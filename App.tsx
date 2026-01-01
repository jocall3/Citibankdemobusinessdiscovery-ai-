
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Fix: Added CTDB_URL to the imports from constants
import { CITI_LOGO, CTDB_NAME, CTDB_URL, AS_OP_MP, OnboardingAnswerKey } from './constants';
import { Answer, LogEntry, LogLevel, CircuitState, GaLmL } from './types';
import { getGeminiService } from './services/geminiService';
import { Type } from '@google/genai';

// --- Shared Internal Services Simulation ---

class CircuitBreaker {
  state: CircuitState = 'C';
  failureCount: number = 0;
  lastFailureTime: number = 0;
  readonly FAILURE_THRESHOLD = 3;
  readonly RESET_TIMEOUT = 15000;

  async execute<T>(name: string, op: () => Promise<T>, onLog: (msg: string, data: any, lv: LogLevel) => void): Promise<T> {
    if (this.state === 'O') {
      if (Date.now() - this.lastFailureTime > this.RESET_TIMEOUT) {
        this.state = 'H';
        onLog("CircuitBreaker.statusChange", { op: name, newState: 'H' }, 'w');
      } else {
        onLog("CircuitBreaker.open", { op: name }, 'e');
        throw new Error(`Circuit is OPEN for ${name}`);
      }
    }

    try {
      const result = await op();
      this.reset();
      return result;
    } catch (error: any) {
      this.recordFailure(name, error, onLog);
      throw error;
    }
  }

  private recordFailure(name: string, error: Error, onLog: (msg: string, data: any, lv: LogLevel) => void) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    onLog("CircuitBreaker.failure", { op: name, count: this.failureCount, error: error.message }, 'e');
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      this.state = 'O';
      onLog("CircuitBreaker.statusChange", { op: name, newState: 'O' }, 'e');
    }
  }

  private reset() {
    this.state = 'C';
    this.failureCount = 0;
  }
}

// --- Components ---

const LogPanel: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto" ref={scrollRef}>
      <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1">
        <span className="text-slate-400 uppercase font-bold tracking-widest">System Telemetry</span>
        <span className="text-slate-500">{logs.length} entries</span>
      </div>
      {logs.map((log, i) => (
        <div key={i} className={`mb-1 ${log.level === 'e' ? 'text-red-400' : log.level === 'w' ? 'text-yellow-400' : ''}`}>
          <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span className="ml-2 font-bold">{log.type}:</span>
          <span className="ml-2 text-slate-300">{JSON.stringify(log.data)}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: any; color?: string }> = ({ label, value, color = "blue" }) => {
  const colorClass = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  }[color] || "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <div className={`p-3 rounded border ${colorClass} flex flex-col items-center justify-center`}>
      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
};

export default function App() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [opCount, setOpCount] = useState(0);
  const [circuitState, setCircuitState] = useState<CircuitState>('C');
  const [summary, setSummary] = useState<string>("");
  const [insights, setInsights] = useState<string[]>([]);
  
  const cbRef = useRef(new CircuitBreaker());
  const aiRef = useRef<GaLmL | null>(null);

  const addLog = useCallback((type: string, data: any, level: LogLevel = 'i') => {
    setLogs(prev => [...prev.slice(-49), { timestamp: Date.now(), type, data, level }]);
  }, []);

  useEffect(() => {
    aiRef.current = getGeminiService();
    addLog("System.init", { name: CTDB_NAME, version: "2.5.0-alpha" });
    setCircuitState(cbRef.current.state);
  }, [addLog]);

  const toggleAnswer = (qk: string, qt: string, av: string) => {
    setAnswers(prev => {
      const exists = prev.find(a => a.qk === qk && a.av === av);
      if (exists) return prev.filter(a => !(a.qk === qk && a.av === av));
      return [...prev, { qk, qt, av }];
    });
  };

  const processAnswers = async () => {
    if (answers.length === 0) return;
    setIsProcessing(true);
    addLog("GmPtMtPr.prPtAs.st", { count: answers.length });

    try {
      const result: Answer[] = await cbRef.current.execute("ProcessPartnerSelection", async () => {
        const ai = aiRef.current!;
        
        // 1. Filter Logic (Simulation of AI Relevance Check)
        const relevanceCheckSchema = {
          type: Type.OBJECT,
          properties: {
            isRelevant: { type: Type.BOOLEAN, description: "Whether selection is strategically sound." },
            riskLevel: { type: Type.STRING, enum: ["low", "med", "high"] }
          },
          required: ["isRelevant", "riskLevel"]
        };

        const processed = await Promise.all(answers.map(async (a) => {
          const aiCheck = await ai.prDa(a, relevanceCheckSchema, "Evaluate business synergy.");
          return {
            ...a,
            _gm_en: true,
            _gm_ts: [aiCheck.riskLevel as string],
            _gm_md_ts: Date.now(),
            _gm_md_dt: aiCheck
          };
        }));

        // 2. Generate Summary
        const summaryText = await ai.gn(
          `Generate a executive summary for the following partner choices: ${JSON.stringify(processed)}`,
          { opCount, ctdbUrl: CTDB_URL }
        );
        setSummary(summaryText);

        // 3. Extract Key Insights
        const insightsSchema = {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of tactical next steps."
        };
        const insightList = await ai.prDa(processed, insightsSchema, "Suggest 3-5 next steps for these integrations.");
        setInsights(Object.values(insightList) as string[]);

        return processed;
      }, addLog);

      setAnswers(result);
      setOpCount(prev => prev + 1);
      addLog("GmPtMtPr.prPtAs.ed", { finalCount: result.length });
    } catch (error: any) {
      addLog("GmPtMtPr.error", { message: error.message }, 'e');
    } finally {
      setCircuitState(cbRef.current.state);
      setIsProcessing(false);
    }
  };

  const resetEngine = () => {
    setAnswers([]);
    setSummary("");
    setInsights([]);
    setOpCount(0);
    addLog("System.reset", { action: "manual_purge" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          {CITI_LOGO}
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-slate-500 font-medium text-sm tracking-tight">Partner Discovery AI Engine</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              {isProcessing ? 'Processing...' : 'Operational'}
            </span>
          </div>
          <button 
            onClick={resetEngine}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Reset Engine
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Selection */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Infrastructure Stack</h2>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(AS_OP_MP).map(([key, options]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{key.replace(/([A-Z])/g, ' $1')}</label>
                  <div className="flex flex-wrap gap-2">
                    {options.map(opt => {
                      const isSelected = answers.some(a => a.qk === key && a.av === opt.v);
                      return (
                        <button
                          key={opt.v}
                          onClick={() => toggleAnswer(key, key, opt.v)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            isSelected 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {opt.v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <button 
                onClick={processAnswers}
                disabled={isProcessing || answers.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all shadow-lg ${
                  isProcessing || answers.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-xl active:scale-95'
                }`}
              >
                {isProcessing ? 'Optimizing Stack...' : 'Execute Match Engine'}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: AI Output and Telemetry */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Ops Count" value={opCount} color="blue" />
            <StatCard label="Selections" value={answers.length} color="green" />
            <StatCard label="Circuit" value={circuitState === 'C' ? 'Closed' : circuitState === 'O' ? 'Open' : 'Half-Open'} color={circuitState === 'C' ? 'green' : 'red'} />
            <StatCard label="Health" value="99.2%" color="orange" />
          </div>

          {/* AI Analysis Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 h-[350px] flex flex-col">
              <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Executive Insight</h2>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div className="p-5 flex-1 overflow-y-auto prose prose-slate prose-sm max-w-none">
                {summary ? (
                  <p className="text-slate-600 italic leading-relaxed">
                    "{summary}"
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2">
                    <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm font-medium">Select partners and execute the engine to generate AI summary.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 h-[350px] flex flex-col">
              <div className="px-4 py-3 border-b border-slate-200">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Strategic Next Steps</h2>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                {insights.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.map((step, idx) => (
                      <li key={idx} className="flex gap-3 items-start group">
                        <span className="flex-none w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{step}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2">
                    <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-sm font-medium text-center">Execute analysis to identify tactical implementation paths.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Telemetry Output */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Engine Diagnostics</h2>
            <LogPanel logs={logs} />
          </section>

          {/* Selected Summary Icons */}
          <section className="bg-slate-800 rounded-xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <svg width="200" height="200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z"/>
               </svg>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Provisioned Ecosystem</h3>
            <div className="flex flex-wrap gap-4 items-center">
              {answers.length > 0 ? (
                answers.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600 group hover:border-blue-500 transition-all">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">{a.qk}</span>
                      <span className="text-sm font-medium">{a.av}</span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-500 text-sm italic">Waiting for architecture definition...</span>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-10 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          <span>&copy; {new Date().getFullYear()} {CTDB_NAME}</span>
          <span className="mx-1">•</span>
          <span className="text-blue-500">{CTDB_URL}</span>
        </div>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
          <a href="#" className="hover:text-blue-600 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
