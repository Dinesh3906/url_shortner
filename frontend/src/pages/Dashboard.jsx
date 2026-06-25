import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Link2, Copy, Check, Trash2, BarChart2, Plus, Calendar, ExternalLink, 
  AlertCircle, Search, LayoutGrid, Terminal, Key, Settings, Menu, X, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard URL creation state
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('links'); // 'overview' | 'links' | 'api' | 'settings'
  
  // UI helpers
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Developer API Keys Tab state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Prod API Key', token: 'sl_live_7a3d9...f4b2', created: '2026-06-01' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);

  // Fetch user links
  const fetchUrls = async () => {
    try {
      const response = await axios.get(`${API_URL}/url/my-urls`);
      if (response.data.success) {
        setUrls(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch your URLs. Please refresh or try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  // Handle URL creation
  const handleShorten = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(false);

    try {
      const response = await axios.post(`${API_URL}/url/shorten`, {
        originalUrl,
        expiresAt: expiresAt || null
      });

      if (response.data.success) {
        setOriginalUrl('');
        setExpiresAt('');
        setCreateSuccess(true);
        setShowCreateModal(false);
        // Refresh list
        fetchUrls();
        // Hide success message after 3 seconds
        setTimeout(() => setCreateSuccess(false), 3000);
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle URL deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shortened link? All analytics data will be lost.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/url/${id}`);
      if (response.data.success) {
        setUrls(urls.filter(url => url._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete URL');
    }
  };

  // Handle Copy
  const handleCopy = (id, shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate mock API Key
  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyName) return;
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullToken = `sl_live_${randomHex}`;
    const obfuscated = `${fullToken.substring(0, 12)}...${fullToken.substring(fullToken.length - 4)}`;
    
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      token: obfuscated,
      created: new Date().toISOString().split('T')[0]
    };
    
    setApiKeys([...apiKeys, newKey]);
    setGeneratedKey(fullToken);
    setNewKeyName('');
  };

  // Aggregated Stats
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeUrls = urls.filter(url => !url.expiresAt || new Date(url.expiresAt) > new Date()).length;

  // Filter urls based on search query
  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) || 
    url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div class="min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row">
      
      {/* Sidebar Console Navigation */}
      <aside class="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-[#09090b] p-4 shrink-0 flex flex-col gap-6">
        
        {/* User Workspace Info */}
        <div class="px-2 py-1 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded bg-zinc-650"></div>
            <span class="text-xs font-mono font-bold tracking-tight text-white uppercase">Console Workspace</span>
          </div>
        </div>

        {/* Console Action: Create Link Button */}
        <button 
          onClick={() => setShowCreateModal(true)}
          class="saas-btn-primary flex items-center justify-center gap-1.5 font-mono text-xs py-2 w-full"
        >
          <Plus class="w-3.5 h-3.5" />
          Create Link
        </button>

        {/* Sidebar Nav Items */}
        <nav class="flex flex-col gap-1">
          {[
            { id: 'overview', name: 'Overview', icon: <LayoutGrid class="w-4 h-4" /> },
            { id: 'links', name: 'Links', icon: <Link2 class="w-4 h-4" /> },
            { id: 'api', name: 'API Keys', icon: <Key class="w-4 h-4" /> },
            { id: 'settings', name: 'Settings', icon: <Settings class="w-4 h-4" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              class={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors text-left ${
                activeTab === item.id 
                  ? 'bg-zinc-900 text-white border border-zinc-800' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Console Workspace */}
      <main class="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        
        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} class="space-y-8">
            <div>
              <h1 class="text-xl font-semibold tracking-tight text-white font-sans">Overview</h1>
              <p class="text-xs text-zinc-500 mt-1 font-mono">Consolidated traffic and service metrics</p>
            </div>

            {/* Metrics Grid */}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Short Links', val: totalUrls, color: 'text-zinc-100' },
                { label: 'Total Redirection Clicks', val: totalClicks.toLocaleString(), color: 'text-zinc-200' },
                { label: 'Active Link Interfaces', val: activeUrls, color: 'text-zinc-300' }
              ].map((stat, idx) => (
                <div key={idx} class="saas-card relative overflow-hidden bg-[#121214] border-zinc-800 p-5">
                  <div class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                  <div class={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* System Info card */}
            <div class="saas-card bg-[#121214] border-zinc-800 space-y-4">
              <h3 class="text-sm font-semibold font-mono text-white">System Architecture Status</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-450">
                <div class="flex items-center justify-between p-3 bg-[#09090b] border border-zinc-800 rounded-lg">
                  <span>Atomic Sequence Generator:</span>
                  <span class="status-badge status-badge-active">Online</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-[#09090b] border border-zinc-800 rounded-lg">
                  <span>Redis Cache Resolution:</span>
                  <span class="status-badge status-badge-active">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: LINKS */}
        {activeTab === 'links' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} class="space-y-6">
            
            {/* Header Area */}
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 class="text-xl font-semibold tracking-tight text-white font-sans">Links</h1>
                <p class="text-xs text-zinc-500 mt-1 font-mono">Manage shortening interfaces and query endpoints</p>
              </div>
            </div>

            {/* URL List Container */}
            <div class="saas-card relative overflow-hidden bg-[#121214] p-0 border-zinc-800">
              
              {/* Header Bar search */}
              <div class="p-4 flex items-center justify-between gap-4 border-b border-zinc-800">
                <div class="relative w-full sm:w-72">
                  <Search class="absolute inset-y-0 left-3 w-4 h-4 text-zinc-650 my-auto" />
                  <input
                    type="text"
                    placeholder="Search shortcode or destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    class="w-full saas-input pl-9 text-xs"
                  />
                </div>
              </div>

              {loading ? (
                <div class="py-20 text-center">
                  <div class="w-8 h-8 border-2 border-zinc-850 border-t-zinc-350 rounded-full animate-spin mx-auto"></div>
                  <p class="text-xs text-zinc-550 mt-4 font-mono">Querying links from cluster...</p>
                </div>
              ) : error ? (
                <div class="py-20 text-center text-red-400 flex flex-col items-center justify-center gap-2 font-mono text-xs">
                  <AlertCircle class="w-6 h-6" />
                  <p>{error}</p>
                </div>
              ) : filteredUrls.length === 0 ? (
                <div class="py-20 text-center text-zinc-500 space-y-3 font-mono text-xs">
                  <p class="font-medium text-zinc-400">No links resolved</p>
                  <p class="text-[10px] text-zinc-650">
                    {searchQuery ? 'Adjust your search queries' : 'Launch your first shortened URL using the "Create Link" button'}
                  </p>
                </div>
              ) : (
                <div class="overflow-x-auto font-mono">
                  <table class="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr class="bg-black/20">
                        <th class="enterprise-table-header w-[35%]">Destination URL</th>
                        <th class="enterprise-table-header w-[25%]">Short URL</th>
                        <th class="enterprise-table-header w-[15%]">Created</th>
                        <th class="enterprise-table-header text-center w-[12%]">Clicks</th>
                        <th class="enterprise-table-header text-center w-[13%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUrls.map((url) => {
                        const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();
                        // Clean domain for display
                        const displayDest = url.originalUrl.replace(/https?:\/\/(www\.)?/, '');
                        
                        return (
                          <tr key={url._id} class="hover:bg-zinc-900/40 transition-colors border-b border-zinc-800/40">
                            {/* Destination */}
                            <td class="enterprise-table-cell max-w-[250px]">
                              <div class="flex flex-col gap-1">
                                <span class="truncate font-mono text-xs text-zinc-450 block" title={url.originalUrl}>
                                  {displayDest}
                                </span>
                                {url.expiresAt && (
                                  <span class={`inline-flex items-center gap-1 text-[9px] font-mono ${isExpired ? 'text-rose-400' : 'text-amber-500'}`}>
                                    <Calendar class="w-3 h-3" />
                                    {isExpired ? 'Expired' : `Expires: ${new Date(url.expiresAt).toLocaleDateString()}`}
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            {/* Short URL */}
                            <td class="enterprise-table-cell">
                              <div class="flex items-center gap-1.5">
                                <a
                                  href={url.shortUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  class="text-zinc-200 hover:text-white font-semibold font-mono text-xs flex items-center gap-1"
                                >
                                  /{url.shortCode}
                                  <ExternalLink class="w-3 h-3 text-zinc-500" />
                                </a>
                                <button
                                  onClick={() => handleCopy(url._id, url.shortUrl)}
                                  class="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                                >
                                  {copiedId === url._id ? <Check class="w-3.5 h-3.5 text-emerald-600" /> : <Copy class="w-3 h-3" />}
                                </button>
                              </div>
                            </td>

                            {/* Created */}
                            <td class="enterprise-table-cell font-mono text-xs text-zinc-450">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </td>

                            {/* Clicks */}
                            <td class="enterprise-table-cell text-center font-mono font-bold text-zinc-200 text-xs">
                              {url.clicks >= 1000 ? `${(url.clicks / 1000).toFixed(1)}k` : url.clicks}
                            </td>

                            {/* Actions */}
                            <td class="enterprise-table-cell">
                              <div class="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => navigate(`/analytics/${url._id}`)}
                                  class="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center"
                                  title="Analytics"
                                >
                                  <BarChart2 class="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(url._id)}
                                  class="p-1.5 bg-zinc-900 border border-zinc-800 text-rose-500 hover:bg-rose-950/20 hover:border-rose-900/30 hover:text-rose-400 rounded-lg transition-colors flex items-center justify-center"
                                  title="Delete"
                                >
                                  <Trash2 class="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: API KEYS */}
        {activeTab === 'api' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} class="space-y-6">
            <div>
              <h1 class="text-xl font-semibold tracking-tight text-white font-sans">API Credentials</h1>
              <p class="text-xs text-zinc-550 mt-1 font-mono">Generate tokens to programmatically shorten links via standard cURL requests</p>
            </div>

            {/* Key generator form */}
            <div class="saas-card bg-[#121214] border-zinc-800">
              <h3 class="text-sm font-semibold font-mono text-white mb-3">Generate API Token</h3>
              <form onSubmit={handleCreateApiKey} class="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input
                  type="text"
                  required
                  placeholder="e.g. Production App Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  class="flex-1 saas-input !py-2 text-xs"
                />
                <button type="submit" class="saas-btn-primary !py-2 text-xs font-mono">
                  Generate Key
                </button>
              </form>

              {/* Show generated key warning */}
              {generatedKey && (
                <div class="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded space-y-2 font-mono text-xs text-left">
                  <div class="text-[10px] text-zinc-400 uppercase font-semibold">Copy your API Key now:</div>
                  <div class="flex items-center justify-between gap-3 bg-black/40 border border-zinc-800 rounded p-2.5">
                    <span class="text-zinc-200 font-bold select-all break-all">{generatedKey}</span>
                    <button 
                      onClick={() => handleCopy('newkey', generatedKey)}
                      class="p-1.5 text-zinc-500 hover:text-white rounded transition-colors shrink-0"
                    >
                      {copiedId === 'newkey' ? <Check class="w-4 h-4 text-emerald-600" /> : <Copy class="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p class="text-[9px] text-amber-500/90">⚠️ Save this key securely. It cannot be shown again.</p>
                </div>
              )}
            </div>

            {/* List keys */}
            <div class="saas-card bg-[#121214] border-zinc-800 p-0 overflow-hidden">
              <div class="p-4 border-b border-zinc-800">
                <h3 class="text-sm font-semibold font-mono text-white">Active Tokens</h3>
              </div>
              <div class="divide-y divide-zinc-800/60 font-mono text-xs">
                {apiKeys.map((key) => (
                  <div key={key.id} class="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div class="font-bold text-zinc-200">{key.name}</div>
                      <div class="text-[10px] text-zinc-500 mt-0.5">{key.token}</div>
                    </div>
                    <div class="text-[10px] text-zinc-500">
                      Created: {key.created}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} class="space-y-6">
            <div>
              <h1 class="text-xl font-semibold tracking-tight text-white font-sans">Settings</h1>
              <p class="text-xs text-zinc-500 mt-1 font-mono">Workspace settings and database configuration</p>
            </div>

            <div class="saas-card bg-[#121214] border-zinc-800 space-y-4">
              <h3 class="text-sm font-semibold font-mono text-white">Database Namespace</h3>
              <div class="space-y-3 font-mono text-xs max-w-md">
                <div class="space-y-1">
                  <div class="text-[10px] text-zinc-500">Active Connection Namespace</div>
                  <div class="p-3 bg-black/40 border border-zinc-800 rounded-lg text-zinc-300 break-all select-all font-semibold">
                    mongodb+srv://cluster0.egxrx3d.mongodb.net/shortlink
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="text-[10px] text-zinc-500">Cache Layer Host</div>
                  <div class="p-3 bg-black/40 border border-zinc-800 rounded-lg text-zinc-300 break-all select-all font-semibold">
                    brilliant-abstracted-income-99971.db.redis.io:16979
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* CREATE URL MODAL DIALOG */}
      <AnimatePresence>
        {showCreateModal && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              class="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              class="saas-card w-full max-w-md relative z-10 p-6 bg-[#09090b] border border-zinc-800 shadow-2xl"
            >
              <div class="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                <h3 class="text-sm font-semibold font-mono text-white flex items-center gap-1.5">
                  <Terminal class="w-4 h-4 text-zinc-400" />
                  Shorten long URL
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  class="p-1 hover:bg-zinc-855 text-zinc-500 hover:text-zinc-200 rounded-lg transition-colors"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleShorten} class="space-y-4 font-mono text-xs">
                <div class="space-y-1.5 text-left">
                  <label class="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Long Destination URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/deep/resource"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    class="w-full saas-input !py-2"
                  />
                </div>

                <div class="space-y-1.5 text-left">
                  <label class="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    class="w-full saas-input !py-2 cursor-pointer"
                  />
                </div>

                {createError && (
                  <div class="p-3 bg-rose-950/10 border border-rose-500/10 text-rose-400 rounded-lg text-[10px]">
                    {createError}
                  </div>
                )}

                <div class="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    class="flex-1 saas-btn-secondary py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createLoading}
                    class="flex-1 saas-btn-primary py-2"
                  >
                    {createLoading ? (
                      <div class="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      'Generate Code'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
