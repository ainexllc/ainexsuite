/**
 * Video Transcoding Cloud Function
 *
 * Triggered on video upload to video-backgrounds/ folder.
 * Generates:
 * - 720p MP4 variant (smaller file, faster loading)
 * - 720p WebM variant (even smaller, modern browsers)
 * - Poster image (first frame as JPG)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const COLLECTION_NAME = 'video-backgrounds';
const MAX_DURATION_SECONDS = 20;

/**
 * Video variant metadata
 */
interface VideoVariant {
  quality: '1080p' | '720p';
  format: 'mp4' | 'webm';
  storagePath: string;
  downloadURL: string;
  fileSize: number;
  width: number;
  height: number;
}

/**
 * Video metadata from FFprobe
 */
interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  bitrate?: number;
}

/**
 * Get video metadata using FFprobe
 */
function getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      resolve({
        duration: metadata.format.duration,
        width: videoStream?.width,
        height: videoStream?.height,
        bitrate: metadata.format.bit_rate
          ? parseInt(String(metadata.format.bit_rate))
          : undefined,
      });
    });
  });
}

/**
 * Transcode video to MP4 with optimized H.264 settings
 */
function transcodeToMP4(
  inputPath: string,
  outputPath: string,
  options: { width: number; height: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .size(`${options.width}x?`) // Maintain aspect ratio
      .noAudio() // Background videos don't need audio
      .videoCodec('libx264')
      .outputOptions([
        '-crf', '23',
        '-preset', 'medium',      // Better quality than 'fast'
        '-tune', 'film',          // Optimized for video content
        '-profile:v', 'high',     // Better compression
        '-level', '4.1',          // Wide compatibility
        '-pix_fmt', 'yuv420p',    // Universal browser support
        '-g', '48',               // Keyframe every 48 frames (~1.6s at 30fps)
        '-movflags', '+faststart', // Enable fast start for web
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('FFmpeg MP4 started:', cmd);
      })
      .on('progress', (progress) => {
        console.log(`MP4 Processing: ${progress.percent?.toFixed(1)}%`);
      })
      .on('end', () => {
        console.log(`MP4 transcoding complete: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg MP4 error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Run a single pass of VP9 encoding
 */
function runVP9Pass(
  inputPath: string,
  outputPath: string,
  options: {
    width: number;
    height: number;
    pass: 1 | 2;
    passLogFile: string;
    speed: number;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputOptions = [
      '-c:v', 'libvpx-vp9',
      '-crf', '30',
      '-b:v', '0',              // Required for CRF mode
      '-tile-columns', '2',     // Parallel decoding
      '-row-mt', '1',           // Multi-threaded
      '-frame-parallel', '1',   // Parallel frame decode
      '-auto-alt-ref', '1',     // Alt reference frames (quality)
      '-lag-in-frames', '25',   // Lookahead buffer
      '-g', '240',              // 8 second GOP for web streaming
      '-an',                    // No audio
      `-pass`, `${options.pass}`,
      `-passlogfile`, options.passLogFile,
      `-speed`, `${options.speed}`,
    ];

    // Pass 1 outputs to null, pass 2 outputs to file
    const actualOutput = options.pass === 1 ? '/dev/null' : outputPath;

    // For pass 1, we need -f webm to specify format for /dev/null
    if (options.pass === 1) {
      outputOptions.push('-f', 'webm');
    }

    ffmpeg(inputPath)
      .size(`${options.width}x?`)
      .noAudio()
      .outputOptions(outputOptions)
      .output(actualOutput)
      .on('start', (cmd) => {
        console.log(`FFmpeg VP9 Pass ${options.pass} started:`, cmd);
      })
      .on('progress', (progress) => {
        console.log(`VP9 Pass ${options.pass}: ${progress.percent?.toFixed(1)}%`);
      })
      .on('end', () => {
        console.log(`VP9 Pass ${options.pass} complete`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`FFmpeg VP9 Pass ${options.pass} error:`, err);
        reject(err);
      })
      .run();
  });
}

/**
 * Transcode video to WebM with two-pass VP9 encoding for optimal quality
 */
async function transcodeToWebM(
  inputPath: string,
  outputPath: string,
  options: { width: number; height: number }
): Promise<void> {
  const passLogFile = path.join(os.tmpdir(), `vp9-passlog-${Date.now()}`);

  try {
    // Pass 1: Analysis (fast, generates statistics)
    console.log('Starting VP9 two-pass encoding...');
    await runVP9Pass(inputPath, outputPath, {
      ...options,
      pass: 1,
      passLogFile,
      speed: 4, // Fast analysis
    });

    // Pass 2: Encode with optimal bitrate distribution
    await runVP9Pass(inputPath, outputPath, {
      ...options,
      pass: 2,
      passLogFile,
      speed: 2, // Quality-focused
    });

    console.log(`WebM transcoding complete: ${outputPath}`);
  } finally {
    // Cleanup pass log files
    const logFiles = [`${passLogFile}-0.log`];
    logFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`Cleaned up pass log: ${file}`);
        }
      } catch (err) {
        console.warn(`Failed to cleanup pass log ${file}:`, err);
      }
    });
  }
}

/**
 * Log encoding metrics for monitoring
 */
function logEncodingMetrics(
  label: string,
  originalSize: number,
  outputSize: number,
  duration: number
): void {
  const compressionRatio = originalSize / outputSize;
  const bitrateKbps = (outputSize * 8) / (duration * 1000);
  const savingsPercent = ((originalSize - outputSize) / originalSize) * 100;

  console.log(`📊 ${label} Metrics:`);
  console.log(`   Compression: ${compressionRatio.toFixed(2)}x`);
  console.log(`   Bitrate: ${bitrateKbps.toFixed(0)} kbps`);
  console.log(`   Size reduction: ${savingsPercent.toFixed(1)}%`);
}

/**
 * Extract first frame as high-quality poster image
 */
function extractPosterFrame(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-vframes', '1',           // Single frame
        '-ss', '00:00:00.100',     // Slightly after start for better frame
        '-q:v', '2',               // High quality JPEG (1-31, lower = better)
        '-vf', 'scale=1920:-2',    // Ensure even dimensions
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`Poster extracted: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('Poster extraction error:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Upload file to Storage and make public
 */
async function uploadToStorage(
  localPath: string,
  storagePath: string,
  contentType: string
): Promise<string> {
  const bucket = admin.storage().bucket();
  const file = bucket.file(storagePath);

  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000', // 1 year cache
    },
  });

  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

/**
 * Cleanup temporary files
 */
function cleanupTempFiles(files: string[]): void {
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`Cleaned up: ${file}`);
      }
    } catch (err) {
      console.warn(`Failed to cleanup ${file}:`, err);
    }
  });
}

/**
 * Storage trigger for video background uploads
 * Processes new videos to create optimized variants
 */
export const processVideoBackground = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 540, // 9 minutes max
    memory: '2GB',
  })
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;

    // Only process videos in video-backgrounds folder
    if (!filePath?.startsWith('video-backgrounds/') || !contentType?.startsWith('video/')) {
      console.log('Skipping non-video file:', filePath);
      return null;
    }

    // Skip if this is a generated variant or poster
    if (
      filePath.includes('/variants/') ||
      filePath.includes('-720p') ||
      filePath.includes('-poster')
    ) {
      console.log('Skipping variant/poster file:', filePath);
      return null;
    }

    // Extract video ID from path: video-backgrounds/{videoId}.{ext}
    const fileName = path.basename(filePath);
    const videoId = fileName.replace(/\.[^/.]+$/, '');

    console.log(`Processing video: ${videoId} (${filePath})`);

    const db = admin.firestore();
    const docRef = db.collection(COLLECTION_NAME).doc(videoId);
    const bucket = admin.storage().bucket();

    // Update Firestore with processing status
    try {
      await docRef.update({
        processingStatus: {
          status: 'processing',
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
    } catch (err) {
      // Document might not exist yet if upload happened before Firestore write
      console.warn('Could not update processing status:', err);
    }

    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, fileName);
    const output720pMp4 = path.join(tempDir, `${videoId}-720p.mp4`);
    const output720pWebm = path.join(tempDir, `${videoId}-720p.webm`);
    const outputPoster = path.join(tempDir, `${videoId}-poster.jpg`);

    const tempFiles = [inputPath, output720pMp4, output720pWebm, outputPoster];

    try {
      // Download original video to temp
      console.log('Downloading original video...');
      await bucket.file(filePath).download({ destination: inputPath });
      console.log(`Downloaded to: ${inputPath}`);

      // Get video metadata
      const metadata = await getVideoMetadata(inputPath);
      console.log('Video metadata:', metadata);

      // Validate duration
      if (metadata.duration && metadata.duration > MAX_DURATION_SECONDS) {
        throw new Error(
          `Video exceeds ${MAX_DURATION_SECONDS} second limit: ${metadata.duration.toFixed(1)}s`
        );
      }

      const variants: VideoVariant[] = [];

      // Add original as 1080p variant
      const originalStats = fs.statSync(inputPath);
      const originalFile = bucket.file(filePath);
      await originalFile.makePublic();
      const originalURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      variants.push({
        quality: '1080p',
        format: 'mp4',
        storagePath: filePath,
        downloadURL: originalURL,
        fileSize: originalStats.size,
        width: metadata.width || 1920,
        height: metadata.height || 1080,
      });

      // Generate 720p MP4 with optimized H.264 encoding
      console.log('Generating 720p MP4 (optimized H.264)...');
      await transcodeToMP4(inputPath, output720pMp4, {
        width: 1280,
        height: 720,
      });

      const mp4StoragePath = `video-backgrounds/variants/${videoId}-720p.mp4`;
      const mp4URL = await uploadToStorage(output720pMp4, mp4StoragePath, 'video/mp4');
      const mp4Stats = fs.statSync(output720pMp4);

      // Log MP4 encoding metrics
      logEncodingMetrics('720p MP4', originalStats.size, mp4Stats.size, metadata.duration || 0);

      variants.push({
        quality: '720p',
        format: 'mp4',
        storagePath: mp4StoragePath,
        downloadURL: mp4URL,
        fileSize: mp4Stats.size,
        width: 1280,
        height: 720,
      });

      // Generate 720p WebM with two-pass VP9 encoding
      console.log('Generating 720p WebM (two-pass VP9)...');
      await transcodeToWebM(inputPath, output720pWebm, {
        width: 1280,
        height: 720,
      });

      const webmStoragePath = `video-backgrounds/variants/${videoId}-720p.webm`;
      const webmURL = await uploadToStorage(output720pWebm, webmStoragePath, 'video/webm');
      const webmStats = fs.statSync(output720pWebm);

      // Log WebM encoding metrics
      logEncodingMetrics('720p WebM', originalStats.size, webmStats.size, metadata.duration || 0);

      variants.push({
        quality: '720p',
        format: 'webm',
        storagePath: webmStoragePath,
        downloadURL: webmURL,
        fileSize: webmStats.size,
        width: 1280,
        height: 720,
      });

      // Extract poster frame
      console.log('Extracting poster frame...');
      await extractPosterFrame(inputPath, outputPoster);

      const posterStoragePath = `video-backgrounds/${videoId}-poster.jpg`;
      const posterURL = await uploadToStorage(outputPoster, posterStoragePath, 'image/jpeg');

      // Update Firestore with completed status and variants
      console.log('Updating Firestore...');
      await docRef.update({
        processingStatus: {
          status: 'completed',
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        variants,
        posterURL,
        posterStoragePath,
        duration: metadata.duration,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Successfully processed video: ${videoId}`);
      console.log(`  - Original: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  - 720p MP4: ${(mp4Stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  - 720p WebM: ${(webmStats.size / 1024 / 1024).toFixed(2)} MB`);

      return { success: true, videoId, variants: variants.length };
    } catch (error) {
      console.error('Video processing error:', error);

      // Update Firestore with failed status
      try {
        await docRef.update({
          processingStatus: {
            status: 'failed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (updateErr) {
        console.error('Failed to update error status:', updateErr);
      }

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      // Cleanup temp files
      cleanupTempFiles(tempFiles);
    }
  });
