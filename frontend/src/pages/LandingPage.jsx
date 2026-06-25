import React, { useState } from 'react';
import axios from 'axios';
import { Link2, Copy, Check, Zap, BarChart3, ShieldCheck, ArrowRight, Clock, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortenedResult, setShortenedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      return setError('Please enter a URL to shorten');
    }

    setLoading(true);
    setError('');
    setShortenedResult(null);
    setCopied(false);

    try {
      const response = await axios.post(`${API_URL}/url/shorten`, {
        originalUrl,
        expiresAt: expiresAt || null
      });

      if (response.data.success) {
        setShortenedResult(response.data.data);
        setOriginalUrl('');
        setExpiresAt('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL. Make sure it is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortenedResult) {
      navigator.clipboard.writeText(shortenedResult.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-24">
      {/* Hero Section */}
      <div class="text-center max-w-4xl mx-auto space-y-6">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Zap class="w-3.5 h-3.5 fill-indigo-400" />
          Powered by Redis & Base62
        </div>
        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
          Shorten Your Links,<br/>
          <span class="bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Accelerate Your Reach
          </span>
        </h1>
        <p class="text-lg sm:text-xl text-slate-400 font-light max-w-2xl mx-auto">
          ShortLink is a high-performance URL shortener converting long, complex links into clean, secure, and trackable links in milliseconds.
        </p>
      </div>

      {/* Shortener Widget */}
      <div class="max-w-3xl mx-auto">
        <div class="glass-panel p-6 sm:p-8 rounded-3xl relative shadow-2xl border border-slate-800/80">
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"></div>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="flex flex-col md:flex-row gap-3">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Link2 class="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Paste your long URL here (e.g. https://example.com/deep/path...)"
                  value={originalUrl}
                  onChange={(e) => {
                    setOriginalUrl(e.target.value);
                    setError('');
                  }}
                  class="w-full glass-input pl-11 !py-3.5"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                class="btn-primary !py-3.5 md:w-36 flex items-center justify-center gap-2 font-semibold shrink-0"
              >
                {loading ? (
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Shorten'
                )}
              </button>
            </div>

            {/* Optional Expiration Date */}
            <div class="flex items-center gap-4 pt-1 text-slate-400 text-xs">
              <span class="flex items-center gap-1.5 font-medium">
                <Clock class="w-4 h-4 text-slate-500" />
                Link Expiration (Optional):
              </span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                class="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
              />
            </div>
          </form>

          {/* Error Alert */}
          {error && (
            <div class="mt-4 p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-2">
              <span class="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Result Output */}
          {shortenedResult && (
            <div class="mt-6 p-4 sm:p-5 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-3 animate-fade-in">
              <div class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Your Link is Ready!
              </div>
              <div class="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                <span class="text-slate-200 select-all font-medium break-all text-sm sm:text-base pr-2">
                  {shortenedResult.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  class="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
                >
                  {copied ? (
                    <>
                      <Check class="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy class="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div class="text-xs text-slate-400 flex flex-col sm:flex-row justify-between sm:items-center gap-1 pt-1">
                <span class="truncate max-w-[280px] sm:max-w-none">Original: {shortenedResult.originalUrl}</span>
                {shortenedResult.expiresAt && (
                  <span class="text-yellow-500/90 font-medium">Expires: {new Date(shortenedResult.expiresAt).toLocaleString()}</span>
                )}
              </div>
              {!isAuthenticated && (
                <div class="pt-2 text-xs text-slate-400 border-t border-slate-800/50">
                  💡 <Link to="/signup" class="text-indigo-400 font-semibold hover:underline">Sign up</Link> to save this link, delete it, and track click locations & devices!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Performance Metrics */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-center">
        {[
          { label: 'Redirection Latency', val: '< 5ms', detail: 'Using Redis Cache' },
          { label: 'Maximum Throughput', val: '10k/sec', detail: 'Distributed Cluster' },
          { label: 'Link Encoding Space', val: '56.8B', detail: '6-Char Base62 capacity' },
          { label: 'Uptime SLA', val: '99.99%', detail: 'High Availability' }
        ].map((item, idx) => (
          <div key={idx} class="glass-card flex flex-col justify-center items-center py-6 px-4">
            <div class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{item.val}</div>
            <div class="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{item.label}</div>
            <div class="text-[10px] text-slate-500 mt-0.5">{item.detail}</div>
          </div>
        ))}
      </div>

      {/* Feature Section */}
      <div class="space-y-12">
        <div class="text-center max-w-2xl mx-auto space-y-3">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Designed for Real-World Scalability
          </h2>
          <p class="text-slate-400 font-light">
            Engineered with modern architecture guidelines to handle millions of redirection requests smoothly.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap class="w-6 h-6 text-indigo-400" />,
              title: 'Cache-Aside Redirection',
              desc: 'Utilizes high-speed Redis memory storage. Redirections bypass database queries completely on cache hits, ensuring near-instantaneous page jumps.'
            },
            {
              icon: <BarChart3 class="w-6 h-6 text-blue-400" />,
              title: 'Asynchronous Analytics',
              desc: 'Redirections run non-blocking analytics logging using Node event loop handlers, keeping the redirection path fast and isolated from database load.'
            },
            {
              icon: <ShieldCheck class="w-6 h-6 text-indigo-400" />,
              title: 'Security Hardened',
              desc: 'Integrates rate limiters, bcrypt password hashing, input sanitization, and parameterized database queries to safeguard endpoints and data integrity.'
            }
          ].map((feat, idx) => (
            <div key={idx} class="glass-card relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
              <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center mb-5">
                {feat.icon}
              </div>
              <h3 class="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p class="text-slate-400 text-sm font-light leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
