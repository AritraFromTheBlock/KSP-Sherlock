export interface ParsedChatCommand {
  action: 'filter_map' | 'zoom_hotspot' | 'reset_map' | 'summary' | 'unknown';
  reply: string;
  district?: string;
  risk_level?: 'High' | 'Medium' | 'Low';
  latitude?: number;
  longitude?: number;
}

/**
 * Parses raw chatbot responses (JSON or plain text) into structured command actions.
 */
export function parseChatCommand(rawResponse: any): ParsedChatCommand {
  if (!rawResponse) {
    return { action: 'unknown', reply: 'No response received' };
  }

  // If response is a direct string, fallback to standard text display
  if (typeof rawResponse === 'string') {
    return { action: 'summary', reply: rawResponse };
  }

  try {
    const action = rawResponse.action || 'summary';
    const reply = rawResponse.reply || rawResponse.answer || rawResponse.response || rawResponse.message || '';

    // Standardize coordinates and properties
    const district = rawResponse.district || undefined;
    let risk_level: 'High' | 'Medium' | 'Low' | undefined = undefined;
    if (rawResponse.risk_level === 'High' || rawResponse.risk_level === 'Medium' || rawResponse.risk_level === 'Low') {
      risk_level = rawResponse.risk_level;
    }

    const latitude = typeof rawResponse.latitude === 'number' ? rawResponse.latitude : undefined;
    const longitude = typeof rawResponse.longitude === 'number' ? rawResponse.longitude : undefined;

    return {
      action,
      reply,
      district,
      risk_level,
      latitude,
      longitude
    };
  } catch (e) {
    console.error('[COMMAND-PARSER] JSON command parsing error:', e);
    return {
      action: 'unknown',
      reply: typeof rawResponse === 'object' ? JSON.stringify(rawResponse) : String(rawResponse)
    };
  }
}
export type { ParsedChatCommand as ChatCommandType };
