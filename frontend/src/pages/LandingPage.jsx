import React, { useState } from 'react';
import axios from 'axios';
import { Link2, Copy, Check, Zap, BarChart3, ShieldCheck, ArrowRight, Clock, QrCode, ArrowUpRight, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
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

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortenedResult, setShortenedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      return setError('Please enter a URL to shorten');
    }

    setLoading(true);
    setError('');
    setShortenedResult(null);
    setCopied(false);
    setShowQr(false);

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24"
    >
      
      {/* Hero Section: Sleek split Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Product Slogan & CTAs */}
        <div class="lg:col-span-7 space-y-6 text-left">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-800 bg-[#121214] text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
            <Terminal class="w-3 h-3 text-zinc-500" />
            API Engine v1.0.0
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] font-sans">
            The link management <br/>
            <span class="text-zinc-500">platform for developers</span>
          </h1>
          
          <p class="text-xs sm:text-sm text-zinc-400 font-light max-w-lg leading-relaxed font-mono">
            A developer-first URL shortener with sub-15ms redirection latency. Powered by Redis caching, MongoDB indexing, and asynchronous analytic log tracking.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link to="/dashboard" class="saas-btn-primary flex items-center gap-1.5 font-mono">
                Go to Console
                <ArrowRight class="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/signup" class="saas-btn-primary flex items-center gap-1.5 font-mono">
                  Get Started for free
                  <ArrowRight class="w-3.5 h-3.5" />
                </Link>
                <a href="#docs" class="saas-btn-secondary font-mono">
                  Read API Docs
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Terminal Metrics Card */}
        <div class="lg:col-span-5">
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            class="saas-card relative overflow-hidden bg-[#121214] border-zinc-800"
          >
            <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-zinc-800"></span>
                <span class="w-2 h-2 rounded-full bg-zinc-800"></span>
                <span class="w-2 h-2 rounded-full bg-zinc-800"></span>
              </div>
              <span class="text-[9px] font-mono text-zinc-500">metrics_daemon.log</span>
            </div>

            <div class="space-y-4 font-mono text-[11px]">
              <div class="space-y-1">
                <div class="text-[9px] text-zinc-500 uppercase tracking-wide">Short Code Interface</div>
                <div class="text-xs font-semibold text-zinc-200">short.ly/x9K2a</div>
              </div>

              <div class="space-y-1">
                <div class="text-[9px] text-zinc-500 uppercase tracking-wide">Destination Address</div>
                <div class="text-zinc-400 break-all">github.com/company/project</div>
              </div>

              <div class="grid grid-cols-2 gap-4 border-t border-zinc-800/60 pt-3">
                <div class="space-y-0.5">
                  <div class="text-[9px] text-zinc-500 uppercase tracking-wide">Requests Logged</div>
                  <div class="text-xs font-bold text-zinc-100">24,891</div>
                </div>
                <div class="space-y-0.5">
                  <div class="text-[9px] text-zinc-500 uppercase tracking-wide">Latency SLA</div>
                  <div class="text-xs font-bold text-zinc-300 flex items-center gap-1">
                    <Zap class="w-3 h-3 text-zinc-500" />
                    12ms
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* URL Shortener Box (Command-style) */}
      <div class="max-w-2xl mx-auto">
        <div class="saas-card bg-[#121214] border-zinc-800 p-5 sm:p-6 shadow-xl">
          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="space-y-1.5 text-left">
              <label class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">
                Destination URL
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="https://github.com/Dinesh3906/url_shortner"
                  value={originalUrl}
                  onChange={(e) => {
                    setOriginalUrl(e.target.value);
                    setError('');
                  }}
                  class="flex-1 saas-input !py-2.5 !px-3.5 focus:border-zinc-500 text-xs"
                />
                <button
                  type="submit"
                  disabled={loading}
                  class="saas-btn-primary !py-2.5 px-4 font-mono text-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  {loading ? (
                    <div class="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Shorten
                      <ArrowRight class="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Expiry Picker */}
            <div class="flex items-center gap-3 pt-1 text-[9px] font-mono text-zinc-500">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                Expiration Date (Optional):
              </span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                class="bg-black/60 border border-zinc-800 text-zinc-350 rounded-md px-2 py-0.5 focus:outline-none text-[9px] cursor-pointer"
              />
            </div>
          </form>

          {error && (
            <div class="mt-4 p-3 bg-rose-950/10 border border-rose-500/10 text-rose-400 rounded text-[11px] text-left font-mono">
              Error: {error}
            </div>
          )}

          {/* Results Output with actions */}
          <AnimatePresence>
            {shortenedResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                class="mt-6 p-4 bg-black/40 border border-zinc-800 rounded space-y-4 text-left font-mono text-[11px]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Short URL Output</span>
                  {shortenedResult.expiresAt && (
                    <span class="text-[9px] text-zinc-500">Expires: {new Date(shortenedResult.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>

                <div class="flex items-center justify-between gap-3 bg-black/60 border border-zinc-800 rounded p-3">
                  <span class="text-zinc-200 select-all font-semibold break-all text-xs">
                    {shortenedResult.shortUrl}
                  </span>
                  
                  <div class="flex items-center gap-1.5 shrink-0">
                    {/* Copy */}
                    <button
                      onClick={handleCopy}
                      class="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded transition-colors flex items-center justify-center"
                      title="Copy Link"
                    >
                      {copied ? <Check class="w-3.5 h-3.5 text-emerald-600" /> : <Copy class="w-3.5 h-3.5" />}
                    </button>
                    {/* QR Code */}
                    <button
                      onClick={() => setShowQr(!showQr)}
                      class={`p-2 rounded transition-colors flex items-center justify-center border ${
                        showQr ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                      title="QR Code"
                    >
                      <QrCode class="w-3.5 h-3.5" />
                    </button>
                    {/* Analytics */}
                    {isAuthenticated && (
                      <button
                        onClick={() => navigate(`/analytics/${shortenedResult._id}`)}
                        class="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors flex items-center justify-center"
                        title="View Analytics"
                      >
                        <ArrowUpRight class="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* QR Code Modal/Drawer */}
                {showQr && (
                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    class="p-4 bg-zinc-900 border border-zinc-800 rounded flex flex-col items-center justify-center gap-3 text-center"
                  >
                    <div class="bg-white p-2 rounded">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortenedResult.shortUrl)}`} 
                        alt="Short link QR code" 
                        class="w-32 h-32"
                      />
                    </div>
                    <span class="text-[9px] text-zinc-500">Scan QR image to resolve shortened URL</span>
                  </motion.div>
                )}

                {!isAuthenticated && (
                  <div class="text-[9px] text-zinc-500 border-t border-zinc-800/80 pt-2">
                    Note: <Link to="/signup" class="text-zinc-300 underline hover:text-white">Sign up</Link> to save this link permanently, customize expiration times, and unlock traffic logs.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Feature Section: Redesigned Cards */}
      <div class="space-y-12">
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <h2 class="text-xl font-bold tracking-tight text-white font-sans sm:text-2xl">
            API System Architecture
          </h2>
          <p class="text-zinc-500 text-[10px] font-mono uppercase tracking-wide">
            Redirection SLA tracking and database log metrics.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap class="w-4 h-4 text-zinc-400" />,
              title: 'Sub-15ms Latency',
              desc: 'Cache resolution bypasses primary databases. Active routes are served from RAM-based cache memory pools.'
            },
            {
              icon: <BarChart3 class="w-4 h-4 text-zinc-400" />,
              title: 'Asynchronous Analytics',
              desc: 'Click logging, user-agent parsing, and database counter mutations are run in a non-blocking queue.'
            },
            {
              icon: <ShieldCheck class="w-4 h-4 text-zinc-400" />,
              title: 'API Authorization',
              desc: 'Secure JWT authentication schemas, API tokens for command line integrations, and client rate limits.'
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -1 }}
              class="saas-card bg-[#121214] border-zinc-800 hover:border-zinc-700/80 p-5 text-left flex flex-col justify-between"
            >
              <div class="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <div class="space-y-1.5">
                <h3 class="text-xs font-semibold text-zinc-200 font-mono">{feat.title}</h3>
                <p class="text-zinc-400 text-[11px] font-mono leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
