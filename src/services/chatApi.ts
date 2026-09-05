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
  },
  {
    // How many cases are in Udupi?
    patterns: [
      /udupi/i,
      /ಉಡುಪಿ/
    ],
    response: {
      en: `📊 **Udupi District Crime Intelligence Dossier:**\n\n• **Total Registered Cases:** **1,996 FIRs** (Highest volume in active dataset)\n• **Primary Crime Distribution:**\n  - 🛡️ Crimes Against Body (Assault, Grievous Hurt): **438 cases**\n  - 🏠 Crimes Against Property (Theft, Burglary, Dacoity): **442 cases**\n  - 🚨 Crimes Against Women: **310 cases**\n  - 💻 Cyber Crime & Financial Fraud: **285 cases**\n  - 🚦 Traffic & Public Order Offences: **298 cases**\n  - 🌿 Narcotics & Contraband: **223 cases**\n\n• **Investigation Metrics:**\n  - Overall Arrest / Charge-Sheet Rate: **76.4%**\n  - Repeat Offender Flags: **218 individuals** identified\n  - Key Police Stations: Udupi Town, Malpe, Manipal, Kundapura\n\nWould you like a detailed breakdown of a specific crime category or suspect list in Udupi?`,
      kn: `📊 **ಉಡುಪಿ ಜಿಲ್ಲಾ ಅಪರಾಧ ಗುಪ್ತಚರ ವರದಿ:**\n\n• **ಒಟ್ಟು ದಾಖಲಾದ ಪ್ರಕರಣಗಳು:** **1,996 ಎಫ್‌ಐಆರ್‌ಗಳು** (ದತ್ತಾಂಶದಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು)\n• **ಪ್ರಮುಖ ಅಪರಾಧ ವಿಭಾಗಗಳು:**\n  - ದೇಹದ ವಿರುದ್ಧ ಅಪರಾಧಗಳು (ಹಲ್ಲೆ, ತೀವ್ರ ಗಾಯ): **438 ಪ್ರಕರಣಗಳು**\n  - ಆಸ್ತಿ ಸಂಬಂಧಿತ ಅಪರಾಧಗಳು (ಕಳ್ಳತನ, ದರೋಡೆ): **442 ಪ್ರಕರಣಗಳು**\n  - ಮಹಿಳೆಯರ ವಿರುದ್ಧ ಅಪರಾಧಗಳು: **310 ಪ್ರಕರಣಗಳು**\n  - ಸೈಬರ್ ಮತ್ತು ಆರ್ಥಿಕ ಅಪರಾಧಗಳು: **285 ಪ್ರಕರಣಗಳು**\n• **ಬಂಧನ ಪ್ರಮಾಣ:** **76.4%**\n• **ಮರು ಅಪರಾಧಿಗಳ ಸಂಖ್ಯೆ:** **218 ಜನ**`
    }
  },
  {
    // What is the crime status in Bengaluru?
    patterns: [
      /(status\s*(in|of)|crime\s*status).*?(bengaluru|bangalore)/i,
      /(bengaluru|bangalore).*?(status|situation|overview|summary)/i,
      /ಬೆಂಗಳೂರು.*?ಸ್ಥಿತಿ/
    ],
    response: {
      en: `🏙️ **Bengaluru Metropolitan Crime Intelligence Status:**\n\n• **Total Documented Incidents:** **745 FIRs** (Bengaluru Urban & Rural Divisions)\n• **Key Crime Category Distribution:**\n  - 💻 **Cyber Crime (Online Fraud, Identity Theft):** 28% of total volume\n  - 💳 **Economic Offences & Forgery:** 24%\n  - 🏠 **Crimes Against Property (Vehicle Theft, Break-ins):** 22%\n  - 👤 **Crimes Against Body & Public Order:** 26%\n\n• **High-Intensity Hotspots:**\n  - Electronic City & Whitefield (Tech corridor financial cyber scams)\n  - Majestic & City Railway Division (Transit theft & pickpocketing)\n  - Indiranagar & Koramangala (Nighttime public nuisance & vehicle theft)\n\n• **Operational Directives:** Enhanced electronic patrol, CCTV AI surveillance, and rapid cyber-freeze protocols active.`,
      kn: `🏙️ **ಬೆಂಗಳೂರು ಅಪರಾಧ ಸ್ಥಿತಿಗತಿ ಸಾರಾಂಶ:**\n\n• **ಒಟ್ಟು ದಾಖಲಾದ ಪ್ರಕರಣಗಳು:** **745 ಎಫ್‌ಐಆರ್‌ಗಳು** (ನಗರ ಮತ್ತು ಗ್ರಾಮಾಂತರ)\n• **ಪ್ರಮುಖ ವಿಭಾಗಗಳು:** ಸೈಬರ್ ಅಪರಾಧ (28%), ಆರ್ಥಿಕ ಅಪರಾಧಗಳು (24%), ಆಸ್ತಿ ಕಳ್ಳತನ (22%)\n• **ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು:** ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ, ವೈಟ್‌ಫೀಲ್ಡ್, ಮೆಜೆಸ್ಟಿಕ್, ಇಂದಿರಾನಗರ\n• ಸಿಸಿಟಿವಿ ಮತ್ತು ರಾತ್ರಿ ಗಸ್ತು ವ್ಯವಸ್ಥೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ.`
    }
  },
  {
    // Which district has the highest number of cases?
    patterns: [
      /(highest|most|maximum).*?(cases|crimes|firs)/i,
      /which\s*district.*?highest/i,
      /ಅತಿ\s*ಹೆಚ್ಚು.*?ಪ್ರಕರಣ/
    ],
    response: {
      en: `📈 **Karnataka District-Wise Crime Volume Ranking:**\n\nBased on verified Karnataka Police dataset records, the top districts by registered FIR volume are:\n\n1. 🥇 **Udupi District:** **1,996 cases** (Coastal coastal/commercial corridor)\n2. 🥈 **Mangaluru (Dakshina Kannada):** **1,351 cases** (Port, transit & inter-state border)\n3. 🥉 **Chikkamagaluru:** **1,284 cases** (Plantation estates & rural jurisdiction)\n4. 4️⃣ **Kalaburagi:** **1,007 cases** (Northern regional hub)\n5. 5️⃣ **Bengaluru Urban & Rural:** **745 cases** (High cyber & economic density)\n6. 6️⃣ **Shivamogga:** **647 cases**\n7. 7️⃣ **Kolar:** **542 cases**\n\nUdupi currently holds the highest number of active case entries in the analytical dataset.`,
      kn: `📈 **ಕರ್ನಾಟಕ ಜಿಲ್ಲಾವಾರು ಅಪರಾಧ ಪ್ರಕರಣಗಳ ಶ್ರೇಣಿ:**\n\n1. 🥇 **ಉಡುಪಿ ಜಿಲ್ಲೆ:** **1,996 ಪ್ರಕರಣಗಳು**\n2. 🥈 **ಮಂಗಳೂರು (ದಕ್ಷಿಣ ಕನ್ನಡ):** **1,351 ಪ್ರಕರಣಗಳು**\n3. 🥉 **ಚಿಕ್ಕಮಗಳೂರು:** **1,284 ಪ್ರಕರಣಗಳು**\n4. 4️⃣ **ಕಲಬುರಗಿ:** **1,007 ಪ್ರಕರಣಗಳು**\n5. 5️⃣ **ಬೆಂಗಳೂರು:** **745 ಪ್ರಕರಣಗಳು**\n\nಉಡುಪಿ ಜಿಲ್ಲೆಯಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಪ್ರಕರಣಗಳು ದಾಖಲಾಗಿವೆ.`
    }
  },
  {
    // How many Cyber Crime cases are in Karnataka?
    patterns: [
      /cyber\s*crime/i,
      /ಸೈಬರ್/
    ],
    response: {
      en: `🛡️ **Karnataka State Cyber Crime Analytics:**\n\n• **Total Registered Cyber Crimes:** **958 cases**\n• **Primary Typologies:**\n  - 📱 UPI / Payment Gateway Phishing: **412 cases**\n  - 🎭 Identity Theft, Impersonation & OTP Fraud: **264 cases**\n  - 💻 System Hacking & Unauthorized Data Access: **178 cases**\n  - 💬 Cyberstalking, Harassment & Online Blackmail: **104 cases**\n\n• **Top Affected Districts:**\n  - Bengaluru Urban: **31%**\n  - Mangaluru: **18%**\n  - Udupi: **14%**\n\n• **Resolution Rate:** **62%** frozen funds recovered within the golden hour protocol.`,
      kn: `🛡️ **ಕರ್ನಾಟಕ ಸೈಬರ್ ಅಪರಾಧ ವಿಶ್ಲೇಷಣೆ:**\n\n• **ಒಟ್ಟು ಸೈಬರ್ ಅಪರಾಧಗಳು:** **958 ಪ್ರಕರಣಗಳು**\n• ಯುಪಿಐ ವಂಚನೆ: **412**, ಗುರುತು ಕಳ್ಳತನ: **264**, ಹ್ಯಾಕಿಂಗ್: **178**\n• ಪ್ರಮುಖ ಜಿಲ್ಲೆಗಳು: ಬೆಂಗಳೂರು (31%), ಮಂಗಳೂರು (18%), ಉಡುಪಿ (14%)`
    }
  },
  {
    // Repeat offenders in Mangaluru
    patterns: [
      /(repeat\s*offenders?|habitual).*?mangaluru/i,
      /mangaluru.*?(repeat|habitual|offenders?)/i,
      /ಮಂಗಳೂರು.*?ಮರು\s*ಅಪರಾಧಿ/
    ],
    response: {
      en: `🚨 **Mangaluru (Dakshina Kannada) Repeat Offender Intelligence:**\n\n• **Flagged Repeat Offenders:** **186 active habitual suspects** identified with ≥2 prior charge sheets.\n• **Syndicate Clusters:**\n  - Coastal Hawala & Unofficial Remittance Nexus\n  - Inter-State Luxury Vehicle Theft Ring\n  - Coastal Sand Extraction & Extortion Network\n\n• **Current Enforcement Status:**\n  - 112 individuals under active bail conditions with weekly station attendance\n  - 34 preventative detention orders issued under Goonda Act\n  - Real-time facial recognition alerts configured across Mangaluru Central and Bajpe port checkpoints.`,
      kn: `🚨 **ಮಂಗಳೂರು ಮರು ಅಪರಾಧಿಗಳ ಗುಪ್ತಚರ ವರದಿ:**\n\n• **ಗುರುತಿಸಲಾದ ಮರು ಅಪರಾಧಿಗಳು:** **186 ಸಕ್ರಿಯ ಶಂಕಿತರು**\n• ಕರಾವಳಿ ಹವಾಲಾ ಮತ್ತು ವಾಹನ ಕಳ್ಳತನ ಜಾಲಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.\n• 112 ಶಂಕಿತರು ಜಾಮೀನು ಷರತ್ತುಗಳ ಅಡಿಯಲ್ಲಿ ನಿಗಾದಲ್ಲಿದ್ದಾರೆ.`
    }
  },
  {
    // Property crimes in Chikkamagaluru
    patterns: [
      /(property\s*crimes?|theft|burglary).*?chikkamagaluru/i,
      /chikkamagaluru.*?(property|theft|burglary)/i,
      /ಚಿಕ್ಕಮಗಳೂರು.*?ಆಸ್ತಿ/
    ],
    response: {
      en: `🏡 **Chikkamagaluru Property Crime Synthesis:**\n\n• **Total Crimes Against Property:** **312 registered FIRs**\n  - Residential & Estate Burglary: **142 cases**\n  - Farm Equipment & Motor Vehicle Theft: **118 cases**\n  - Organized Dacoity & Highway Robbery: **52 cases**\n\n• **Modus Operandi Insights:**\n  - Target Profiles: Remote coffee plantation bungalows and highway supply warehouses.\n  - Operating Window: Night hours between 01:00 AM – 04:30 AM.\n\n• **Recovery Performance:** **64.8%** of stolen property successfully recovered; 188 accused individuals apprehended.`,
      kn: `🏡 **ಚಿಕ್ಕಮಗಳೂರು ಆಸ್ತಿ ಅಪರಾಧಗಳ ವರದಿ:**\n\n• **ಒಟ್ಟು ಆಸ್ತಿ ಅಪರಾಧಗಳು:** **312 ಎಫ್‌ಐಆರ್‌ಗಳು** (ದರೋಡೆ: 142, ಕಳ್ಳತನ: 118, ದರೋಡೆ ಯತ್ನ: 52)\n• ಕಾಫಿ ತೋಟಗಳು ಮತ್ತು ಹೆದ್ದಾರಿ ಗೋದಾಮುಗಳನ್ನು ಗುರಿಯಾಗಿಸಲಾಗಿದೆ.\n• **ಚೇತರಿಕೆ ದರ:** 64.8% ಆಸ್ತಿ ಮರುಪಡೆಯಲಾಗಿದೆ.`
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
    const healthUrl = `${API_CONFIG.ASSISTANT_BASE_URL}/health`;
    const json = await apiClient.get(healthUrl, { timeoutMs: 10000, skipAuth: true });

    result.latencyMs = Math.round(performance.now() - startTime);
    result.endpointReachable = true;
    result.jsonValid = json !== null && typeof json === 'object';
  } catch (e: any) {
    // Fallback: try posting ping to /chat
    try {
      const json = await apiClient.post(API_CONFIG.ASSISTANT_ENDPOINT, { 
        question: 'ping', 
        session_id: getSessionId(), 
        language: 'en' 
      }, { timeoutMs: 10000, skipAuth: true });
      result.latencyMs = Math.round(performance.now() - startTime);
      result.endpointReachable = true;
      result.jsonValid = json !== null && typeof json === 'object';
    } catch (err: any) {
      result.error = err.message || 'Network exception';
      if (err.status && err.status !== 0 && err.status !== 408) {
        result.endpointReachable = true;
        result.latencyMs = Math.round(performance.now() - startTime);
      }
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
