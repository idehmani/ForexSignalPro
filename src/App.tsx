import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Globe, 
  BarChart3,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getForexAnalysis } from './lib/gemini';
import { TradingSignal, MarketData, AnalysisResult } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Mock data for initial state
const INITIAL_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'XAU/USD', 'BTC/USD', 'US30', 'NAS100'];

const MOCK_CHART_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  value: 1.08 + Math.random() * 0.02
}));

export default function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [marketData, setMarketData] = useState<MarketData[]>(
    INITIAL_PAIRS.map(pair => {
      let price = 1.08;
      if (pair === 'USD/JPY') price = 150.0;
      if (pair === 'XAU/USD') price = 2300.0;
      if (pair === 'BTC/USD') price = 65000.0;
      if (pair === 'US30') price = 39000.0;
      if (pair === 'NAS100') price = 18000.0;
      
      return {
        pair,
        price: price + (Math.random() - 0.5) * (price * 0.01),
        change: (Math.random() - 0.5) * 0.01,
        changePercent: (Math.random() - 0.5) * 1
      };
    })
  );

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const result = await getForexAnalysis(INITIAL_PAIRS);
      setAnalysis(result);
      // Update market data with some randomness based on signals
      setMarketData(prev => prev.map(m => {
        const signal = result.signals.find(s => s.pair === m.pair);
        if (signal) {
          return { ...m, price: signal.entry };
        }
        return m;
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const currentSignal = analysis?.signals.find(s => s.pair === selectedPair);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <TrendingUp className="text-black w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">ForexSignal<span className="text-emerald-500">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MARCHÉ OUVERT
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAnalysis} 
              disabled={loading}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2 transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Analyse...' : 'Actualiser'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Market Watch */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white/5 border-white/10 overflow-hidden backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Market Watch</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                {marketData.map((data) => (
                  <button
                    key={data.pair}
                    onClick={() => setSelectedPair(data.pair)}
                    className={`w-full flex items-center justify-between p-4 transition-all hover:bg-white/5 border-l-2 ${
                      selectedPair === data.pair ? 'bg-emerald-500/10 border-emerald-500' : 'border-transparent'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-white">{data.pair}</div>
                      <div className="text-xs text-slate-500">Forex • Spot</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{data.price.toFixed(5)}</div>
                      <div className={`text-xs font-medium ${data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.change >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Center: Chart & Signal */}
        <div className="lg:col-span-6 space-y-6">
          {/* Chart Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-2xl font-bold text-white">{selectedPair}</CardTitle>
                <CardDescription className="text-slate-400">Temps réel • 1H</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300">H1</Badge>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300">D1</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#475569" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => val.toFixed(4)}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Signal Card */}
          <AnimatePresence mode="wait">
            {currentSignal ? (
              <motion.div
                key={currentSignal.pair}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`border-2 ${currentSignal.type === 'BUY' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'} backdrop-blur-md`}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${currentSignal.type === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                        {currentSignal.type === 'BUY' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white">Signal {currentSignal.type}</CardTitle>
                        <CardDescription className="text-slate-400">Confiance: {currentSignal.confidence}%</CardDescription>
                      </div>
                    </div>
                    <Badge className={currentSignal.type === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}>
                      ACTIF
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Entrée</div>
                        <div className="text-xl font-mono text-white font-bold">{currentSignal.entry.toFixed(5)}</div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Stop Loss</div>
                        <div className="text-xl font-mono text-rose-400 font-bold">{currentSignal.stopLoss.toFixed(5)}</div>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Take Profit</div>
                        <div className="text-xl font-mono text-emerald-400 font-bold">{currentSignal.takeProfit.toFixed(5)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-slate-300">
                        <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="leading-relaxed"><span className="font-bold text-white">Justification:</span> {currentSignal.rationale}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Généré le {new Date(currentSignal.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-white/5 border-white/10 border-dashed py-12 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-12 h-12 text-slate-700 mb-4" />
                <CardTitle className="text-slate-400">Aucun signal actif pour {selectedPair}</CardTitle>
                <CardDescription className="mt-2">Cliquez sur actualiser pour lancer une nouvelle analyse IA.</CardDescription>
              </Card>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Market Insights */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Aperçu du Marché
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {analysis?.marketOverview || "Analyse globale en cours..."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Actualités Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-white/5">
                  {analysis?.news.map((item, idx) => (
                    <div key={idx} className="p-4 space-y-2 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <Badge className={
                          item.impact === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          item.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }>
                          {item.impact} Impact
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.summary}</p>
                    </div>
                  )) || (
                    <div className="p-8 text-center text-slate-600 text-sm">
                      Recherche d'actualités...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12 py-8 bg-black/40">
        <div className="max-w-[1600px] mx-auto px-6 text-center space-y-4">
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            AVERTISSEMENT: Le trading sur le Forex comporte des risques importants. Les signaux fournis par cette IA sont à titre informatif uniquement et ne constituent pas des conseils financiers. Ne tradez jamais de l'argent que vous ne pouvez pas vous permettre de perdre.
          </p>
          <div className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
            © 2026 FOREX SIGNAL PRO • POWERED BY GEMINI AI
          </div>
        </div>
      </footer>
    </div>
  );
}
