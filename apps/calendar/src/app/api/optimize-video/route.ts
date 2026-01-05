import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

/**
 * Video Optimization API
 * Resizes and compresses videos for avatar use
 * Target: 512x512, WebM format, ~500KB for 6 seconds
 */

const TARGET_SIZE = 512;
const TARGET_BITRATE = '500k';
const TARGET_FORMAT = 'webm';

/**
 * Run FFmpeg command with promise wrapper
 */
async function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    // Try different FFmpeg paths
    const ffmpegPaths = [
      'ffmpeg',
      '/usr/bin/ffmpeg',
      '/usr/local/bin/ffmpeg',
      '/opt/homebrew/bin/ffmpeg',
    ];

    const tryPath = (index: number) => {
      if (index >= ffmpegPaths.length) {
        reject(new Error('FFmpeg not found. Please install FFmpeg.'));
        return;
      }

      const ffmpeg = spawn(ffmpegPaths[index], args);
      let stderr = '';

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('error', () => {
        // Try next path
        tryPath(index + 1);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
        }
      });
    };

    tryPath(0);
  });
}

/**
 * Generate unique temp file path
 */
function getTempPath(ext: string): string {
  const id = Math.random().toString(36).substring(2, 15);
  return join(tmpdir(), `avatar-${id}.${ext}`);
}

export async function POST(request: NextRequest) {
  const inputPath = getTempPath('mp4');
  const outputPath = getTempPath('webm');

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
    } else {
      // Decode base64
      const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
      videoBuffer = Buffer.from(base64Data, 'base64');
    }

    // Write input file
    await writeFile(inputPath, videoBuffer);

    // Run FFmpeg to optimize
    // - Scale to 512x512 (crop to square, center)
    // - Convert to WebM (VP9 codec)
    // - Target bitrate for small file size
    // - High quality settings for small video
    const ffmpegArgs = [
      '-y', // Overwrite output
      '-i', inputPath,
      // Video filters: scale and crop to square
      '-vf', `scale=${TARGET_SIZE}:${TARGET_SIZE}:force_original_aspect_ratio=increase,crop=${TARGET_SIZE}:${TARGET_SIZE}`,
      // VP9 codec for WebM
      '-c:v', 'libvpx-vp9',
      // Target bitrate
      '-b:v', TARGET_BITRATE,
      // Two-pass would be better but slower, using CRF instead
      '-crf', '30',
      // No audio (avatars don't need it)
      '-an',
      // Optimize for web
      '-deadline', 'good',
      '-cpu-used', '2',
      // Output format
      '-f', 'webm',
      outputPath,
    ];

    await runFFmpeg(ffmpegArgs);

    // Read optimized file
    const { readFile, stat } = await import('fs/promises');
    const optimizedBuffer = await readFile(outputPath);
    const stats = await stat(outputPath);

    // Convert to base64 data URL
    const base64 = optimizedBuffer.toString('base64');
    const dataUrl = `data:video/webm;base64,${base64}`;

    // Cleanup temp files
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);

    return NextResponse.json({
      success: true,
      videoData: dataUrl,
      format: TARGET_FORMAT,
      size: stats.size,
      dimensions: `${TARGET_SIZE}x${TARGET_SIZE}`,
      originalSize: videoBuffer.length,
      compressionRatio: (videoBuffer.length / stats.size).toFixed(2),
    });

  } catch (error) {
    // Cleanup on error
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);

    console.error('Video optimization error:', error);

    // Check if FFmpeg is not installed
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('FFmpeg not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'FFmpeg is not installed on this server',
          hint: 'Install FFmpeg or use a cloud-based video processing service',
        },
        { status: 500 }
      );
    }

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
