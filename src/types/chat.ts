export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isError?: boolean;
  suggestions?: string[];
  confidence?: any;
  explanation?: any;
  insights?: any[];
  raw?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
}
