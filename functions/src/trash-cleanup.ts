/**
 * Scheduled Cloud Function to automatically delete notes
 * that have been in trash for more than 30 days.
 *
 * This enforces the 30-day retention policy promised in the Notes app UI.
 */

import * as functions from "firebase-functions";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";

interface Attachment {
  storagePath?: string;
  url?: string;
  name?: string;
}

const RETENTION_DAYS = 30;
const BATCH_SIZE = 500; // Firestore batch limit

/**
 * Scheduled function to permanently delete notes older than 30 days
 * Runs every 12 hours via Pub/Sub schedule
 */
export const cleanupTrashedNotes = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: "512MB",
  })
  .pubsub.schedule("every 12 hours")
  .onRun(async () => {
    logger.info("Starting trash cleanup job...");

    const db = admin.firestore();
    const storage = admin.storage().bucket();

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

    logger.info(`Cutoff date: ${cutoffDate.toISOString()}`);

    let totalDeleted = 0;
    let totalAttachmentsDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      // Query expired notes using collectionGroup
      // This searches across all users' notes collections
      const expiredNotesQuery = db
        .collectionGroup("notes")
        .where("deletedAt", "!=", null)
        .where("deletedAt", "<=", cutoffTimestamp)
        .limit(BATCH_SIZE);

      const snapshot = await expiredNotesQuery.get();

      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      logger.info(`Processing batch of ${snapshot.size} expired notes...`);

      // Process each note
      const deletePromises = snapshot.docs.map(async (docSnapshot) => {
        const noteData = docSnapshot.data();
        const noteRef = docSnapshot.ref;

        try {
          // Delete attachments from Storage first
          const attachments = noteData.attachments as Attachment[] | undefined;
          if (attachments && attachments.length > 0) {
            const attachmentDeletePromises = attachments
              .filter((attachment) => attachment.storagePath)
              .map(async (attachment) => {
                try {
                  await storage.file(attachment.storagePath!).delete();
                  totalAttachmentsDeleted++;
                  logger.info(`Deleted attachment: ${attachment.storagePath}`);
                } catch (err) {
                  // Attachment might already be deleted (404)
                  const error = err as { code?: number; message?: string };
                  if (error.code !== 404) {
                    logger.warn(
                      `Failed to delete attachment ${attachment.storagePath}:`,
                      error.message
                    );
                  }
                }
              });

            await Promise.all(attachmentDeletePromises);
          }

          // Delete the note document
          await noteRef.delete();
          totalDeleted++;
          logger.info(`Deleted note: ${noteRef.path}`);
        } catch (err) {
          const error = err as { message?: string };
          logger.error(`Failed to delete note ${noteRef.path}:`, error.message);
        }
      });

      await Promise.all(deletePromises);

      // Check if we might have more (batch was full)
      hasMore = snapshot.size === BATCH_SIZE;
    }

    logger.info(
      `Trash cleanup complete. Deleted ${totalDeleted} notes and ${totalAttachmentsDeleted} attachments.`
    );

    return {
      success: true,
      deletedNotes: totalDeleted,
      deletedAttachments: totalAttachmentsDeleted,
    };
  });
