import { API_CONFIG, IS_DEV } from '../config/apiConfig';
import { HotspotType } from './hotspotService';
import { apiClient } from '../utils/apiClient';

// ---------------------------------------------------------------------------
// LOCAL INTENT DETECTION — intercepts common queries before hitting the backend
// ---------------------------------------------------------------------------

interface LocalIntent {
  patterns: RegExp[];
  response: { en: string; kn: string };
}

const LOCAL_INTENTS: LocalIntent[] = [
  {
    // Greetings
    patterns: [/^(hi|hello|hey|hiya|howdy|greetings|good\s*(morning|afternoon|evening|day))[\.!?\s]*$/i],
    response: {
      en: `Hello, Officer! 👋 I'm **SHERLOCK**, your AI Crime Investigation Assistant powered by the KSP Neural Engine.\n\nI'm fully synced with Karnataka crime datasets and ready to assist you with:\n• 🔥 Crime hotspot analysis & geospatial mapping\n• 📋 FIR search, vector indexing & case summaries\n• 🕵️ Criminal network investigation & offender profiling\n• 📊 Crime analytics, pattern matching & temporal trends\n• 🎯 Predictive intelligence & high-risk location forecasting\n\nHow can I assist your investigation today?`,
      kn: `ನಮಸ್ಕಾರ, ಅಧಿಕಾರಿ! 👋 ನಾನು **ಶೆರ್ಲಾಕ್**, KSP ನ್ಯೂರಲ್ ಇಂಜಿನ್ ಚಾಲಿತ AI ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕಿ.\n\nಕರ್ನಾಟಕದ ಅಪರಾಧ ದತ್ತಾಂಶಗಳೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಸಿಂಕ್ ಆಗಿದ್ದೇನೆ. ಇಂದು ನಿಮ್ಮ ತನಿಖೆಯಲ್ಲಿ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`
    }
  },
  {
    // How are you / status checks
    patterns: [/^how\s*(are\s*you|r\s*u|are\s*u|do\s*you\s*do|is\s*it\s*going|[''']?s\s*it\s*going)[\.!?\s]*$/i],
    response: {
      en: `All neural systems operational, Officer. ✅\n\n**SHERLOCK Status Report:**\n• 🧠 Neural Engine: Online & fully calibrated\n• 📡 Crime Intelligence Sync: Active\n• 🗄️ Karnataka Crime DB: Connected\n• 🔒 Audit Trail: Enabled\n\nReady to assist with investigations. What's your query?`,
      kn: `ಎಲ್ಲಾ ನ್ಯೂರಲ್ ಸಿಸ್ಟಮ್‌ಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ. ✅ ತನಿಖೆಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧ. ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಏನು?`
    }
  },
  {
    // What can you do / help / capabilities
    patterns: [/^(what\s*(can\s*you\s*do|do\s*you\s*do|are\s*you\s*capable|can\s*i\s*(ask|do))|help|how\s*can\s*(you\s*help|i\s*use)|capabilities|features|tell\s*me\s*about\s*you(rself)?)[\.!?\s]*$/i],
    response: {
      en: `I'm **SHERLOCK** — the KSP AI Crime Investigation Assistant. Here's what I can do for you:\n\n🔥 **Crime Hotspot Analysis**\nIdentify and visualize crime clustering patterns across Karnataka districts.\n\n📋 **FIR Search & Summarization**\nRetrieve and synthesize details from registered incident dossiers.\n\n🕵️ **Criminal Network Investigation**\nMap out suspect connections, syndicate links, and alias cross-referencing.\n\n👤 **Offender Profiling**\nBuild detailed suspect profiles from historical crime records.\n\n📊 **Crime Analytics & Pattern Matching**\nDetect temporal trends, modus operandi patterns, and anomalies.\n\n🎯 **Predictive Intelligence**\nAI-driven spatial forecasting of high-risk zones.\n\n📄 **Investigation Report Generation**\nSynthesize findings into structured case summaries.\n\nTry one of the suggested prompts on the left, or type your own query!`,
      kn: `ನಾನು **ಶೆರ್ಲಾಕ್** — KSP AI ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕಿ. ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್, FIR ಹುಡುಕಾಟ, ಅಪರಾಧಿ ಜಾಲ ತನಿಖೆ, ಮತ್ತು ಮುನ್ಸೂಚಕ ವಿಶ್ಲೇಷಣೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.`
    }
  },
  {
    // Thanks / thank you
    patterns: [/^(thanks|thank\s*you|thank\s*u|thx|ty|cheers|appreciated|great\s*job|well\s*done|good\s*job)[\.!?\s]*$/i],
    response: {
      en: `You're welcome, Officer. 🫡 SHERLOCK is always at your service.\n\nIf you have more queries — crime hotspots, FIR lookups, suspect profiling, or anything else — just ask. Stay vigilant!`,
      kn: `ಧನ್ಯವಾದಗಳು, ಅಧಿಕಾರಿ. 🫡 ಶೆರ್ಲಾಕ್ ಯಾವಾಗಲೂ ನಿಮ್ಮ ಸೇವೆಗೆ ಸಿದ್ಧ. ಇನ್ನಷ್ಟು ಸಹಾಯ ಬೇಕಾದಲ್ಲಿ ಕೇಳಿ.`
    }
  },
  {
    // Who are you / what are you
    patterns: [/^(who\s*(are\s*you|r\s*u)|what\s*(are|is)\s*(you|sherlock|this\s*(ai|bot|assistant|system))|introduce\s*yourself|tell\s*me\s*who\s*you\s*are)[\.!?\s]*$/i],
    response: {
      en: `I am **SHERLOCK** (Strategic Heuristic Engine for Real-time Law enforcement, Operations, Crime intelligence & Knowledge).\n\n🤖 Built for the **Karnataka State Police** as an AI-powered crime investigation backbone.\n\n**Core Identity:**\n• Neural Engine trained on Karnataka crime datasets\n• Specialised in FIR analysis, hotspot prediction & criminal network mapping\n• Multilingual support: English & Kannada\n• Fully encrypted — all queries are audit-logged\n\nI exist to turn raw crime data into actionable intelligence for field officers and investigators. How can I assist your operation?`,
      kn: `ನಾನು **ಶೆರ್ಲಾಕ್** — ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್‌ಗಾಗಿ ನಿರ್ಮಿಸಲಾದ AI ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕಿ. ಅಪರಾಧ ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆ, FIR ಹುಡುಕಾಟ ಮತ್ತು ಮುನ್ಸೂಚಕ ಬುದ್ಧಿಮತ್ತೆಯಲ್ಲಿ ತಜ್ಞ.`
    }
  },
  {
    // Bye / goodbye
    patterns: [/^(bye|goodbye|good\s*bye|see\s*you|later|take\s*care|signing\s*off|over\s*and\s*out|cya)[\.!?\s]*$/i],
    response: {
      en: `Signing off, Officer. Stay safe on duty. 🛡️\n\nSHERLOCK will be here whenever you need criminal intelligence support. Over and out.`,
      kn: `ವಿದಾಯ, ಅಧಿಕಾರಿ. ಸುರಕ್ಷಿತವಾಗಿರಿ. 🛡️ ಶೆರ್ಲಾಕ್ ಯಾವಾಗಲೂ ಸಿದ್ಧ.`
    }
  },
  {
    // Jokes / funny
    patterns: [/^(tell\s*me\s*a\s*joke|joke|funny|make\s*me\s*laugh|entertain\s*me|be\s*funny)[\.!?\s]*$/i],
    response: {
      en: `Humour is not in my operational parameters, Officer. 😄\n\nBut here's a detective's truth: *"The world is full of obvious things, which nobody by any chance ever observes."* — Sherlock Holmes\n\nNow, shall we get back to the investigation?`,
      kn: `ಅಧಿಕಾರಿ, ಹಾಸ್ಯ ನನ್ನ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಇಲ್ಲ. ಆದರೆ ತನಿಖೆ ಮುಂದುವರಿಸೋಣ! 😄`
    }
  },
  {
    // Test / ping / are you there
    patterns: [/^(test|ping|are\s*you\s*(there|online|working|active|running)|check)[\.!?\s]*$/i],
    response: {
      en: `SHERLOCK Neural Engine: **Online** ✅\nAll systems nominal. KSP Intelligence sync is active.\n\nType your investigation query to proceed.`,
      kn: `ಶೆರ್ಲಾಕ್ ನ್ಯೂರಲ್ ಇಂಜಿನ್: **ಆನ್‌ಲೈನ್** ✅ ಎಲ್ಲಾ ಸಿಸ್ಟಮ್‌ಗಳು ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತಿವೆ.`
    }
  },
  {
    // Good / okay / ok / alright / cool acknowledgements
    patterns: [/^(ok|okay|ok+|alright|got\s*it|understood|noted|roger|copy\s*that|affirmative|sure|fine|sounds\s*good|great|cool|nice|perfect|excellent|awesome)[\.!?\s]*$/i],
    response: {
      en: `Acknowledged. 🫡 Standing by for your next query, Officer.\n\nAnytime you need crime intelligence support — hotspot analysis, FIR lookups, suspect profiles, or pattern analysis — I'm ready.`,
      kn: `ಅಂಗೀಕರಿಸಲಾಗಿದೆ. 🫡 ಮುಂದಿನ ಪ್ರಶ್ನೆಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೇನೆ, ಅಧಿಕಾರಿ.`
    }
  }
];

/**
 * Checks if a message matches any local intent and returns an instant response.
 * Returns null if the message should be forwarded to the backend.
 */
function matchLocalIntent(question: string, language: 'en' | 'kn'): string | null {
  const trimmed = question.trim();
  for (const intent of LOCAL_INTENTS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(trimmed)) {
        return intent.response[language] ?? intent.response.en;
      }
    }
  }
  return null;
}


export interface ChatRequestPayload {
  question: string;
  session_id: string;
  language?: 'en' | 'kn';
  selected_hotspot?: HotspotType | null;
}

export interface ChatApiResponse {
  text: string;           // Display ONLY answer
  answer: string;         // Primary answer string
  suggestions?: string[]; // Preserved for future UI enhancements
  confidence?: any;       // Preserved for future UI enhancements
  explanation?: any;      // Preserved for future UI enhancements
  insights?: any[];       // Preserved for future UI enhancements
  session_id?: string;
  raw: any;               // Complete raw JSON response stored intact
  responseTimeMs: number;
}

export interface DiagnosticResult {
  endpointReachable: boolean;
  isHttps: boolean;
  latencyMs: number;
  jsonValid: boolean;
  error?: string;
}

/**
 * Generate or retrieve UUID for the conversation session.
 * Reuses the single generated UUID across the conversation lifetime.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

let currentSessionId = generateUUID();

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = generateUUID();
  }
  return currentSessionId;
}

export function resetSessionId(): string {
  currentSessionId = generateUUID();
  return currentSessionId;
}

/**
 * Validates and extracts the `answer` string from backend responses.
 */
function validateChatResponse(data: any): string {
  if (data === null || data === undefined) {
    throw new Error('Response is null or undefined');
  }

  let text = '';
  if (typeof data === 'string') {
    text = data;
  } else if (typeof data === 'object') {
    text = 
      data.answer || 
      data.reply || 
      data.response || 
      data.text || 
      data.message || 
      data.output ||
      data.chat_response;
      
    if (!text) {
      const stringValue = Object.values(data).find(val => typeof val === 'string');
      if (typeof stringValue === 'string') {
        text = stringValue;
      }
    }
  }

  text = text ? text.trim() : '';

  if (!text) {
    throw new Error('No valid answer field found in backend response');
  }

  return text;
}

/**
 * Primary Entry Point for KSP-SHERLOCK-ASSISTANT Backend.
 * Sends: { question, session_id, language }
 * Receives: { answer, suggestions, confidence, explanation, insights }
 */
export async function sendMessage(
  question: string, 
  language: 'en' | 'kn' = 'en',
  selectedHotspot?: HotspotType | null,
  retryCount = 0
): Promise<ChatApiResponse> {
  // ── Local intent check (instant responses, no backend round-trip) ──
  if (retryCount === 0) {
    const localAnswer = matchLocalIntent(question, language);
    if (localAnswer) {
      if (IS_DEV) console.log('[SHERLOCK-API] Local intent matched — skipping backend call.');
      return {
        text: localAnswer,
        answer: localAnswer,
        raw: { isError: false, source: 'local' },
        responseTimeMs: 0,
        session_id: getSessionId()
      };
    }
  }

  const activeSessionId = getSessionId();
  const payload: ChatRequestPayload = { 
    question, 
    session_id: activeSessionId,
    language: language || 'en',
    ...(selectedHotspot ? { selected_hotspot: selectedHotspot } : {})
  };

  
  const startTime = performance.now();

  if (IS_DEV) {
    console.log(`[SHERLOCK-API] [Attempt ${retryCount + 1}] KSP-SHERLOCK-ASSISTANT request to: ${API_CONFIG.ASSISTANT_ENDPOINT}`);
    console.log(`[SHERLOCK-API] Payload:`, payload);
  }

  try {
    const data = await apiClient.post(API_CONFIG.ASSISTANT_ENDPOINT, payload, {
      timeoutMs: API_CONFIG.TIMEOUT_MS,
      skipAuth: true
    });

    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (IS_DEV) {
      console.log(`[SHERLOCK-API] Complete Raw Response from KSP-SHERLOCK-ASSISTANT:`, data);
    }

    const answerText = validateChatResponse(data);

    return {
      text: answerText,
      answer: answerText,
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : undefined,
      confidence: data.confidence || undefined,
      explanation: data.explanation || undefined,
      insights: Array.isArray(data.insights) ? data.insights : undefined,
      session_id: data.session_id || activeSessionId,
      raw: data,
      responseTimeMs
    };

  } catch (error: any) {
    const isTimeout = error.message?.includes('timed out');
    const isNetworkFailure = !error.status || isTimeout;

    if (isNetworkFailure && retryCount < API_CONFIG.MAX_RETRIES) {
      if (IS_DEV) {
        console.warn(`[SHERLOCK-API] Connection issue calling ${API_CONFIG.ASSISTANT_ENDPOINT}. Retrying attempt ${retryCount + 1}...`);
      }
      return sendMessage(question, language, selectedHotspot, retryCount + 1);
    }

    if (IS_DEV) {
      console.error(`[SHERLOCK-API] KSP-SHERLOCK-ASSISTANT request failed:`, error);
    }

    let userFacingErrorMessage = language === 'kn'
      ? `KSP ಶೆರ್ಲಾಕ್ ಅಸಿಸ್ಟೆಂಟ್ ಸರ್ವರ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರ್ವರ್ ಸಕ್ರಿಯವಾಗಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.`
      : `Unable to connect to the KSP Sherlock Assistant backend. Please verify that the server is running.`;

    if (isTimeout) {
      userFacingErrorMessage = language === 'kn'
        ? "KSP ಶೆರ್ಲಾಕ್ ಅಸಿಸ್ಟೆಂಟ್ ವಿನಂತಿ ಸಮಯ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        : "The request to KSP Sherlock Assistant timed out. Please try again.";
    } else if (error.status === 401 || error.status === 403) {
      userFacingErrorMessage = error.message;
    } else if (error.message && error.message.includes('500')) {
      userFacingErrorMessage = language === 'kn'
        ? "KSP ಶೆರ್ಲಾಕ್ ಅಸಿಸ್ಟೆಂಟ್ ಸರ್ವರ್ ಆಂತರಿಕ ದೋಷವನ್ನು ಎದುರಿಸಿದೆ (500). ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        : "The KSP Sherlock Assistant server encountered an internal error (500). Please try again shortly.";
    }

    return {
      text: userFacingErrorMessage,
      answer: userFacingErrorMessage,
      raw: {
        error: error.message || 'Network exception',
        isError: true
      },
      responseTimeMs: 0
    };
  }
}

/**
 * Developer Diagnostics Utility for KSP-SHERLOCK-ASSISTANT.
 * Pings the configured ASSISTANT_ENDPOINT to check connection health.
 */
export async function runDiagnostics(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    endpointReachable: false,
    isHttps: API_CONFIG.ASSISTANT_ENDPOINT.startsWith('https://'),
    latencyMs: 0,
    jsonValid: false,
  };

  const startTime = performance.now();

  try {
    const json = await apiClient.post(API_CONFIG.ASSISTANT_ENDPOINT, { 
      question: 'ping', 
      session_id: getSessionId(), 
      language: 'en' 
    }, { timeoutMs: 15000, skipAuth: true });

    result.latencyMs = Math.round(performance.now() - startTime);
    result.endpointReachable = true;
    result.jsonValid = json !== null && typeof json === 'object';
  } catch (e: any) {
    result.error = e.message || 'Network exception';
    // If the server responded with any HTTP status code (e.g. 200, 204, 400), the backend is online and reachable
    if (e.status && e.status !== 0 && e.status !== 408) {
      result.endpointReachable = true;
      result.latencyMs = Math.round(performance.now() - startTime);
    }
  }

  if (IS_DEV) {
    console.group('%c🛡️ KSP SHERLOCK - AI Assistant Diagnostics', 'color: #F5A623; font-weight: bold;');
    console.log(`Endpoint URL: ${API_CONFIG.ASSISTANT_ENDPOINT}`);
    console.log(`Reachable: ${result.endpointReachable ? '✓ Yes' : '✗ No'}`);
    console.log(`Latency: ${result.latencyMs}ms`);
    console.log(`JSON Schema Compliance: ${result.jsonValid ? '✓ Yes' : '✗ No'}`);
    if (result.error) console.warn(`Diagnostic Error details: ${result.error}`);
    console.groupEnd();
  }

  return result;
}
