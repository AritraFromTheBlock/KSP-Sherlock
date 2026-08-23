import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Mic, 
  MicOff,
  Paperclip, 
  X,
  Send, 
  Cpu, 
  Compass, 
  ShieldAlert, 
  Search, 
  Flame, 
  Network, 
  UserSquare, 
  FileSpreadsheet,
  Globe,
  ChevronDown,
  Clock,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { sendMessage, runDiagnostics } from '../services/chatApi';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { selectedHotspotStore } from '../utils/selectedHotspotStore';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, ChatSession } from '../types/chat';
import { saveSession } from '../utils/chatHistoryStore';
import { useLocation, useNavigate } from 'react-router-dom';

interface SuggestionCard {
  label: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Lightweight inline markdown renderer.
 * Handles: **bold**, *italic*, newlines, and bullet lines (• or -).
 */
function renderMarkdown(text: string): React.ReactNode {
  return text.split('\n').map((line, lineIdx) => {
    // Parse inline bold (**text**) and italic (*text*)
    const parseInline = (raw: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(raw)) !== null) {
        if (match.index > lastIndex) parts.push(raw.slice(lastIndex, match.index));
        if (match[1] !== undefined) parts.push(<strong key={match.index} className="text-slate-100 font-semibold">{match[1]}</strong>);
        else if (match[2] !== undefined) parts.push(<em key={match.index} className="text-slate-300 italic">{match[2]}</em>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < raw.length) parts.push(raw.slice(lastIndex));
      return parts;
    };

    const isBullet = /^[•\-]\s/.test(line);
    const content = isBullet ? line.slice(2) : line;

    return (
      <span key={lineIdx} className={`block ${isBullet ? 'pl-2' : ''}`}>
        {isBullet && <span className="text-neon-bright mr-1">•</span>}
        {parseInline(content)}
      </span>
    );
  });
}


type Lang = 'en' | 'kn';
type ConnectionStatus = 'connected' | 'checking' | 'failed' | 'offline';

function AIAssistantContent() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState<Lang>('en');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Try to load initial messages from history
  const initialSession = (location.state as any)?.session as ChatSession | undefined;
  
  const [messages, setMessages] = useState<ChatMessage[]>(initialSession?.messages || []);
  const [sessionId, setSessionId] = useState<string>(initialSession?.id || `session-${Date.now()}`);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus('connected');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Run initial health checks and diagnostics on startup
  useEffect(() => {
    let isMounted = true;

    const checkBackendHealth = async (retries = 2) => {
      if (!navigator.onLine) {
        if (isMounted) {
          setStatus('offline');
          setIsCheckingHealth(false);
        }
        return;
      }

      if (isMounted) setStatus('checking');

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const diagnostics = await runDiagnostics();
          if (diagnostics.endpointReachable) {
            if (isMounted) {
              setStatus('connected');
              setIsCheckingHealth(false);
            }
            return;
          }
        } catch {
          // Retry on failure
        }

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      if (isMounted) {
        setStatus('failed');
        setIsCheckingHealth(false);
      }
    };

    checkBackendHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll viewport
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isCheckingHealth]);

  // Persist session to local storage when messages change
  useEffect(() => {
    if (messages.length > 0 && currentUser?.uid) {
      const firstUserMessage = messages.find(m => m.sender === 'user');
      const title = firstUserMessage ? firstUserMessage.text.substring(0, 40) + (firstUserMessage.text.length > 40 ? '...' : '') : 'New Conversation';
      
      const session: ChatSession = {
        id: sessionId,
        title,
        timestamp: messages[0].timestamp, // use first message timestamp
        messages
      };
      saveSession(currentUser.uid, session);
    }
  }, [messages, currentUser, sessionId]);

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(`session-${Date.now()}`);
    // Clear the location state so refreshing doesn't reload the old session
    navigate(location.pathname, { replace: true, state: {} });
  };

  // Dual-language localizations
  const localizedContent = {
    en: {
      title: 'AI Crime Investigation Assistant',
      subtitle: 'AI-Powered Crime Intelligence & Investigation Support',
      status: {
        connected: 'Connected',
        checking: 'Checking...',
        failed: 'Backend Unreachable',
        offline: 'No Internet Connection'
      },
      welcomeTitle: 'Welcome, Inspector Singh',
      welcomeDesc: 'SHERLOCK Neural Engine is fully synced with Karnataka Crime datasets. I can assist with:',
      bullets: [
        'Crime hotspot analysis',
        'FIR search & vector indexing',
        'Criminal network investigation',
        'Offender profiling & alias checks',
        'Case summarization & dossier building',
        'Crime analytics & pattern matching',
        'Predictive intelligence directives'
      ],
      suggestionTitle: 'Suggested Query Prompts',
      suggestions: [
        {
          label: 'Show Bengaluru crime hotspots',
          description: 'Geospatial visualization of crime clustering patterns.',
          icon: <Flame className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'Find repeat offenders',
          description: 'Cross-reference active suspects with history logs.',
          icon: <UserSquare className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'Summarize FIR',
          description: 'Synthesize details of any registered incident dossier.',
          icon: <FileSpreadsheet className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'Analyze criminal network',
          description: 'Map out suspect connections & syndicate links.',
          icon: <Network className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'Predict high-risk locations',
          description: 'AI spatial forecasting based on temporal trends.',
          icon: <Compass className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'Generate investigation report',
          description: 'Synthesize findings into an official PDF draft.',
          icon: <Search className="h-4 w-4 text-neon-bright" />
        }
      ],
      emptyStateTitle: 'Start a conversation with the AI Crime Investigation Assistant',
      emptyStateDesc: 'Query the neural framework for immediate spatial-temporal predictions, incident analysis, or charge sheet summaries.',
      auditTrail: 'LOGGED AUDIT TRAIL ENABLED',
      placeholder: 'Ask about crimes, FIRs, suspects, hotspots, analytics...',
      sendBtn: 'SEND',
      intelSync: 'SECURE INTEL SYNC',
      typingIndicator: 'Analyzing...',
      connectingIndicator: 'Connecting to KSP Intelligence...',
      errorMessage: 'Unable to contact the KSP Intelligence Server. Please try again.',
      offlineAlert: 'No internet connection detected. Sending messages is disabled.',
      noHotspotSelected: 'Please select a hotspot first.'
    },
    kn: {
      title: 'AI ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕಿ',
      subtitle: 'AI-ಚಾಲಿತ ಅಪರಾಧ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ತನಿಖಾ ಬೆಂಬಲ',
      status: {
        connected: 'ಸಂಪರ್ಕಿತಗೊಂಡಿದೆ',
        checking: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
        failed: 'ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿಲ್ಲ',
        offline: 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲ'
      },
      welcomeTitle: 'ಸ್ವಾಗತ, ಇನ್ಸ್ಪೆಕ್ಟರ್ ಸಿಂಗ್',
      welcomeDesc: 'ಶೆರ್ಲಾಕ್ ನ್ಯೂರಲ್ ಇಂಜಿನ್ ಕರ್ನಾಟಕದ ಅಪರಾಧ ದತ್ತಾಂಶಗಳೊಂದಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಸಿಂಕ್ ಆಗಿದೆ. ನಾನು ಈ ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:',
      bullets: [
        'ಅಪರಾಧದ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳ ವಿಶ್ಲೇಷಣೆ',
        'FIR ಹುಡುಕಾಟ ಮತ್ತು ವೆಕ್ಟರ್ ಇಂಡೆಕ್ಸಿಂಗ್',
        'ಅಪರಾಧಿಗಳ ಜಾಲ ತನಿಖೆ',
        'ಅಪರಾಧಿಗಳ ವಿವರಣೆ ಮತ್ತು ಉಪನಾಮ ಪರಿಶೀಲನೆ',
        'ಪ್ರಕರಣದ ಸಾರಾಂಶ ಮತ್ತು ಫೈಲ್ ಸಿದ್ಧಪಡಿಸುವಿಕೆ',
        'ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ವಿನ್ಯಾಸ ಹೊಂದಾಣಿಕೆ',
        'ಮುನ್ಸೂಚಕ ಬುದ್ಧಿಮತ್ತೆ ನಿರ್ದೇಶನಗಳು'
      ],
      suggestionTitle: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು',
      suggestions: [
        {
          label: 'ಬೆಂಗಳೂರಿನ ಅಪರಾಧದ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ತೋರಿಸಿ',
          description: 'ಅಪರಾಧ ಕ್ಲಸ್ಟರಿಂಗ್ ಮಾದರಿಗಳ ಜಿಯೋಸ್ಪೇಷಿಯಲ್ ದೃಶ್ಯೀಕರಣ.',
          icon: <Flame className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'ಮರು ಅಪರಾಧಿಗಳನ್ನು ಪತ್ತೆ ಮಾಡಿ',
          description: 'ಸಕ್ರಿಯ ಶಂಕಿತರನ್ನು ಹಳೆಯ ದಾಖಲೆಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ ನೋಡಿ.',
          icon: <UserSquare className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'FIR ಸಾರಾಂಶ ನೀಡಿ',
          description: 'ಯಾವುದೇ ನೋಂದಾಯಿತ ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಸಂಶ್ಲೇಷಿಸಿ.',
          icon: <FileSpreadsheet className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'ಅಪರಾಧಿ ಜಾಲವನ್ನು ವಿಶ್ಲೇಷಿಸಿ',
          description: 'ಶಂಕಿತರ ಸಂಪರ್ಕಗಳು ಮತ್ತು ಸಿಂಡಿಕೇಟ್ ಲಿಂಕ್‌ಗಳನ್ನು ನಕ್ಷೆ ಮಾಡಿ.',
          icon: <Network className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಸ್ಥಳಗಳನ್ನು ಊಹಿಸಿ',
          description: 'ತಾತ್ಕಾಲಿಕ ಪ್ರವೃತ್ತಿಗಳ ಆಧಾರದ ಮೇಲೆ AI ಪ್ರಾದೇಶಿಕ ಮುನ್ಸೂಚನೆ.',
          icon: <Compass className="h-4 w-4 text-neon-bright" />
        },
        {
          label: 'ತನಿಖಾ ವರದಿಯನ್ನು ರಚಿಸಿ',
          description: 'ಕಂಡುಬಂದ ಅಂಶಗಳನ್ನು ಅಧಿಕೃತ ಪಿಡಿಎಫ್ ಕರಡಿನಲ್ಲಿ ಸಂಶ್ಲೇಷಿಸಿ.',
          icon: <Search className="h-4 w-4 text-neon-bright" />
        }
      ],
      emptyStateTitle: 'AI ಅಪರಾಧ ತನಿಖಾ ಸಹಾಯಕಿಯೊಂದಿಗೆ ಸಂಭಾಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ',
      emptyStateDesc: 'ತ್ವರಿತ ಪ್ರಾದೇಶಿಕ-ತಾತ್ಕಾಲಿಕ ಮುನ್ಸೂಚನೆಗಳು, ಘಟನೆ ವಿಶ್ಲೇಷಣೆ ಅಥವಾ ಚಾರ್ಜ್ ಶೀಟ್ ಸಾರಾಂಶಗಳಿಗಾಗಿ ನ್ಯೂರಲ್ ಫ್ರೇಮ್‌ವರ್ಕ್ ಅನ್ನು ಪ್ರಶ್ನಿಸಿ.',
      auditTrail: 'ದಾಖಲಿತ ಆಡಿಟ್ ಟ್ರಯಲ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
      placeholder: 'ಅಪರಾಧಗಳು, FIR, ಸಂಶಯಿತರು ಅಥವಾ ಹಾಟ್ಸ್ಪಾಟ್ಗಳ ಬಗ್ಗೆ ಕೇಳಿ...',
      sendBtn: 'ಕಳುಹಿಸಿ',
      intelSync: 'ಸುರಕ್ಷಿತ ಇಂಟೆಲ್ ಸಿಂಕ್',
      typingIndicator: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      connectingIndicator: 'KSP ಇಂಟೆಲಿಜೆನ್ಸ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...',
      errorMessage: 'ಕೆಎಸ್ಪಿ ಇಂಟೆಲಿಜೆನ್ಸ್ ಸರ್ವರ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.',
      offlineAlert: 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲ. ಸಂದೇಶ ಕಳುಹಿಸುವಿಕೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.',
      noHotspotSelected: 'ದಯವಿಟ್ಟು ಮೊದಲು ಹಾಟ್‌ಸ್ಪಾಟ್ ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.'
    }
  };

  const current = localizedContent[language];

  // Helper to format timestamps securely
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const toggleVoice = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRec();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
    }
    
    recognitionRef.current.lang = language === 'en' ? 'en-US' : 'kn-IN';
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputValue(transcript);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sends messages to Catalyst endpoint
  const handleSendMessage = async (textToSend: string) => {
    if (!isOnline) return;
    const trimmed = textToSend.trim();
    if ((!trimmed && !selectedFile) || isLoading) return;

    let finalMsg = trimmed;
    if (selectedFile) {
      finalMsg = finalMsg ? `${finalMsg} [Attached File: ${selectedFile.name}]` : `[Attached File: ${selectedFile.name}]`;
    }

    // Check context constraint for hotspot explanation command
    const isHotspotQuery = trimmed.toLowerCase().includes('why is this hotspot high risk');
    const selectedHotspot = selectedHotspotStore.getState().selectedHotspot;

    if (isHotspotQuery && !selectedHotspot) {
      // Short-circuit: Show warning bubble and exit
      const warningMsg: ChatMessage = {
        id: `msg-${Date.now()}-warn`,
        sender: 'ai',
        text: current.noHotspotSelected,
        timestamp: getFormattedTime()
      };
      setMessages(prev => [
        ...prev, 
        { id: `msg-${Date.now()}-user`, sender: 'user', text: trimmed, timestamp: getFormattedTime() },
        warningMsg
      ]);
      setInputValue('');
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: finalMsg,
      timestamp: getFormattedTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSelectedFile(null);
    setIsLoading(true);
    setStatus('checking');

    try {
      // Direct call to KSP-SHERLOCK-ASSISTANT backend
      const apiResponse = await sendMessage(finalMsg, language, selectedHotspot);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: apiResponse.answer || apiResponse.text,
        timestamp: getFormattedTime(),
        isError: apiResponse.raw?.isError || false,
        suggestions: apiResponse.suggestions,
        confidence: apiResponse.confidence,
        explanation: apiResponse.explanation,
        insights: apiResponse.insights,
        raw: apiResponse.raw,
      };

      setMessages(prev => [...prev, aiMsg]);
      setStatus(apiResponse.raw?.isError ? 'failed' : 'connected');
    } catch (error: any) {
      console.error('[SHERLOCK-UI] Call exception:', error);
      
      const isClientErr = error.message?.includes('HTTP Client Error');
      const errText = isClientErr 
        ? 'The server returned an unexpected response.' 
        : current.errorMessage;

      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'ai',
        text: errText,
        timestamp: getFormattedTime(),
        isError: true
      };

      setMessages(prev => [...prev, errorMsg]);
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (promptText: string) => {
    if (!isOnline || isLoading) return;
    handleSendMessage(promptText);
  };

  // Status indicators color resolver
  const getStatusBadgeStyle = () => {
    if (!isOnline) {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    switch (status) {
      case 'connected':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'checking':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'failed':
      default:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  const getStatusBadgeLabel = () => {
    if (!isOnline) {
      return current.status.offline;
    }
    switch (status) {
      case 'connected':
        return current.status.connected;
      case 'checking':
        return current.status.checking;
      case 'failed':
      default:
        return current.status.failed;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-edge/60 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon/10 border border-neon/30 text-neon-bright shadow-neon-sm animate-pulse">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-slate-100">
              {current.title}
            </h1>
            <p className="font-body text-xs text-slate-400 mt-0.5">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2 select-none shrink-0 relative">
          
          {/* Diagnostic Status Indicator */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs border ${getStatusBadgeStyle()}`}>
            <span className={`h-2 w-2 rounded-full ${
              !isOnline 
                ? 'bg-red-400'
                : status === 'connected' 
                ? 'bg-emerald-400 animate-ping' 
                : status === 'checking'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-red-400'
            }`} />
            <span className="font-bold tracking-wide">
              {getStatusBadgeLabel()}
            </span>
          </div>

          {/* Lang Dropdown Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-panel border border-edge hover:border-neon/40 px-3.5 py-1.5 rounded-lg text-slate-200 text-xs font-semibold tracking-wide transition-all"
          >
            <Globe className="h-4 w-4 text-neon-bright" />
            <span>{language === 'en' ? '🇬🇧 English' : '🇮🇳 ಕನ್ನಡ'}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Languages Dropdown options */}
          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-edge bg-panel shadow-2xl z-50 overflow-hidden font-body opacity-100"
                >
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-edge hover:text-neon-bright transition-colors flex items-center justify-between ${language === 'en' ? 'text-neon-bright bg-edge' : 'text-slate-300'}`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'en' && <span className="h-1.5 w-1.5 rounded-full bg-neon-bright" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('kn');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs hover:bg-edge hover:text-neon-bright transition-colors flex items-center justify-between ${language === 'kn' ? 'text-neon-bright bg-edge' : 'text-slate-300'}`}
                  >
                    <span>🇮🇳 ಕನ್ನಡ (Kannada)</span>
                    {language === 'kn' && <span className="h-1.5 w-1.5 rounded-full bg-neon-bright" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 bg-neon/10 hover:bg-neon/20 border border-neon/30 px-3.5 py-1.5 rounded-lg text-neon-bright text-xs font-semibold tracking-wide transition-all ml-2"
          >
            + New Chat
          </button>
        </div>
      </div>

      {/* Main Body viewport */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Hand: Welcome Card & Suggestions (hidden on chat load) */}
        {messages.length === 0 && (
          <div className="w-full lg:w-[35%] flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar shrink-0">
            {/* Welcome Card */}
            <div className="relative rounded-xl border border-neon/30 bg-gradient-to-b from-panel/90 to-abyss/85 p-5 shadow-lg backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 h-24 w-24 rounded-full bg-neon/5 blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-neon-bright" />
                <h2 className="font-display font-bold text-slate-100 text-base tracking-wide">
                  {current.welcomeTitle}
                </h2>
              </div>
              <p className="font-body text-xs text-slate-300 mb-3.5 leading-relaxed">
                {current.welcomeDesc}
              </p>
              <ul className="space-y-2.5 font-body text-xs text-slate-400">
                {current.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon mt-1.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions cards list */}
            <div className="space-y-3">
              <h3 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest pl-1">
                {current.suggestionTitle}
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {current.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug.label)}
                    disabled={!isOnline || isLoading}
                    className="w-full text-left group flex items-start gap-3 p-3.5 rounded-xl border border-edge bg-panel/30 hover:border-neon/40 hover:bg-panel/60 transition-all duration-200 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-void border border-edge group-hover:border-neon/30 transition-colors">
                      {sug.icon}
                    </div>
                    <div>
                      <h4 className="font-body text-xs font-semibold text-slate-200 group-hover:text-neon-bright transition-colors">
                        {sug.label}
                      </h4>
                      <p className="font-body text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {sug.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Active Conversation area */}
        <div className="flex-1 flex flex-col rounded-xl border border-edge bg-panel/75 backdrop-blur-md overflow-hidden shadow-lg h-full">
          
          {isCheckingHealth ? (
            /* INITIAL PING CONNECTION STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10 border border-neon/20 text-neon-bright animate-spin mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs text-slate-400">
                {current.connectingIndicator}
              </span>
            </div>
          ) : messages.length === 0 ? (
            /* EMPTY CHAT ILLUSTRATION */
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neon/10 border border-neon/20 mb-6 shadow-neon-sm">
                <Bot className="h-8 w-8 text-neon-bright" />
              </div>
              <h3 className="font-display text-lg font-bold tracking-wide text-slate-200">
                {current.emptyStateTitle}
              </h3>
              <p className="mt-2 font-body text-xs text-slate-400 max-w-sm leading-relaxed">
                {current.emptyStateDesc}
              </p>
              <div className="flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-void/50 border border-edge/60 max-w-xs font-mono text-[10px] text-slate-400">
                <ShieldAlert className="h-4 w-4 text-neon" />
                <span>{current.auditTrail}</span>
              </div>
            </div>
          ) : (
            /* CONVERSATION SCROLLABLE AREA */
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar bg-void/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon/10 border border-neon/20 text-neon-bright">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}

                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md flex flex-col relative ${
                    msg.sender === 'user'
                      ? 'bg-neon/15 border border-neon/30 text-slate-100 rounded-tr-none'
                      : msg.isError 
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-none'
                      : 'bg-panel border border-edge/80 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.isError && (
                      <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[10px] text-red-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>ERROR STATUS</span>
                      </div>
                    )}
                    <div className="text-sm font-body leading-relaxed select-text space-y-0.5">
                      {msg.sender === 'ai' ? renderMarkdown(msg.text) : (
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] font-mono text-slate-500 select-none">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loader indicator bubble */}
              {isLoading && (
                <div className="flex w-full items-start gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon/10 border border-neon/20 text-neon-bright animate-spin">
                    <Cpu className="h-4 w-4" />
                  </div>
                  
                  <div className="bg-panel border border-edge/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-md text-slate-300 max-w-[80%]">
                    <div className="flex items-center gap-3">
                      <div className="flex space-x-1.5">
                        <div className="h-2 w-2 rounded-full bg-neon-bright animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 rounded-full bg-neon-bright animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 rounded-full bg-neon-bright animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        {current.typingIndicator}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Bottom Chat Input box */}
          <div className="p-4 bg-void/35 border-t border-edge/80 space-y-3 shrink-0">
            {/* Offline Alert Bar */}
            {!isOnline && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                <WifiOff className="h-4 w-4" />
                <span>{current.offlineAlert}</span>
              </div>
            )}

            {/* File Attachment Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between bg-neon/10 border border-neon/30 px-3 py-2 rounded-lg max-w-sm mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="h-4 w-4 text-neon-bright shrink-0" />
                  <span className="text-xs text-slate-200 truncate">{selectedFile.name}</span>
                </div>
                <button 
                  onClick={removeFile}
                  className="text-slate-400 hover:text-red-400 ml-2 shrink-0 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="relative flex items-center">
              {/* Attachment */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-4 text-slate-400 hover:text-neon-bright transition-colors"
                title="Attach Document"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* TextInput */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={current.placeholder}
                disabled={!isOnline || isLoading || isCheckingHealth}
                className="w-full bg-void/90 border border-edge/80 rounded-full pl-12 pr-24 py-3.5 text-xs md:text-sm text-slate-200 outline-none focus:border-neon focus:shadow-neon-sm transition-all placeholder-slate-500 font-body disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`h-8 w-8 flex items-center justify-center rounded-full transition-all ${
                    isListening 
                      ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20 animate-pulse' 
                      : 'text-slate-400 hover:text-neon-bright hover:bg-panel/50'
                  }`}
                  title={isListening ? "Stop Voice Command" : "Voice Command"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                
                {/* Submit button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={(!inputValue.trim() && !selectedFile) || !isOnline || isLoading || isCheckingHealth}
                  className="h-9 px-4 flex items-center justify-center rounded-full bg-neon/15 text-neon-bright border border-neon/30 hover:bg-neon hover:text-void transition-all font-mono text-xs font-bold gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{current.sendBtn}</span>
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-3">
              <span>{current.intelSync}</span>
              <span>CATALYST INSTANCE V1.0</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Wrapper wrapping components inside custom Error Boundary shield
export default function AIAssistant() {
  return (
    <ErrorBoundary fallbackTitle="AI Crime Investigation Console Crash Protection">
      <AIAssistantContent />
    </ErrorBoundary>
  );
}
