import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Sliders, 
  Cpu, 
  Flame, 
  Check, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AnomalyDetectionOverview, SystemKPIMetric, PredictiveAnomalyLog } from '../types';

export const PredictiveAnomalyTab: React.FC = () => {
  const [data, setData] = useState<AnomalyDetectionOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [isInjectingTest, setIsInjectingTest] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const fetchAnomalyData = async () => {
    try {
      const res = await fetch('/api/anomaly/overview');
      const json = await res.json();
      if (json.success && json.overview) {
        setData(json.overview);
      }
    } catch (err) {
      console.error("Failed to load anomaly detection data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const handleExecuteRemediation = async (anomalyId: string) => {
    setRemediatingId(anomalyId);
    setNotificationMsg(null);
    try {
      const res = await fetch('/api/anomaly/execute-remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyId })
      });
      const json = await res.json();
      if (json.success) {
        setNotificationMsg(json.message);
        await fetchAnomalyData();
      }
    } catch (err) {
      console.error("Remediation execution error:", err);
    } finally {
      setRemediatingId(null);
    }
  };

  const handleInjectTestAnomaly = async () => {
    setIsInjectingTest(true);
    setNotificationMsg(null);
    try {
      const res = await fetch('/api/anomaly/inject-test-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.success) {
        setNotificationMsg(json.message);
        await fetchAnomalyData();
      }
    } catch (err) {
      console.error("Inject test error:", err);
    } finally {
      setIsInjectingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm font-medium">جاري فحص مؤشرات الأداء الحيوية (KPIs) والتنبؤ بالشذوذ التشغيلي...</p>
      </div>
    );
  }

  const overview = data || {
    systemHealthScore: 98.9,
    activeMonitoredModules: 3140,
    anomalyRiskLevel: "Low",
    kpiMetrics: [],
    activeAnomalies: [],
    resolvedAnomaliesCount: 48,
    automatedRemediationRate: "99.4%"
  };

  const filteredAnomalies = overview.activeAnomalies.filter(anom => {
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'unresolved') return !anom.isResolved;
    if (selectedCategoryFilter === 'resolved') return anom.isResolved;
    return anom.severity === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner / System Health Status */}
      <div className="bg-gradient-to-l from-neutral-900 via-neutral-900/90 to-neutral-950 border border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 border border-amber-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Predictive Anomaly Sentinel 3000-Core</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                صحة النظام {overview.systemHealthScore}%
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-neutral-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>نظام كشف الشذوذ التنبؤي ومراقبة مؤشرات الأداء (Predictive Anomaly Detection)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              رصد مستمر لمؤشرات الأداء الرئيسية (KPIs) عبر كافة الـ <span className="text-amber-400 font-bold font-mono">3,000+ وحدة ووكيل</span>. يتعرف النظام مسبقاً على أي انحرافات تشغيلية محتملة قبل وقوع الأعطال، مع اقتراح وتنفيذ إجراءات وقائية استباقية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="inject-test-anomaly-btn"
              type="button"
              onClick={handleInjectTestAnomaly}
              disabled={isInjectingTest}
              className="bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 border border-neutral-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isInjectingTest ? "جاري المحاكاة..." : "محاكاة شذوذ للاختبار"}</span>
            </button>

            <button
              id="refresh-anomaly-sentinel-btn"
              type="button"
              onClick={fetchAnomalyData}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث الفحص</span>
            </button>
          </div>
        </div>

        {notificationMsg && (
          <div className="mt-4 p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Gauges Grid */}
      <div className="space-y-2.5">
        <h4 className="text-sm font-bold text-neutral-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>مؤشرات الأداء الحيوية (Live System KPIs - 3,000+ Modules)</span>
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            {overview.activeMonitoredModules.toLocaleString()} وحدة تحت المراقبة اللحظية
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {overview.kpiMetrics.map((kpi) => (
            <div 
              key={kpi.id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 space-y-2 hover:border-neutral-700 transition-all"
            >
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span className="truncate">{kpi.nameAr}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  kpi.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-300' :
                  kpi.status === 'elevated' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-rose-500/20 text-rose-300'
                }`}>
                  {kpi.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-neutral-100">
                  {kpi.currentValue}
                  <span className="text-xs text-neutral-400 font-normal mr-1">{kpi.unit}</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  طبيعي: {kpi.normalRange[0]}-{kpi.normalRange[1]}
                </span>
              </div>

              {/* Sparkline Visual Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full ${
                      kpi.status === 'optimal' ? 'bg-emerald-500' :
                      kpi.status === 'elevated' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, ((kpi.currentValue - kpi.normalRange[0]) / (kpi.normalRange[1] - kpi.normalRange[0])) * 100))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9.5px] text-neutral-500">
                  <span>الاتجاه المتوقع:</span>
                  <span className={`font-mono font-bold ${
                    kpi.forecastTrend === 'improving' ? 'text-emerald-400' :
                    kpi.forecastTrend === 'stable' ? 'text-neutral-400' : 'text-amber-400'
                  }`}>
                    {kpi.forecastTrend === 'improving' ? '↑ تحسن مستمر' :
                     kpi.forecastTrend === 'stable' ? '→ مستقر' : '↓ تذبذب محتمل'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Predictive Anomalies & Preventative Actions */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-neutral-200 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>سجل التنبؤ بالشذوذ والإجراءات الوقائية (Predictive Anomalies & Actions)</span>
          </h4>

          {/* Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              الكل ({overview.activeAnomalies.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('unresolved')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedCategoryFilter === 'unresolved'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              تتطلب إجراء ({overview.activeAnomalies.filter(a => !a.isResolved).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('resolved')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedCategoryFilter === 'resolved'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              تمت معالجتها ({overview.activeAnomalies.filter(a => a.isResolved).length})
            </button>
          </div>
        </div>

        {filteredAnomalies.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 text-center text-neutral-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-neutral-200 text-sm">كافة الـ 3000+ وحدة تعمل ضمن المعايير المثالية دون أي شذوذ مرصود.</p>
            <p className="text-xs text-neutral-500">يمكنك الضغط على "محاكاة شذوذ للاختبار" للتحقق من سرعة استجابة المحرك التنبؤي.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnomalies.map((anomaly) => (
              <div 
                key={anomaly.id}
                className={`p-4 rounded-2xl border transition-all ${
                  anomaly.isResolved
                    ? 'bg-neutral-950/70 border-neutral-800/80 opacity-80'
                    : anomaly.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-lg'
                    : 'bg-neutral-900/90 border-amber-500/40 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-neutral-800/80 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                      anomaly.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      anomaly.severity === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {anomaly.severity.toUpperCase()}
                    </span>

                    <span className="font-bold text-neutral-100 text-sm">
                      {anomaly.anomalyTypeAr}
                    </span>

                    <span className="text-xs text-neutral-400 font-mono">
                      (انحراف: {anomaly.deviationPercent}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{anomaly.timeToImpactEstimate}</span>
                    </span>

                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      دقة التنبؤ {anomaly.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-300 mb-3.5">
                  <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-amber-300 block">التأثير المستقبلي المتوقع:</span>
                    <p className="text-neutral-300 text-xs leading-relaxed">{anomaly.predictedImpactAr}</p>
                    <span className="text-[10px] text-neutral-500 block pt-1 font-mono">{anomaly.predictedImpactEn}</span>
                  </div>

                  <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-cyan-300 block">السبب الجذري المرصود:</span>
                    <p className="text-neutral-300 text-xs leading-relaxed">{anomaly.rootCauseAr}</p>
                    <span className="text-[10px] text-neutral-500 block pt-1 font-mono">{anomaly.rootCauseEn}</span>
                  </div>
                </div>

                {/* Preventative Action Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-neutral-200 block">
                        الإجراء الوقائي الموصى به:
                      </span>
                      <span className="text-xs text-neutral-300">{anomaly.suggestedActionAr}</span>
                    </div>
                  </div>

                  <div>
                    {anomaly.isResolved ? (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>تم تنفيذ الإجراء وتأمين الوحدة</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExecuteRemediation(anomaly.id)}
                        disabled={remediatingId === anomaly.id}
                        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
                      >
                        <Zap className={`w-3.5 h-3.5 ${remediatingId === anomaly.id ? 'animate-spin' : ''}`} />
                        <span>{remediatingId === anomaly.id ? "جاري التطبيق..." : "تطبيق الإجراء الوقائي فوراً"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
