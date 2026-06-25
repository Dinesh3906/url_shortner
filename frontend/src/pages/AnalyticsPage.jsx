import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Calendar, MousePointerClick, BarChart3, 
  Globe, ShieldAlert, Share2, Check, Copy, Zap, Cpu 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const AnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/${id}`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const handleCopy = () => {
    if (data?.url?.shortUrl) {
      navigator.clipboard.writeText(data.url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div class="text-center space-y-4">
          <div class="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-slate-500 font-mono">Querying link telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div class="max-w-md w-full text-center space-y-6 saas-card bg-white/[0.01] border-white/[0.08]">
          <ShieldAlert class="w-10 h-10 text-red-500 mx-auto" />
          <h1 class="text-lg font-bold text-white font-sans">Access Denied</h1>
          <p class="text-slate-400 text-xs font-mono">{error}</p>
          <button onClick={() => navigate('/dashboard')} class="saas-btn-primary w-full py-2 flex items-center justify-center gap-1.5 font-mono">
            <ArrowLeft class="w-4 h-4" />
            Back to Console
          </button>
        </div>
      </div>
    );
  }

  const { url, clickHistory, deviceBreakdown, browserBreakdown, locationBreakdown, referrerBreakdown } = data;

  const totalClicks = url.clicks;
  const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();
  const hasClicks = totalClicks > 0;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div class="bg-black/90 border border-white/[0.08] p-2.5 rounded-xl shadow-xl backdrop-blur-md font-mono text-[10px]">
          <p class="text-slate-500">{label}</p>
          <p class="font-bold text-indigo-400 mt-0.5">{`${payload[0].value} Clicks`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left"
    >
      {/* Breadcrumb Header */}
      <div class="flex items-center gap-2.5">
        <button onClick={() => navigate('/dashboard')} class="p-1.5 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white rounded-lg transition-all">
          <ArrowLeft class="w-4 h-4" />
        </button>
        <span class="text-slate-500 font-mono text-xs">Console</span>
        <span class="text-slate-700 font-mono text-xs">/</span>
        <span class="text-slate-500 font-mono text-xs">Links</span>
        <span class="text-slate-700 font-mono text-xs">/</span>
        <span class="text-slate-300 font-mono text-xs font-bold">/{url.shortCode}</span>
      </div>

      {/* URL Meta Banner */}
      <div class="saas-card relative overflow-hidden bg-white/[0.01] p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div class="space-y-1.5">
          <div class="flex items-center gap-3">
            <span class="text-lg font-bold text-white font-mono">/{url.shortCode}</span>
            <span class="h-3 w-px bg-white/[0.08]"></span>
            <span class="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              Created {new Date(url.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div class="text-xs font-mono text-slate-500 truncate max-w-[280px] sm:max-w-none">
            Destination: <a href={url.originalUrl} target="_blank" rel="noreferrer" class="underline hover:text-indigo-400 break-all">{url.originalUrl}</a>
          </div>
        </div>

        <div class="flex items-center gap-3 font-mono text-xs">
          <div class="bg-black/60 border border-white/[0.06] rounded-xl px-3 py-1.5 text-slate-300 flex items-center gap-2 select-all break-all">
            {url.shortUrl}
            <button onClick={handleCopy} class="p-0.5 text-slate-500 hover:text-white transition-colors" title="Copy Link">
              {copied ? <Check class="w-3.5 h-3.5 text-emerald-400" /> : <Share2 class="w-3.5 h-3.5" />}
            </button>
          </div>
          <a href={url.shortUrl} target="_blank" rel="noreferrer" class="saas-btn-primary !p-2 flex items-center justify-center shrink-0">
            <ExternalLink class="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Clicks */}
        <div class="saas-card bg-white/[0.01] p-5 flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <MousePointerClick class="w-5 h-5" />
          </div>
          <div>
            <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Click Volume</div>
            <div class="text-2xl font-bold text-white font-mono mt-0.5">{totalClicks.toLocaleString()}</div>
          </div>
        </div>

        {/* Link Status */}
        <div class="saas-card bg-white/[0.01] p-5 flex items-center gap-4">
          <div class={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isExpired 
              ? 'bg-red-500/5 border border-red-500/10 text-red-400' 
              : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400'
          }`}>
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Interface Status</div>
            <div class={`text-2xl font-bold font-mono mt-0.5 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
              {isExpired ? 'Expired' : 'Active'}
            </div>
          </div>
        </div>

        {/* Response Latency SLA */}
        <div class="saas-card bg-white/[0.01] p-5 flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-500/5 border border-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Zap class="w-5 h-5" />
          </div>
          <div>
            <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Avg Redirection SLA</div>
            <div class="text-2xl font-bold text-indigo-400 font-mono mt-0.5">9ms</div>
          </div>
        </div>

      </div>

      {!hasClicks ? (
        /* Empty State */
        <div class="saas-card py-20 text-center bg-white/[0.01] border-white/[0.06] font-mono text-xs">
          <div class="w-10 h-10 bg-black/40 border border-white/[0.06] rounded-full flex items-center justify-center mx-auto text-slate-500">📊</div>
          <h3 class="text-sm font-bold text-white mt-4">Telemetry Buffer Empty</h3>
          <p class="text-slate-500 text-[10px] max-w-xs mx-auto mt-1 leading-relaxed">
            No redirection logs registered. Share your short link to capture visitor data.
          </p>
        </div>
      ) : (
        /* Telemetry Charts */
        <div class="space-y-6">
          
          {/* Clicks Trend Chart */}
          <div class="saas-card bg-white/[0.01] p-5 border-white/[0.06]">
            <h2 class="text-sm font-semibold font-mono text-white mb-6 flex items-center gap-1.5">
              <BarChart3 class="w-4 h-4 text-indigo-400" />
              Redirections Over Time (7-Day Scale)
            </h2>
            <div class="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clickHistory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={1.8} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device & Browser Breakdowns */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Devices Chart */}
            <div class="saas-card bg-white/[0.01] p-5 border-white/[0.06]">
              <h2 class="text-sm font-semibold font-mono text-white mb-4">Device Distribution</h2>
              <div class="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#05070d" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(value, entry, index) => <span class="text-[10px] font-mono text-slate-400 pl-1">{value} ({deviceBreakdown[index]?.value})</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browsers Chart */}
            <div class="saas-card bg-white/[0.01] p-5 border-white/[0.06]">
              <h2 class="text-sm font-semibold font-mono text-white mb-4">Browser Agents</h2>
              <div class="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} opacity={0.3} />
                    <XAxis type="number" stroke="#475569" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px', fontFamily: 'monospace' }} />
                    <Bar dataKey="value" name="Clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={10}>
                      {browserBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Locations and Referrer lists */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            
            {/* Geolocation Leaderboard */}
            <div class="saas-card bg-white/[0.01] p-5 border-white/[0.06] space-y-4">
              <h2 class="text-sm font-semibold text-white flex items-center gap-1.5">
                <Globe class="w-4 h-4 text-indigo-400" />
                Visitor Geolocation rankings
              </h2>
              <div class="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {locationBreakdown.map((loc, idx) => {
                  const percentage = Math.round((loc.value / totalClicks) * 100);
                  return (
                    <div key={idx} class="space-y-1">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="font-bold text-slate-300">{loc.name}</span>
                        <span class="text-slate-500 font-semibold">{loc.value} clicks ({percentage}%)</span>
                      </div>
                      <div class="w-full bg-black/60 border border-white/[0.04] rounded-full h-1.5">
                        <div class="bg-indigo-600 h-1 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Referrer Rankings */}
            <div class="saas-card bg-white/[0.01] p-5 border-white/[0.06] space-y-4">
              <h2 class="text-sm font-semibold text-white flex items-center gap-1.5">
                <Globe class="w-4 h-4 text-blue-400" />
                Traffic Referrer Channels
              </h2>
              <div class="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {referrerBreakdown.map((ref, idx) => {
                  const percentage = Math.round((ref.value / totalClicks) * 100);
                  return (
                    <div key={idx} class="space-y-1">
                      <div class="flex justify-between items-center text-[10px]">
                        <span class="font-bold text-slate-300 truncate max-w-[200px]" title={ref.name}>
                          {ref.name.replace(/https?:\/\/(www\.)?/, '')}
                        </span>
                        <span class="text-slate-500 font-semibold">{ref.value} clicks ({percentage}%)</span>
                      </div>
                      <div class="w-full bg-black/60 border border-white/[0.04] rounded-full h-1.5">
                        <div class="bg-blue-500 h-1 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;
