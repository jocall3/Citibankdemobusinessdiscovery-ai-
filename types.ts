
export type LogLevel = 'i' | 'w' | 'e' | 'd';
export type CircuitState = 'O' | 'C' | 'H'; // Open, Closed, Half-Open

export interface LogEntry {
  timestamp: number;
  type: string;
  data: any;
  level: LogLevel;
}

export interface Answer {
  qk: string; // questionKey
  qt: string; // questionText
  av: string; // answerValue
  pm?: {
    pt?: { name: string };
    usRpPtNm?: string;
  };
  _gm_en?: boolean; // Gemini Enabled
  _gm_ts?: string[]; // Gemini Tags
  _gm_md_ts?: number; // Gemini Modified Timestamp
  _gm_md_dt?: any; // Gemini Modified Data
}

export interface GaLmL {
  gn: (pm: string, c: Record<string, any>) => Promise<string>;
  prDa: (da: Record<string, any>, sc: any, is: string) => Promise<Record<string, any>>;
}

export interface TelemetryService {
  lgEv: (et: string, da: Record<string, any>, lv?: LogLevel) => void;
  rcMt: (mn: string, v: number, ts?: Record<string, string>) => void;
  trOp: <T>(on: string, cb: () => Promise<T>) => Promise<T>;
}
