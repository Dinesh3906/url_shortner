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
      className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 font-sans"
    >
      {/* Hero — centered, simple */}
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          Make your links shorter
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Paste a long URL, get a short one. Track clicks, set expiry dates, or pick a custom name.
          Free, no sign-up needed.
        </p>
      </div>

      {/* Main shortener card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL input row */}
          <div className="flex items-center gap-2 border border-zinc-200 bg-zinc-50/60 rounded-xl px-4 py-3 focus-within:border-zinc-300 transition-colors">
            <Link2 className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Paste your link here..."
              value={originalUrl}
              onChange={(e) => {
                setOriginalUrl(e.target.value);
                setError('');
              }}
              className="bg-transparent border-0 p-0 text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none w-full"
            />
            <button
              type="submit"
              disabled={loading}
              className="ml-2 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer active:scale-[0.97]"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Shorten'
              )}
            </button>
          </div>

          {/* Optional fields — expiry and custom name */}
          <div className="flex flex-wrap items-center gap-4 px-1">
            <div>
              {!showExpiry ? (
                <button
                  type="button"
                  onClick={() => setShowExpiry(true)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  Set expiry
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-white border border-zinc-200 text-zinc-700 rounded-md px-2 py-0.5 focus:outline-none text-[11px] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowExpiry(false); setExpiresAt(''); }}
                    className="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
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
                  className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  Custom name
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Link2 className="w-3 h-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="my-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    className="bg-white border border-zinc-200 text-zinc-700 rounded-md px-2 py-0.5 focus:outline-none text-[11px] placeholder-zinc-400 w-24"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowCustom(false); setCustomAlias(''); }}
                    className="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
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
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
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
              className="mt-6 space-y-3"
            >
              <div className="border-t border-zinc-100 pt-5"></div>

              {/* Short URL output */}
              <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 gap-3">
                <a
                  href={shortenedResult.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-zinc-900 truncate hover:underline"
                >
                  {shortenedResult.shortUrl}
                </a>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      showQr
                        ? 'bg-zinc-200 text-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                    }`}
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {copied && (
                <p className="text-xs text-emerald-600 px-1">Copied to clipboard</p>
              )}

              {/* QR Code */}
              <AnimatePresence>
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col items-center gap-2">
                      <div className="bg-white p-2 rounded-lg border border-zinc-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            shortenedResult.shortUrl
                          )}`}
                          alt="QR code"
                          className="w-28 h-28"
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400">Scan to open the short link</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs text-zinc-400 px-1">
                <span>Created {formatDate(shortenedResult.createdAt)}</span>
                {shortenedResult.expiresAt && (
                  <span>· Expires {formatDate(shortenedResult.expiresAt)}</span>
                )}
              </div>

              {/* Sign up nudge */}
              {!isAuthenticated && (
                <p className="text-xs text-zinc-400 px-1">
                  <Link to="/signup" className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2">Sign up</Link> to
                  save links to your dashboard and see who clicks them.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* What you get — simple list, not a SaaS features grid */}
      <div className="mt-16 text-center">
        <h2 className="text-lg font-semibold text-zinc-800 mb-6">What you get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-zinc-800">Click tracking</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              See how many people clicked your link, what browser they used, and where they came from.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-zinc-800">Custom names</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pick a custom name like <span className="text-zinc-700">/my-resume</span> instead of a random code.
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-medium text-zinc-800">Expiry dates</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Links can expire after a set date. Good for limited-time offers or temporary shares.
            </p>
          </div>
        </div>
      </div>

      {/* CTA for non-authenticated */}
      {!isAuthenticated && (
        <div className="mt-14 text-center space-y-3">
          <p className="text-sm text-zinc-500">Want a dashboard to manage all your links?</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              Create free account
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 text-zinc-600 hover:text-zinc-900 text-xs font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-20 pt-6 border-t border-zinc-100 text-center">
        <p className="text-[11px] text-zinc-400">
          Built by <a href="https://github.com/Dinesh3906" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-700 underline underline-offset-2">Dinesh</a>
        </p>
      </div>
    </motion.div>
  );
};

export default LandingPage;
