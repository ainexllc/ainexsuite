import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDoc,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { TaskSpace, Task, TaskGroup } from '../types/models';

// --- Spaces ---

export async function createTodoSpaceInDb(space: TaskSpace) {
  const spaceRef = doc(collection(db, 'todo_spaces'), space.id);
  await setDoc(spaceRef, space);
}

export async function updateTodoSpaceInDb(spaceId: string, updates: Partial<TaskSpace>) {
  const spaceRef = doc(db, 'todo_spaces', spaceId);
  await updateDoc(spaceRef, updates);
}

export function subscribeToUserTodoSpaces(userId: string, callback: (spaces: TaskSpace[]) => void) {
  const q = query(
    collection(db, 'todo_spaces'), 
    where('memberUids', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map(doc => doc.data() as TaskSpace);
    callback(spaces);
  });
}

// --- Tasks ---

// Helper to get space members for shared spaces
async function getSpaceMembers(spaceId: string): Promise<string[]> {
  if (!spaceId || spaceId === 'personal') return [];
  const spaceDoc = await getDoc(doc(db, 'todo_spaces', spaceId));
  if (spaceDoc.exists()) {
    return spaceDoc.data()?.memberUids || [];
  }
  return [];
}

export async function createTaskInDb(task: Task) {
  const taskRef = doc(collection(db, 'tasks'), task.id);

  // For shared spaces, add all members to sharedWithUserIds (like notes app)
  const taskData = { ...task };
  if (task.spaceId && task.spaceId !== 'personal') {
    const memberUids = await getSpaceMembers(task.spaceId);
    taskData.sharedWithUserIds = memberUids.filter(uid => uid !== task.ownerId);
  }

  await setDoc(taskRef, taskData);
}

export async function updateTaskInDb(taskId: string, updates: Partial<Task>) {
  const taskRef = doc(db, 'tasks', taskId);
  // Handle undefined values: convert to deleteField() for Firestore
  const finalUpdates = { ...updates, updatedAt: new Date().toISOString() };
  const cleanedUpdates = Object.fromEntries(
    Object.entries(finalUpdates).map(([key, value]) => [
      key,
      value === undefined ? deleteField() : value
    ])
  );
  await updateDoc(taskRef, cleanedUpdates);
}

export async function deleteTaskFromDb(taskId: string) {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
}

export function subscribeToSpaceTasks(spaceId: string, userId: string, callback: (tasks: Task[]) => void) {
  // Query by spaceId only - security rules allow read if user is a space member
  // (see firestore.rules lines 274-280: allows read if user in todo_spaces/{spaceId}.memberUids)
  const q = query(
    collection(db, 'tasks'),
    where('spaceId', '==', spaceId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data() as Task);
    callback(tasks);
  });
}

export function subscribeToAllUserTasks(userId: string, callback: (tasks: Task[]) => void) {
  // Get all tasks where user is an assignee (for "All Spaces" view)
  const q = query(
    collection(db, 'tasks'),
    where('assigneeIds', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data() as Task);
    callback(tasks);
  });
}

export function subscribeToPersonalTasks(userId: string, callback: (tasks: Task[]) => void) {
  // Get tasks for the virtual "My Todos" personal space
  // Query by ownerId to satisfy security rules (ownerId == request.auth.uid)
  const q = query(
    collection(db, 'tasks'),
    where('spaceId', '==', 'personal'),
    where('ownerId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data() as Task);
    callback(tasks);
  });
}

// --- Task Groups ---

export async function createGroupInDb(group: TaskGroup) {
  const groupRef = doc(collection(db, 'todo_groups'), group.id);
  await setDoc(groupRef, group);
}

export async function updateGroupInDb(groupId: string, updates: Partial<TaskGroup>) {
  const groupRef = doc(db, 'todo_groups', groupId);
  await updateDoc(groupRef, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteGroupFromDb(groupId: string) {
  const groupRef = doc(db, 'todo_groups', groupId);
  await deleteDoc(groupRef);
}

export async function deleteGroupAndUnassignTasks(groupId: string, taskIds: string[]) {
  const batch = writeBatch(db);

  // Delete the group
  const groupRef = doc(db, 'todo_groups', groupId);
  batch.delete(groupRef);

  // Unassign tasks from this group (remove groupId field)
  for (const taskId of taskIds) {
    const taskRef = doc(db, 'tasks', taskId);
    batch.update(taskRef, { groupId: deleteField(), updatedAt: new Date().toISOString() });
  }

  await batch.commit();
}

export function subscribeToSpaceGroups(spaceId: string, userId: string, callback: (groups: TaskGroup[]) => void) {
  // Query groups by spaceId - for personal space, also filter by ownerId
  const q = spaceId === 'personal'
    ? query(
        collection(db, 'todo_groups'),
        where('spaceId', '==', spaceId),
        where('ownerId', '==', userId)
      )
    : query(
        collection(db, 'todo_groups'),
        where('spaceId', '==', spaceId)
      );

  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => doc.data() as TaskGroup);
    // Sort by order
    groups.sort((a, b) => a.order - b.order);
    callback(groups);
  });
}
