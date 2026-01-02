import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { TaskSpace, Task } from '../types/models';

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

export async function createTaskInDb(task: Task) {
  const taskRef = doc(collection(db, 'tasks'), task.id);
  await setDoc(taskRef, task);
}

export async function updateTaskInDb(taskId: string, updates: Partial<Task>) {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteTaskFromDb(taskId: string) {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
}

export function subscribeToSpaceTasks(spaceId: string, callback: (tasks: Task[]) => void) {
  const q = query(
    collection(db, 'tasks'),
    where('spaceId', '==', spaceId)
    // orderBy('order') // Indexes might be needed if we sort by order here, but client-side sort is fine for now
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
  // These are tasks where spaceId is "personal" OR ownerId matches and no shared space
  const q = query(
    collection(db, 'tasks'),
    where('spaceId', '==', 'personal')
  );

  return onSnapshot(q, (snapshot) => {
    // Filter to only include tasks where user is owner or assignee
    const tasks = snapshot.docs
      .map(doc => doc.data() as Task)
      .filter(task => task.ownerId === userId || task.assigneeIds?.includes(userId));
    callback(tasks);
  });
}
