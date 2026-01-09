import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import { updateProject } from "./project-service";

// ============ Types ============

export interface WhiteboardData {
  nodes: unknown[];
  edges: unknown[];
  isDarkMode: boolean;
  edgeType: string;
  arrowType: string;
  lineStyle: string;
  projectId: string | null;
  updatedAt: string;
}

// ============ Whiteboard Document Helpers ============

/**
 * Get the Firestore document path for a user's whiteboard
 */
export function whiteboardDocPath(userId: string): string {
  return `whiteboards/${userId}`;
}

/**
 * Get the Firestore document reference for a user's whiteboard
 */
function whiteboardDoc(userId: string) {
  return doc(db, whiteboardDocPath(userId));
}

// ============ Whiteboard Operations ============

/**
 * Get whiteboard data for a user
 */
export async function getWhiteboardData(userId: string): Promise<WhiteboardData | null> {
  try {
    const whiteboardRef = whiteboardDoc(userId);
    const snapshot = await getDoc(whiteboardRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as WhiteboardData;
  } catch (error) {
    console.error("[Whiteboard] Error getting whiteboard data:", error);
    return null;
  }
}

/**
 * Get the project ID linked to a whiteboard
 */
export async function getWhiteboardProjectId(userId: string): Promise<string | null> {
  const data = await getWhiteboardData(userId);
  return data?.projectId ?? null;
}

// ============ Project Linking Operations ============

/**
 * Link a whiteboard to a project
 * Updates both the whiteboard document and the project's whiteboardId field
 */
export async function linkWhiteboardToProject(
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const whiteboardRef = whiteboardDoc(userId);
    const whiteboardSnap = await getDoc(whiteboardRef);

    if (whiteboardSnap.exists()) {
      // Update existing whiteboard with project link
      await updateDoc(whiteboardRef, {
        projectId,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new whiteboard with project link
      await setDoc(whiteboardRef, {
        nodes: [],
        edges: [],
        isDarkMode: true,
        edgeType: "smoothstep",
        arrowType: "end",
        lineStyle: "solid",
        projectId,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update the project's whiteboardId field
    await updateProject(userId, projectId, {
      whiteboardId: userId, // Using userId as whiteboard ID since it's the document ID
    });
  } catch (error) {
    console.error("[Whiteboard] Error linking whiteboard to project:", error);
    throw error;
  }
}

/**
 * Unlink a whiteboard from a project
 * Clears the project link from both the whiteboard and the project
 */
export async function unlinkWhiteboardFromProject(
  userId: string,
  projectId: string
): Promise<void> {
  try {
    const whiteboardRef = whiteboardDoc(userId);
    const whiteboardSnap = await getDoc(whiteboardRef);

    if (whiteboardSnap.exists()) {
      await updateDoc(whiteboardRef, {
        projectId: null,
        updatedAt: new Date().toISOString(),
      });
    }

    // Clear the project's whiteboardId field
    await updateProject(userId, projectId, {
      whiteboardId: null,
    });
  } catch (error) {
    console.error("[Whiteboard] Error unlinking whiteboard from project:", error);
    throw error;
  }
}

/**
 * Update the project link on a whiteboard
 * Handles unlinking from old project and linking to new project
 */
export async function updateWhiteboardProjectLink(
  userId: string,
  oldProjectId: string | null,
  newProjectId: string | null
): Promise<void> {
  try {
    // Unlink from old project if exists
    if (oldProjectId) {
      await updateProject(userId, oldProjectId, {
        whiteboardId: null,
      });
    }

    // Update whiteboard with new project link
    const whiteboardRef = whiteboardDoc(userId);
    await updateDoc(whiteboardRef, {
      projectId: newProjectId,
      updatedAt: new Date().toISOString(),
    });

    // Link to new project if exists
    if (newProjectId) {
      await updateProject(userId, newProjectId, {
        whiteboardId: userId,
      });
    }
  } catch (error) {
    console.error("[Whiteboard] Error updating whiteboard project link:", error);
    throw error;
  }
}
