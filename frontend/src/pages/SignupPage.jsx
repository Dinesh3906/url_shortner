import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (username.length < 3) {
      return setError('Username must be at least 3 characters long');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    const result = await register(username, email, password);
    setLoading(false);

    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || 'Registration failed. Please try again.');
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
            Create account
          </h2>
          <p class="text-xs text-zinc-500 font-mono">
            Get started with reliable URL infrastructure
          </p>
        </div>

        {/* Card */}
        <div class="saas-card bg-[#121214] border-zinc-800 p-8 shadow-xl">

          {error && (
            <motion.div 
              initial={{ x: -4, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              class="mb-5 p-3 bg-rose-950/10 border border-rose-500/10 rounded flex items-start gap-2 text-rose-450 font-mono text-[11px]"
            >
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form class="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div class="space-y-1.5 font-mono text-xs">
              <label htmlFor="username" class="font-semibold text-zinc-400 uppercase tracking-wide">
                Username
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-650">
                  <User class="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  class="w-full saas-input pl-10 !py-2.5"
                  placeholder="johndoe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div class="space-y-1.5 font-mono text-xs">
              <label htmlFor="email" class="font-semibold text-zinc-400 uppercase tracking-wide">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-650">
                  <Mail class="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  class="w-full saas-input pl-10 !py-2.5"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div class="space-y-1.5 font-mono text-xs">
              <label htmlFor="password" class="font-semibold text-zinc-400 uppercase tracking-wide">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-650">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  class="w-full saas-input pl-10 !py-2.5"
                  placeholder="•••••••• (Min 6 chars)"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div class="space-y-1.5 font-mono text-xs">
              <label htmlFor="confirmPassword" class="font-semibold text-zinc-400 uppercase tracking-wide">
                Confirm Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-650">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  class="w-full saas-input pl-10 !py-2.5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              class="w-full saas-btn-primary py-3 flex items-center justify-center gap-2 group text-xs font-semibold font-mono mt-4"
            >
              {loading ? (
                <div class="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus class="w-4 h-4" />
                  Register Workspace
                  <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div class="mt-8 pt-6 border-t border-zinc-800/80 text-center text-xs text-zinc-500 font-mono">
            Already have an account?{' '}
            <Link to="/login" class="text-zinc-350 hover:text-white font-semibold transition-colors">
              Sign in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
