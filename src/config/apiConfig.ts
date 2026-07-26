/**
 * API Configuration Layer for KSP SHERLOCK.
 * Configures endpoints for the AI systems:
 *
 * SYSTEM 1: General AI Assistant  → chatbot_function  (/chat)
 * SYSTEM 2: Heatmap Hotspot Data  → hotspot_function  (/hotspots)
 * SYSTEM 2: Heatmap Copilot Chat  → chatbot_function  (/chat)  [hotspot_function has no /chat route]
 *
 * Override the chat backend independently via VITE_MAP_COPILOT_CHAT_ENDPOINT in .env.
 */

const metaEnv = (import.meta as any).env || {};

// SYSTEM 1: General AI Assistant (chatbot_function)
const assistantEnv = metaEnv.VITE_ASSISTANT_BASE_URL || 'https://ksp-sherlock-60077726539.development.catalystserverless.in/server/chatbot_function';
export const ASSISTANT_BASE_URL = assistantEnv.replace(/\/$/, '');

export const ASSISTANT_ENDPOINT = 
  metaEnv.VITE_ASSISTANT_ENDPOINT || `${ASSISTANT_BASE_URL}/chat`;

// Legacy alias definitions
export const DEPLOYED_CATALYST_ENDPOINT = ASSISTANT_ENDPOINT;
export const CATALYST_ENDPOINT = ASSISTANT_ENDPOINT;

// SYSTEM 2: Hotspot data endpoint (hotspot_function — only exposes /hotspots)
const mapCopilotEnv = metaEnv.VITE_MAP_COPILOT_ENDPOINT || metaEnv.VITE_API_BASE || 'https://ksp-sherlock-ai.onrender.com';
export const MAP_COPILOT_BASE_URL = mapCopilotEnv.replace(/\/$/, '');

// The heatmap copilot /chat route lives on chatbot_function (hotspot_function has no /chat).
// Override with VITE_MAP_COPILOT_CHAT_ENDPOINT if the chat moves to its own function later.
const mapCopilotChatEnv = metaEnv.VITE_MAP_COPILOT_CHAT_ENDPOINT || ASSISTANT_BASE_URL;
export const MAP_COPILOT_CHAT_BASE_URL = mapCopilotChatEnv.replace(/\/$/, '');

export const MAP_COPILOT_ENDPOINTS = {
  HEALTH:   `${MAP_COPILOT_BASE_URL}/health`,
  HOTSPOTS: `${MAP_COPILOT_BASE_URL}/hotspots`,
  CHAT:     `${MAP_COPILOT_CHAT_BASE_URL}/chat`,  // chatbot_function, not hotspot_function
};

export const API_CONFIG = {
  ASSISTANT_BASE_URL:    ASSISTANT_BASE_URL,
  ASSISTANT_ENDPOINT:    ASSISTANT_ENDPOINT,
  CATALYST_ENDPOINT:     ASSISTANT_ENDPOINT,
  MAP_COPILOT_BASE_URL:  MAP_COPILOT_BASE_URL,
  TIMEOUT_MS: 120000, // 120 seconds network timeout
  MAX_RETRIES: 1,    // Maximum number of network retries
};

// Check if running in development mode
export const IS_DEV = !!metaEnv.DEV;
