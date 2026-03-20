import { useEffect, useState, useRef, useCallback } from "react";

const LW_CDN='https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js';
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`)){res();return;}const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}

const AI_CONFIG={
  anthropic:{url:'https://api.anthropic.com/v1/messages',model:'claude-sonnet-4-20250514',key:null,label:'Claude Sonnet 4',color:'#f5a623'},
  groq:{url:'https://api.groq.com/openai/v1/chat/completions',model:'llama-3.3-70b-versatile',key:'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',label:'Groq Llama 3.3',color:'#f55036'},
};
const VALLEY_KEY='live_264966be983d94d76527a76199bf85182a69e3b19a918159';

const VALLEY_BASE='https://api.valleyafrica.com/v1';
const COINGECKO='https://api.coingecko.com/api/v3';
const FOREX_API='https://api.frankfurter.app/latest?from=USD&to=GHS,NGN,ZAR,KES,EGP,XOF,EUR,GBP';
const FEAR_API='https://api.alternative.me/fng/?limit=1';

const EXCHANGES={
  GSE:{name:'Ghana Stock Exchange',country:'Ghana',currency:'GHS',flag:'GH',color:'#f5a623'},
  NGX:{name:'Nigerian Exchange Group',country:'Nigeria',currency:'NGN',flag:'NG',color:'#00c853'},
  JSE:{name:'Johannesburg Stock Exch.',country:'South Africa',currency:'ZAR',flag:'ZA',color:'#0ea5e9'},
  NSE:{name:'Nairobi Securities Exch.',country:'Kenya',currency:'KES',flag:'KE',color:'#ff6d00'},
  EGX:{name:'Egyptian Exchange',country:'Egypt',currency:'EGP',flag:'EG',color:'#e53935'},
  BRVM:{name:'Bourse Regionale',country:'W. Africa',currency:'XOF',flag:'WA',color:'#a855f7'},
};

const GSE_SEED={MTNGH:1.86,GCB:6.22,NEWGOLD:195.8,CAL:0.91,EGL:3.45,GOIL:2.10,TOTAL:8.75,GGBL:3.92,UNIL:12.40,BOPP:5.80,ETI:0.18,FML:4.80,MECH:2.40};
const ALL_STOCKS={
  GSE:[{t:'MTNGH',n:'MTN Ghana',s:'Telecom',mc:18500},{t:'GCB',n:'GCB Bank',s:'Banking',mc:7440},{t:'NEWGOLD',n:'NewGold ETF',s:'ETF',mc:9780},{t:'GOIL',n:'GOIL Co.',s:'Energy',mc:1260},{t:'TOTAL',n:'TotalEnergies GH',s:'Energy',mc:2625},{t:'GGBL',n:'Guinness GH',s:'Consumer',mc:1176},{t:'UNIL',n:'Unilever GH',s:'Consumer',mc:2232},{t:'CAL',n:'CAL Bank',s:'Banking',mc:546},{t:'EGL',n:'Enterprise Grp',s:'Insurance',mc:1380},{t:'BOPP',n:'Benso Oil Palm',s:'Agric',mc:1044},{t:'FML',n:'Fan Milk',s:'Consumer',mc:720},{t:'MECH',n:'Mechanical Lloyd',s:'Auto',mc:280}].map(s=>({...s,p:GSE_SEED[s.t]||1,pc:GSE_SEED[s.t]||1,v:Math.floor(Math.random()*1500000+100000),ex:'GSE'})),
  NGX:[{t:'DANGCEM',n:'Dangote Cement',s:'Industry',mc:8260000,p:485,pc:470,v:3200000,ex:'NGX'},{t:'MTNN',n:'MTN Nigeria',s:'Telecom',mc:4028000,p:198.5,pc:195,v:8500000,ex:'NGX'},{t:'ZENITHB',n:'Zenith Bank',s:'Banking',mc:1340000,p:42.5,pc:41.8,v:25000000,ex:'NGX'},{t:'GTCO',n:'GTCo Holdings',s:'Banking',mc:1730000,p:58.9,pc:57.2,v:18000000,ex:'NGX'},{t:'SEPLAT',n:'Seplat Energy',s:'Energy',mc:1900000,p:3200,pc:3150,v:450000,ex:'NGX'}],
  JSE:[{t:'NPN',n:'Naspers',s:'Tech',mc:1450000,p:3420,pc:3380,v:1200000,ex:'JSE'},{t:'BHP',n:'BHP Group',s:'Mining',mc:1180000,p:580,pc:572,v:2800000,ex:'JSE'},{t:'GFI',n:'Gold Fields',s:'Mining',mc:188000,p:264,pc:258,v:3600000,ex:'JSE'},{t:'MTN',n:'MTN Group',s:'Telecom',mc:178000,p:98.5,pc:96.8,v:11000000,ex:'JSE'},{t:'SBK',n:'Standard Bank',s:'Banking',mc:385000,p:242,pc:238,v:3800000,ex:'JSE'}],
  NSE:[{t:'SAFCOM',n:'Safaricom',s:'Telecom',mc:740000,p:18.5,pc:18.1,v:32000000,ex:'NSE'},{t:'EQTY',n:'Equity Group',s:'Banking',mc:198000,p:52,pc:50.5,v:8200000,ex:'NSE'},{t:'KCB',n:'KCB Group',s:'Banking',mc:136000,p:42.5,pc:41.75,v:6100000,ex:'NSE'}],
  EGX:[{t:'COMI',n:'CIB Egypt',s:'Banking',mc:54000,p:72.5,pc:70.8,v:12000000,ex:'EGX'},{t:'EGTS',n:'Egyptian Telecom',s:'Telecom',mc:82000,p:38.9,pc:38,v:5600000,ex:'EGX'}],
  BRVM:[{t:'ONTBV',n:'Orange CI',s:'Telecom',mc:750000,p:12500,pc:12200,v:45000,ex:'BRVM'},{t:'ETIASA',n:'Ecobank CI',s:'Banking',mc:440000,p:8800,pc:8600,v:32000,ex:'BRVM'}],
};

const POLITICAL_RISK={
  GH:{country:'Ghana',leader:'John Mahama',party:'NDC',approvalPct:58,riskLevel:'MEDIUM',notes:'IMF program ongoing.',exchangeImpact:'GSE'},
  NG:{country:'Nigeria',leader:'Bola Tinubu',party:'APC',approvalPct:34,riskLevel:'HIGH',notes:'FX unification. Low approval.',exchangeImpact:'NGX'},
  ZA:{country:'South Africa',leader:'Cyril Ramaphosa',party:'ANC/GNU',approvalPct:42,riskLevel:'MEDIUM',notes:'GNU coalition. Load shedding.',exchangeImpact:'JSE'},
  KE:{country:'Kenya',leader:'William Ruto',party:'UDA',approvalPct:29,riskLevel:'HIGH',notes:'IMF reforms. Low approval.',exchangeImpact:'NSE'},
  EG:{country:'Egypt',leader:'Abdel el-Sisi',party:'Independent',approvalPct:65,riskLevel:'MEDIUM',notes:'IMF tranche approved.',exchangeImpact:'EGX'},
  CI:{country:"Cote d'Ivoire",leader:'Alassane Ouattara',party:'RHDP',approvalPct:55,riskLevel:'LOW',notes:'Most stable BRVM anchor.',exchangeImpact:'BRVM'},
};

const SUPPLY_CHAIN={
  MTNGH:{parent:'MTN Group (JSE)',risks:['ECG Load Shedding - HIGH','Huawei US sanctions - HIGH','NCA regulatory action - MEDIUM'],ecgDep:true},
  GGBL:{parent:'Castel/Diageo (France)',risks:['Suez Canal disruption - HIGH','ECG load shedding - HIGH','Cedi devaluation - MEDIUM'],ecgDep:true},
  FML:{parent:'Danone S.A. (Paris)',risks:['ECG load shedding - CRITICAL','Milk powder imports - HIGH','Cedi devaluation - HIGH'],ecgDep:true},
  UNIL:{parent:'Unilever PLC (London)',risks:['Indonesia palm oil ban - HIGH','Suez disruption - HIGH','ECG shedding - MEDIUM'],ecgDep:true},
  GOIL:{parent:'Govt of Ghana/SSNIT',risks:['Oil price spike - HIGH','Cedi devaluation - CRITICAL','Port congestion - HIGH'],ecgDep:false},
  GCB:{parent:'Govt of Ghana/SSNIT',risks:['IMF debt restructuring - HIGH','Cedi devaluation - MEDIUM'],ecgDep:false},
  NEWGOLD:{parent:'World Gold Council',risks:['Gold price volatility - MEDIUM','USD/GHS rate - HIGH'],ecgDep:false},
};

const RISK_EVENTS=[
  {id:1,title:'ECG load shedding - Accra & Kumasi',type:'ECG Load Shedding',severity:'HIGH',source:'ECG',region:'Ghana',time:'2h ago',desc:'Extended dumsor affecting FML, MTNGH, GGBL operations.'},
  {id:2,title:'Cedi weakening - USD/GHS above 15',type:'Cedi Devaluation',severity:'HIGH',source:'BoG',region:'Ghana',time:'4h ago',desc:'GHS under pressure. Import costs rising for consumer stocks.'},
  {id:3,title:'IMF review - Ghana Article IV',type:'IMF Review',severity:'MEDIUM',source:'IMF',region:'Ghana',time:'1d ago',desc:'Quarterly review upcoming. Positive signals from BoG.'},
  {id:4,title:'Bitcoin volatility - 5% swing',type:'Crypto Volatility',severity:'MEDIUM',source:'CoinGecko',region:'Global',time:'30m ago',desc:'BTC showing high volatility. Fear & Greed at extreme fear.'},
  {id:5,title:'Gold price surge - $3,000/oz',type:'Gold Price Surge',severity:'LOW',source:'Bloomberg',region:'Global',time:'6h ago',desc:'Gold above $3000. NEWGOLD ETF likely to benefit.'},
];

async function callAI(messages, systemPrompt, maxTokens=600, stream=false){
  for(const [provider,cfg] of Object.entries(AI_CONFIG)){
    if(provider==='anthropic'&&!cfg.key) continue;
    try{
      let res, text='';
      if(provider==='anthropic'){
        res=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json','x-api-key':cfg.key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:cfg.model,max_tokens:maxTokens,system:systemPrompt,messages})});
        const d=await res.json(); text=d.content?.[0]?.text||'No response';
      } else {
        res=await fetch(cfg.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${cfg.key}`},body:JSON.stringify({model:cfg.model,max_tokens:maxTokens,messages:[{role:'system',content:systemPrompt},...messages]})});
        const d=await res.json(); text=d.choices?.[0]?.message?.content||'No response';
      }
      return {text,provider,label:cfg.label,color:cfg.color};
    }catch(e){continue;}
  }
  return {text:'AI unavailable. Check connection.',provider:'none',label:'Offline',color:'#4a6a88'};
}

function generateOHLC(seed,days=60){
  const data=[];let p=seed;
  for(let i=days;i>=0;i--){
    const t=Math.floor((Date.now()-i*86400000)/1000);
    const o=p,h=p*(1+Math.random()*0.03),l=p*(1-Math.random()*0.03),c=l+(h-l)*Math.random();
    data.push({time:t,open:+o.toFixed(4),high:+h.toFixed(4),low:+l.toFixed(4),close:+c.toFixed(4)});
    p=c;
  }
  return data;
}

function generateSignal(closes){
  if(!closes||closes.length<35) return null;
  const rsi=(()=>{const p=14;let g=0,l=0;for(let i=1;i<=p;i++){const d=closes[i]-closes[i-1];d>0?g+=d:l-=d;}let ag=g/p,al=l/p;for(let i=p+1;i<closes.length;i++){const d=closes[i]-closes[i-1];ag=(ag*(p-1)+(d>0?d:0))/p;al=(al*(p-1)+(d<0?-d:0))/p;}return al===0?100:+(100-100/(1+ag/al)).toFixed(2);})();
  const ema=(arr,n)=>{if(arr.length<n)return[];const k=2/(n+1);let r=[arr.slice(0,n).reduce((a,b)=>a+b,0)/n];for(let i=n;i<arr.length;i++)r.push(arr[i]*k+r[r.length-1]*(1-k));return r;};
  const e9=ema(closes,9),e21=ema(closes,21);
  const macdLine=ema(closes,12).map((v,i)=>v-(ema(closes,26)[i]||v)).filter(Boolean);
  const hist=macdLine.length>9?macdLine[macdLine.length-1]-(ema(macdLine,9)[ema(macdLine,9).length-1]||0):0;
  const sl=closes.slice(-20),mid=sl.reduce((a,b)=>a+b,0)/20,std=Math.sqrt(sl.reduce((a,b)=>a+(b-mid)**2,0)/20);
  const pctB=(closes[closes.length-1]-mid+2*std)/(4*std);
  let buy=0,sell=0,reasons=[];
  if(rsi<30){buy+=35;reasons.push('RSI oversold');}else if(rsi>70){sell+=35;reasons.push('RSI overbought');}
  if(hist>0){buy+=25;reasons.push('MACD bullish');}else{sell+=25;reasons.push('MACD bearish');}
  if(pctB<0.1){buy+=20;reasons.push('Lower BB bounce');}else if(pctB>0.9){sell+=20;reasons.push('Upper BB rejection');}
  if(e9.length&&e21.length&&e9[e9.length-1]>e21[e21.length-1]){buy+=20;reasons.push('EMA bullish');}else{sell+=20;reasons.push('EMA bearish');}
  const conf=Math.max(buy,sell);
  const signal=buy>sell&&buy>=40?'BUY':sell>buy&&sell>=40?'SELL':'HOLD';
  return {signal,confidence:conf,rsi,macd:+hist.toFixed(4),pctB:+pctB.toFixed(3),reasons:reasons.slice(0,3),sl:+(closes[closes.length-1]*0.97).toFixed(4),tp:+(closes[closes.length-1]*1.04).toFixed(4)};
}

export default function App(){
  const [page,setPage]=useState('dashboard');
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [activeEx,setActiveEx]=useState('GSE');
  const [stocks,setStocks]=useState(ALL_STOCKS);
  const [selStock,setSelStock]=useState(ALL_STOCKS.GSE[0]);
  const [forex,setForex]=useState({GHS:15.27,NGN:1580,ZAR:18.4,KES:129,EGP:48.5,XOF:610,EUR:0.92,GBP:0.79});
  const [crypto,setCrypto]=useState({});
  const [fearGreed,setFearGreed]=useState({value:42,label:'Fear'});
  const [botSig,setBotSig]=useState(null);
  const [botCoin,setBotCoin]=useState('bitcoin');
  const [botRunning,setBotRunning]=useState(false);
  const [botLog,setBotLog]=useState([]);
  const [msgs,setMsgs]=useState([{role:'assistant',content:"ACCRA TERMINAL V16 online - Africa's #1 Financial Intelligence Platform.\n\nCovering 6 exchanges, 85+ stocks, Real-time crypto, Political risk, Supply chain intelligence\n\nAsk me about any African market, stock analysis, or trading signal.",provider:'anthropic',label:'Claude Sonnet 4',color:'#f5a623'}]);
  const [chatInput,setChatInput]=useState('');
  const [chatLoading,setChatLoading]=useState(false);
  const [dismissedRisks,setDismissedRisks]=useState(new Set());
  const [sortK,setSortK]=useState('mc');
  const [sortD,setSortD]=useState(-1);
  const [searchQ,setSearchQ]=useState('');
  const [cmdSearch,setCmdSearch]=useState('');
  const [showCmd,setShowCmd]=useState(false);
  const [freedom,setFreedom]=useState({terminal:0,crypto:0,gse:0,hydro:0,btcstack:0});
  const [botStatus,setBotStatus]=useState(null);
  const [botStrategy,setBotStrategy]=useState({mode:'balanced',min_confidence:35,max_open_trades:5,crypto_enabled:true,stocks_enabled:true,hfm_enabled:true,avoid_assets:[],prefer_assets:[],market_condition:'neutral'});
  const [botConnected,setBotConnected]=useState(false);
  const [realBal,setRealBal]=useState(null);
  const [realBalLoading,setRealBalLoading]=useState(false);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiRec,setAiRec]=useState('');
  const [pendingStrategy,setPendingStrategy]=useState(null);
  const [approving,setApproving]=useState(false);
  const [portfolio]=useState([{sym:'BTC',qty:0.012,avg:62000,color:'#f7931a'},{sym:'SOL',qty:2.5,avg:140,color:'#9945ff'},{sym:'MTNGH',qty:1200,avg:1.72,color:'#f5a623'},{sym:'GCB',qty:500,avg:5.80,color:'#00c853'}]);
  const chatEndRef=useRef(null);
  const botRef=useRef(null);
  const cmdRef=useRef(null);

function TradingChart({data,color='#f5a623'}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current||!data?.length) return;
    let chart;
    loadScript(LW_CDN).then(()=>{
      if(!window.LightweightCharts||!ref.current) return;
      ref.current.innerHTML='';
      chart=window.LightweightCharts.createChart(ref.current,{
        width:ref.current.offsetWidth,height:160,
        layout:{background:{color:'transparent'},textColor:'#5a6a7a'},
        grid:{vertLines:{color:'#1e2d47'},horzLines:{color:'#1e2d47'}},
        crosshair:{mode:1},
        rightPriceScale:{borderColor:'#1e2d47'},
        timeScale:{borderColor:'#1e2d47',timeVisible:false},
      });
      const series=chart.addCandlestickSeries({
        upColor:color,downColor:'#ff1744',borderUpColor:color,borderDownColor:'#ff1744',
        wickUpColor:color,wickDownColor:'#ff1744',
      });
      series.setData(data);
      chart.timeScale().fitContent();
      const ro=new ResizeObserver(()=>{if(ref.current)chart.applyOptions({width:ref.current.offsetWidth});});
      ro.observe(ref.current);
      return()=>{ro.disconnect();try{chart.remove();}catch{}};
    });
    return()=>{try{if(chart)chart.remove();}catch{}};
  },[data,color]);
  return <div ref={ref} style={{width:'100%',height:160,borderRadius:4,overflow:'hidden'}}/>;
}
  // Intelligence bridge - pushes world context to bot every 5 minutes
  useEffect(() => {
    const G = '4f5f6918288ddaec0a1fc998af3e6f99';
    const TK = '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';
    const push = async () => {
      try {
        const b = crypto?.bitcoin?.usd_24h_change || 0;
        const f = fearGreed?.value || 50;
        const g = Math.min(100,
          RISK_EVENTS.filter(e => !dismissedRisks.has(e.id) && e.severity === 'HIGH').length * 15 +
          RISK_EVENTS.filter(e => !dismissedRisks.has(e.id) && e.severity === 'CRITICAL').length * 25 +
          (forex?.GHS > 16 ? 10 : forex?.GHS > 15 ? 5 : 0) +
          (f < 20 ? 5 : f > 80 ? 8 : 0));
        const payload = {
          timestamp: new Date().toISOString(),
          source: 'accra_terminal_v16',
          global_risk_score: g,
          risk_level: g > 70 ? 'CRITICAL' : g > 45 ? 'HIGH' : g > 25 ? 'MEDIUM' : 'LOW',
          crypto: {
            btc_price: crypto?.bitcoin?.usd || 0,
            btc_24h_change: b,
            btc_trend: b > 4 ? 'STRONG_UP' : b > 1.5 ? 'UP' : b < -4 ? 'STRONG_DOWN' : b < -1.5 ? 'DOWN' : 'NEUTRAL',
            eth_price: crypto?.ethereum?.usd || 0,
            sol_price: crypto?.solana?.usd || 0,
            fear_greed: f,
            fear_greed_label: fearGreed?.label || 'Neutral',
          },
          fx_stress: {
            GHS: { rate: forex?.GHS, trend: forex?.GHS > 16 ? 'CRISIS' : forex?.GHS > 15.5 ? 'WEAK' : 'STABLE' },
            NGN: { rate: forex?.NGN, trend: forex?.NGN > 1700 ? 'CRISIS' : forex?.NGN > 1600 ? 'WEAK' : 'STABLE' },
            ZAR: { rate: forex?.ZAR, trend: forex?.ZAR > 20 ? 'CRISIS' : forex?.ZAR > 19 ? 'WEAK' : 'STABLE' },
          },
          active_risks: RISK_EVENTS.filter(e => !dismissedRisks.has(e.id)).map(e => ({
            title: e.title, severity: e.severity,
            score: e.severity === 'CRITICAL' ? 25 : e.severity === 'HIGH' ? 15 : 8,
            affects_crypto: ['war','conflict','sanction','fed','inflation','fomc'].some(k => e.title.toLowerCase().includes(k)),
            affects_gold: ['gold','inflation','war','conflict','fed'].some(k => e.title.toLowerCase().includes(k)),
            affects_oil: ['oil','opec','iran','gulf','crude'].some(k => e.title.toLowerCase().includes(k)),
            affects_african_stocks: ['ecg','cedi','naira','imf','ghana','nigeria'].some(k => e.title.toLowerCase().includes(k)),
          })),
          recommendations: [
            ...(g > 65 ? [{ action: 'REDUCE_EXPOSURE', priority: 'HIGH' }] : []),
            ...(f <= 20 ? [{ action: 'ACCUMULATE_BTC', priority: 'HIGH' }] : []),
            ...(f >= 85 ? [{ action: 'TAKE_PROFITS', priority: 'HIGH' }] : []),
            ...(forex?.GHS > 16 ? [{ action: 'FAVOR_HARD_ASSETS', priority: 'HIGH' }] : []),
          ],
          quick_signals: {
            mode_suggestion: g > 65 ? 'conservative' : g > 35 ? 'balanced' : 'aggressive',
            btc_favorable: f < 45 && b > -6,
          },
        };
        await fetch('https://api.github.com/gists/' + G, {
          method: 'PATCH',
          headers: { 'Authorization': 'Bearer ' + TK, 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: { 'terminal_intelligence.json': { content: JSON.stringify(payload) } } }),
        });
      } catch(e) { console.warn('[INTEL]', e.message); }
    };
    push();
    const t = setInterval(push, 300000);
    return () => clearInterval(t);
  }, [fearGreed, crypto, forex, dismissedRisks]); // eslint-disable-line react-hooks/exhaustive-deps


