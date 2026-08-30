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

// SYSTEM 1: General AI Assistant (Render FastAPI /chat)
const defaultBackend = 'https://ksp-sherlock-ai.onrender.com';
const backendUrl = metaEnv.VITE_BACKEND_URL || metaEnv.VITE_API_BASE || defaultBackend;
export const RENDER_BACKEND_URL = backendUrl.replace(/\/$/, '');

export const ASSISTANT_DIRECT_URL = `${RENDER_BACKEND_URL}/chat`;
export const ASSISTANT_RELATIVE_URL = `${RENDER_BACKEND_URL}/chat`;
const assistantEnv = metaEnv.VITE_ASSISTANT_BASE_URL || RENDER_BACKEND_URL;
export const ASSISTANT_BASE_URL = assistantEnv.replace(/\/$/, '');

export const ASSISTANT_ENDPOINT = 
  metaEnv.VITE_ASSISTANT_ENDPOINT || `${ASSISTANT_BASE_URL}/chat`;

// Legacy alias definitions
export const DEPLOYED_CATALYST_ENDPOINT = ASSISTANT_ENDPOINT;
export const CATALYST_ENDPOINT = ASSISTANT_ENDPOINT;

// SYSTEM 2: Hotspot data endpoint (FastAPI /hotspots)
export const MAP_COPILOT_BASE_URL = RENDER_BACKEND_URL;
export const MAP_COPILOT_CHAT_BASE_URL = RENDER_BACKEND_URL;

export const MAP_COPILOT_ENDPOINTS = {
  HEALTH:   `${MAP_COPILOT_BASE_URL}/health`,
  HOTSPOTS: `${MAP_COPILOT_BASE_URL}/hotspots`,
  CHAT:     `${MAP_COPILOT_CHAT_BASE_URL}/chat`,
};

// SYSTEM 3: Escalation Prediction Model (escalation_function — /predict)
export const ESCALATION_DIRECT_URL = 'https://ksp-sherlock-60077726539.development.catalystserverless.in/server/escalation_function/predict';
export const ESCALATION_RELATIVE_URL = '/server/escalation_function/predict';
const escalationEnv = metaEnv.VITE_ESCALATION_ENDPOINT || (metaEnv.DEV ? ESCALATION_RELATIVE_URL : ESCALATION_DIRECT_URL);
export const ESCALATION_ENDPOINT = escalationEnv;

export const API_CONFIG = {
  ASSISTANT_BASE_URL:    ASSISTANT_BASE_URL,
  ASSISTANT_ENDPOINT:    ASSISTANT_ENDPOINT,
  CATALYST_ENDPOINT:     ASSISTANT_ENDPOINT,
  MAP_COPILOT_BASE_URL:  MAP_COPILOT_BASE_URL,
  ESCALATION_ENDPOINT:   ESCALATION_ENDPOINT,
  TIMEOUT_MS: 120000, // 120 seconds network timeout
  MAX_RETRIES: 1,    // Maximum number of network retries
};

// Check if running in development mode
export const IS_DEV = !!metaEnv.DEV;
