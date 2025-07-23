import { promises as fs } from 'fs';
import * as path from 'path';

const SESSION_FILE = path.join(__dirname, 'socket-sessions.json');

// Queue to handle concurrent file operations and prevent race conditions
let fileOperationQueue: Promise<any> = Promise.resolve();

async function ensureFileExists() {
  try {
    await fs.access(SESSION_FILE);
  } catch {
    await fs.writeFile(SESSION_FILE, JSON.stringify({}), 'utf-8');
  }
}

// Safe file operation wrapper that queues operations to prevent race conditions
async function safeFileOperation<T>(operation: () => Promise<T>): Promise<T> {
  const currentOperation = fileOperationQueue.then(operation).catch((error) => {
    console.error('File operation failed:', error);
    throw error;
  });

  fileOperationQueue = currentOperation.catch(() => { });
  return currentOperation;
}

export async function storeSocketSession(userId: string, socketId: string) {
  return safeFileOperation(async () => {
    await ensureFileExists();

    const data = await fs.readFile(SESSION_FILE, 'utf-8');
    let sessions: Record<string, string>;

    try {
      sessions = JSON.parse(data);
    } catch (error) {
      console.warn('Invalid JSON in session file, resetting:', error);
      sessions = {};
    }

    sessions[userId] = socketId;

    await fs.writeFile(SESSION_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  });
}

export async function getSocketId(userId: string): Promise<string | undefined> {
  return safeFileOperation(async () => {
    await ensureFileExists();

    const data = await fs.readFile(SESSION_FILE, 'utf-8');
    let sessions: Record<string, string>;

    try {
      sessions = JSON.parse(data);
    } catch (error) {
      console.warn('Invalid JSON in session file:', error);
      return undefined;
    }

    return sessions[userId];
  });
}

export async function removeSocketSession(userId: string) {
  return safeFileOperation(async () => {
    await ensureFileExists();

    const data = await fs.readFile(SESSION_FILE, 'utf-8');
    let sessions: Record<string, string>;

    try {
      sessions = JSON.parse(data);
    } catch (error) {
      console.warn('Invalid JSON in session file, resetting:', error);
      sessions = {};
    }

    delete sessions[userId];

    await fs.writeFile(SESSION_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  });
}

export async function getAllSessions(): Promise<Record<string, string>> {
  return safeFileOperation(async () => {
    await ensureFileExists();

    const data = await fs.readFile(SESSION_FILE, 'utf-8');
    let sessions: Record<string, string>;

    try {
      sessions = JSON.parse(data);
    } catch (error) {
      console.warn('Invalid JSON in session file:', error);
      return {};
    }

    return sessions;
  });
}
