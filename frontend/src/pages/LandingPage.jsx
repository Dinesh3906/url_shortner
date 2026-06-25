import React, { useState } from 'react';
import axios from 'axios';
import { Link2, Copy, Check, ArrowRight, Clock, QrCode, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
  
  const [originalUrl, setOriginalUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortenedResult, setShortenedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      return setError('Enter a URL first');
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
        setShortenedResult(response.data.data);
        setOriginalUrl('');
        setExpiresAt('');
        setCustomAlias('');
        setShowExpiry(false);
        setShowCustom(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shortenedResult) return;
    navigator.clipboard.writeText(shortenedResult.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!shortenedResult) return;
    if (navigator.share) {
      navigator.share({ title: 'ShortLink', url: shortenedResult.shortUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      class="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 font-sans"
    >
      {/* Hero — centered, simple */}
      <div class="text-center space-y-4 mb-10">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          Make your links shorter
        </h1>
        <p class="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Paste a long URL, get a short one. Track clicks, set expiry dates, or pick a custom name.
          Free, no sign-up needed.
        </p>
      </div>

      {/* Main shortener card */}
      <div class="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-sm">
        <form onSubmit={handleSubmit} class="space-y-4">
          {/* URL input row */}
          <div class="flex items-center gap-2 border border-zinc-200 bg-zinc-50/60 rounded-xl px-4 py-3 focus-within:border-zinc-300 transition-colors">
            <Link2 class="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Paste your link here..."
              value={originalUrl}
              onChange={(e) => {
                setOriginalUrl(e.target.value);
                setError('');
              }}
              class="bg-transparent border-0 p-0 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none w-full"
            />
            <button
              type="submit"
              disabled={loading}
              class="ml-2 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer active:scale-[0.97]"
            >
              {loading ? (
                <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Shorten'
              )}
            </button>
          </div>

          {/* Optional fields — expiry and custom name */}
          <div class="flex flex-wrap items-center gap-4 px-1">
            <div>
              {!showExpiry ? (
                <button
                  type="button"
                  onClick={() => setShowExpiry(true)}
                  class="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock class="w-3 h-3" />
                  Set expiry
                </button>
              ) : (
                <div class="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock class="w-3 h-3 text-zinc-400" />
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    class="bg-white border border-zinc-200 text-zinc-700 rounded-md px-2 py-0.5 focus:outline-none text-[11px] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowExpiry(false); setExpiresAt(''); }}
                    class="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div>
              {!showCustom ? (
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  class="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link2 class="w-3 h-3" />
                  Custom name
                </button>
              ) : (
                <div class="flex items-center gap-2 text-xs text-zinc-500">
                  <Link2 class="w-3 h-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="my-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    class="bg-white border border-zinc-200 text-zinc-700 rounded-md px-2 py-0.5 focus:outline-none text-[11px] placeholder-zinc-400 w-24"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowCustom(false); setCustomAlias(''); }}
                    class="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div class="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Result — only shown after actually shortening */}
        <AnimatePresence>
          {shortenedResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              class="mt-6 space-y-3"
            >
              <div class="border-t border-zinc-100 pt-5"></div>

              {/* Short URL output */}
              <div class="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 gap-3">
                <a
                  href={shortenedResult.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  class="text-sm font-medium text-zinc-900 truncate hover:underline"
                >
                  {shortenedResult.shortUrl}
                </a>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    class="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copied ? <Check class="w-4 h-4 text-emerald-500" /> : <Copy class="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    class={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      showQr
                        ? 'bg-zinc-200 text-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                    }`}
                    title="QR Code"
                  >
                    <QrCode class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    class="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Share"
                  >
                    <Share2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              {copied && (
                <p class="text-xs text-emerald-600 px-1">Copied to clipboard</p>
              )}

              {/* QR Code */}
              <AnimatePresence>
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    class="overflow-hidden"
                  >
                    <div class="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col items-center gap-2">
                      <div class="bg-white p-2 rounded-lg border border-zinc-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            shortenedResult.shortUrl
                          )}`}
                          alt="QR code"
                          class="w-28 h-28"
                        />
                      </div>
                      <span class="text-[11px] text-zinc-400">Scan to open the short link</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Meta info */}
              <div class="flex items-center gap-4 text-xs text-zinc-400 px-1">
                <span>Created {formatDate(shortenedResult.createdAt)}</span>
                {shortenedResult.expiresAt && (
                  <span>· Expires {formatDate(shortenedResult.expiresAt)}</span>
                )}
              </div>

              {/* Sign up nudge */}
              {!isAuthenticated && (
                <p class="text-xs text-zinc-400 px-1">
                  <Link to="/signup" class="text-zinc-600 hover:text-zinc-900 underline underline-offset-2">Sign up</Link> to
                  save links to your dashboard and see who clicks them.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* What you get — simple list, not a SaaS features grid */}
      <div class="mt-16 text-center">
        <h2 class="text-lg font-semibold text-zinc-800 mb-6">What you get</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div class="space-y-1.5">
            <h3 class="text-sm font-medium text-zinc-800">Click tracking</h3>
            <p class="text-xs text-zinc-500 leading-relaxed">
              See how many people clicked your link, what browser they used, and where they came from.
            </p>
          </div>
          <div class="space-y-1.5">
            <h3 class="text-sm font-medium text-zinc-800">Custom names</h3>
            <p class="text-xs text-zinc-500 leading-relaxed">
              Pick a custom name like <span class="text-zinc-700">/my-resume</span> instead of a random code.
            </p>
          </div>
          <div class="space-y-1.5">
            <h3 class="text-sm font-medium text-zinc-800">Expiry dates</h3>
            <p class="text-xs text-zinc-500 leading-relaxed">
              Links can expire after a set date. Good for limited-time offers or temporary shares.
            </p>
          </div>
        </div>
      </div>

      {/* CTA for non-authenticated */}
      {!isAuthenticated && (
        <div class="mt-14 text-center space-y-3">
          <p class="text-sm text-zinc-500">Want a dashboard to manage all your links?</p>
          <div class="flex items-center justify-center gap-3">
            <Link
              to="/signup"
              class="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              Create free account
              <ArrowRight class="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/login"
              class="px-5 py-2 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div class="mt-20 pt-6 border-t border-zinc-100 text-center">
        <p class="text-[11px] text-zinc-400">
          Built by <a href="https://github.com/Dinesh3906" target="_blank" rel="noreferrer" class="text-zinc-500 hover:text-zinc-700 underline underline-offset-2">Dinesh</a>
        </p>
      </div>
    </motion.div>
  );
};

export default LandingPage;
