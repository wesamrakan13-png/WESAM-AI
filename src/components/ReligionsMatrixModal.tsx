import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Sparkles, 
  Scale, 
  Globe2, 
  Compass, 
  HeartHandshake, 
  Layers, 
  MessageSquareQuote,
  ChevronRight,
  Send,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ReligionItem, ReligionCategory } from '../types';
import { WORLD_RELIGIONS_DATA, COMPARATIVE_THEMES } from '../data/religionsData';

interface ReligionsMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const ReligionsMatrixModal: React.FC<ReligionsMatrixModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReligionCategory | "all" | "comparative_view">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReligion, setSelectedReligion] = useState<ReligionItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "comparative">("overview");

  if (!isOpen) return null;

  const filteredReligions = WORLD_RELIGIONS_DATA.filter((rel) => {
    const matchesCategory = selectedCategory === "all" || selectedCategory === "comparative_view" || rel.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const matchesSearch = 
      rel.nameAr.toLowerCase().includes(q) ||
      rel.nameEn.toLowerCase().includes(q) ||
      rel.geographicOrigin.toLowerCase().includes(q) ||
      rel.sacredTexts.some(t => t.toLowerCase().includes(q)) ||
      rel.keyFigures.some(f => f.toLowerCase().includes(q)) ||
      rel.corePillarsAr.some(p => p.toLowerCase().includes(q)) ||
      rel.commonHumanValuesAr.some(v => v.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleAskAboutReligion = (promptText: string) => {
    onSelectPrompt(promptText);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#0e0e14] border border-neutral-750 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right text-neutral-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-xl">
                🌍
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مصفوفة الأديان والحضارات العالمية (World Religions Matrix)
                </h2>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  12+ تقليد روحي
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                استعراض شامل وموضوعي لجميع أديان العالم، العقائد، النصوص المقدسة، ومقارنة القيم الإنسانية المشتركة
              </p>
            </div>
          </div>

          <button
            id="close-religions-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-neutral-800/80 bg-[#121218] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={() => { setActiveTab("overview"); setSelectedCategory("all"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-amber-500 text-neutral-950 shadow"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>موسوعة الأديان</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("comparative"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "comparative"
                  ? "bg-amber-500 text-neutral-950 shadow"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>علم مقارنة الأديان</span>
            </button>
          </div>

          {/* Search Box */}
          {activeTab === "overview" && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن دين، نص مقدس، مؤسس، أو مفهوم عقائدي..."
                className="w-full bg-neutral-900 border border-neutral-750 focus:border-amber-500/80 rounded-xl py-2 pr-9 pl-4 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition shadow-inner"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-2.5 text-neutral-500 hover:text-neutral-300 text-xs"
                >
                  مسح
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category Filter Pills (when in Overview mode) */}
        {activeTab === "overview" && (
          <div className="px-4 py-2 bg-neutral-950/60 border-b border-neutral-850 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-neutral-200 text-neutral-950 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              الكل (12 ديانة)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("abrahamic")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "abrahamic"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              <span>☪️ ✝️ ✡️</span>
              <span>الأديان الإبراهيمية</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("dharmic")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "dharmic"
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/50 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              <span>🕉️ ☸️ ☬</span>
              <span>الأديان الهندية والدارمية</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("east_asian")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "east_asian"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              <span>☯️ ⛩️ 📖</span>
              <span>أديان وحِكم شرق آسيا</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("persian_ancient")}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === "persian_ancient"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
              }`}
            >
              <span>🔥</span>
              <span>التقاليد القديمة والزرادشتية</span>
            </button>
          </div>
        )}

        {/* Modal Body Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === "overview" ? (
            /* --- TAB 1: RELIGIONS OVERVIEW GRID & DETAIL MODAL --- */
            selectedReligion ? (
              /* Deep Single Religion Viewer */
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Top Action Back Bar */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedReligion(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>العودة لجميع الأديان</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 font-mono">
                      {selectedReligion.adherentsCount}
                    </span>
                    <span className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg border border-neutral-700">
                      {selectedReligion.geographicOrigin}
                    </span>
                  </div>
                </div>

                {/* Religion Hero Banner */}
                <div className={`p-6 rounded-3xl bg-gradient-to-r ${selectedReligion.iconBgColor} border ${selectedReligion.borderColor} relative overflow-hidden shadow-xl`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-3xl mb-2">{selectedReligion.symbol}</div>
                      <h3 className="text-2xl font-black text-white mb-1">
                        {selectedReligion.nameAr}
                      </h3>
                      <p className="text-xs text-neutral-300">
                        النشأة والعهد: {selectedReligion.originatedEra} • الموطن الأصلي: {selectedReligion.geographicOrigin}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAskAboutReligion(`قدم لي دراسة فكرية وعلمية شاملة وموثقة حول ${selectedReligion.nameAr}، عقائدها، نصوصها، وتاريخها الحضاري`)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 transition shadow-lg active:scale-95 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>طرح بحث في WESAM AI</span>
                    </button>
                  </div>
                </div>

                {/* Grid of Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Sacred Texts */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <BookOpen className="w-4 h-4" />
                      <span>الكتب والنصوص المقدسة (Sacred Texts)</span>
                    </div>
                    <ul className="space-y-1.5 text-neutral-300">
                      {selectedReligion.sacredTexts.map((text, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Figures */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Globe2 className="w-4 h-4" />
                      <span>الشخصيات والأنبياء والمؤسسون</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReligion.keyFigures.map((fig, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200">
                          {fig}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Concept of Divine */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Compass className="w-4 h-4" />
                      <span>مفهوم الألوهية والحقيقة المطلقة (Concept of the Divine)</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-xs">
                      {selectedReligion.viewOfGodOrUltimateRealityAr}
                    </p>
                  </div>

                  {/* Core Pillars */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <ShieldCheck className="w-4 h-4" />
                      <span>الأركان والعقائد الأساسية</span>
                    </div>
                    <ul className="space-y-1.5 text-neutral-300">
                      {selectedReligion.corePillarsAr.map((pillar, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pillar}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ethical Teachings */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <HeartHandshake className="w-4 h-4" />
                      <span>الوصايا والأخلاق والفضائل</span>
                    </div>
                    <ul className="space-y-1.5 text-neutral-300">
                      {selectedReligion.ethicalTeachingsAr.map((eth, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 mt-0.5">•</span>
                          <span>{eth}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Afterlife */}
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 font-bold text-sky-300">
                      <Layers className="w-4 h-4" />
                      <span>المصير والآخرة والتحرر (Afterlife & Transcendence)</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-xs">
                      {selectedReligion.afterlifeConceptAr}
                    </p>
                  </div>
                </div>

                {/* Sample Prompt Presets */}
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-750 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                    <MessageSquareQuote className="w-4 h-4" />
                    <span>أسئلة ومسائل بحثية جاهزة حول {selectedReligion.nameAr} (انقر للإرسال الفوري):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {selectedReligion.sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskAboutReligion(q)}
                        className="p-2.5 text-right rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-[11px] text-neutral-300 hover:text-white transition flex flex-col justify-between gap-2 group cursor-pointer shadow-sm"
                      >
                        <p className="line-clamp-2">{q}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold self-end group-hover:translate-x-[-2px] transition-transform">
                          <span>طرح السؤال</span>
                          <Send className="w-2.5 h-2.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* All Religions Cards Grid */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredReligions.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedReligion(rel)}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${rel.iconBgColor} border ${rel.borderColor} hover:scale-[1.02] hover:border-amber-400/80 transition-all cursor-pointer shadow-md flex flex-col justify-between gap-3 group`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-2xl select-none group-hover:scale-110 transition-transform">
                            {rel.symbol}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-950/70 border border-neutral-700 text-neutral-300">
                            {rel.adherentsCount}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                          {rel.nameAr}
                        </h4>
                        <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">
                          {rel.viewOfGodOrUltimateRealityAr}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10.5px]">
                        <span className="text-neutral-400">{rel.geographicOrigin}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                          <span>استعراض التفاصيل</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredReligions.length === 0 && (
                  <div className="text-center py-12 space-y-3">
                    <div className="text-4xl">🔍</div>
                    <h4 className="text-sm font-bold text-neutral-300">لم يتم العثور على نتائج مطابقة لبحثك</h4>
                    <p className="text-xs text-neutral-500">جرب كتابة اسم دين آخر أو نص مقدس مثل: الإسلام، المسيحية، التوراة، بوذا، الكارما...</p>
                  </div>
                )}
              </div>
            )
          ) : (
            /* --- TAB 2: COMPARATIVE THEOLOGY MATRIX --- */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Scale className="w-4 h-4" />
                  <span>علم مقارنة الأديان والقيم الإنسانية الكونية</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  يقدم WESAM AI تحليلاً مقارناً نزيهاً وموضوعياً يجمع بين التوصيف الدقيق لكل دين، وإبراز نقاط التلاقي الإنساني، واحترام الخصوصيات العقدية دون خلط أو تعصب.
                </p>
              </div>

              {/* Comparative Theme Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPARATIVE_THEMES.map((theme) => (
                  <div key={theme.id} className="p-4 rounded-2xl bg-[#121218] border border-neutral-750 space-y-3">
                    <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{theme.titleAr}</span>
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {theme.descriptionAr}
                    </p>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                      <span className="font-bold text-neutral-400 block">المقارنة المعرفية:</span>
                      <p>{theme.keyComparison}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAskAboutReligion(`قدم لي دراسة مقارنة معمقة بين الأديان الكبرى حول مسألة: ${theme.titleAr}`)}
                      className="w-full py-2 rounded-xl bg-neutral-850 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-amber-400" />
                      <span>طرح بحث مقارن حول هذه المسألة</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Cross-faith Common Values */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-amber-950/40 border border-emerald-500/30 space-y-3">
                <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  <span>المشترك الأخلاقي والإنساني الأعظم بين كافة الأديان</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200">
                    <div className="text-lg mb-1">🕊️</div>
                    <span className="font-bold">السلام واللاعنف</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200">
                    <div className="text-lg mb-1">⚖️</div>
                    <span className="font-bold">العدل ونصرة المظلوم</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200">
                    <div className="text-lg mb-1">🤝</div>
                    <span className="font-bold">الصدق والأمانة</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-neutral-200">
                    <div className="text-lg mb-1">🌱</div>
                    <span className="font-bold">حماية الطبيعة والبيئة</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>مصفوفة معرفية متكاملة مدعمة بنظام فحص الحقائق والنزاهة XAI</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
