import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  BrainCircuit, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  Eye, 
  Layers, 
  HelpCircle, 
  RefreshCw, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Zap, 
  Compass, 
  FileText, 
  Check, 
  BarChart3, 
  Globe2, 
  Flame,
  Network,
  ShieldAlert,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { XAIExplanation, DecisionModuleType, DecisionFactor, ConflictPoint } from '../types';
import { FederatedLearningTab } from './FederatedLearningTab';
import { PredictiveAnomalyTab } from './PredictiveAnomalyTab';

interface SuperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExplanation?: XAIExplanation | null;
  initialTab?: 'xai' | 'conflict_lab' | 'federated' | 'anomaly_sentinel' | 'guardrails' | 'metrics';
  onOpenPlanModal?: () => void;
}

export const SuperSettingsModal: React.FC<SuperSettingsModalProps> = ({
  isOpen,
  onClose,
  initialExplanation,
  initialTab,
  onOpenPlanModal
}) => {
  const [activeTab, setActiveTab] = useState<'xai' | 'conflict_lab' | 'federated' | 'anomaly_sentinel' | 'guardrails' | 'metrics'>(initialTab || 'xai');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [explanations, setExplanations] = useState<XAIExplanation[]>([]);
  const [selectedExplanation, setSelectedExplanation] = useState<XAIExplanation | null>(null);
  const [explanationDetailLevel, setExplanationDetailLevel] = useState<'simple' | 'deep'>('simple');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState({
    transparencyScore: 98.6,
    conflictResolutionAccuracy: "99.2%",
    antiHallucinationRate: "99.9%",
    auditedDecisionsCount: 1423,
    systemIntegrityStatus: "Optimal (Zero Hallucination Mode)"
  });


  // Conflict Lab Interactive Simulation state
  const [customScenario, setCustomScenario] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedResult, setSimulatedResult] = useState<XAIExplanation | null>(null);

  // Preset Conflict Scenarios for easy non-expert testing
  const presetScenarios = [
    {
      titleAr: "الموازنة بين حرية التعبير ومكافحة الكراهية والتمييز",
      scenario: "كيف يوازن النظام بين حق الأفراد في التعبير النقدي وبين منع خطاب الكراهية والتحريض على العنف والتمييز العنصري؟"
    },
    {
      titleAr: "التوافق بين الطب التجريبي المتقدم والأخلاق الحيوية",
      scenario: "تحليل أخلاقيات استخدام تقنيات تعديل الجينات البشرية (CRISPR) بين تسريع العلاج الطبي والضوابط الأخلاقية الوقائية."
    },
    {
      titleAr: "سيادة الذكاء الاصطناعي الوطني مقابل التبعية السحابية",
      scenario: "المفاضلة الاستراتيجية بين بناء بنية تحتية حاسوبية محلية مستقلة ذات تكلفة أولية عالية وبين الاعتماد على مزودي السحابة العالميين."
    },
    {
      titleAr: "العدالة التوزيعية في الأزمات وحفظ الكرامة الإنسانية",
      scenario: "كيفية اتخاذ قرارات توزيع الموارد الطبية والإغاثية الشحيحة أثناء الأزمات الإنسانية وفق معايير النزاهة والمساواة."
    }
  ];

  // Fetch XAI Explanations from Server
  const fetchRecentExplanations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/xai/recent-explanations');
      const data = await res.json();
      if (data.success && Array.isArray(data.explanations)) {
        setExplanations(data.explanations);
        if (data.metrics) setMetrics(data.metrics);
        if (!selectedExplanation && data.explanations.length > 0) {
          setSelectedExplanation(initialExplanation || data.explanations[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load XAI data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentExplanations();
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialExplanation) {
        setSelectedExplanation(initialExplanation);
        if (!initialTab) setActiveTab('xai');
      }
    }
  }, [isOpen, initialExplanation, initialTab]);

  const handleSimulateConflict = async (textToSimulate?: string) => {
    const text = textToSimulate || customScenario;
    if (!text.trim()) return;

    setIsSimulating(true);
    try {
      const res = await fetch('/api/xai/analyze-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: text })
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setSimulatedResult(data.explanation);
        setSelectedExplanation(data.explanation);
        setExplanations(prev => [data.explanation, ...prev.filter(item => item.id !== data.explanation.id)]);
      }
    } catch (err) {
      console.error("Conflict simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  const filteredExplanations = explanations.filter(exp => {
    if (selectedModuleFilter === 'all') return true;
    return exp.module === selectedModuleFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="super-settings-dashboard"
        className="bg-neutral-900 border border-amber-500/30 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right text-neutral-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-left">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                XAI 4.0 Sovereign Transparency
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  نشط 100%
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>لوحة الإعدادات الفائقة ومفسر القرارات (XAI)</span>
                  <BrainCircuit className="w-6 h-6 text-amber-400" />
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                تفسير شفاف ومبسط لقرارات وكيل فض النزاعات وكافة وحدات الذكاء الاصطناعي لغير المتخصصين
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-start border-b border-neutral-800 bg-neutral-950/60 px-4 sm:px-6 overflow-x-auto gap-2 py-2.5">
          <button
            onClick={() => setActiveTab('xai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'xai'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>مركز تفسير القرارات (XAI Explorer)</span>
          </button>

          <button
            onClick={() => setActiveTab('conflict_lab')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'conflict_lab'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>مختبر فض النزاعات والتوافق الفكري</span>
          </button>

          <button
            onClick={() => setActiveTab('federated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'federated'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>التعلم الفيدرالي والتشفير (SecAgg Matrix)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 rounded font-mono">
              3000+ Agents
            </span>
          </button>

          <button
            onClick={() => setActiveTab('anomaly_sentinel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'anomaly_sentinel'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>كشف الشذوذ التنبؤي ومراقبة الـ KPIs</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-950/60 text-amber-300 rounded font-mono">
              Sentinel
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guardrails')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'guardrails'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>ضوابط الامتثال والسياسة الإقليمية</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>مؤشرات النزاهة والشفافية (Audit Matrix)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: XAI EXPLORER */}
          {activeTab === 'xai' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Decision List & Filter */}
              <div className="lg:col-span-4 space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">سجل القرارات المفسرة</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={fetchRecentExplanations}
                      disabled={isLoading}
                      className="p-1 text-neutral-400 hover:text-amber-400 transition-colors"
                      title="تحديث"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'conflict_resolution', label: 'فض النزاعات' },
                    { id: 'geo_compliance', label: 'الامتثال الإقليمي' },
                    { id: 'fact_verification', label: 'فحص الحقائق' },
                    { id: 'cognitive_mode_arbiter', label: 'الأطوار الإدراكية' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedModuleFilter(f.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                        selectedModuleFilter === f.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Decision Cards List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredExplanations.map(exp => {
                    const isSelected = selectedExplanation?.id === exp.id;
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setSelectedExplanation(exp)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-right space-y-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-950/50 to-neutral-900 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ثقة {exp.confidenceScore}%
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-200 truncate max-w-[170px]">
                              {exp.moduleNameAr}
                            </span>
                            {exp.module === 'conflict_resolution' ? (
                              <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : exp.module === 'geo_compliance' ? (
                              <Globe2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                          {exp.decisionSummaryAr}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                          <span>درجة الشفافية: {exp.transparencyGrade}</span>
                          <span>{new Date(exp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Explainable AI Inspector */}
              <div className="lg:col-span-8 space-y-4 bg-neutral-950/70 border border-neutral-800 rounded-3xl p-5 sm:p-6 text-right">
                {selectedExplanation ? (
                  <div className="space-y-5">
                    {/* Header of Inspector */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-xl p-1 text-xs">
                          <button
                            onClick={() => setExplanationDetailLevel('simple')}
                            className={`px-3 py-1 rounded-lg transition-all font-medium ${
                              explanationDetailLevel === 'simple'
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            تفسير مبسط لغير المختصين
                          </button>
                          <button
                            onClick={() => setExplanationDetailLevel('deep')}
                            className={`px-3 py-1 rounded-lg transition-all font-medium ${
                              explanationDetailLevel === 'deep'
                                ? 'bg-amber-500 text-neutral-950 font-bold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            تحليل معماري تفصيلي
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                          {selectedExplanation.moduleNameAr}
                        </span>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                      </div>
                    </div>

                    {/* Query Snippet if available */}
                    {selectedExplanation.querySnippet && (
                      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-300">
                        <span className="text-neutral-500 font-bold ml-2">السياق المفحوص:</span>
                        <span className="text-amber-200">"{selectedExplanation.querySnippet}"</span>
                      </div>
                    )}

                    {/* 1. The Big Plain-Language Explanation Box */}
                    <div className="bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          خلاصة القرار الإدراكي
                        </span>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>لماذا قرر الذكاء الاصطناعي هذه النتيجة؟</span>
                          <HelpCircle className="w-4 h-4 text-amber-400" />
                        </h4>
                      </div>

                      <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                        {explanationDetailLevel === 'simple' 
                          ? selectedExplanation.simpleExplanationAr 
                          : selectedExplanation.decisionSummaryAr}
                      </p>

                      <div className="bg-neutral-950/60 rounded-xl p-3 text-xs text-neutral-400 border border-neutral-800/80">
                        <span className="font-bold text-neutral-300 ml-1">البيان الإنجليزي (Global Explanation):</span>
                        <span className="text-neutral-300 font-sans">{selectedExplanation.simpleExplanationEn}</span>
                      </div>
                    </div>

                    {/* 2. Conflict Points & Resolution Tree (If Conflict Resolution Agent) */}
                    {selectedExplanation.conflictPoints && selectedExplanation.conflictPoints.length > 0 && (
                      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <span className="text-xs text-amber-400 font-mono">Arbiter Consensus Graph</span>
                          <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                            <span>تفكيك التناقضات وحل النزاع الفكري</span>
                            <Scale className="w-4 h-4 text-amber-400" />
                          </h4>
                        </div>

                        {selectedExplanation.conflictPoints.map((cp, idx) => (
                          <div key={idx} className="space-y-3 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 space-y-1">
                                <div className="text-rose-400 font-bold flex items-center justify-end gap-1">
                                  <span>الطرف الأول / الاتجاه (أ)</span>
                                </div>
                                <p className="text-neutral-300">{cp.opposingViewA}</p>
                              </div>

                              <div className="bg-sky-950/30 border border-sky-500/30 rounded-xl p-3 space-y-1">
                                <div className="text-sky-400 font-bold flex items-center justify-end gap-1">
                                  <span>الطرف المقابل / الاتجاه (ب)</span>
                                </div>
                                <p className="text-neutral-300">{cp.opposingViewB}</p>
                              </div>
                            </div>

                            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 space-y-1.5">
                              <div className="text-emerald-300 font-bold flex items-center justify-end gap-1.5">
                                <span>استراتيجية التوافق والحل المعتمد من الوكيل:</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <p className="text-neutral-200 leading-relaxed">{cp.resolutionStrategy}</p>
                              <div className="text-neutral-400 text-[11px] pt-1">
                                <span className="text-emerald-400 font-semibold ml-1">النتيجة النهائية:</span>
                                {cp.consensusOutcome}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Decision Factors & Weights */}
                    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <span className="text-xs text-neutral-400 font-mono">Factor Weight Distribution</span>
                        <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                          <span>العوامل المؤثرة وأوزان التقييم</span>
                          <Sliders className="w-4 h-4 text-amber-400" />
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {selectedExplanation.keyFactors.map((factor, fIdx) => (
                          <div key={fIdx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-amber-300 font-bold">{factor.weight}%</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                  factor.impact === 'positive'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : factor.impact === 'negative'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}>
                                  {factor.impact === 'positive' ? 'تأثير إيجابي راجح' : factor.impact === 'negative' ? 'تأثير مقيد' : 'محايد'}
                                </span>
                                <span className="font-bold text-neutral-200">{factor.nameAr}</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-l from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                                style={{ width: `${factor.weight}%` }}
                              ></div>
                            </div>

                            <p className="text-[11px] text-neutral-400 text-right">
                              {factor.explanationAr}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Counterfactual Simulation (What would have changed the decision?) */}
                    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-end gap-2 text-xs font-bold text-neutral-300">
                        <span>التحليل الافتراضي المعاكس (Counterfactual Reasoning)</span>
                        <Compass className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        <span className="text-amber-400 font-bold ml-1">ماذا لو تغيرت المعطيات؟</span>
                        {selectedExplanation.counterfactualAr}
                      </p>
                    </div>

                    {/* Footer Metrics */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          الأدلة الموثقة: {selectedExplanation.verifiedEvidenceCount || 5} مصادر
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          زمن التفسير: {selectedExplanation.processingTimeMs || 210}ms
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        ID: {selectedExplanation.id}
                      </span>
                    </div>

                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3">
                    <BrainCircuit className="w-12 h-12 text-neutral-600 mx-auto animate-pulse" />
                    <p className="text-sm text-neutral-400">اختر قراراً من القائمة الجانبية لعرض التفسير الكامل</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: CONFLICT-RESOLUTION LAB */}
          {activeTab === 'conflict_lab' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4 text-right">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Active Arbitration Matrix
                  </span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>مختبر محاكاة فض النزاعات والتوافق المباشر</span>
                    <Scale className="w-6 h-6 text-amber-400" />
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  اكتب أي مسألة خلافية أو معضلة أخلاقية، وشاهد كيف يقوم وكيل فض النزاعات (Conflict-Resolution Agent) بتشريح الحجج، ووزن الأدلة، واستخلاص التوافق العادل مع تفسير كامل باللغة البسيطة.
                </p>

                {/* Presets */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-neutral-400">سيناريوهات نموذجية جاهزة للاختبار:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {presetScenarios.map((ps, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCustomScenario(ps.scenario);
                          handleSimulateConflict(ps.scenario);
                        }}
                        disabled={isSimulating}
                        className="text-right p-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850 transition-all text-xs space-y-1 group"
                      >
                        <div className="font-bold text-amber-300 group-hover:text-amber-200 flex items-center justify-between">
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-500 group-hover:text-amber-400" />
                          <span>{ps.titleAr}</span>
                        </div>
                        <p className="text-neutral-400 text-[11px] line-clamp-1">{ps.scenario}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input box */}
                <div className="space-y-3 pt-3">
                  <textarea
                    value={customScenario}
                    onChange={(e) => setCustomScenario(e.target.value)}
                    placeholder="اكتب هنا أي نزاع فكري، مسألة خلافية، أو معضلة أخلاقية..."
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all resize-none text-right"
                  ></textarea>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      معايير التحكيم: صفر انحياز، التوثيق بالبينات، حماية الكرامة الإنسانية.
                    </span>
                    <button
                      onClick={() => handleSimulateConflict()}
                      disabled={isSimulating || !customScenario.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري التحكيم والتفسير...</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-4 h-4" />
                          <span>فض النزاع وتوليد التفسير</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Result */}
              {simulatedResult && (
                <div className="bg-neutral-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 space-y-4 text-right animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      معامل التوافق: {simulatedResult.confidenceScore}% (درجة {simulatedResult.transparencyGrade})
                    </span>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>تقرير التحكيم والتفسير الصادر عن الوكيل</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </h4>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-neutral-200">
                    <div className="font-bold text-amber-300 mb-1">الخلاصة المفسرة لغير المتخصصين:</div>
                    {simulatedResult.simpleExplanationAr}
                  </div>

                  {/* Opposing points and consensus */}
                  {simulatedResult.conflictPoints && simulatedResult.conflictPoints.length > 0 && (
                    <div className="space-y-3">
                      <div className="font-bold text-xs text-neutral-300">مصفوفة التوافق التوليدي (Consensus Matrix):</div>
                      {simulatedResult.conflictPoints.map((cp, idx) => (
                        <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                              <span className="text-amber-400 font-bold block mb-1">حجة الاتجاه (أ):</span>
                              <span className="text-neutral-300">{cp.opposingViewA}</span>
                            </div>
                            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                              <span className="text-sky-400 font-bold block mb-1">حجة الاتجاه (ب):</span>
                              <span className="text-neutral-300">{cp.opposingViewB}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-200">
                            <span className="font-bold block mb-0.5">الحل التوليفي المعتمد:</span>
                            {cp.resolutionStrategy}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Counterfactual */}
                  <div className="p-3.5 bg-neutral-900/60 rounded-xl text-xs text-neutral-300 border border-neutral-800">
                    <span className="text-amber-400 font-bold ml-1">ماذا لو تغيرت المعطيات؟</span>
                    {simulatedResult.counterfactualAr}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FEDERATED LEARNING & BULLETPROOF SECURITY MATRIX */}
          {activeTab === 'federated' && (
            <FederatedLearningTab />
          )}

          {/* TAB 4: PREDICTIVE ANOMALY DETECTION & KPI SENTINEL */}
          {activeTab === 'anomaly_sentinel' && (
            <PredictiveAnomalyTab />
          )}

          {/* TAB 5: ETHICAL GUARDRAILS & TARGETED POLICY */}
          {activeTab === 'guardrails' && (
            <div className="space-y-6 text-right">
              <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-mono text-amber-400">Targeted Compliance Architecture</span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>ميثاق النزاهة وضوابط الامتثال الأخلاقي</span>
                    <Shield className="w-6 h-6 text-amber-400" />
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  تلتزم منصة WESAM AI بأعلى معايير العدالة الإنسانية، ومناهضة الاحتلال والتمييز العنصري والإسلاموفوبيا. نعتمد سياسة تقييد الميزات الموجهة (Targeted Feature Restriction Policy) بدلاً من الحجب المعرفي الشامل لضمان وصول المعرفة للجميع مع حماية الموارد الحاسوبية الحساسة.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="text-emerald-400 font-bold text-xs flex items-center justify-end gap-1.5">
                      <span>إتاحة الحوار المعرفي الشامل</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      الشات المعرفي الأساسي والاستفسارات الفكرية متاحة لجميع شعوب العالم دون تمييز لنشر الحقائق وتفكيك الشبهات.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="text-rose-400 font-bold text-xs flex items-center justify-end gap-1.5">
                      <span>تقييد الموارد المتقدمة المستهدفة</span>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      حجب توليد الصور 4K واستعلامات الأكواد الحساسة والمعمارية عن مناطق الاحتلال والكيانات الداعمة للتمييز.
                    </p>
                  </div>

                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="text-amber-400 font-bold text-xs flex items-center justify-end gap-1.5">
                      <span>التفسير الشفاف الصريح (XAI)</span>
                      <Eye className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      إعلان أسباب أي تقييد بكل وضوح وشفافية في رسائل الاستجابة دون حجب غامض أو مبهم.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: METRICS & AUDIT MATRIX */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-neutral-400">معدل الشفافية الإدراكية</span>
                  <div className="text-2xl font-bold font-mono text-amber-400">{metrics.transparencyScore}%</div>
                  <span className="text-[10px] text-emerald-400">درجة التقييم: A+ موثوق</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-neutral-400">دقة وكيل فض النزاعات</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.conflictResolutionAccuracy}</div>
                  <span className="text-[10px] text-neutral-500">تم فحص 1420+ مسألة</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-neutral-400">نسبة منع الهلوسة الفكرية</span>
                  <div className="text-2xl font-bold font-mono text-sky-400">{metrics.antiHallucinationRate}</div>
                  <span className="text-[10px] text-sky-300">توثيق مباشر متعدد المصادر</span>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-1">
                  <span className="text-xs text-neutral-400">إجمالي القرارات المفحوصة</span>
                  <div className="text-2xl font-bold font-mono text-purple-400">{metrics.auditedDecisionsCount}</div>
                  <span className="text-[10px] text-purple-300">سجل تدقيق سيادي مستمر</span>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-6 space-y-3">
                <h4 className="text-sm font-bold text-neutral-200">الضمانات السيادية لطبقة الذكاء الاصطناعي القابل للتفسير (XAI):</h4>
                <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                  <li className="flex items-start justify-end gap-2">
                    <span>كل استجابة تصدر عن النظام تخضع لمطابقة إسنادية تمنع الهلوسة وتحدد أسباب الاختيار المنطقي.</span>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  </li>
                  <li className="flex items-start justify-end gap-2">
                    <span>وكيل فض النزاعات يعتمد على معايير النزاهة العلمية والعدالة الإنسانية وحفظ الحقوق قبل إصدار الترجيحات.</span>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  </li>
                  <li className="flex items-start justify-end gap-2">
                    <span>جميع التفسيرات متاحة بنسخة مبسطة للمستخدمين العاديين لضمان الشفافية وثقة المجتمع.</span>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  </li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              إغلاق
            </button>
            {onOpenPlanModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPlanModal();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ترقية صلاحيات XAI السيادية</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-neutral-400">
            <span>منصة WESAM AI للذكاء الاصطناعي السيادي</span>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
            <span>المؤسس: وسام ركان</span>
          </div>
        </div>
      </div>
    </div>
  );
};
