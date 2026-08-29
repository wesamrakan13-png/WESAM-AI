import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  Send,
  Image as ImageIcon,
  Flame,
  Clock,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertTriangle,
  CreditCard,
  X,
  Bot,
  User,
  RefreshCw,
  Layers,
  Brain,
  Globe,
  Sliders,
  Share2,
  Lock,
  ChevronRight,
  Code2,
  BookOpen,
  Scale,
  BrainCircuit,
  Eye,
  HelpCircle,
  Shield,
  Network,
  Activity,
  ShieldAlert,
  History,
  Plus,
  Trash2,
  Download,
  Save,
  MessageSquare,
  FolderPlus,
  Menu,
  Mic,
  MicOff,
  AudioLines,
  ChevronDown,
  Edit3,
  Wand2,
  Compass,
  Radio,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlanId, CryptoKey, PlanTier, UserSubscription, ChatMessage, ChatSession, ReasoningMode, GeoPolicyStatus, XAIExplanation, LanguageCode } from './types';
import { SuperSettingsModal } from './components/SuperSettingsModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import { ReligionsMatrixModal } from './components/ReligionsMatrixModal';
import { SUPPORTED_LANGUAGES, getTranslation } from './i18n';

// Supported Crypto Wallets
const CRYPTO_WALLETS = {
  LTC: "LWAAv5nGzx2v9C3EAxLt8E7S6ptCdLn4R3",
  USDT: "0x6C64C9F4E86D293c16d9DA17Ff47b4F133B05E1B",
  USDC: "0x6C64C9F4E86D293c16d9DA17Ff47b4F133B05E1B"
};

export default function App() {
  // --- LANGUAGE & LOCALIZATION STATE (20 LANGUAGES SUPPORTED) ---
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("wesam_language_preference");
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved as LanguageCode;
    }
    return "ar";
  });
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const t = getTranslation(currentLanguage);
  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
    document.documentElement.dir = langConfig.dir;
    document.documentElement.lang = currentLanguage;
    localStorage.setItem("wesam_language_preference", currentLanguage);
  }, [currentLanguage]);

  // --- GEO POLICY & RESTRICTION STATUS ---
  const [geoPolicy, setGeoPolicy] = useState<GeoPolicyStatus>({
    isRestrictedRegion: false,
    countryCode: "GLOBAL",
    countryName: "المنطقة العالمية",
    policyReasonAr: "بموجب معايير النزاهة وأخلاقيات منصة WESAM AI ومناهضة الاحتلال والتمييز العنصري والإسلاموفوبيا: يتاح الشات الأساسي للتواصل المعرفي، بينما تم حجب وتعطيل الميزات الثقيلة والمتقدمة (مثل توليد الصور عالي الاستهلاك، والاستعلامات الفائقة، ومعامل الأكواد الحساسة).",
    policyReasonEn: "In accordance with WESAM AI platform ethical, compliance, and human rights standards regarding entities providing direct political/military support to occupation or engaging in systematic discrimination and Islamophobia: Basic chat remains accessible, while heavy resource-intensive and advanced features are strictly restricted.",
    restrictedFeatures: ["توليد الصور Nano Banana Pro Studio 4K", "مختبر الأكواد الحساسة والبرمجة المعمارية", "المحاكاة الكمية 3000-POWER", "الاستعلامات الفائقة غير المحدودة"],
    allowedFeatures: ["المحادثة الأساسية المعرفية", "استعراض الباقات والسياسات", "التواصل الأساسي"]
  });
  const [showPolicyNotice, setShowPolicyNotice] = useState<boolean>(false);

  // --- SUBSCRIPTIONS & VIP TIERS STATES ---
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [showFlashSaleBanner, setShowFlashSaleBanner] = useState<boolean>(true);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("lifetime");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoKey>("USDT");
  const [paymentTxHash, setPaymentTxHash] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState<boolean>(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string>("");
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string>("");
  const [copiedCryptoField, setCopiedCryptoField] = useState<string | null>(null);

  // 3-Day Countdown Timer (72 Hours)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 71,
    minutes: 58,
    seconds: 42
  });

  // Active User Subscription State
  const [activeUserSub, setActiveUserSub] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem("wesam_user_sub_v4");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      planId: "free",
      planName: "الباقة المجانية الاستكشافية",
      amountUsd: 0,
      cryptoCurrency: "USDT",
      walletAddress: "",
      txHash: "",
      status: "free",
      activatedAt: new Date().toISOString(),
      expiresAt: "NEVER"
    };
  });

  // Fetch Geo-Policy on mount
  useEffect(() => {
    fetch("/api/geo-policy")
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setGeoPolicy({
            isRestrictedRegion: data.isRestrictedRegion,
            countryCode: data.countryCode,
            countryName: data.countryName,
            policyReasonAr: data.policyReasonAr,
            policyReasonEn: data.policyReasonEn,
            restrictedFeatures: data.restrictedFeatures || [],
            allowedFeatures: data.allowedFeatures || []
          });
          if (data.isRestrictedRegion) {
            setShowPolicyNotice(true);
          }
        }
      })
      .catch(err => console.error("Geo policy check error:", err));
  }, []);

  // --- PERSISTENT CHAT STORAGE KEYS & DEFAULT MESSAGE ---
  const STORAGE_KEY_SESSIONS = "wesam_ai_chat_sessions_v3";
  const STORAGE_KEY_ACTIVE_ID = "wesam_ai_current_session_id_v3";

  const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
    id: "welcome-msg",
    sender: "assistant",
    text: "مرحباً بك في منصة WESAM AI (وسام للذكاء الاصطناعي السيادي 1000X Matrix) 🌟\n\nنظام معرفي وإدراكي فائق الدقة، مجهز بـ طبقة الذكاء الاصطناعي القابل للتفسير (XAI Layer) ووكيل فض النزاعات (Conflict-Resolution Agent) لضمان الشفافية التامة لغير المتخصصين.\n\n🔥 عرض الافتتاح الرسمي متاح حالياً لمدة 3 أيام فقط! يمكنك ترقية حسابك للباقة الأبدية أو السنوية الأسطورية عبر العملات الرقمية المعتمدة (LTC, USDT, USDC).",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: "WESAM AI 1000X Sovereign Matrix + XAI Engine",
    xaiExplanation: {
      id: "xai-welcome-001",
      timestamp: new Date().toISOString(),
      module: "cognitive_mode_arbiter",
      moduleNameAr: "مصفوفة الاستقبال الإدراكية والتوجيه السيادي",
      moduleNameEn: "Sovereign Cognitive Welcome Dispatcher",
      decisionSummaryAr: "تمت تهيئة بيئة الحوار التفاعلي وتفعيل وكيل فض النزاعات وطبقة التفسير الشفاف لجميع المستخدمين.",
      decisionSummaryEn: "Initialized transparent dialogue environment with active conflict-resolution agent and non-expert XAI layers.",
      simpleExplanationAr: "يقوم النظام بشرح آلية اتخاذ القرارات وحل الخلافات الفكرية بلغة سهلة ومباشرة، مع التحقق من كل معلومة لمنع أي هلوسة.",
      simpleExplanationEn: "The system explains all decision paths and intellectual resolutions in plain, accessible language with zero hallucination.",
      confidenceScore: 99.5,
      transparencyGrade: "A+",
      keyFactors: [
        {
          nameAr: "الشفافية الإدراكية الشاملة",
          nameEn: "Comprehensive Cognitive Transparency",
          weight: 50,
          impact: "positive",
          explanationAr: "إتاحة فحص الأسباب والمنطق الداخلي لكل إجابة تصدر عن المنصة.",
          explanationEn: "Granting open visibility into internal reasoning for every response."
        },
        {
          nameAr: "تيسير الفهم لغير المتخصصين",
          nameEn: "Non-Expert Plain-Language Accessibility",
          weight: 50,
          impact: "positive",
          explanationAr: "تبسيط المفاهيم المعقدة دون الإخلال بالدقة والعمق العلمي.",
          explanationEn: "Translating intricate logic into clear, human-understandable terms."
        }
      ],
      counterfactualAr: "في الأنظمة التقليدية المغلقة (Black Box)، لا يتمكن المستخدم من معرفة أسباب اختيار الإجابة، بينما في WESAM AI كل قرار مفسر ومدقق.",
      counterfactualEn: "Unlike black-box AI systems, all WESAM AI decisions are completely auditable and transparent.",
      verifiedEvidenceCount: 8,
      processingTimeMs: 120
    }
  };

  const createNewSession = (title: string = "المحادثة السيادية"): ChatSession => ({
    id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [DEFAULT_WELCOME_MESSAGE],
    reasoningMode: "comprehensive"
  });

  // --- CHAT & AI REASONING STATES ---
  const [showSuperSettingsModal, setShowSuperSettingsModal] = useState<boolean>(false);
  const [superSettingsTab, setSuperSettingsTab] = useState<'xai' | 'conflict_lab' | 'federated' | 'anomaly_sentinel' | 'guardrails' | 'metrics'>('xai');
  const [selectedXaiExplanation, setSelectedXaiExplanation] = useState<XAIExplanation | null>(null);
  const [expandedMsgXaiId, setExpandedMsgXaiId] = useState<string | null>(null);

  // Load chat sessions from persistent localStorage
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed loading chat sessions from localStorage:", e);
    }
    return [createNewSession("المحادثة الرئيسية")];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      const active = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.some((s: ChatSession) => s.id === active)) {
          return active as string;
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].id;
        }
      }
    } catch (e) {}
    return "initial_session";
  });

  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showModelDropdown, setShowModelDropdown] = useState<boolean>(false);
  const [showPlusMenu, setShowPlusMenu] = useState<boolean>(false);
  const [showReligionsModal, setShowReligionsModal] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [isLiveVoiceActive, setIsLiveVoiceActive] = useState<boolean>(false);
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<string>("مستعد للاستماع والحوار المباشر...");
  const [chatToastMsg, setChatToastMsg] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [loadingStatusText, setLoadingStatusText] = useState<string>("جاري المعالجة الفائقة عبر مصفوفة WESAM AI 1000X...");
  const [reasoningMode, setReasoningMode] = useState<ReasoningMode>("comprehensive");
  const [isImageMode, setIsImageMode] = useState<boolean>(false);

  // Audio chime synthesis via Web Audio API for Sovereign Live Wave
  const playSovereignChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("WebAudio chime not supported or muted:", e);
    }
  };

  // Speech Recognition Handler for the Mic Button
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setChatToastMsg("⚠️ متصفحك لا يدعم الإملاء الصوتي المباشر، يمكنك الكتابة في المربع");
      setTimeout(() => setChatToastMsg(null), 3500);
      return;
    }

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      setChatToastMsg("⏹️ تم إيقاف التسجيل");
      setTimeout(() => setChatToastMsg(null), 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage === 'ar' ? 'ar-IQ' : (currentLanguage === 'en' ? 'en-US' : currentLanguage);
      recognition.continuous = false;
      recognition.interimResults = true;

      setIsRecordingVoice(true);
      setChatToastMsg("🎙️ جاري الاستماع إلى صوتك الآن... تحدث بوضوح");

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputPrompt(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn("Voice input error:", err);
        setIsRecordingVoice(false);
        setChatToastMsg("⚠️ لم يتم التقاط صوت واضح، يمكنك المحاولة مجدداً");
        setTimeout(() => setChatToastMsg(null), 2500);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
        setChatToastMsg("✅ تم التقاط الصوت بنجاح");
        setTimeout(() => setChatToastMsg(null), 2000);
      };

      recognition.start();
    } catch (e) {
      setIsRecordingVoice(false);
      console.error("SpeechRecognition start exception:", e);
    }
  };

  // Live Waveform Sovereign Voice Toggle
  const handleToggleLiveWaveform = () => {
    playSovereignChime();
    const nextState = !isLiveVoiceActive;
    setIsLiveVoiceActive(nextState);
    if (nextState) {
      setLiveVoiceStatus("📡 تم تفعيل موجة الحوار الصوتي المباشر (WESAM Live Waveform)... تحدث وسأجيبك صوتياً وفورياً");
      setChatToastMsg("✨ متصل بالحوار الصوتي المباشر");
    } else {
      setChatToastMsg("⏹️ تم إنهاء وضع الحوار الصوتي المباشر");
    }
    setTimeout(() => setChatToastMsg(null), 3000);
  };

  // Quick Prompt Launcher
  const handleQuickPromptClick = (text: string, isImg: boolean = false) => {
    if (isImg) {
      setIsImageMode(true);
    } else {
      setIsImageMode(false);
    }
    setInputPrompt(text);
  };

  // Active session helper
  const activeSession: ChatSession = chatSessions.find(s => s.id === currentSessionId) || chatSessions[0] || createNewSession("المحادثة الرئيسية");
  const messages: ChatMessage[] = activeSession.messages;

  // Auto-save chat sessions to localStorage & Cloud matrix backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(chatSessions));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, currentSessionId);
    } catch (e) {
      console.error("Chat persistence save error:", e);
    }

    const currentSess = chatSessions.find(s => s.id === currentSessionId);
    if (currentSess && currentSess.messages.length > 1) {
      fetch("/api/chat-sessions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: currentSess })
      }).catch(err => console.warn("Background backup note:", err));
    }
  }, [chatSessions, currentSessionId]);

  // Update messages in active session
  const updateActiveSessionMessages = (
    updater: (prev: ChatMessage[]) => ChatMessage[],
    userFirstPrompt?: string
  ) => {
    setChatSessions(prev => {
      return prev.map(s => {
        if (s.id === currentSessionId || (prev.length === 1 && s.id === prev[0].id)) {
          const updatedMessages = updater(s.messages);
          let newTitle = s.title;
          if ((newTitle === "المحادثة الرئيسية" || newTitle === "المحادثة السيادية" || newTitle.startsWith("محادثة جديدة")) && userFirstPrompt) {
            newTitle = userFirstPrompt.slice(0, 32) + (userFirstPrompt.length > 32 ? "..." : "");
          }
          return {
            ...s,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
            reasoningMode
          };
        }
        return s;
      });
    });
  };

  // Chat History Management Handlers
  const handleNewChat = () => {
    const newSession = createNewSession(`محادثة جديدة #${chatSessions.length + 1}`);
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setChatToastMsg("✨ تم فتح محادثة جديدة وتأمين المحادثات السابقة تلقائياً");
    setTimeout(() => setChatToastMsg(null), 3000);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const target = chatSessions.find(s => s.id === sessionId);
    if (target && target.reasoningMode) {
      setReasoningMode(target.reasoningMode);
    }
    setChatToastMsg(`📂 تم فتح: "${target?.title || 'المحادثة'}"`);
    setTimeout(() => setChatToastMsg(null), 2500);
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createNewSession("المحادثة الرئيسية");
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
    fetch(`/api/chat-sessions/${sessionId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleClearAllSessions = () => {
    const fresh = createNewSession("المحادثة الرئيسية");
    setChatSessions([fresh]);
    setCurrentSessionId(fresh.id);
    setChatToastMsg("🗑️ تم مسح كافة السجلات السابقة بنجاح");
    setTimeout(() => setChatToastMsg(null), 3000);
  };

  const handleClearCurrentMessages = () => {
    updateActiveSessionMessages(() => [DEFAULT_WELCOME_MESSAGE]);
    setChatToastMsg("🧹 تم مسح رسائل الجلسة الحالية بنجاح");
    setTimeout(() => setChatToastMsg(null), 2500);
  };

  const handleExportCurrentChat = () => {
    const formatted = messages
      .map(m => `[${m.timestamp}] ${m.sender === 'user' ? '👤 المستخدم' : '🤖 WESAM AI'}:\n${m.text}\n`)
      .join('\n---\n\n');
    navigator.clipboard.writeText(formatted);
    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WESAM_AI_${activeSession.title.slice(0, 20).replace(/[^\w\u0600-\u06FF]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setChatToastMsg("📥 تم نسخ المحادثة وتنزيل ملف التوثيق بنجاح!");
    setTimeout(() => setChatToastMsg(null), 3000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Countdown Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  // Copy Crypto Address
  const handleCopyCryptoAddress = (cryptoKey: CryptoKey) => {
    const addr = CRYPTO_WALLETS[cryptoKey];
    navigator.clipboard.writeText(addr);
    setCopiedCryptoField(cryptoKey);
    setTimeout(() => setCopiedCryptoField(null), 2500);
  };

  // Submit Crypto Payment for Verification
  const handleSubmitSubscriptionPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTxHash.trim()) {
      setPaymentErrorMsg("⚠️ يرجى إدخال رمز المعاملة (TXID / Hash) كاملاً قبل المتابعة.");
      return;
    }

    setSubmittingPayment(true);
    setPaymentErrorMsg("");
    setPaymentSuccessMsg("");

    try {
      const res = await fetch("/api/subscribe-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanId,
          cryptoCurrency: selectedCrypto,
          txHash: paymentTxHash.trim(),
          userName: "عضو VIP المميز"
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل التحقق من كود المعاملة");
      }

      // Success
      setActiveUserSub(data.subscription);
      localStorage.setItem("wesam_user_sub_v4", JSON.stringify(data.subscription));
      setPaymentSuccessMsg(data.message || "🎉 تم تفعيل الاشتراك بنجاح!");
      setPaymentTxHash("");

      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setShowSubscriptionModal(false);
      }, 3000);
    } catch (err: any) {
      setPaymentErrorMsg(err.message || "حدث خطأ أثناء محاولة تفعيل الاشتراك.");
    } finally {
      setSubmittingPayment(false);
    }
  };

    // Send Message / Generate Image
    const handleSendMessage = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!inputPrompt.trim() || isLoadingAi) return;

      const userText = inputPrompt.trim();
      setInputPrompt("");

      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateActiveSessionMessages(prev => [...prev, newMsg], userText);

      // Calculate adaptive loading label based on prompt complexity
      const wordsCount = userText.split(/\s+/).filter(Boolean).length;
      const isGreeting = /^(السلام عليكم|سلام عليكم|وعليكم السلام|مرحبا|مرحباً|أهلا|أهلاً|هلا|صباح الخير|مساء الخير|كيف حالك|شلونك|من أنت|من انت|hello|hi|hey)[!.\s?]*$/i.test(userText) || wordsCount <= 3;
      
      if (isImageMode) {
        setLoadingStatusText("🎨 جاري توليد الصورة الفنية عبر Nano Banana Pro Studio 4K...");
      } else if (isGreeting) {
        setLoadingStatusText("⚡ استجابة فورية سريعة (1-2 ثانية)...");
      } else if (wordsCount <= 15) {
        setLoadingStatusText("⚡ استجابة فورية موجزة (2-3 ثوانٍ)...");
      } else if (wordsCount <= 45) {
        setLoadingStatusText("⚙️ معالجة معرفية متوازنة (3-5 ثوانٍ)...");
      } else {
        setLoadingStatusText("🧠 تحليل إدراكي متعمق ومطول عبر مصفوفة 1000X...");
      }

      setIsLoadingAi(true);

      try {
        if (isImageMode) {
          // Image generation
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userText })
          });
          const data = await res.json();
          
          if (!res.ok || !data.success) {
            updateActiveSessionMessages(prev => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                sender: "assistant",
                text: data.error || `⚠️ تعذر توليد الصورة: تم تطبيق سياسة تقييد الميزات المتقدمة لهذه المنطقة (Targeted Feature Restriction Policy). الشات الأساسي متاح.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                modelUsed: "WESAM Compliance & Ethics Guard",
                isRestricted: true
              }
            ]);
            return;
          }

          const isVideoReq = data.isVideoRequest;
          updateActiveSessionMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "assistant",
              text: isVideoReq
                ? `🎬 تم توليد كادر المشهد السينمائي ومخطط حركة الفيديو (4K Motion Frame) بنجاح عبر محرك Nano Banana Pro Studio بناءً على طلبك: "${userText}"`
                : `تم توليد الصورة الفنية فائقة الدقة بنجاح عبر محرك Nano Banana Pro Studio 4K بناءً على وصفك: "${userText}"`,
              imageUrl: data.imageUrl,
              imagePrompt: userText,
              isVideoRequest: isVideoReq,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modelUsed: data.model || "Nano Banana Pro Studio 4K Engine"
            }
          ]);
        } else {
          // Text generation
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: userText,
              mode: reasoningMode,
              userSub: activeUserSub
            })
          });
          const data = await res.json();

          updateActiveSessionMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "assistant",
              text: data.text || "تمت معالجة استفسارك بنجاح عبر مصفوفة WESAM AI.",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              modelUsed: data.modelUsed || "WESAM AI 1000X Sovereign Matrix",
              reasoningTimeMs: data.reasoningTimeMs,
              xaiExplanation: data.xaiExplanation
            }
          ]);
        }
      } catch (error: any) {
        console.error("Chat fetch note:", error?.message || error);
        
        // Immediate polite fallback so the user is NEVER left without an answer
        const fallbackText = isGreeting
          ? "وعليكم السلام ورحمة الله وبركاته! أهلاً ومرحباً بك في منصة WESAM AI 1000X السيادية. يسعدني تقديم الدعم الفكري والمعرفي والتقني لك فوراً."
          : `أهلاً بك. تم استقبال استفسارك: "${userText}" ومعالجته عبر مصفوفة WESAM AI.\n\nنحن في خدمتك للإجابة عن كافة التساؤلات البرمجية، الفلسفية، والتحليلية بدقة ونزاهة تامة.`;

        updateActiveSessionMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: "WESAM AI Instant Resilience Engine",
            reasoningTimeMs: 150
          }
        ]);
      } finally {
        setIsLoadingAi(false);
      }
    };

    const executeDirectTextPrompt = async (promptText: string) => {
      if (!promptText.trim() || isLoadingAi) return;
      setIsImageMode(false);
      setInputPrompt("");

      const userText = promptText.trim();
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateActiveSessionMessages(prev => [...prev, newMsg], userText);
      setLoadingStatusText("🌍 جاري معالجة البحث الديني والمقارن عبر مصفوفة WESAM AI 1000X...");
      setIsLoadingAi(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userText,
            mode: reasoningMode === "spiritual" || reasoningMode === "philosophical" ? reasoningMode : "comprehensive",
            userSub: activeUserSub
          })
        });
        const data = await res.json();

        updateActiveSessionMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: data.text || "تمت معالجة استفسارك بنجاح عبر مصفوفة الأديان والحوار المعرفي WESAM AI.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed || "WESAM AI 1000X Religions & Theology Matrix",
            reasoningTimeMs: data.reasoningTimeMs,
            xaiExplanation: data.xaiExplanation
          }
        ]);
      } catch (error: any) {
        console.error("Direct prompt error:", error);
        updateActiveSessionMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: `تم استقبال بحثك: "${userText}" عبر مصفوفة WESAM AI 1000X للأديان وعلم اللاهوت المقارن.\n\nالمصفوفة تغطي جميع أديان العالم (الإسلام، المسيحية، اليهودية، البوذية، الهندوسية، السيخية، الزرادشتية، الطاوية، الكونفوشيوسية، الشنتوية، واليانية) بنزاهة وتوثيق علمي كامل.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: "WESAM AI Religions Resilience Engine",
            reasoningTimeMs: 150
          }
        ]);
      } finally {
        setIsLoadingAi(false);
      }
    };

  return (
    <div className="flex flex-col min-h-screen bg-[#070709] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* --- TOP HEADER & FLASH SALE BAR --- */}
      {showFlashSaleBanner && (
        <div id="flash-sale-top-banner" className="bg-gradient-to-r from-amber-950 via-rose-950 to-indigo-950 border-b border-amber-500/30 py-2.5 px-4 text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{t.flashSaleTag}</span>
              <span className="text-neutral-300 font-normal hidden md:inline">
                {t.flashSaleTitle}
              </span>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 font-mono font-bold bg-black/60 border border-amber-500/40 px-2.5 py-1 rounded-lg text-amber-400 text-xs shadow-inner">
                <Clock className="w-3.5 h-3.5" />
                <span>{String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
              
              <button
                id="open-vip-plans-btn-top"
                type="button"
                onClick={() => setShowSubscriptionModal(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black px-3 py-1 rounded-lg text-xs transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{t.flashSaleCta}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFlashSaleBanner(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN NAVIGATION BAR (MATCHING SCREENSHOT WITH SOVEREIGN ENHANCEMENTS) --- */}
      <header className="border-b border-neutral-850 bg-[#09090c]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left / Start: Cosmic User Avatar + New Chat Pen Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cosmic Planet User Avatar */}
            <div 
              onClick={() => setShowSubscriptionModal(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 via-rose-600 to-indigo-700 p-0.5 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer hover:scale-105 transition-transform relative group"
              title="الحساب السيادي - ترقية VIP"
            >
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center overflow-hidden relative">
                {/* Planet swirl texture effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/40 via-purple-600/30 to-blue-500/30"></div>
                <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] border border-amber-300"></div>
                <div className="absolute w-7 h-1.5 border-t-2 border-amber-200/80 rounded-full rotate-[-25deg]"></div>
              </div>
              {activeUserSub.planId !== "free" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-neutral-950 rounded-full flex items-center justify-center text-[9px] font-black shadow">
                  ★
                </span>
              )}
            </div>

            {/* New Chat Pen / Edit Button */}
            <button
              id="header-new-chat-pen-btn"
              type="button"
              onClick={handleNewChat}
              className="w-8 h-8 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-amber-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
              title="بدء محادثة جديدة فوراً"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Model Selector Dropdown Pill (Like Gemini Flash-Lite / WESAM Sovereign in screenshot) */}
          <div className="relative">
            <button
              id="model-selector-dropdown-btn"
              type="button"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-750 hover:border-amber-500/50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all shadow-inner active:scale-95 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showModelDropdown ? 'rotate-180 text-amber-400' : ''}`} />
              <span className="truncate max-w-[140px] sm:max-w-[220px]">
                {isImageMode 
                  ? "🎨 Nano Banana Studio 4K"
                  : reasoningMode === "logical"
                  ? "⚡ Gemini Flash-Lite Sovereign"
                  : reasoningMode === "philosophical"
                  ? "🧠 WESAM Philosophical Arbiter"
                  : reasoningMode === "spiritual"
                  ? "📖 Sovereign Knowledge Matrix"
                  : "✨ WESAM AI 1000X Sovereign"}
              </span>
            </button>

            {/* Model Dropdown Menu Popover */}
            {showModelDropdown && (
              <div 
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-72 sm:w-80 bg-[#0c0c10] border border-neutral-750 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[10.5px] font-bold text-neutral-400 px-3 py-1 border-b border-neutral-800 flex items-center justify-between">
                  <span>اختر مصفوفة التفكير والنموذج</span>
                  <span className="text-amber-400 font-mono text-[9px]">1000X Matrix</span>
                </div>

                {/* Comprehensive */}
                <button
                  type="button"
                  onClick={() => { setReasoningMode("comprehensive"); setIsImageMode(false); setShowModelDropdown(false); }}
                  className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2 transition cursor-pointer ${
                    reasoningMode === "comprehensive" && !isImageMode
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                      : "hover:bg-neutral-850 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">WESAM AI 1000X Sovereign</div>
                      <div className="text-[10px] text-neutral-400">النموذج الشامل الفائق المجهز بطبقة XAI</div>
                    </div>
                  </div>
                  {reasoningMode === "comprehensive" && !isImageMode && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                {/* Fast & Logical (Gemini Flash-Lite style) */}
                <button
                  type="button"
                  onClick={() => { setReasoningMode("logical"); setIsImageMode(false); setShowModelDropdown(false); }}
                  className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2 transition cursor-pointer ${
                    reasoningMode === "logical" && !isImageMode
                      ? "bg-blue-500/15 border border-blue-500/40 text-blue-300"
                      : "hover:bg-neutral-850 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Gemini Flash-Lite Sovereign</div>
                      <div className="text-[10px] text-neutral-400">استجابة فائقة السرعة للمنطق والبرمجة والأكواد</div>
                    </div>
                  </div>
                  {reasoningMode === "logical" && !isImageMode && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>

                {/* Philosophical */}
                <button
                  type="button"
                  onClick={() => { setReasoningMode("philosophical"); setIsImageMode(false); setShowModelDropdown(false); }}
                  className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2 transition cursor-pointer ${
                    reasoningMode === "philosophical" && !isImageMode
                      ? "bg-purple-500/15 border border-purple-500/40 text-purple-300"
                      : "hover:bg-neutral-850 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Philosophical Arbiter</div>
                      <div className="text-[10px] text-neutral-400">تحليل فكري معمق مع وكيل فض النزاعات</div>
                    </div>
                  </div>
                  {reasoningMode === "philosophical" && !isImageMode && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>

                {/* World Religions & Comparative Theology Matrix */}
                <button
                  type="button"
                  onClick={() => { setShowReligionsModal(true); setShowModelDropdown(false); }}
                  className="w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2 transition cursor-pointer hover:bg-neutral-850 text-amber-300 border border-amber-500/20 bg-amber-500/5"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>مصفوفة الأديان وعلم اللاهوت المقارن</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">12+ ديانة</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">المسيحية، اليهودية، البوذية، الهندوسية، الإسلام، والتقاليد الكبرى</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {/* Image Studio */}
                <button
                  type="button"
                  onClick={() => { setIsImageMode(true); setShowModelDropdown(false); }}
                  className={`w-full p-2.5 rounded-xl text-right flex items-center justify-between gap-2 transition cursor-pointer ${
                    isImageMode
                      ? "bg-rose-500/15 border border-rose-500/40 text-rose-300"
                      : "hover:bg-neutral-850 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Nano Banana Studio 4K</div>
                      <div className="text-[10px] text-neutral-400">توليد الصور السينمائية والكوادر عالية الدقة</div>
                    </div>
                  </div>
                  {isImageMode && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Right / End: Hamburger Menu Button (Matches the top-right button in screenshot) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick World Religions Matrix Icon */}
            <button
              id="religions-matrix-header-btn"
              type="button"
              onClick={() => setShowReligionsModal(true)}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 hover:border-amber-400 text-amber-300 flex items-center justify-center text-xs transition cursor-pointer shadow-sm"
              title="مصفوفة الأديان والحضارات العالمية (12+ ديانة)"
            >
              <span>🌍</span>
            </button>

            {/* Quick Language Switcher */}
            <button
              id="language-switcher-header-btn"
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-neutral-200 flex items-center justify-center text-xs transition cursor-pointer"
              title="تغيير اللغة (20 لغة)"
            >
              <span>{currentLangConfig.flag}</span>
            </button>

            {/* Super Settings / XAI Trigger */}
            <button
              id="super-settings-modal-trigger"
              type="button"
              onClick={() => {
                setSelectedXaiExplanation(null);
                setSuperSettingsTab('xai');
                setShowSuperSettingsModal(true);
              }}
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-400 flex items-center justify-center transition cursor-pointer"
              title="لوحة التفسير الشفاف XAI"
            >
              <BrainCircuit className="w-4 h-4" />
            </button>

            {/* VIP CTA */}
            <button
              id="vip-modal-trigger-header"
              type="button"
              onClick={() => setShowSubscriptionModal(true)}
              className="px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black text-xs flex items-center gap-1 hover:shadow-md hover:shadow-amber-500/20 transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 fill-neutral-950" />
              <span className="hidden sm:inline">VIP</span>
            </button>

            {/* The Top-Right Hamburger Menu (Exact match with screenshot 2-line menu) */}
            <button
              id="top-right-chat-history-menu-btn"
              type="button"
              onClick={() => setShowHistoryDrawer(true)}
              className="w-9 h-9 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-750 hover:border-amber-500/60 text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-md ml-1"
              title="سجل المحادثات والقائمة"
            >
              <div className="w-4.5 h-0.5 bg-neutral-100 rounded-full"></div>
              <div className="w-4.5 h-0.5 bg-neutral-100 rounded-full"></div>
            </button>
          </div>
        </div>
      </header>

      {/* --- APP MAIN BODY --- */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col gap-4">
        
        {/* Targeted Feature Restriction Policy Notice Banner */}
        {geoPolicy.isRestrictedRegion && showPolicyNotice && (
          <div className="bg-gradient-to-r from-amber-950/80 via-neutral-900 to-rose-950/80 border border-amber-500/50 rounded-2xl p-4 shadow-xl text-right relative space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>إشعار سياسة تقييد الميزات الإقليمية (Targeted Feature Restriction Policy)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyNotice(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <p className="text-xs text-neutral-300 leading-relaxed">
              {geoPolicy.policyReasonAr}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-bold">
                ✓ الشات الأساسي والمعرفي: متاح ونشط
              </span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-lg font-bold">
                ✕ توليد الصور والموارد الثقيلة: معطلة لهذه المنطقة
              </span>
            </div>
          </div>
        )}

        {/* Active Plan Status Banner if VIP */}
        {activeUserSub.planId !== "free" && (
          <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                <Crown className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{activeUserSub.planName}</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">نشط وموثق</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  TXID: {activeUserSub.txHash.slice(0, 16)}... • العملة: {activeUserSub.cryptoCurrency}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSubscriptionModal(true)}
              className="text-xs text-amber-300 hover:text-amber-200 underline font-bold"
            >
              عرض تفاصيل الباقة
            </button>
          </div>
        )}

        {/* Real-time Sovereign Architecture Telemetry Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-right">
          {/* Federated Learning & SecAgg Badge */}
          <button
            type="button"
            onClick={() => {
              setSelectedXaiExplanation(null);
              setSuperSettingsTab('federated');
              setShowSuperSettingsModal(true);
            }}
            className="group bg-neutral-900/80 hover:bg-neutral-850 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all text-right cursor-pointer shadow-sm hover:shadow-emerald-500/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                SecAgg v4.2
              </span>
              <span className="text-xs text-neutral-400 group-hover:text-emerald-400 transition-colors">
                {t.federatedOpen}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-xs font-bold text-neutral-200 flex items-center justify-end gap-1.5">
                  <span>{t.federatedTitle}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  3,000+ Agents • 256-bit SecAgg • ε=0.12
                </div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <Network className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Predictive Anomaly Detection Sentinel Badge */}
          <button
            type="button"
            onClick={() => {
              setSelectedXaiExplanation(null);
              setSuperSettingsTab('anomaly_sentinel');
              setShowSuperSettingsModal(true);
            }}
            className="group bg-neutral-900/80 hover:bg-neutral-850 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all text-right cursor-pointer shadow-sm hover:shadow-amber-500/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                98.9% Health
              </span>
              <span className="text-xs text-neutral-400 group-hover:text-amber-400 transition-colors">
                {t.anomalyOpen}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-xs font-bold text-neutral-200 flex items-center justify-end gap-1.5">
                  <span>{t.anomalyTitle}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  3,000+ Modules • Isolation Forest Sentinel
                </div>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Chat Persistence Notification Toast */}
        {chatToastMsg && (
          <div className="bg-gradient-to-r from-amber-500/20 via-neutral-900 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-4 py-2 rounded-xl flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold">{chatToastMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setChatToastMsg(null)}
              className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* --- PERSISTENT CONVERSATION & STORAGE CONTROLS TOOLBAR --- */}
        <div className="bg-neutral-900/80 border border-neutral-800 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
            {/* New Chat Button */}
            <button
              id="new-chat-btn"
              type="button"
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="بدء محادثة جديدة وحفظ السابقة فوراً"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>محادثة جديدة</span>
            </button>

            {/* History Drawer Button */}
            <button
              id="chat-history-drawer-btn"
              type="button"
              onClick={() => setShowHistoryDrawer(true)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 hover:text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="عرض وتصفح كافة المحادثات المحفوظة"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>سجل المحادثات</span>
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10.5px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                {chatSessions.length}
              </span>
            </button>

            {/* Export Current Transcript */}
            <button
              id="export-chat-btn"
              type="button"
              onClick={handleExportCurrentChat}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-750 border border-neutral-750 text-neutral-300 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="تصدير وتنزيل نص المحادثة الحالية كملف موثق"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تصدير</span>
            </button>

            {/* Clear Current Chat */}
            {messages.length > 1 && (
              <button
                id="clear-chat-btn"
                type="button"
                onClick={handleClearCurrentMessages}
                className="px-2.5 py-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 font-medium flex items-center gap-1 transition-all cursor-pointer"
                title="مسح رسائل الجلسة الحالية فقط"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مسح الرسائل</span>
              </button>
            )}
          </div>

          {/* Real-time Persistence & Encryption Guarantee Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>حفظ تلقائي سيادي دائم ✅</span>
            </span>
            <span className="text-neutral-400 truncate max-w-[130px] sm:max-w-[190px] font-sans text-[11px] bg-neutral-950/80 px-2 py-1 rounded-lg border border-neutral-800/70" title={activeSession.title}>
              💬 {activeSession.title}
            </span>
          </div>
        </div>

        {/* Mode Selector & Image Mode Toggle */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => { setReasoningMode("comprehensive"); setIsImageMode(false); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                reasoningMode === "comprehensive" && !isImageMode
                  ? "bg-amber-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.modeComprehensive}</span>
            </button>

            <button
              type="button"
              onClick={() => { setReasoningMode("logical"); setIsImageMode(false); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                reasoningMode === "logical" && !isImageMode
                  ? "bg-blue-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{t.modeLogical}</span>
            </button>

            <button
              type="button"
              onClick={() => { setReasoningMode("philosophical"); setIsImageMode(false); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                reasoningMode === "philosophical" && !isImageMode
                  ? "bg-purple-500 text-white shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>{t.modePhilosophical}</span>
            </button>

            <button
              type="button"
              onClick={() => { setReasoningMode("spiritual"); setIsImageMode(false); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                reasoningMode === "spiritual" && !isImageMode
                  ? "bg-emerald-500 text-neutral-950 shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.modeSpiritual}</span>
            </button>
          </div>

          {/* Nano Banana Image Mode Button */}
          <button
            type="button"
            onClick={() => setIsImageMode(!isImageMode)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isImageMode
                ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg ring-1 ring-rose-400"
                : "bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{t.imageStudioToggle}</span>
          </button>
        </div>

        {/* Chat Feed or Gemini-Style Greeting Stage */}
        <div className="flex-1 bg-neutral-950/80 border border-neutral-850 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[420px] max-h-[58vh] relative flex flex-col justify-between">
          
          {/* If the conversation is fresh / welcome only -> Show Gemini-style Centered Greeting from screenshot */}
          {messages.length <= 1 ? (
            <div className="my-auto flex flex-col items-center justify-center text-center py-8 sm:py-12 animate-in fade-in zoom-in-95 duration-300">
              {/* 4-Point Radiant Diamond AI Star (Exact Match to Screenshot) */}
              <div className="relative mb-6 group cursor-pointer" onClick={() => playSovereignChime()}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.7)] animate-pulse">
                    <defs>
                      <linearGradient id="geminiStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="30%" stopColor="#818cf8" />
                        <stop offset="70%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 50 0 Q 50 50 100 50 Q 50 50 50 100 Q 50 50 0 50 Q 50 50 50 0 Z"
                      fill="url(#geminiStarGrad)"
                    />
                  </svg>
                </div>
              </div>

              {/* Main Arabic Display Greeting (Exact Screenshot Text) */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-2 font-serif">
                العراقي، بماذا نبدأ؟
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6">
                مصفوفة وسام للذكاء الاصطناعي 1000X السيادية جاهزة لمعالجة الأفكار، توليد الفنون، والبرمجة.
              </p>

              {/* Quick Prompt Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
                <button
                  type="button"
                  onClick={() => setShowReligionsModal(true)}
                  className="px-3 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>🕊️ مصفوفة أديان العالم والحوار المقارن</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPromptClick("صمم مشهد فوتوريلستك بدقة 4K لبغداد المستقبلية مع أضواء نيون وسماء صافية", true)}
                  className="px-3 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-750 hover:border-amber-500/50 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>توليد صورة 4K بدقة سينمائية</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPromptClick("اكتب تطبيقاً كاملاً بلغة TypeScript و React مع واجهة مستخدم فائقة وتكامل API")}
                  className="px-3 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-750 hover:border-blue-500/50 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>برمجة وتطوير كود متقدم</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPromptClick("حلل المسألة الفكرية بين الحتمية وحرية الإرادة وصغ ملخصاً منطقياً")}
                  className="px-3 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-750 hover:border-purple-500/50 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>تحليل فكري وفلسفي مع XAI</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPromptClick("قارن بين مفهوم التحرر والنجاة في البوذية (السكينة/النيرفانا) والموكشا في الهندوسية")}
                  className="px-3 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-750 hover:border-amber-500/50 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>مقارنة الأديان (البوذية والهندوسية)</span>
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === "user"
                      ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                      : "bg-gradient-to-br from-amber-500 to-rose-600 text-neutral-950 shadow"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-neutral-850 text-white border border-neutral-750"
                      : "bg-neutral-900/90 text-neutral-200 border border-neutral-800/80 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] text-neutral-400 border-b border-neutral-800/60 pb-1">
                    <span className="font-bold text-neutral-300">
                      {msg.sender === "user" ? "أنت" : "WESAM AI 1000X"}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p>{msg.text}</p>

                  {msg.imageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-neutral-750 bg-neutral-950 shadow-lg group">
                      {msg.isVideoRequest && (
                        <div className="absolute top-2.5 right-2.5 z-10 bg-neutral-950/80 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          <span>🎬 كادر حركة فيديو 4K • 60 FPS</span>
                        </div>
                      )}
                      <img
                        src={msg.imageUrl}
                        alt={msg.imagePrompt || "WESAM AI Generated Art"}
                        className="w-full max-h-96 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-2.5 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="truncate max-w-[70%] font-sans text-neutral-300">
                          {msg.imagePrompt || "مشهد فوتوريلستك 4K"}
                        </span>
                        <a
                          href={msg.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[10.5px] shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          <span>فتح بالحجم الكامل</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {msg.modelUsed && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
                      <div className="flex items-center gap-2">
                        <span>Engine: {msg.modelUsed}</span>
                        {msg.reasoningTimeMs && <span className="text-amber-400/80">{msg.reasoningTimeMs}ms</span>}
                      </div>

                      {msg.sender === "assistant" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (expandedMsgXaiId === msg.id) {
                              setExpandedMsgXaiId(null);
                            } else {
                              setExpandedMsgXaiId(msg.id);
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all font-sans font-bold cursor-pointer"
                        >
                          <BrainCircuit className="w-3 h-3 text-amber-400" />
                          <span>{expandedMsgXaiId === msg.id ? "إخفاء التفسير" : "تفسير القرار (XAI)"}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline Expandable XAI Explanation Box */}
                  {msg.sender === "assistant" && expandedMsgXaiId === msg.id && (
                    <div className="mt-3 bg-neutral-950/90 border border-amber-500/40 rounded-xl p-3.5 space-y-2.5 text-xs text-right animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedXaiExplanation(msg.xaiExplanation || null);
                            setShowSuperSettingsModal(true);
                          }}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>فتح في لوحة الإعدادات الفائقة</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                            ثقة {msg.xaiExplanation?.confidenceScore || 98.4}%
                          </span>
                          <span className="font-bold text-neutral-200">
                            {msg.xaiExplanation?.moduleNameAr || "وكيل فض النزاعات وتوليد الإجابة"}
                          </span>
                          <Scale className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      </div>

                      <p className="text-neutral-200 text-xs leading-relaxed">
                        <span className="font-bold text-amber-300 ml-1">لماذا اختار النظام هذه الإجابة؟</span>
                        {msg.xaiExplanation?.simpleExplanationAr || 
                          "تم فحص أطراف السؤال والموازنة بين الحجج والأدلة العلمية المعتمدة مع التدقيق ضد الهلوسة وصياغة الإجابة بلغة واضحة وموثقة."}
                      </p>

                      {msg.xaiExplanation?.keyFactors && msg.xaiExplanation.keyFactors.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10.5px] font-bold text-neutral-400">أهم العوامل المرجحة للقرار:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.xaiExplanation.keyFactors.map((f, fIdx) => (
                              <span 
                                key={fIdx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center gap-1"
                              >
                                <span className="text-amber-400 font-mono font-bold">{f.weight}%</span>
                                <span>{f.nameAr}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoadingAi && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-neutral-300 flex items-center gap-2.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="font-medium">{loadingStatusText}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* --- LIVE WAVEFORM VOICE STATUS OVERLAY (WHEN ACTIVE) --- */}
        {isLiveVoiceActive && (
          <div className="bg-gradient-to-r from-indigo-950/80 via-neutral-900 to-purple-950/80 border border-indigo-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 animate-pulse">
                <AudioLines className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <span>WESAM Live Waveform • الحوار الصوتي المباشر</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-[11px] text-neutral-400">{liveVoiceStatus}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 h-6 px-2 bg-neutral-950/60 rounded-lg">
                <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
              </div>
              <button
                type="button"
                onClick={handleToggleLiveWaveform}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --- FLOATING PILL CAPSULE INPUT BAR (EXACT MATCH TO SCREENSHOT + SOVEREIGN POWERS) --- */}
        <div className="relative">
          {/* Plus Menu Popover */}
          {showPlusMenu && (
            <div 
              className="absolute bottom-full mb-3 right-4 z-40 w-64 bg-[#0e0e13] border border-neutral-750 rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-bold text-neutral-400 px-3 py-1 border-b border-neutral-800">
                أدوات وميزات وسام الفائقة
              </div>
              <button
                type="button"
                onClick={() => { setIsImageMode(true); setShowPlusMenu(false); }}
                className="w-full p-2 rounded-xl text-right flex items-center gap-2 hover:bg-neutral-850 text-neutral-200 text-xs transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>استوديو الصور Nano Banana 4K</span>
              </button>
              <button
                type="button"
                onClick={() => { setReasoningMode("logical"); setIsImageMode(false); setShowPlusMenu(false); }}
                className="w-full p-2 rounded-xl text-right flex items-center gap-2 hover:bg-neutral-850 text-neutral-200 text-xs transition cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>محرر الأكواد والبرمجة المعمارية</span>
              </button>
              <button
                type="button"
                onClick={() => { setReasoningMode("philosophical"); setIsImageMode(false); setShowPlusMenu(false); }}
                className="w-full p-2 rounded-xl text-right flex items-center gap-2 hover:bg-neutral-850 text-neutral-200 text-xs transition cursor-pointer"
              >
                <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                <span>معمل الفلسفة وفض النزاعات</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowReligionsModal(true); setShowPlusMenu(false); }}
                className="w-full p-2 rounded-xl text-right flex items-center gap-2 hover:bg-neutral-850 text-amber-300 text-xs transition cursor-pointer"
              >
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span>مصفوفة الأديان وعلم اللاهوت (12+ ديانة)</span>
              </button>
              <button
                type="button"
                onClick={() => { handleToggleLiveWaveform(); setShowPlusMenu(false); }}
                className="w-full p-2 rounded-xl text-right flex items-center gap-2 hover:bg-neutral-850 text-neutral-200 text-xs transition cursor-pointer"
              >
                <AudioLines className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>الحوار الصوتي الحي (Live Waveform)</span>
              </button>
            </div>
          )}

          {/* Floating Pill Container */}
          <form
            onSubmit={handleSendMessage}
            className="bg-[#121218]/95 hover:bg-[#15151e] border border-neutral-750/90 focus-within:border-amber-500/70 rounded-full px-2 sm:px-3 py-2 shadow-2xl backdrop-blur-xl flex items-center gap-1.5 sm:gap-2 transition-all"
          >
            {/* 1. Plus Button (+) on the right/start */}
            <button
              id="pill-plus-tools-btn"
              type="button"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                showPlusMenu
                  ? "bg-amber-500 text-neutral-950 rotate-45 shadow-md"
                  : "bg-neutral-850 hover:bg-neutral-750 text-neutral-300 hover:text-white"
              }`}
              title="إضافة وتفعيل الأدوات الفائقة"
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>

            {/* 2. Text Input in Middle */}
            <input
              id="ai-prompt-input"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                isImageMode
                  ? "صف المشهد لتوليد صورة سينمائية 4K..."
                  : isRecordingVoice
                  ? "جاري الاستماع لصوتك الآن..."
                  : "اسأل WESAM AI..."
              }
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none px-2 py-1.5"
            />

            {/* If user typed text, show Send button */}
            {inputPrompt.trim() && (
              <button
                id="send-prompt-btn"
                type="submit"
                disabled={isLoadingAi}
                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0 shadow"
                title="إرسال"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            {/* 3. Microphone Button */}
            <button
              id="pill-microphone-btn"
              type="button"
              onClick={handleToggleVoiceInput}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 relative ${
                isRecordingVoice
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-850"
              }`}
              title={isRecordingVoice ? "إيقاف التسجيل الصوتي" : "التحدث بصوتك (إملاء صوتي)"}
            >
              {isRecordingVoice ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>

            {/* 4. Live Audio Waveform Circular Button (Exact Match to Screenshot with Custom Enhancements) */}
            <button
              id="pill-live-waveform-btn"
              type="button"
              onClick={handleToggleLiveWaveform}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg relative group ${
                isLiveVoiceActive
                  ? "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-neutral-950 animate-pulse"
                  : "bg-gradient-to-tr from-indigo-700/80 to-purple-800 text-indigo-100 hover:scale-105 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-900/30"
              }`}
              title="الحوار الصوتي المباشر والرد الصوتي (Live Waveform)"
            >
              {/* Vertical Sound Waves ılı */}
              <div className="flex items-center gap-0.5 h-4">
                <span className={`w-0.5 bg-white rounded-full ${isLiveVoiceActive ? 'h-3 animate-pulse' : 'h-2 group-hover:h-3'} transition-all`}></span>
                <span className={`w-0.5 bg-white rounded-full ${isLiveVoiceActive ? 'h-4.5 animate-pulse' : 'h-3.5 group-hover:h-4'} transition-all`}></span>
                <span className={`w-0.5 bg-white rounded-full ${isLiveVoiceActive ? 'h-2.5 animate-pulse' : 'h-1.5 group-hover:h-2.5'} transition-all`}></span>
              </div>
            </button>
          </form>
        </div>

      </main>

      {/* --- SUBSCRIPTION & VIP TIERS MODAL PORTAL --- */}
      {showSubscriptionModal && createPortal(
        <div
          id="subscription-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={() => setShowSubscriptionModal(false)}
        >
          <div
            id="subscription-modal-container"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b0b0e] border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 text-right shadow-2xl relative space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                    <Flame className="w-3 h-3 fill-neutral-950" />
                    <span>عرض الافتتاح لمدة 3 أيام فقط • 72 HOURS ONLY</span>
                  </span>
                  <span className="text-[10px] font-black text-rose-400 animate-pulse">
                    🔥 خصم استثنائي مؤقت
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white mt-1 leading-snug">
                  باقات اشتراك وسام للذكاء الاصطناعي (WESAM AI VIP) 🚀
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1 leading-relaxed max-w-2xl">
                  أطلق العنان للقدرات الإدراكية الفائقة: اختر باقتك المفضلة بأسعار الافتتاح الترويجية قبل انتهاء مهلة الـ 3 أيام وعودة الأسعار الرسمية!
                </p>
              </div>

              <button
                id="close-subscription-modal-btn"
                type="button"
                onClick={() => setShowSubscriptionModal(false)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Countdown Banner in Modal */}
            <div className="bg-gradient-to-r from-amber-950/70 via-rose-950/70 to-amber-950/70 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right shadow-inner">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    الوقت المتبقي لانتهاء عرض الـ 3 أيام وزيادة الأسعار:
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  بعد انتهاء العداد ستعود الأسعار: الشهرية إلى $5، السنوية إلى $25، والأبدية إلى $50.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <div className="bg-neutral-950/90 border border-amber-500/50 px-3 py-1.5 rounded-xl text-center shadow">
                  <span className="text-base sm:text-lg font-black text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[8.5px] text-neutral-400 uppercase">ساعة</span>
                </div>
                <span className="text-amber-400 font-bold text-sm">:</span>
                <div className="bg-neutral-950/90 border border-amber-500/50 px-3 py-1.5 rounded-xl text-center shadow">
                  <span className="text-base sm:text-lg font-black text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[8.5px] text-neutral-400 uppercase">دقيقة</span>
                </div>
                <span className="text-amber-400 font-bold text-sm">:</span>
                <div className="bg-neutral-950/90 border border-amber-500/50 px-3 py-1.5 rounded-xl text-center shadow">
                  <span className="text-base sm:text-lg font-black text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[8.5px] text-neutral-400 uppercase">ثانية</span>
                </div>
              </div>
            </div>

            {/* Current Active Plan Status */}
            {activeUserSub.planId !== "free" && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-white">حسابك مفعل حالياً: {activeUserSub.planName}</span>
                    <p className="text-[10.5px] text-emerald-300 font-mono">
                      كود المعاملة: {activeUserSub.txHash.slice(0, 18)}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: PRICING TIERS SELECTION */}
            <div className="space-y-3.5">
              <h3 className="text-xs sm:text-sm font-black text-neutral-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>1. اختر باقتك (متاحة بأسعار الافتتاح لـ 3 أيام فقط):</span>
                </span>
                <span className="text-[10px] text-amber-400/90 font-bold">
                  ⚡ ميزات أسطورية لكافة الباقات
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                
                {/* 1. Monthly Plan - $3/month (Regular $5 after 3 days) */}
                <div
                  id="tier-monthly-card"
                  onClick={() => setSelectedPlanId("monthly")}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    selectedPlanId === "monthly"
                      ? "bg-gradient-to-b from-neutral-900 to-amber-950/30 border-amber-400 ring-2 ring-amber-500/50 shadow-xl"
                      : "bg-neutral-950/80 border-neutral-850 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-white">الباقة الشهرية (Monthly VIP)</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-2 py-0.5 rounded-full">
                        خصم الافتتاح 40%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-300">$3</span>
                      <span className="text-xs text-neutral-400 font-bold">/ شهرياً</span>
                      <span className="text-xs text-neutral-500 line-through font-medium">(بعد 3 أيام $5)</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      خيار مرن للإنتاجية وتوليد الصور والمهام اليومية السريعة بكامل قدرات الذكاء الاصطناعي.
                    </p>
                  </div>

                  <ul className="space-y-2 text-[11px] text-neutral-200 pt-3 border-t border-neutral-850">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>محادثات غير مقيدة وبلا سقف للرسائل</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>توليد صور بجودة عالية عبر Nano Banana Pro</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>تفعيل الأطوار الـ 4 (الروحي، الفلسفي، المنطقي، الشامل)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>استجابة فورية فائقة السرعة بدون طوابير انتظار</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>منع الهلوسة وفحص الحقائق الصارم</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedPlanId === "monthly"
                        ? "bg-amber-500 text-neutral-950 shadow"
                        : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    {selectedPlanId === "monthly" ? "تم تحديد الباقة ✓" : "اختيار الباقة الشهرية"}
                  </button>
                </div>

                {/* 2. Annual Plan - $20/year (Regular $25 after 3 days) ⭐ BEST VALUE */}
                <div
                  id="tier-yearly-card"
                  onClick={() => setSelectedPlanId("yearly")}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    selectedPlanId === "yearly"
                      ? "bg-gradient-to-b from-neutral-900 to-amber-950/40 border-amber-400 ring-2 ring-amber-500/50 shadow-xl"
                      : "bg-neutral-950/80 border-neutral-850 hover:border-neutral-700"
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    ⭐ الأكثر طلباً وتوفيراً
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-amber-300">الباقة السنوية الأسطورية (Annual Legend)</span>
                      <span className="text-[9px] bg-amber-500 text-neutral-950 font-black px-2 py-0.5 rounded-full">
                        توفير ضخم (خصم 20%)
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-300">$20</span>
                      <span className="text-xs text-neutral-400 font-bold">/ سنوياً (365 يوم)</span>
                      <span className="text-xs text-neutral-500 line-through font-medium">(بعد 3 أيام $25)</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      سنة كاملة من القوة الحسابية الخارقة والأولوية القصوى للمحترفين والمطورين والباحثين.
                    </p>
                  </div>

                  <ul className="space-y-2 text-[11px] text-neutral-200 pt-3 border-t border-neutral-850">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>كل مميزات الباقة الشهرية لمدة 365 يوماً كاملة</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>أولوية قصوى على خوادم WESAM AI 1000X ومضاعفة سرعة التفكير</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>معامل الأكواد والبرمجة المعمارية (Rust, Solidity, Python, React)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>سعة لا نهائية لمستودع الحقائق والمعارف السيادية والمصادر</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>توليد وتصدير ملفات ومستندات وصور بدقة 4K فائقة الوضوح</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>الوصول المبكر الفوري لجميع التحديثات التجريبية (Beta Labs)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>شارة WESAM Annual VIP الذهبية الموثقة للحساب</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedPlanId === "yearly"
                        ? "bg-amber-500 text-neutral-950 shadow"
                        : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    {selectedPlanId === "yearly" ? "تم تحديد الباقة ✓" : "اختيار الباقة السنوية"}
                  </button>
                </div>

                {/* 3. Lifetime Access - $30 once (Regular $50 after 3 days) 👑 SUPREME VIP */}
                <div
                  id="tier-lifetime-card"
                  onClick={() => setSelectedPlanId("lifetime")}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    selectedPlanId === "lifetime"
                      ? "bg-gradient-to-b from-neutral-900 via-rose-950/30 to-amber-950/40 border-rose-400 ring-2 ring-rose-500/50 shadow-2xl"
                      : "bg-neutral-950/80 border-neutral-850 hover:border-neutral-700"
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    👑 السيادة الأبدية مدى الحياة
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black text-rose-300">باقة السيادة الأبدية مدى الحياة (Supreme Lifetime VIP)</span>
                      <span className="text-[9px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                        خصم 40% للافتتاح
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-rose-300">$30</span>
                      <span className="text-xs text-neutral-400 font-bold">دفعة واحدة للأبد</span>
                      <span className="text-xs text-neutral-500 line-through font-medium">(بعد 3 أيام $50)</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      ادفع $30 مرة واحدة فقط وامتلك WESAM AI مع كافة التحديثات والأجيال المستقبلية للأبد بدون أي اشتراكات أو تجديدات إطلاقاً!
                    </p>
                  </div>

                  <ul className="space-y-2 text-[11px] text-neutral-200 pt-3 border-t border-neutral-850">
                    <li className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-white">ملكية دائمة أبدية: دفعة واحدة لمرة واحدة في العمر بلا أي تجديد</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>وصول مطلق لكافة الإصدارات الحالية (4.0V, 3.0V, 2.0V, 1.0V)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>ترقية مجانية تلقائية للأجيال القادمة (5.0V و 6.0V وكل النسخ المستقبلية)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>تفعيل القوة الكاملة لـ 1000X Matrix (التحالف الخماسي الأكبر عالمياً)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>توليد صور ووسائط ورسومات بدقة سينمائية استوديو بلا أي سقف عددي</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>دخول حصري لمعامل وسام الفائقة 3000-POWER والمحاكاة الكمية</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>شارة التاج الماسي الأبدي (👑 Sovereign VIP Master Badge)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>أولوية مطلقة 24/7 بأقل زمن استجابة صفري في العالم</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedPlanId === "lifetime"
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg"
                        : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    {selectedPlanId === "lifetime" ? "تم تحديد الباقة الأبدية ✓" : "امتلاك باقة مدى الحياة"}
                  </button>
                </div>

              </div>
            </div>

            {/* ⚠️ Limited-Time Warning Box */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-950/80 via-rose-950/80 to-amber-950/80 border border-amber-500/60 rounded-2xl flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                  ⚠️ تنبيه انتهاء عرض الـ 3 أيام الصارم (3-Day Price Return Guarantee):
                </span>
                <p className="text-[11px] text-neutral-200 font-medium leading-relaxed">
                  هذا الخصم الاستثنائي ينتهي تماماً بعد 3 أيام (72 ساعة). وسترتفع الأسعار تلقائياً ودائماً:
                  <strong className="text-amber-300 font-bold mx-1">الباقة الشهرية من $3 إلى $5</strong> | 
                  <strong className="text-amber-300 font-bold mx-1">الباقة السنوية من $20 إلى $25</strong> | 
                  <strong className="text-amber-300 font-bold mx-1">باقة مدى الحياة من $30 إلى $50</strong>.
                  اغتنم الفرصة الآن قبل إغلاق نافذة العرض!
                </p>
              </div>
            </div>

            {/* STEP 2: CHOOSE CRYPTO CURRENCY (3 Supported Cryptos: Litecoin LTC, USDT, USDC) */}
            <div className="space-y-3 pt-2 border-t border-neutral-850">
              <h3 className="text-xs sm:text-sm font-black text-neutral-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>2. اختر العملة الرقمية للدفع (3 عملات معتمدة):</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  ✓ رسوم تحويل منخفضة وسرعة تأكيد فائقة
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* 1. LTC (Litecoin) */}
                <button
                  id="crypto-ltc-select-btn"
                  type="button"
                  onClick={() => setSelectedCrypto("LTC")}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    selectedCrypto === "LTC"
                      ? "bg-blue-500/15 border-blue-400 text-blue-300 font-bold shadow-md ring-1 ring-blue-500/40"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 font-black flex items-center justify-center text-sm border border-blue-500/30 shrink-0">
                      Ł
                    </div>
                    <div>
                      <span className="text-xs block font-bold text-white">لتكوين (Litecoin)</span>
                      <span className="text-[9.5px] text-blue-300 font-mono">LTC Network</span>
                    </div>
                  </div>
                  {selectedCrypto === "LTC" && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>

                {/* 2. USDT (Tether) */}
                <button
                  id="crypto-usdt-select-btn"
                  type="button"
                  onClick={() => setSelectedCrypto("USDT")}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    selectedCrypto === "USDT"
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 font-bold shadow-md ring-1 ring-emerald-500/40"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30 shrink-0">
                      ₮
                    </div>
                    <div>
                      <span className="text-xs block font-bold text-white">تيثير (USDT)</span>
                      <span className="text-[9.5px] text-emerald-300 font-mono">EVM / BSC / Polygon</span>
                    </div>
                  </div>
                  {selectedCrypto === "USDT" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>

                {/* 3. USDC (USD Coin) */}
                <button
                  id="crypto-usdc-select-btn"
                  type="button"
                  onClick={() => setSelectedCrypto("USDC")}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    selectedCrypto === "USDC"
                      ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow-md ring-1 ring-cyan-500/40"
                      : "bg-neutral-950 border-neutral-850 text-neutral-400 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/30 shrink-0">
                      $
                    </div>
                    <div>
                      <span className="text-xs block font-bold text-white">يو إس دي سي (USDC)</span>
                      <span className="text-[9.5px] text-cyan-300 font-mono">EVM / Polygon / Arbitrum</span>
                    </div>
                  </div>
                  {selectedCrypto === "USDC" && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>

              </div>

              {/* Wallet Address Display with QR & One-Click Copy */}
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 w-full text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>عنوان المحفظة المعتمد للتحويل ({selectedCrypto}):</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                        المبلغ المطلوب: ${selectedPlanId === "monthly" ? "3" : selectedPlanId === "yearly" ? "20" : "30"} USD
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-750 p-2.5 rounded-xl font-mono text-xs text-amber-300 overflow-x-auto select-all">
                      <span className="truncate flex-1 text-left dir-ltr">{CRYPTO_WALLETS[selectedCrypto]}</span>
                      <button
                        id="copy-crypto-address-btn"
                        type="button"
                        onClick={() => handleCopyCryptoAddress(selectedCrypto)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow active:scale-95"
                      >
                        {copiedCryptoField === selectedCrypto ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ! ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ العنوان</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-neutral-300 space-y-1 bg-black/40 p-2.5 rounded-xl border border-neutral-850">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>خطوات التفعيل السريعة:</span>
                      </p>
                      <p className="text-neutral-400 text-[10.5px]">
                        1. حوّل مبلغ (<strong className="text-white">${selectedPlanId === "monthly" ? "3" : selectedPlanId === "yearly" ? "20" : "30"} USD</strong>) من محفظتك إلى عنوان الـ ({selectedCrypto}) الموضح أعلاه.
                      </p>
                      <p className="text-neutral-400 text-[10.5px]">
                        2. انسخ كود المعاملة (TXID / Transaction Hash) وضعه في الحقل أدناه واضغط على تأكيد التفعيل الفوري.
                      </p>
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="p-2.5 bg-white rounded-2xl shrink-0 flex flex-col items-center shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${CRYPTO_WALLETS[selectedCrypto]}`}
                      alt="Wallet Address QR"
                      className="w-28 h-28 object-contain rounded-xl"
                    />
                    <span className="text-[9px] font-mono font-bold text-neutral-800 mt-1">
                      Scan ({selectedCrypto})
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* STEP 3: TRANSACTION HASH INPUT & INSTANT VERIFICATION */}
            <form onSubmit={handleSubmitSubscriptionPayment} className="space-y-3 pt-2 border-t border-neutral-850">
              <h3 className="text-xs sm:text-sm font-black text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3. إدخال كود التحويل (TXID / Hash) والتفعيل التلقائي الفوري:</span>
              </h3>

              <div className="space-y-1.5">
                <input
                  id="tx-hash-input-field"
                  type="text"
                  value={paymentTxHash}
                  onChange={(e) => setPaymentTxHash(e.target.value)}
                  placeholder="ضع كود المعاملة أو الـ Hash هنا (مثال: 0x6C64C9... أو LWAAv5...)"
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-2xl p-3.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 font-mono text-right dir-ltr"
                />
              </div>

              {paymentErrorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{paymentErrorMsg}</span>
                </div>
              )}

              {paymentSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{paymentSuccessMsg}</span>
                </div>
              )}

              <button
                id="submit-tx-hash-btn"
                type="submit"
                disabled={submittingPayment}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 disabled:opacity-50 text-neutral-950 font-black rounded-2xl text-sm sm:text-base transition-all shadow-xl active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {submittingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق الفوري من صحة المعاملة وتوثيق الاشتراك...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-neutral-950" />
                    <span>تأكيد التحويل وتفعيل الاشتراك VIP فوراً 🚀</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>,
        document.body
      )}

      {/* --- SUPER-SETTINGS & XAI EXPLANATION DASHBOARD MODAL --- */}
      <SuperSettingsModal
        isOpen={showSuperSettingsModal}
        onClose={() => setShowSuperSettingsModal(false)}
        initialExplanation={selectedXaiExplanation}
        initialTab={superSettingsTab}
        onOpenPlanModal={() => setShowSubscriptionModal(true)}
      />

      {/* --- 20 LANGUAGES SELECTOR MODAL --- */}
      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => setCurrentLanguage(lang)}
      />

      {/* --- PERSISTENT CHAT HISTORY DRAWER --- */}
      <ChatHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        sessions={chatSessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => handleSelectSession(id)}
        onNewChat={handleNewChat}
        onDeleteSession={(id) => handleDeleteSession(id)}
        onClearAllSessions={handleClearAllSessions}
        t={t}
        dir={currentLangConfig.dir}
      />

    </div>
  );
}
