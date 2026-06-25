import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link2, Copy, Check, Trash2, BarChart2, Plus, Calendar, ExternalLink, AlertCircle, ArrowUpRight, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  
  // UI helpers
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Panel */}
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p class="text-sm text-slate-400 font-light mt-1">
            Manage your shortened links, monitor performance, and view visitor analytics
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Links Created', val: totalUrls, color: 'text-indigo-400' },
          { label: 'Total Clicks Tracked', val: totalClicks, color: 'text-blue-400' },
          { label: 'Active Short Links', val: activeUrls, color: 'text-emerald-400' }
        ].map((stat, idx) => (
          <div key={idx} class="glass-card relative overflow-hidden">
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            <div class={`text-4xl font-extrabold mt-2 tracking-tight ${stat.color}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Quick Shortener & Main URLs List Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Link Sidebar Box */}
        <div class="lg:col-span-1 space-y-6">
          <div class="glass-panel p-6 rounded-2xl relative shadow-xl border border-slate-800/80">
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"></div>
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Plus class="w-5 h-5 text-indigo-400" />
              Shorten a New Link
            </h2>
            
            <form onSubmit={handleShorten} class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Long URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/very/long/url"
                  value={originalUrl}
                  onChange={(e) => {
                    setOriginalUrl(e.target.value);
                    setCreateError('');
                  }}
                  class="w-full glass-input text-xs"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Expiration Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  class="w-full glass-input text-xs cursor-pointer"
                />
              </div>

              {createError && (
                <div class="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-[11px] text-red-400 flex items-start gap-1.5">
                  <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div class="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-medium">
                  🎉 Link shortened successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={createLoading}
                class="w-full btn-primary !py-2.5 text-xs font-semibold"
              >
                {createLoading ? (
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Create Short Link'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* URLs Table List */}
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-panel rounded-2xl relative shadow-xl overflow-hidden border border-slate-800/80">
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
            
            {/* List Header Search */}
            <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800/60">
              <h2 class="text-lg font-bold text-white">Your Shortened Links</h2>
              
              {/* Search Widget */}
              <div class="relative w-full sm:w-64">
                <Search class="absolute inset-y-0 left-3 w-4 h-4 text-slate-500 my-auto" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  class="w-full bg-slate-950/40 border border-slate-800/80 text-xs text-white rounded-xl pl-9 pr-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 placeholder-slate-500"
                />
              </div>
            </div>

            {loading ? (
              <div class="py-20 text-center">
                <div class="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p class="text-sm text-slate-400 mt-4">Loading your links...</p>
              </div>
            ) : error ? (
              <div class="py-20 text-center text-red-400 flex flex-col items-center justify-center gap-2">
                <AlertCircle class="w-8 h-8" />
                <p>{error}</p>
              </div>
            ) : filteredUrls.length === 0 ? (
              <div class="py-20 text-center text-slate-400 space-y-4">
                <div class="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Link2 class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-medium text-slate-300">No links found</p>
                  <p class="text-xs font-light text-slate-500 mt-1">
                    {searchQuery ? 'Try adjusting your search keywords' : 'Get started by creating your first shortened URL!'}
                  </p>
                </div>
              </div>
            ) : (
              <div class="overflow-x-auto">
                <table class="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr>
                      <th class="table-header w-[35%]">Original URL</th>
                      <th class="table-header w-[30%]">Short Link</th>
                      <th class="table-header text-center w-[12%]">Clicks</th>
                      <th class="table-header w-[13%]">Created</th>
                      <th class="table-header text-center w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUrls.map((url) => {
                      const isExpired = url.expiresAt && new Date(url.expiresAt) <= new Date();
                      
                      return (
                        <tr key={url._id} class="hover:bg-slate-900/30 transition-colors">
                          {/* Original URL */}
                          <td class="table-cell max-w-[200px]">
                            <div class="flex flex-col">
                              <span class="truncate font-light text-slate-400 text-xs hover:text-slate-300 transition-colors" title={url.originalUrl}>
                                {url.originalUrl}
                              </span>
                              {url.expiresAt && (
                                <span class={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-yellow-500'}`}>
                                  <Calendar class="w-3 h-3" />
                                  {isExpired ? 'Expired' : `Expires: ${new Date(url.expiresAt).toLocaleDateString()}`}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          {/* Short Link */}
                          <td class="table-cell">
                            <div class="flex items-center gap-2">
                              <a
                                href={url.shortUrl}
                                target="_blank"
                                rel="noreferrer"
                                class="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-sm shrink-0"
                              >
                                {url.shortCode}
                                <ExternalLink class="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleCopy(url._id, url.shortUrl)}
                                class="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                                title="Copy Short URL"
                              >
                                {copiedId === url._id ? <Check class="w-4 h-4 text-emerald-400" /> : <Copy class="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Clicks */}
                          <td class="table-cell text-center font-bold text-slate-100">
                            {url.clicks}
                          </td>

                          {/* Created */}
                          <td class="table-cell text-xs text-slate-400">
                            {new Date(url.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td class="table-cell">
                            <div class="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/analytics/${url._id}`)}
                                class="p-2 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-900/30 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors flex items-center justify-center"
                                title="Detailed Analytics"
                              >
                                <BarChart2 class="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(url._id)}
                                class="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center justify-center"
                                title="Delete Link"
                              >
                                <Trash2 class="w-4 h-4" />
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
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
