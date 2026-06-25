import React, { useState } from 'react';
import axios from 'axios';
import { 
  Link2, Copy, Check, Zap, BarChart3, Shield, ArrowRight, Clock, 
  QrCode, Share2, Globe 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/_/backend/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Input fields
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  
  // UI feedback & state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortenedResult, setShortenedResult] = useState(null);
  
  // Displayed Card contents (initialized to match the screenshot mockup)
  const [displayedShortUrl, setDisplayedShortUrl] = useState('short.link/a8f3Kp');
  const [displayedClicks, setDisplayedClicks] = useState('12,842');
  const [displayedCreated, setDisplayedCreated] = useState('May 12, 2025');
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
        expiresAt: expiresAt || null,
        customAlias: customAlias || null
      });

      if (response.data.success) {
        const resultData = response.data.data;
        setShortenedResult(resultData);
        
        // Dynamically update the visual card with the actual live shortened URL and info!
        setDisplayedShortUrl(resultData.shortUrl);
        setDisplayedClicks('0');
        setDisplayedCreated(formatDate(resultData.createdAt));
        
        setOriginalUrl('');
        setExpiresAt('');
        setCustomAlias('');
        setShowExpiry(false);
        setShowCustom(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL. Make sure it is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const urlToCopy = shortenedResult ? shortenedResult.shortUrl : 'https://short.link/a8f3Kp';
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const urlToShare = shortenedResult ? shortenedResult.shortUrl : 'https://short.link/a8f3Kp';
    if (navigator.share) {
      navigator.share({
        title: 'ShortLink',
        url: urlToShare
      }).catch(() => {
        // Handle cancel or dismissal
      });
    } else {
      navigator.clipboard.writeText(urlToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20 font-sans"
    >
      {/* Hero Section */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Product Slogan & CTAs */}
        <div class="lg:col-span-6 space-y-6 text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/5 border border-[#10b981]/15 text-[#10b981] font-mono text-[10px] uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span class="text-[#10b981]/90 font-semibold font-mono">URL Infrastructure</span>
            <span class="text-zinc-300">|</span>
            <span class="text-zinc-500 font-sans">Built for speed & scale</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.08]">
            Short links.<br />
            Real impact.
          </h1>

          <p class="text-sm sm:text-base text-zinc-600 max-w-lg leading-relaxed">
            ShortLink is the developer-friendly URL shortener trusted by thousands of teams to build, scale, and analyze links that drive results.
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link to="/dashboard" class="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#5f56f3] text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-[#4f46e5]/10">
                Go to Dashboard
                <ArrowRight class="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/signup" class="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#5f56f3] text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-[#4f46e5]/10">
                  Get started for free
                </Link>
                <Link to="/login" class="px-5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 font-semibold text-xs rounded-lg border border-zinc-200 transition-all">
                  View API docs
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Mockup Link Shortener Widget */}
        <div class="lg:col-span-6">
          <div class="saas-card shadow-lg p-6 sm:p-8 relative overflow-hidden">
            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="border border-zinc-200 bg-zinc-50 rounded-xl p-4 focus-within:border-zinc-350/85 transition-all space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5 grow min-w-0">
                    <Link2 class="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Paste your long URL"
                      value={originalUrl}
                      onChange={(e) => {
                        setOriginalUrl(e.target.value);
                        setError('');
                      }}
                      class="bg-transparent border-0 p-0 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:ring-0 w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    class="ml-3 px-5 py-2 bg-[#4f46e5] hover:bg-[#5f56f3] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-55 cursor-pointer shadow-md shadow-indigo-950/20 active:scale-[0.98]"
                  >
                    {loading ? (
                      <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Shorten
                        <ArrowRight class="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                <div class="text-[10px] text-zinc-500 font-mono select-all break-all px-0.5 leading-normal">
                  https://www.example.com/very/long/path?with=query&params=true
                </div>
              </div>

              {/* Collapsible Expiration Picker */}
              <div class="flex flex-wrap items-center gap-4 px-1">
                
                {/* Expiration Picker */}
                <div>
                  {!showExpiry ? (
                    <button
                      type="button"
                      onClick={() => setShowExpiry(true)}
                      class="text-[10px] text-zinc-500 hover:text-zinc-700 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                    >
                      <Clock class="w-3 h-3 text-zinc-400" />
                      Add expiration date
                    </button>
                  ) : (
                    <div class="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Clock class="w-3 h-3 text-zinc-400" />
                      <span>Expires:</span>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        class="bg-white border border-zinc-200 text-zinc-800 rounded-md px-2 py-0.5 focus:outline-none text-[9px] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowExpiry(false);
                          setExpiresAt('');
                        }}
                        class="text-zinc-500 hover:text-zinc-700 ml-1 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom Alias Picker */}
                <div>
                  {!showCustom ? (
                    <button
                      type="button"
                      onClick={() => setShowCustom(true)}
                      class="text-[10px] text-zinc-500 hover:text-zinc-700 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                    >
                      <Link2 class="w-3 h-3 text-zinc-400" />
                      Add custom name
                    </button>
                  ) : (
                    <div class="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Link2 class="w-3 h-3 text-zinc-400" />
                      <span>Custom Name:</span>
                      <input
                        type="text"
                        placeholder="my-alias"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        class="bg-white border border-zinc-200 text-zinc-800 rounded-md px-2 py-0.5 focus:outline-none text-[10px] placeholder-zinc-400 w-28"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustom(false);
                          setCustomAlias('');
                        }}
                        class="text-zinc-500 hover:text-zinc-700 ml-1 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </form>

            {error && (
              <div class="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs text-left font-mono">
                {error}
              </div>
            )}

            {/* Horizontal Separator */}
            <div class="border-t border-zinc-200/80 my-6"></div>

            {/* Output Display Container */}
            <div class="space-y-4 text-left">
              <div class="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Your short link
              </div>

              <div class="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-3 sm:p-4 gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-sm font-semibold text-zinc-800 truncate select-all font-mono">
                    {displayedShortUrl}
                  </span>
                  {copied && (
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
                      Copied!
                    </span>
                  )}
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    class="p-2 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 rounded-lg border border-zinc-200/80 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    class={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      showQr 
                        ? 'bg-zinc-100 border-zinc-300 text-zinc-900' 
                        : 'bg-white border-zinc-200/80 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                    }`}
                    title="QR Code"
                  >
                    <QrCode class="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleShare}
                    class="p-2 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 rounded-lg border border-zinc-200/80 transition-colors cursor-pointer"
                    title="Share link"
                  >
                    <Share2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded QR Code Display */}
              <AnimatePresence>
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    class="overflow-hidden"
                  >
                    <div class="mt-2 p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
                      <div class="bg-white p-2 rounded-lg border border-zinc-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            shortenedResult ? shortenedResult.shortUrl : 'https://short.link/a8f3Kp'
                          )}`}
                          alt="Short link QR code"
                          class="w-28 h-28"
                        />
                      </div>
                      <span class="text-[9px] text-zinc-500 font-mono">Scan QR image to resolve shortened URL</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats Row */}
              <div class="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Clicks</div>
                  <div class="text-sm font-bold text-zinc-800">{displayedClicks}</div>
                </div>
                <div>
                  <div class="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Created</div>
                  <div class="text-sm font-bold text-zinc-800">{displayedCreated}</div>
                </div>
              </div>

              {/* Dashboard Note for Anon Users */}
              {!isAuthenticated && !shortenedResult && (
                <div class="text-[10px] text-zinc-500 border-t border-zinc-200/80 pt-3">
                  Note: <Link to="/signup" class="text-zinc-600 hover:text-zinc-900 underline">Sign up</Link> to save this link permanently, customize links, and unlock deep traffic logs.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Feature Section: Redesigned Horizontal Card */}
      <div class="w-full bg-white border border-zinc-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 md:divide-x md:divide-zinc-200/50">
          
          {/* Feature 1 */}
          <div class="flex gap-4 md:px-4">
            <div class="w-8 h-8 rounded-lg bg-[#10b981]/5 border border-[#10b981]/15 flex items-center justify-center shrink-0 mt-0.5">
              <Zap class="w-4 h-4 text-[#10b981]" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-zinc-800 mb-1 font-sans">Blazing fast</h4>
              <p class="text-[11px] text-zinc-500 leading-normal">Sub-15ms redirects powered by edge caching.</p>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div class="flex gap-4 md:px-4">
            <div class="w-8 h-8 rounded-lg bg-[#4f46e5]/5 border border-[#4f46e5]/15 flex items-center justify-center shrink-0 mt-0.5">
              <Shield class="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-zinc-800 mb-1 font-sans">Reliable</h4>
              <p class="text-[11px] text-zinc-500 leading-normal">99.99% uptime with global infrastructure.</p>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div class="flex gap-4 md:px-4">
            <div class="w-8 h-8 rounded-lg bg-[#4f46e5]/5 border border-[#4f46e5]/15 flex items-center justify-center shrink-0 mt-0.5">
              <BarChart3 class="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-zinc-800 mb-1 font-sans">Insightful analytics</h4>
              <p class="text-[11px] text-zinc-500 leading-normal">Track clicks, locations, devices, and more.</p>
            </div>
          </div>
          
          {/* Feature 4 */}
          <div class="flex gap-4 md:px-4">
            <div class="w-8 h-8 rounded-lg bg-[#4f46e5]/5 border border-[#4f46e5]/15 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold text-[#4f46e5]">
              &lt;/&gt;
            </div>
            <div>
              <h4 class="text-xs font-bold text-zinc-800 mb-1 font-sans">Developer first</h4>
              <p class="text-[11px] text-zinc-500 leading-normal">Simple API, SDKs, and webhooks.</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Built to handle scale Section */}
      <div class="space-y-8 pt-4">
        <div class="text-center space-y-2">
          <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
            Trusted by Developers
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Built to handle scale
          </h2>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1 */}
          <div class="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm hover:border-zinc-300 transition-all">
            <div class="w-8 h-8 rounded-lg bg-[#4f46e5]/5 border border-[#4f46e5]/15 flex items-center justify-center">
              <Link2 class="w-4 h-4 text-[#4f46e5] rotate-45" />
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">+2.4B</div>
              <div class="text-[11px] text-zinc-500 font-sans">Links created</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div class="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm hover:border-zinc-300 transition-all">
            <div class="w-8 h-8 rounded-lg bg-[#10b981]/5 border border-[#10b981]/15 flex items-center justify-center">
              <BarChart3 class="w-4 h-4 text-[#10b981]" />
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">+5.6B</div>
              <div class="text-[11px] text-zinc-500 font-sans">Clicks tracked</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div class="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm hover:border-zinc-300 transition-all">
            <div class="w-8 h-8 rounded-lg bg-blue-500/5 border border-blue-500/15 flex items-center justify-center">
              <Globe class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">180+</div>
              <div class="text-[11px] text-zinc-500 font-sans">Countries served</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div class="bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm hover:border-zinc-300 transition-all">
            <div class="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-center justify-center">
              <Clock class="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">&lt;15ms</div>
              <div class="text-[11px] text-zinc-500 font-sans">Avg. redirect time</div>
            </div>
          </div>

        </div>
      </div>
      
    </motion.div>
  );
};

export default LandingPage;
