export interface TradingSignal {
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  rationale: string;
  timestamp: string;
}

export interface MarketData {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface AnalysisResult {
  signals: TradingSignal[];
  marketOverview: string;
  news: {
    title: string;
    impact: 'High' | 'Medium' | 'Low';
    summary: string;
  }[];
}
