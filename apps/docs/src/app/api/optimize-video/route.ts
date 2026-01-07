import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

/**
 * Video Optimization API
 * Resizes and compresses videos for avatar use
 *
 * Uses FFmpeg locally, falls back to Cloudinary on Vercel
 * Target: 512x512, WebM format, ~500KB for 6 seconds
 */

const TARGET_SIZE = 512;
const TARGET_BITRATE = '500k';

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
  const inputPath = join(tmpdir(), `avatar-in-${Date.now()}.mp4`);
  const outputPath = join(tmpdir(), `avatar-out-${Date.now()}.webm`);

  try {
    await writeFile(inputPath, videoBuffer);

    const ffmpegArgs = [
      '-y',
      '-i', inputPath,
      '-vf', `scale=${TARGET_SIZE}:${TARGET_SIZE}:force_original_aspect_ratio=increase,crop=${TARGET_SIZE}:${TARGET_SIZE}`,
      '-c:v', 'libvpx-vp9',
      '-b:v', TARGET_BITRATE,
      '-crf', '30',
      '-an',
      '-deadline', 'good',
      '-cpu-used', '2',
      '-f', 'webm',
      outputPath,
    ];

    await runFFmpeg(ffmpegArgs);

    const optimizedBuffer = await readFile(outputPath);
    const stats = await stat(outputPath);
    const base64 = optimizedBuffer.toString('base64');

    return {
      data: `data:video/webm;base64,${base64}`,
      size: stats.size,
      format: 'webm',
    };
  } finally {
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}

/**
 * Optimize video using Cloudinary (for Vercel/serverless)
 */
async function optimizeWithCloudinary(videoBuffer: Buffer): Promise<{
  data: string;
  size: number;
  format: string;
}> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials not configured');
  }

  // Create upload signature
  const timestamp = Math.floor(Date.now() / 1000);
  const eager = `c_fill,w_${TARGET_SIZE},h_${TARGET_SIZE},f_webm,vc_vp9,br_500k`;

  // Build signature string
  const signatureString = `eager=${eager}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

  // Create SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Upload to Cloudinary with eager transformation
  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(videoBuffer)], { type: 'video/mp4' }), 'avatar.mp4');
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('eager', eager);
  formData.append('resource_type', 'video');

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    { method: 'POST', body: formData }
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const result = await uploadResponse.json();

  // Get the eager transformation URL
  const eagerUrl = result.eager?.[0]?.secure_url || result.secure_url;

  if (!eagerUrl) {
    throw new Error('No transformed video URL returned');
  }

  // Fetch the optimized video
  const videoResponse = await fetch(eagerUrl);
  if (!videoResponse.ok) {
    throw new Error('Failed to fetch optimized video from Cloudinary');
  }

  const optimizedBuffer = await videoResponse.arrayBuffer();
  const base64 = Buffer.from(optimizedBuffer).toString('base64');

  // Clean up: delete from Cloudinary (fire and forget)
  const deleteTimestamp = Math.floor(Date.now() / 1000);
  const deleteSignatureString = `public_id=${result.public_id}&timestamp=${deleteTimestamp}${CLOUDINARY_API_SECRET}`;
  const deleteData = encoder.encode(deleteSignatureString);
  const deleteHashBuffer = await crypto.subtle.digest('SHA-1', deleteData);
  const deleteHashArray = Array.from(new Uint8Array(deleteHashBuffer));
  const deleteSignature = deleteHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_id: result.public_id,
      api_key: CLOUDINARY_API_KEY,
      timestamp: deleteTimestamp,
      signature: deleteSignature,
    }),
  }).catch(() => {});

  return {
    data: `data:video/webm;base64,${base64}`,
    size: optimizedBuffer.byteLength,
    format: 'webm',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, videoData } = body;

    if (!videoUrl && !videoData) {
      return NextResponse.json(
        { success: false, error: 'videoUrl or videoData is required' },
        { status: 400 }
      );
    }

    // Get video data
    let videoBuffer: Buffer;

    if (videoUrl) {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch video: ${response.status}` },
          { status: 400 }
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
    } else {
      const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
      videoBuffer = Buffer.from(base64Data, 'base64');
    }

    const originalSize = videoBuffer.length;

    // Try FFmpeg first (local development)
    const ffmpegAvailable = await isFFmpegAvailable();

    let result: { data: string; size: number; format: string };

    if (ffmpegAvailable) {
      result = await optimizeWithFFmpeg(videoBuffer);
    } else if (CLOUDINARY_CLOUD_NAME) {
      result = await optimizeWithCloudinary(videoBuffer);
    } else {
      // No optimization available - return original
      console.warn('No video optimization available, returning original');
      return NextResponse.json({
        success: true,
        videoData: videoData || `data:video/mp4;base64,${videoBuffer.toString('base64')}`,
        format: 'mp4',
        size: originalSize,
        dimensions: 'original',
        originalSize,
        compressionRatio: '1.00',
        optimized: false,
      });
    }

    return NextResponse.json({
      success: true,
      videoData: result.data,
      format: result.format,
      size: result.size,
      dimensions: `${TARGET_SIZE}x${TARGET_SIZE}`,
      originalSize,
      compressionRatio: (originalSize / result.size).toFixed(2),
      optimized: true,
    });

  } catch (error) {
    console.error('Video optimization error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to optimize video',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
