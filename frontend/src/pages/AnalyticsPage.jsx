import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, MousePointerClick, BarChart3, Globe, Tablet, ShieldAlert, Share2, Check, Copy } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

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
      <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div class="text-center space-y-4">
          <div class="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p class="text-sm text-slate-400">Loading deep analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div class="max-w-md w-full text-center space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <ShieldAlert class="w-14 h-14 text-red-500 mx-auto" />
          <h1 class="text-2xl font-bold text-white">Access Denied</h1>
          <p class="text-slate-400 text-sm">{error}</p>
          <button onClick={() => navigate('/dashboard')} class="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            <ArrowLeft class="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { url, clickHistory, deviceBreakdown, browserBreakdown, locationBreakdown, referrerBreakdown } = data;

  const totalClicks = url.clicks;
  const hasClicks = totalClicks > 0;

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div class="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p class="text-xs font-semibold text-slate-400">{label}</p>
          <p class="text-sm font-extrabold text-indigo-400 mt-1">{`${payload[0].value} Clicks`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Header */}
      <div class="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} class="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <span class="text-slate-500 font-medium">Analytics</span>
        <span class="text-slate-300 font-extrabold">/</span>
        <span class="text-slate-300 font-semibold">{url.shortCode}</span>
      </div>

      {/* URL Banner */}
      <div class="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800/80">
        <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"></div>
        <div class="space-y-2 max-w-xl">
          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold text-white tracking-tight">{url.shortCode}</span>
            <span class="h-4 w-px bg-slate-800"></span>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              Created {new Date(url.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div class="text-xs font-light text-slate-400 truncate max-w-[280px] sm:max-w-none hover:text-slate-300">
            Original: <a href={url.originalUrl} target="_blank" rel="noreferrer" class="underline hover:text-indigo-400">{url.originalUrl}</a>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-200 font-medium break-all select-all flex items-center gap-3">
            {url.shortUrl}
            <button onClick={handleCopy} class="p-1 hover:text-indigo-400 transition-colors" title="Copy URL">
              {copied ? <Check class="w-4 h-4 text-emerald-400" /> : <Share2 class="w-4 h-4" />}
            </button>
          </div>
          <a href={url.shortUrl} target="_blank" rel="noreferrer" class="btn-primary !p-2.5 flex items-center justify-center shrink-0">
            <ExternalLink class="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="glass-card flex items-center gap-5">
          <div class="w-12 h-12 bg-indigo-950/40 border border-indigo-900/30 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <MousePointerClick class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clicks</div>
            <div class="text-3xl font-extrabold text-white tracking-tight mt-1">{totalClicks}</div>
          </div>
        </div>

        <div class="glass-card flex items-center gap-5">
          <div class="w-12 h-12 bg-blue-950/40 border border-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Globe class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Locations Detected</div>
            <div class="text-3xl font-extrabold text-white tracking-tight mt-1">
              {hasClicks ? locationBreakdown.length : 0}
            </div>
          </div>
        </div>

        <div class="glass-card flex items-center gap-5">
          <div class="w-12 h-12 bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Tablet class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Device Breakdowns</div>
            <div class="text-3xl font-extrabold text-white tracking-tight mt-1">
              {hasClicks ? deviceBreakdown.length : 0}
            </div>
          </div>
        </div>
      </div>

      {!hasClicks ? (
        /* Empty State */
        <div class="glass-panel py-24 text-center rounded-3xl border border-slate-800/80">
          <div class="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">📊</div>
          <h3 class="text-lg font-bold text-white mt-5">No Visitor Analytics Yet</h3>
          <p class="text-slate-400 text-sm font-light mt-1.5 max-w-sm mx-auto leading-relaxed">
            Your short link has not been clicked yet. Share your short link to gather deep traffic insights.
          </p>
          <button onClick={handleCopy} class="btn-primary mt-6 !px-5 flex items-center gap-2 mx-auto text-sm font-semibold">
            {copied ? <Check class="w-4 h-4" /> : <Copy class="w-4 h-4" />}
            {copied ? 'Copied to Clipboard' : 'Copy Short Link'}
          </button>
        </div>
      ) : (
        /* Analytical Graphs Grid */
        <div class="space-y-8">
          
          {/* Row 1: Clicks Over Time */}
          <div class="glass-panel p-6 rounded-3xl relative shadow-xl border border-slate-800/80">
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"></div>
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-1.5">
              <BarChart3 class="w-5 h-5 text-indigo-400" />
              Clicks Trend (Last 7 Days)
            </h2>
            <div class="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clickHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Browsers and Devices */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Devices Chart (Pie Chart) */}
            <div class="glass-panel p-6 rounded-3xl relative shadow-xl border border-slate-800/80">
              <h2 class="text-lg font-bold text-white mb-6">Device Breakdown</h2>
              <div class="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} formatter={(value, entry, index) => <span class="text-xs text-slate-300 font-medium pl-1">{value} ({deviceBreakdown[index]?.value})</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browsers Chart (Bar Chart) */}
            <div class="glass-panel p-6 rounded-3xl relative shadow-xl border border-slate-800/80">
              <h2 class="text-lg font-bold text-white mb-6">Browser Breakdown</h2>
              <div class="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                    <Bar dataKey="value" name="Clicks" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                      {browserBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Row 3: Locations and Referrers */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Locations (List Table style) */}
            <div class="glass-panel p-6 rounded-3xl relative shadow-xl border border-slate-800/80">
              <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Globe class="w-5 h-5 text-indigo-400" />
                Top Geolocations
              </h2>
              <div class="space-y-4 max-h-64 overflow-y-auto pr-1">
                {locationBreakdown.map((loc, idx) => {
                  const percentage = Math.round((loc.value / totalClicks) * 100);
                  return (
                    <div key={idx} class="space-y-1.5">
                      <div class="flex justify-between items-center text-xs">
                        <span class="font-semibold text-slate-200">{loc.name}</span>
                        <span class="text-slate-400 font-bold">{loc.value} clicks ({percentage}%)</span>
                      </div>
                      <div class="w-full bg-slate-950 border border-slate-900 rounded-full h-2">
                        <div class="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Referrers (List Table style) */}
            <div class="glass-panel p-6 rounded-3xl relative shadow-xl border border-slate-800/80">
              <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Globe class="w-5 h-5 text-blue-400" />
                Referrer Channels
              </h2>
              <div class="space-y-4 max-h-64 overflow-y-auto pr-1">
                {referrerBreakdown.map((ref, idx) => {
                  const percentage = Math.round((ref.value / totalClicks) * 100);
                  return (
                    <div key={idx} class="space-y-1.5">
                      <div class="flex justify-between items-center text-xs">
                        <span class="font-semibold text-slate-200 truncate max-w-[200px]" title={ref.name}>
                          {ref.name}
                        </span>
                        <span class="text-slate-400 font-bold">{ref.value} clicks ({percentage}%)</span>
                      </div>
                      <div class="w-full bg-slate-950 border border-slate-900 rounded-full h-2">
                        <div class="bg-blue-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
