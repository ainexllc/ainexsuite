import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

/**
 * Bot Avatar Video Optimization API
 * Resizes and compresses videos to 200x200 for chat display
 *
 * Uses FFmpeg locally, falls back to Cloudinary on Vercel
 * Target: 200x200, WebM format, optimized for small file size
 */

const TARGET_SIZE = 200;
const TARGET_BITRATE = '300k';

// Cloudinary config (for Vercel deployment)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Check if FFmpeg is available
 */
async function isFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    ffmpeg.on('error', () => resolve(false));
    ffmpeg.on('close', (code) => resolve(code === 0));
  });
}

/**
 * Run FFmpeg command with promise wrapper
 */
async function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegPaths = [
      'ffmpeg',
      '/usr/bin/ffmpeg',
      '/usr/local/bin/ffmpeg',
      '/opt/homebrew/bin/ffmpeg',
    ];

    const tryPath = (index: number) => {
      if (index >= ffmpegPaths.length) {
        reject(new Error('FFmpeg not found'));
        return;
      }

      const ffmpeg = spawn(ffmpegPaths[index], args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('error', () => tryPath(index + 1));

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg error: ${stderr.slice(-500)}`));
        }
      });
    };

    tryPath(0);
  });
}

/**
 * Optimize video using local FFmpeg
 */
async function optimizeWithFFmpeg(videoBuffer: Buffer): Promise<{
  data: string;
  size: number;
  format: string;
}> {
  const inputPath = join(tmpdir(), `bot-avatar-in-${Date.now()}.mp4`);
  const outputPath = join(tmpdir(), `bot-avatar-out-${Date.now()}.webm`);

  try {
    await writeFile(inputPath, videoBuffer);

    const ffmpegArgs = [
      '-y',
      '-i',
      inputPath,
      '-vf',
      `scale=${TARGET_SIZE}:${TARGET_SIZE}:force_original_aspect_ratio=increase,crop=${TARGET_SIZE}:${TARGET_SIZE}`,
      '-c:v',
      'libvpx-vp9',
      '-b:v',
      TARGET_BITRATE,
      '-crf',
      '35', // Higher CRF for smaller file size
      '-an', // No audio
      '-deadline',
      'good',
      '-cpu-used',
      '2',
      '-f',
      'webm',
      outputPath,
    ];

    await runFFmpeg(ffmpegArgs);

    const outputBuffer = await readFile(outputPath);
    const outputStats = await stat(outputPath);
    const base64 = outputBuffer.toString('base64');

    return {
      data: `data:video/webm;base64,${base64}`,
      size: outputStats.size,
      format: 'webm',
    };
  } finally {
    // Cleanup temp files
    try {
      await unlink(inputPath);
    } catch {
      /* ignore */
    }
    try {
      await unlink(outputPath);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Optimize video using Cloudinary (fallback for Vercel)
 */
async function optimizeWithCloudinary(videoBuffer: Buffer): Promise<{
  data: string;
  size: number;
  format: string;
}> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary not configured');
  }

  // Create signature for upload
  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import('crypto');
  const paramsToSign = `eager=c_fill,w_${TARGET_SIZE},h_${TARGET_SIZE},f_webm,vc_vp9,br_${TARGET_BITRATE}&folder=bot-avatars&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + CLOUDINARY_API_SECRET)
    .digest('hex');

  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', new Blob([videoBuffer], { type: 'video/mp4' }));
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', 'bot-avatars');
  formData.append(
    'eager',
    `c_fill,w_${TARGET_SIZE},h_${TARGET_SIZE},f_webm,vc_vp9,br_${TARGET_BITRATE}`
  );
  formData.append('eager_async', 'false');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const result = await response.json();

  // Get the optimized version URL
  const optimizedUrl = result.eager?.[0]?.secure_url;
  if (!optimizedUrl) {
    throw new Error('No optimized video URL returned');
  }

  // Fetch the optimized video
  const videoResponse = await fetch(optimizedUrl);
  if (!videoResponse.ok) {
    throw new Error('Failed to fetch optimized video');
  }

  const optimizedBuffer = Buffer.from(await videoResponse.arrayBuffer());
  const base64 = optimizedBuffer.toString('base64');

  // Delete from Cloudinary to clean up
  try {
    const deleteTimestamp = Math.floor(Date.now() / 1000);
    const deleteSignature = crypto
      .createHash('sha1')
      .update(`public_id=${result.public_id}&timestamp=${deleteTimestamp}${CLOUDINARY_API_SECRET}`)
      .digest('hex');

    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: result.public_id,
          api_key: CLOUDINARY_API_KEY,
          timestamp: deleteTimestamp,
          signature: deleteSignature,
        }),
      }
    );
  } catch {
    // Ignore cleanup errors
  }

  return {
    data: `data:video/webm;base64,${base64}`,
    size: optimizedBuffer.length,
    format: 'webm',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, videoData } = body;

    if (!videoUrl && !videoData) {
      return NextResponse.json(
        { success: false, error: 'Either videoUrl or videoData is required' },
        { status: 400 }
      );
    }

    // Get video as buffer
    let videoBuffer: Buffer;
    let originalSize: number;

    if (videoUrl) {
      // Fetch from URL
      const response = await fetch(videoUrl);
      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch video: ${response.status}` },
          { status: 400 }
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
      originalSize = videoBuffer.length;
    } else {
      // Decode base64
      const base64Match = videoData.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match) {
        videoBuffer = Buffer.from(base64Match[1], 'base64');
      } else {
        videoBuffer = Buffer.from(videoData, 'base64');
      }
      originalSize = videoBuffer.length;
    }

    // Try FFmpeg first, fallback to Cloudinary
    let result: { data: string; size: number; format: string };

    const ffmpegAvailable = await isFFmpegAvailable();
    if (ffmpegAvailable) {
      result = await optimizeWithFFmpeg(videoBuffer);
    } else if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      result = await optimizeWithCloudinary(videoBuffer);
    } else {
      return NextResponse.json(
        { success: false, error: 'No video processing available (FFmpeg or Cloudinary required)' },
        { status: 500 }
      );
    }

    const compressionRatio = (originalSize / result.size).toFixed(2);

    return NextResponse.json({
      success: true,
      videoData: result.data,
      format: result.format,
      size: result.size,
      dimensions: `${TARGET_SIZE}x${TARGET_SIZE}`,
      originalSize,
      compressionRatio,
      optimized: true,
    });
  } catch (error) {
    console.error('Video optimization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Video optimization failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
