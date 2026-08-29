export type PlanId = "free" | "monthly" | "yearly" | "lifetime";

export type CryptoKey = "LTC" | "USDT" | "USDC";

export interface PlanTier {
  id: PlanId;
  name: string;
  nameEn: string;
  currentPrice: number;
  regularPrice: number;
  period: string;
  periodEn: string;
  badge: string;
  badgeEn: string;
  description: string;
  descriptionEn: string;
  isPopular?: boolean;
  isLifetime?: boolean;
  features: {
    ar: string;
    en: string;
    isHighlight?: boolean;
    isSuper?: boolean;
  }[];
}

export interface UserSubscription {
  planId: PlanId;
  planName: string;
  amountUsd: number;
  cryptoCurrency: CryptoKey;
  walletAddress: string;
  txHash: string;
  status: "active" | "pending" | "free";
  activatedAt: string;
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  modelUsed?: string;
  imageUrl?: string;
  imagePrompt?: string;
  isVideoRequest?: boolean;
  videoDurationSec?: number;
  reasoningTimeMs?: number;
  sources?: string[];
  isRestricted?: boolean;
  xaiExplanation?: XAIExplanation;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  reasoningMode?: ReasoningMode;
}

export type ReasoningMode = "comprehensive" | "logical" | "philosophical" | "spiritual";

export interface GeoPolicyStatus {
  isRestrictedRegion: boolean;
  countryCode?: string;
  countryName?: string;
  regionName?: string;
  policyReasonAr: string;
  policyReasonEn: string;
  restrictedFeatures: string[];
  allowedFeatures: string[];
}

export type DecisionModuleType = 
  | "conflict_resolution"
  | "geo_compliance"
  | "fact_verification"
  | "cognitive_mode_arbiter"
  | "safety_ethics";

export interface DecisionFactor {
  nameAr: string;
  nameEn: string;
  weight: number; // 0 to 100
  impact: "positive" | "negative" | "neutral";
  explanationAr: string;
  explanationEn: string;
}

export interface ConflictPoint {
  opposingViewA: string;
  opposingViewB: string;
  resolutionStrategy: string;
  consensusOutcome: string;
}

export interface XAIExplanation {
  id: string;
  timestamp: string;
  module: DecisionModuleType;
  moduleNameAr: string;
  moduleNameEn: string;
  querySnippet?: string;
  decisionSummaryAr: string;
  decisionSummaryEn: string;
  simpleExplanationAr: string;
  simpleExplanationEn: string;
  confidenceScore: number;
  transparencyGrade: "A+" | "A" | "B+";
  keyFactors: DecisionFactor[];
  conflictPoints?: ConflictPoint[];
  counterfactualAr: string;
  counterfactualEn: string;
  verifiedEvidenceCount?: number;
  processingTimeMs?: number;
}

// --- FEDERATED LEARNING FRAMEWORK TYPES ---
export interface FederatedAgentNode {
  id: string;
  nameAr: string;
  nameEn: string;
  cluster: string;
  status: "training" | "aggregating" | "syncing" | "idle";
  encryptedGradientHash: string;
  encryptionStandard: string;
  dpEpsilon: number; // Differential privacy parameter (e.g., 0.15)
  participatingAgentsCount: number;
  localLoss: number;
  localAccuracy: number;
  bandwidthKbps: number;
  lastContributionTime: string;
}

export interface FederatedRoundTelemetry {
  roundNumber: number;
  timestamp: string;
  totalParticipatingAgents: number; // 3000+
  activeClustersCount: number;
  secureAggregationStatus: "SecAgg_Verified" | "Homomorphic_Masking" | "ZeroKnowledge_Proven";
  globalAccuracy: number;
  globalLossReduction: number;
  privacyBudgetUsed: string;
  modelWeightChecksum: string;
  trainingEpochDurationMs: number;
}

export interface FederatedLearningOverview {
  globalModelVersion: string;
  totalRegisteredAgents: number; // 3140 agents
  totalActiveNodes: number;
  completedRoundsCount: number;
  securityMatrixLevel: "Bulletproof 256-bit Homomorphic + SecAgg";
  differentialPrivacyGuarantee: string;
  activeNodes: FederatedAgentNode[];
  recentRounds: FederatedRoundTelemetry[];
}

// --- PREDICTIVE ANOMALY DETECTION TYPES ---
export type AnomalySeverity = "critical" | "warning" | "optimization";

export type LanguageCode =
  | "ar"
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "tr"
  | "fa"
  | "ur"
  | "ru"
  | "zh"
  | "ja"
  | "ko"
  | "pt"
  | "hi"
  | "nl"
  | "sv"
  | "pl"
  | "id"
  | "el";

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  flag: string;
  dir: "rtl" | "ltr";
  region: string;
}

export interface SystemKPIMetric {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "latency" | "drift" | "entropy" | "consensus" | "memory";
  currentValue: number;
  unit: string;
  normalRange: [number, number];
  status: "optimal" | "elevated" | "divergent";
  forecastTrend: "improving" | "stable" | "degrading";
  historicalTrend: number[];
}

export interface PredictiveAnomalyLog {
  id: string;
  timestamp: string;
  targetModuleId: string;
  targetModuleNameAr: string;
  targetModuleNameEn: string;
  severity: AnomalySeverity;
  anomalyTypeAr: string;
  anomalyTypeEn: string;
  deviationPercent: number;
  predictedImpactAr: string;
  predictedImpactEn: string;
  rootCauseAr: string;
  rootCauseEn: string;
  timeToImpactEstimate: string; // e.g. "في غضون 4.5 دقائق"
  confidenceScore: number;
  suggestedActionAr: string;
  suggestedActionEn: string;
  remediationStatus: "suggested" | "executed" | "monitoring";
  isResolved?: boolean;
}

export interface AnomalyDetectionOverview {
  systemHealthScore: number; // 98.8%
  activeMonitoredModules: number; // 3000+
  anomalyRiskLevel: "Low" | "Moderate" | "Elevated";
  kpiMetrics: SystemKPIMetric[];
  activeAnomalies: PredictiveAnomalyLog[];
  resolvedAnomaliesCount: number;
  automatedRemediationRate: string;
}

// --- WORLD RELIGIONS & COMPARATIVE THEOLOGY TYPES ---
export type ReligionCategory = "abrahamic" | "dharmic" | "east_asian" | "persian_ancient" | "comparative";

export interface ReligionItem {
  id: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  category: ReligionCategory;
  adherentsCount: string;
  originatedEra: string;
  geographicOrigin: string;
  keyFigures: string[];
  sacredTexts: string[];
  corePillarsAr: string[];
  ethicalTeachingsAr: string[];
  viewOfGodOrUltimateRealityAr: string;
  afterlifeConceptAr: string;
  commonHumanValuesAr: string[];
  sampleQuestions: string[];
  iconBgColor: string;
  borderColor: string;
}

