import { sendHeatmapChat, ChatResponse } from '../services/aiHeatmapService';
import { sendMessage } from '../services/chatApi';
import { handleHeatmapCommand } from './heatmapCommandHandler';
import { HotspotType } from '../services/hotspotService';

export interface ProcessedChatResult {
  replyText: string;
  response: ChatResponse;
}

/**
 * Checks if the user query is related to the Crime Heatmap.
 */
export function isHeatmapRelated(message: string, isOnHeatmapPage = false): boolean {
  if (isOnHeatmapPage) return true;

  const lower = message.toLowerCase();
  
  if (
    lower.includes('why is this hotspot') || 
    lower.includes('highest-risk hotspot') ||
    lower.includes('summarize the current map') ||
    lower.includes('reset the map') ||
    lower.includes('reset map') ||
    lower.includes('show high-risk') ||
    lower.includes('show medium-risk') ||
    lower.includes('show low-risk') ||
    lower.includes('take me to')
  ) {
    return true;
  }

  const keywords = ['heatmap', 'hotspot', 'risk', 'map'];
  return keywords.some(kw => lower.includes(kw));
}

/**
 * Coordinating controller to route queries to the FastAPI backend /chat endpoint,
 * process map_command via handleHeatmapCommand, and return both replyText and full backend response.
 */
export async function handleHeatmapChatQuery(
  question: string,
  language: 'en' | 'kn' = 'en',
  selectedHotspot?: HotspotType | null
): Promise<ProcessedChatResult> {
  console.log('[CHAT-HEATMAP-CONTROLLER] Sending query to FastAPI POST /chat endpoint');
  const response = await sendHeatmapChat(question, language, selectedHotspot);
  
  // Execute map command and extract conversational reply
  const replyText = handleHeatmapCommand(response);

  return {
    replyText: replyText || response.reply,
    response,
  };
}

export async function handleChatQuery(
  question: string,
  language: 'en' | 'kn',
  selectedHotspot: HotspotType | null,
  isOnHeatmapPage = false
): Promise<string> {
  const isHeatmap = isHeatmapRelated(question, isOnHeatmapPage);

  if (isHeatmap) {
    const result = await handleHeatmapChatQuery(question, language, selectedHotspot);
    return result.replyText;
  } else {
    console.log('[CHAT-HEATMAP-CONTROLLER] Routing query to General Chatbot Endpoint');
    const apiResponse = await sendMessage(question, language, selectedHotspot);
    const replyText = handleHeatmapCommand(apiResponse.raw);
    return replyText;
  }
}
