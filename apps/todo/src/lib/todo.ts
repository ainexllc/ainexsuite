import { db, createActivity } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { auth } from '@ainexsuite/firebase';
import type { TodoTask, TodoProject, CreateTodoTaskInput, CreateTodoProjectInput } from '@ainexsuite/types';

const TASKS_COLLECTION = 'todos';
const PROJECTS_COLLECTION = 'projects';

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
}

// Tasks
export async function createTask(input: Omit<CreateTodoTaskInput, 'ownerId'>): Promise<string> {
  const userId = getCurrentUserId();

  // Get the highest order number for new tasks
  const tasksSnapshot = await getDocs(
    query(collection(db, TASKS_COLLECTION), where('ownerId', '==', userId))
  );
  const maxOrder = tasksSnapshot.docs.reduce(
    (max, doc) => Math.max(max, (doc.data().order as number) || 0),
    0
  );

  const taskData = {
    ...input,
    ownerId: userId,
    completed: false,
    subtasks: input.subtasks || [],
    order: input.order !== undefined ? input.order : maxOrder + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);

  // Log activity
  try {
    await createActivity({
      app: 'todo',
      action: 'created',
      itemType: 'task',
      itemId: docRef.id,
      itemTitle: input.title,
      metadata: { priority: input.priority },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }

  return docRef.id;
}

export async function updateTask(
  taskId: string,
  updates: Partial<Omit<TodoTask, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, { ...updates, updatedAt: serverTimestamp() });

  // Log activity
  try {
    const action = updates.completed !== undefined ? 'completed' : 'updated';
    const metadata: Record<string, unknown> = {};
    if (updates.priority !== undefined) metadata.priority = updates.priority;
    if (updates.completed !== undefined) metadata.completed = updates.completed;
    await createActivity({
      app: 'todo',
      action,
      itemType: 'task',
      itemId: taskId,
      itemTitle: updates.title || 'Task',
      metadata,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);

  // Get task details before deleting
  const taskDoc = await getDoc(taskRef);
  const task = taskDoc.exists() ? taskDoc.data() as TodoTask : null;

  await deleteDoc(taskRef);

  // Log activity
  if (task) {
    try {
      await createActivity({
        app: 'todo',
        action: 'deleted',
        itemType: 'task',
        itemId: taskId,
        itemTitle: task.title,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export async function getTasks(): Promise<TodoTask[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('order', 'asc')
  );

  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    order: doc.data().order || 0, // Ensure order field exists
  })) as TodoTask[];

  // Sort by order for tasks that have the same order value (fallback to createdAt)
  return tasks.sort((a, b) => {
    if (a.order === b.order) {
      return b.createdAt - a.createdAt;
    }
    return a.order - b.order;
  });
}

export async function reorderTasks(taskIds: string[], newOrders: number[]): Promise<void> {
  // Update all tasks with their new order values
  const updatePromises = taskIds.map((taskId, index) => {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    return updateDoc(taskRef, {
      order: newOrders[index],
      updatedAt: serverTimestamp(),
    });
  });

  await Promise.all(updatePromises);
}

// Projects
export async function createProject(input: Omit<CreateTodoProjectInput, 'ownerId'>): Promise<string> {
  const userId = getCurrentUserId();
  const projectData = {
    ...input,
    ownerId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
  return docRef.id;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<TodoProject, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(projectRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteProject(projectId: string): Promise<void> {
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await deleteDoc(projectRef);
}

export async function getProjects(): Promise<TodoProject[]> {
  const userId = getCurrentUserId();
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis() || Date.now(),
    updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
  })) as TodoProject[];
}
