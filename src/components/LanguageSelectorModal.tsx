import React, { useState, useMemo } from 'react';
import { Globe, Search, Check, X, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../i18n';
import { LanguageCode, LanguageOption } from '../types';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = getTranslation(currentLanguage);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(lang => 
      lang.nativeName.toLowerCase().includes(q) ||
      lang.englishName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q) ||
      lang.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-neutral-100 max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>{t.langModalTitle}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                  20 Languages
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {t.langModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchLangPlaceholder}
            className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Languages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-neutral-700">
          {filteredLanguages.map((lang: LanguageOption) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-800/50 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl select-none shrink-0" role="img" aria-label={lang.englishName}>
                    {lang.flag}
                  </span>
                  <div className="truncate">
                    <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 truncate">
                      {lang.englishName} • <span className="text-[11px] text-neutral-500">{lang.region}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-neutral-900 border border-neutral-800 text-neutral-400">
                    {lang.dir.toUpperCase()}
                  </span>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-neutral-800 flex items-center justify-center opacity-40">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-400 space-y-2">
              <Globe className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
              <p className="text-sm">لم يتم العثور على لغة مطابقة لبحثك</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-400 hover:underline"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.allLanguagesCount}</span>
          </div>
          <span className="font-mono text-[11px] text-neutral-500">
            WESAM AI i18n v4.2
          </span>
        </div>
      </div>
    </div>
  );
};
