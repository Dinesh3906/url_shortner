import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on edit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrUsername || !formData.password) {
      return setError('Please enter all credentials');
    }

    setLoading(true);
    setError('');

    const result = await login(formData.emailOrUsername, formData.password);
    
    setLoading(false);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        class="max-w-md w-full space-y-8 text-left"
      >
        {/* Header */}
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight text-white font-sans">
            Welcome back
          </h2>
          <p class="text-xs text-zinc-500 font-mono">
            Sign in to access your URL console
          </p>
        </div>

        {/* Card */}
        <div class="saas-card bg-[#121214] border-zinc-800 p-8 shadow-xl">

          {error && (
            <motion.div 
              initial={{ x: -4, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              class="mb-6 p-3 bg-rose-950/10 border border-rose-500/10 rounded flex items-start gap-2 text-rose-450 font-mono text-[11px]"
            >
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form class="space-y-5" onSubmit={handleSubmit}>
            {/* Username/Email Input */}
            <div class="space-y-1.5 font-mono text-xs">
              <label htmlFor="emailOrUsername" class="font-semibold text-zinc-400 uppercase tracking-wide">
                Email or Username
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-600">
                  <Mail class="w-4 h-4" />
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  required
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  class="w-full saas-input pl-10 py-2.5!"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div class="space-y-1.5 font-mono text-xs">
              <label htmlFor="password" class="font-semibold text-zinc-400 uppercase tracking-wide">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-600">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  class="w-full saas-input pl-10 py-2.5!"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              class="w-full saas-btn-primary py-3 flex items-center justify-center gap-2 group text-xs font-semibold font-mono mt-2"
            >
              {loading ? (
                <div class="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn class="w-4 h-4" />
                  Authenticate
                  <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div class="mt-8 pt-6 border-t border-zinc-800/80 text-center text-xs text-zinc-500 font-mono">
            New developer?{' '}
            <Link to="/signup" class="text-zinc-350 hover:text-white font-semibold transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
