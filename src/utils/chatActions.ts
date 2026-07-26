import { handleHeatmapCommand } from './heatmapCommandHandler';

/**
 * Orchestrator to parse and execute chatbot map action commands.
 * Returns the final text reply to render in the chat logs.
 * Maintain backward compatibility by wrapping the new command handler.
 */
export function executeChatAction(rawResponse: any): string {
  return handleHeatmapCommand(rawResponse);
}

