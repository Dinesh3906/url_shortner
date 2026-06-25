import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Calendar, MousePointerClick, BarChart3, 
  Globe, ShieldAlert, Share2, Check, Zap, Cpu 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/_/backend/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const COLORS = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#71717a'];

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
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-500 font-mono">Querying link telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 saas-card bg-white border-zinc-200 shadow-xl">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
          <h1 className="text-lg font-bold text-zinc-900 font-sans">Access Denied</h1>
          <p className="text-zinc-600 text-xs font-mono">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="saas-btn-primary w-full py-2 flex items-center justify-center gap-1.5 font-sans">
            <ArrowLeft className="w-4 h-4" />
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
        <div className="bg-white border border-zinc-200 p-2.5 rounded shadow-md font-sans text-[10px]">
          <p className="text-zinc-500">{label}</p>
          <p className="font-bold text-zinc-900 mt-0.5">{`${payload[0].value} Clicks`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left"
    >
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2.5">
        <button onClick={() => navigate('/dashboard')} className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 rounded-lg transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-zinc-500 font-mono text-[11px]">Console</span>
        <span className="text-zinc-300 font-mono text-[11px]">/</span>
        <span className="text-zinc-500 font-mono text-[11px]">Links</span>
        <span className="text-zinc-300 font-mono text-[11px]">/</span>
        <span className="text-zinc-800 font-mono text-[11px] font-bold">/{url.shortCode}</span>
      </div>

      {/* URL Meta Banner */}
      <div className="saas-card bg-white border-zinc-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-zinc-900 font-mono">/{url.shortCode}</span>
            <span className="h-3 w-px bg-zinc-200"></span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {new Date(url.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-xs font-mono text-zinc-600 truncate max-w-[280px] sm:max-w-none">
            Destination: <a href={url.originalUrl} target="_blank" rel="noreferrer" className="underline hover:text-[#4f46e5] break-all">{url.originalUrl}</a>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-zinc-800 flex items-center gap-2 select-all break-all">
            {url.shortUrl}
            <button onClick={handleCopy} className="p-0.5 text-zinc-400 hover:text-zinc-850 transition-colors" title="Copy Link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          <a href={url.shortUrl} target="_blank" rel="noreferrer" className="saas-btn-primary p-2! flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Clicks */}
        <div className="saas-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded flex items-center justify-center shrink-0">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Click Volume</div>
            <div className="text-2xl font-bold text-zinc-900 font-mono mt-0.5">{totalClicks.toLocaleString()}</div>
          </div>
        </div>

        {/* Link Status */}
        <div className="saas-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Interface Status</div>
            <div className={`text-2xl font-bold font-mono mt-0.5 ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isExpired ? 'Expired' : 'Active'}
            </div>
          </div>
        </div>

        {/* Response Latency SLA */}
        <div className="saas-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Avg Redirection SLA</div>
            <div className="text-2xl font-bold text-zinc-900 font-mono mt-0.5">9ms</div>
          </div>
        </div>

      </div>

      {!hasClicks ? (
        /* Empty State */
        <div className="saas-card py-20 text-center font-mono text-xs">
          <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-center mx-auto text-zinc-400 mb-4">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">Telemetry Buffer Empty</h3>
          <p className="text-zinc-550 text-[10px] max-w-xs mx-auto mt-1 leading-relaxed">
            No redirection logs registered. Share your short link to capture visitor data.
          </p>
        </div>
      ) : (
        /* Telemetry Charts */
        <div className="space-y-6">
          
          {/* Clicks Trend Chart */}
          <div className="saas-card p-5">
            <h2 className="text-sm font-semibold font-mono text-zinc-900 mb-6 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-zinc-500" />
              Redirections Over Time (7-Day Scale)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clickHistory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} opacity={0.5} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={1.8} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device & Browser Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Devices Chart */}
            <div className="saas-card p-5">
              <h2 className="text-sm font-semibold font-mono text-zinc-900 mb-4">Device Distribution</h2>
              <div className="h-56 flex items-center justify-center">
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#000' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(value, entry, index) => <span className="text-[10px] font-mono text-zinc-550 pl-1">{value} ({deviceBreakdown[index]?.value})</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browsers Chart */}
            <div className="saas-card p-5">
              <h2 className="text-sm font-semibold font-mono text-zinc-900 mb-4">Browser Agents</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={true} vertical={false} opacity={0.5} />
                    <XAxis type="number" stroke="#888888" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={9} fontClassName="font-mono" tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }} />
                    <Bar dataKey="value" name="Clicks" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={10}>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
            
            {/* Geolocation Leaderboard */}
            <div className="saas-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-zinc-500" />
                Visitor Geolocation rankings
              </h2>
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1 font-mono">
                {locationBreakdown.map((loc, idx) => {
                  const percentage = Math.round((loc.value / totalClicks) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-zinc-700">{loc.name}</span>
                        <span className="text-zinc-550 font-semibold">{loc.value} clicks ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 border border-zinc-200 rounded-full h-1.5">
                        <div className="bg-[#4f46e5] h-1 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Referrer Rankings */}
            <div className="saas-card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-zinc-500" />
                Traffic Referrer Channels
              </h2>
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1 font-mono">
                {referrerBreakdown.map((ref, idx) => {
                  const percentage = Math.round((ref.value / totalClicks) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-zinc-700 truncate max-w-[200px]" title={ref.name}>
                          {ref.name.replace(/https?:\/\/(www\.)?/, '')}
                        </span>
                        <span className="text-zinc-550 font-semibold">{ref.value} clicks ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 border border-zinc-200 rounded-full h-1.5">
                        <div className="bg-[#4f46e5] h-1 rounded-full" style={{ width: `${percentage}%` }}></div>
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
