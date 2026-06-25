import React, { useState } from 'react';
import axios from 'axios';
import { Link2, Copy, Check, Zap, BarChart3, ShieldCheck, ArrowRight, Clock, QrCode, ArrowUpRight, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-24"
    >
      
      {/* Hero Section: Asymmetric Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Copy & CTAs */}
        <div class="lg:col-span-7 space-y-6 text-left">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/[0.06] text-slate-400 font-mono text-[10px] uppercase tracking-wider">
            <Terminal class="w-3.5 h-3.5 text-indigo-500" />
            Developer-First Redirection
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1] font-sans">
            URL infrastructure <br/>
            <span class="text-indigo-400 font-mono font-medium">built for scale</span>
          </h1>
          
          <p class="text-sm sm:text-base text-slate-400 font-light max-w-xl leading-relaxed">
            Create, manage and analyze millions of links with a reliable shortening engine powered by caching and real-time analytics.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link to="/dashboard" class="saas-btn-primary flex items-center gap-1.5 font-mono">
                Go to Console
                <ArrowRight class="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/signup" class="saas-btn-primary flex items-center gap-1.5 font-mono">
                  Get Started for free
                  <ArrowRight class="w-4 h-4" />
                </Link>
                <a href="#docs" class="saas-btn-secondary font-mono">
                  Read API Docs
                </a>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Live Product Preview Card */}
        <div class="lg:col-span-5">
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            class="saas-card relative overflow-hidden bg-white/[0.015] border-white/[0.08]"
          >
            {/* Subtle top brand decoration line */}
            <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
            
            <div class="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <span class="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Redirection Metrics</span>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[10px] font-mono text-emerald-400">Active</span>
              </div>
            </div>

            <div class="space-y-4 font-mono text-xs">
              <div class="space-y-1">
                <div class="text-[10px] text-slate-500 uppercase">Short URL</div>
                <div class="text-sm font-semibold text-white">short.ly/x9K2a</div>
              </div>

              <div class="space-y-1">
                <div class="text-[10px] text-slate-500 uppercase">Original URL</div>
                <div class="text-slate-300 break-all">github.com/company/project</div>
              </div>

              <div class="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-3">
                <div class="space-y-0.5">
                  <div class="text-[10px] text-slate-500 uppercase">Clicks</div>
                  <div class="text-sm font-bold text-white">24,891</div>
                </div>
                <div class="space-y-0.5">
                  <div class="text-[10px] text-slate-500 uppercase">Latency</div>
                  <div class="text-sm font-bold text-indigo-400 flex items-center gap-1">
                    <Zap class="w-3 h-3 fill-indigo-400" />
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
        <div class="saas-card relative shadow-2xl bg-white/[0.015] border-white/[0.08] p-5 sm:p-6">
          <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="space-y-1 text-left">
              <label class="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span class="text-indigo-400">🔗</span> paste your long URL
              </label>
              <div class="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="example.com/product/page"
                  value={originalUrl}
                  onChange={(e) => {
                    setOriginalUrl(e.target.value);
                    setError('');
                  }}
                  class="flex-1 saas-input !py-2.5 !px-3.5 focus:border-indigo-500/50 text-xs"
                />
                <button
                  type="submit"
                  disabled={loading}
                  class="saas-btn-primary !py-2.5 px-4 font-mono text-xs flex items-center justify-center gap-1.5 shrink-0"
                >
                  {loading ? (
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Generate short link
                      <ArrowRight class="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Expiry Picker */}
            <div class="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                Expiration Date (Optional):
              </span>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                class="bg-black/40 border border-white/[0.06] text-slate-300 rounded-md px-2 py-0.5 focus:outline-none text-[10px] cursor-pointer"
              />
            </div>
          </form>

          {error && (
            <div class="mt-4 p-3 bg-red-950/20 border border-red-500/10 text-red-400 rounded-xl text-xs text-left font-mono">
              Error: {error}
            </div>
          )}

          {/* Results Output with actions */}
          <AnimatePresence>
            {shortenedResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                class="mt-6 p-4 bg-indigo-950/10 border border-indigo-500/20 rounded-xl space-y-4 text-left font-mono text-xs"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Short Link Generated</span>
                  {shortenedResult.expiresAt && (
                    <span class="text-[10px] text-yellow-500/80">Expires: {new Date(shortenedResult.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>

                <div class="flex items-center justify-between gap-3 bg-black/60 border border-white/[0.06] rounded-xl p-3">
                  <span class="text-white select-all font-semibold break-all text-sm">
                    {shortenedResult.shortUrl}
                  </span>
                  
                  <div class="flex items-center gap-1.5 shrink-0">
                    {/* Copy */}
                    <button
                      onClick={handleCopy}
                      class="p-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center"
                      title="Copy Link"
                    >
                      {copied ? <Check class="w-4 h-4 text-emerald-400" /> : <Copy class="w-4 h-4" />}
                    </button>
                    {/* QR Code */}
                    <button
                      onClick={() => setShowQr(!showQr)}
                      class={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                        showQr ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                      title="QR Code"
                    >
                      <QrCode class="w-4 h-4" />
                    </button>
                    {/* Analytics */}
                    {isAuthenticated && (
                      <button
                        onClick={() => navigate(`/analytics/${shortenedResult._id}`)}
                        class="p-2 bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                        title="View Analytics"
                      >
                        <ArrowUpRight class="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* QR Code Modal/Drawer */}
                {showQr && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    class="p-4 bg-black/60 border border-white/[0.06] rounded-xl flex flex-col items-center justify-center gap-3 text-center"
                  >
                    <div class="bg-white p-2.5 rounded-lg">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortenedResult.shortUrl)}`} 
                        alt="Short link QR code" 
                        class="w-36 h-36"
                      />
                    </div>
                    <span class="text-[10px] text-slate-500">Scan QR to visit shortened URL</span>
                  </motion.div>
                )}

                {!isAuthenticated && (
                  <div class="text-[10px] text-slate-500 border-t border-white/[0.04] pt-2">
                    💡 <Link to="/signup" class="text-indigo-400 hover:underline">Sign up</Link> to save this link permanently, customize expiration times, and unlock deep analytic reports.
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
          <h2 class="text-2xl font-semibold tracking-tight text-white font-sans sm:text-3xl">
            Reliable Infrastructure
          </h2>
          <p class="text-slate-500 font-light text-xs font-mono">
            Optimized for low-latency redirections and detailed request tracking.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap class="w-4 h-4 text-indigo-400" />,
              title: 'Fast Redirects',
              desc: '12ms average redirect latency. Redirection lookups bypass databases completely by querying RAM-based Redis instances.'
            },
            {
              icon: <BarChart3 class="w-4 h-4 text-blue-400" />,
              title: 'Analytics Engine',
              desc: 'Track clicks, browser useragents, devices, and countries asynchronously without slowing down your visitor\'s jump.'
            },
            {
              icon: <ShieldCheck class="w-4 h-4 text-emerald-400" />,
              title: 'Secure Links',
              desc: 'Enforce connection safety with input validation, password hashing, and customizable expiration configurations.'
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -2 }}
              class="saas-card bg-white/[0.015] border-white/[0.08] hover:border-white/[0.12] p-5 text-left flex flex-col justify-between"
            >
              <div class="w-9 h-9 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <div class="space-y-1">
                <h3 class="text-sm font-semibold text-white font-mono">{feat.title}</h3>
                <p class="text-slate-400 text-xs font-light leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
