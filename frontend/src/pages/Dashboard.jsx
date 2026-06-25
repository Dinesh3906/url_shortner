import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Link2, Copy, Check, Trash2, BarChart2, Plus, Calendar, ExternalLink, 
  AlertCircle, Search, LayoutGrid, Terminal, Key, Settings, X 
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
  const [customAlias, setCustomAlias] = useState('');
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
        expiresAt: expiresAt || null,
        customAlias: customAlias || null
      });

      if (response.data.success) {
        setOriginalUrl('');
        setExpiresAt('');
        setCustomAlias('');
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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row">
      
      {/* Sidebar Console Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 bg-zinc-50 p-4 shrink-0 flex flex-col gap-6">
        
        {/* User Workspace Info */}
        <div className="px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded bg-zinc-400"></div>
            <span className="text-xs font-mono font-bold tracking-tight text-zinc-800 uppercase">Console Workspace</span>
          </div>
        </div>

        {/* Console Action: Create Link Button */}
        <button 
          onClick={() => setShowCreateModal(true)}
          className="saas-btn-primary flex items-center justify-center gap-1.5 font-sans text-xs py-2 w-full shadow-md shadow-indigo-100"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Link
        </button>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-1">
          {[
            { id: 'overview', name: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
            { id: 'links', name: 'Links', icon: <Link2 className="w-4 h-4" /> },
            { id: 'api', name: 'API Keys', icon: <Key className="w-4 h-4" /> },
            { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-colors text-left ${
                activeTab === item.id 
                  ? 'bg-white text-zinc-900 border border-zinc-200 shadow-sm' 
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Console Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        
        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 font-sans">Overview</h1>
              <p className="text-xs text-zinc-500 mt-1 font-mono">Consolidated traffic and service metrics</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Short Links', val: totalUrls, color: 'text-zinc-900' },
                { label: 'Total Redirection Clicks', val: totalClicks.toLocaleString(), color: 'text-zinc-900' },
                { label: 'Active Link Interfaces', val: activeUrls, color: 'text-zinc-900' }
              ].map((stat, idx) => (
                <div key={idx} className="saas-card relative overflow-hidden p-5">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                  <div className={`text-2xl font-bold mt-2 font-mono ${stat.color}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* System Info card */}
            <div className="saas-card space-y-4">
              <h3 className="text-sm font-semibold font-mono text-zinc-900">System Architecture Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-600">
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span>Atomic Sequence Generator:</span>
                  <span className="status-badge status-badge-active">Online</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <span>Redis Cache Resolution:</span>
                  <span className="status-badge status-badge-active">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: LINKS */}
        {activeTab === 'links' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 font-sans">Links</h1>
                <p className="text-xs text-zinc-500 mt-1 font-mono">Manage shortening interfaces and query endpoints</p>
              </div>
            </div>

            {/* URL List Container */}
            <div className="saas-card relative overflow-hidden p-0">
              
              {/* Header Bar search bar */}
              <div className="p-4 flex items-center justify-between gap-4 border-b border-zinc-200">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute inset-y-0 left-3 w-4 h-4 text-zinc-400 my-auto" />
                  <input
                    type="text"
                    placeholder="Search shortcode or destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full saas-input pl-9 text-xs"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-zinc-500 mt-4 font-mono">Querying links from cluster...</p>
                </div>
              ) : error ? (
                <div className="py-20 text-center text-red-500 flex flex-col items-center justify-center gap-2 font-mono text-xs">
                  <AlertCircle className="w-6 h-6" />
                  <p>{error}</p>
                </div>
              ) : filteredUrls.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 space-y-3 font-mono text-xs">
                  <p className="font-medium text-zinc-650">No links resolved</p>
                  <p className="text-[10px] text-zinc-450">
                    {searchQuery ? 'Adjust your search queries' : 'Launch your first shortened URL using the "Create Link" button'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto font-mono">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr className="bg-zinc-50">
                        <th className="enterprise-table-header w-[35%]">Destination URL</th>
                        <th className="enterprise-table-header w-[25%]">Short URL</th>
                        <th className="enterprise-table-header w-[15%]">Created</th>
                        <th className="enterprise-table-header text-center w-[12%]">Clicks</th>
                        <th className="enterprise-table-header text-center w-[13%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUrls.map((url) => {
                        const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();
                        // Clean domain for display
                        const displayDest = url.originalUrl.replace(/https?:\/\/(www\.)?/, '');
                        
                        return (
                          <tr key={url._id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100">
                            {/* Destination */}
                            <td className="enterprise-table-cell max-w-[250px]">
                              <div className="flex flex-col gap-1">
                                <span className="truncate font-mono text-xs text-zinc-600 block" title={url.originalUrl}>
                                  {displayDest}
                                </span>
                                {url.expiresAt && (
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-mono ${isExpired ? 'text-rose-600' : 'text-amber-600'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {isExpired ? 'Expired' : `Expires: ${new Date(url.expiresAt).toLocaleDateString()}`}
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            {/* Short URL */}
                            <td className="enterprise-table-cell">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={url.shortUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-800 hover:text-[#4f46e5] font-semibold font-mono text-xs flex items-center gap-1"
                                >
                                  /{url.shortCode}
                                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                                </a>
                                <button
                                  onClick={() => handleCopy(url._id, url.shortUrl)}
                                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors"
                                >
                                  {copiedId === url._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>

                            {/* Created */}
                            <td className="enterprise-table-cell font-mono text-xs text-zinc-500">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </td>

                            {/* Clicks */}
                            <td className="enterprise-table-cell text-center font-mono font-bold text-zinc-900 text-xs">
                              {url.clicks >= 1000 ? `${(url.clicks / 1000).toFixed(1)}k` : url.clicks}
                            </td>

                            {/* Actions */}
                            <td className="enterprise-table-cell">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => navigate(`/analytics/${url._id}`)}
                                  className="p-1.5 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors flex items-center justify-center"
                                  title="Analytics"
                                >
                                  <BarChart2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(url._id)}
                                  className="p-1.5 bg-white border border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-lg transition-colors flex items-center justify-center"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 font-sans">API Credentials</h1>
              <p className="text-xs text-zinc-500 mt-1 font-mono">Generate tokens to programmatically shorten links via standard cURL requests</p>
            </div>

            {/* Key generator form */}
            <div className="saas-card">
              <h3 className="text-sm font-semibold font-mono text-zinc-800 mb-3">Generate API Token</h3>
              <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input
                  type="text"
                  required
                  placeholder="e.g. Production App Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 saas-input py-2! text-xs"
                />
                <button type="submit" className="saas-btn-primary py-2! text-xs font-sans">
                  Generate Key
                </button>
              </form>

              {/* Show generated key warning */}
              {generatedKey && (
                <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded space-y-2 font-mono text-xs text-left">
                  <div className="text-[10px] text-zinc-500 uppercase font-semibold">Copy your API Key now:</div>
                  <div className="flex items-center justify-between gap-3 bg-white border border-zinc-200 rounded p-2.5">
                    <span className="text-zinc-800 font-bold select-all break-all">{generatedKey}</span>
                    <button 
                      onClick={() => handleCopy('newkey', generatedKey)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors shrink-0"
                    >
                      {copiedId === 'newkey' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-amber-600">⚠️ Save this key securely. It cannot be shown again.</p>
                </div>
              )}
            </div>

            {/* List keys */}
            <div className="saas-card p-0 overflow-hidden">
              <div className="p-4 border-b border-zinc-200">
                <h3 className="text-sm font-semibold font-mono text-zinc-800">Active Tokens</h3>
              </div>
              <div className="divide-y divide-zinc-200 font-mono text-xs">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-zinc-700">{key.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{key.token}</div>
                    </div>
                    <div className="text-[10px] text-zinc-500">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900 font-sans">Settings</h1>
              <p className="text-xs text-zinc-500 mt-1 font-mono">Workspace settings and database configuration</p>
            </div>

            <div className="saas-card space-y-4">
              <h3 className="text-sm font-semibold font-mono text-zinc-850">Database Namespace</h3>
              <div className="space-y-3 font-mono text-xs max-w-md">
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500">Active Connection Namespace</div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 break-all select-all font-semibold">
                    mongodb+srv://cluster0.egxrx3d.mongodb.net/shortlink
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500">Cache Layer Host</div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 break-all select-all font-semibold">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="saas-card w-full max-w-md relative z-10 p-6 bg-white border border-zinc-200 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3 mb-4">
                <h3 className="text-sm font-semibold font-mono text-zinc-800 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  Shorten long URL
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-850 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleShorten} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-sans">Long Destination URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/deep/resource"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="w-full saas-input py-2!"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-sans">Custom Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. my-custom-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="w-full saas-input py-2!"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-sans">Expiration Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full saas-input py-2! cursor-pointer"
                  />
                </div>

                {createError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-650 rounded-lg text-[10px]">
                    {createError}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 saas-btn-secondary py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 saas-btn-primary py-2"
                  >
                    {createLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
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
