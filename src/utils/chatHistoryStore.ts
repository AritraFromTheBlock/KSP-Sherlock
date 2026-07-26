import { ChatSession } from '../types/chat';

const STORAGE_KEY_PREFIX = 'sherlock_chat_history_';

export const getSessions = (userId: string): ChatSession[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) return [];
    const sessions = JSON.parse(raw) as ChatSession[];
    return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    console.error('Failed to parse chat history', e);
    return [];
  }
};

export const saveSession = (userId: string, session: ChatSession): void => {
  try {
    const sessions = getSessions(userId);
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat session', e);
  }
};

export const deleteSession = (userId: string, sessionId: string): void => {
  try {
    let sessions = getSessions(userId);
    sessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to delete chat session', e);
  }
};
