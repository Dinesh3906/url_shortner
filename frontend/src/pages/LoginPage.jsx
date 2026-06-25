import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        {/* Header */}
        <div class="text-center">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p class="mt-2.5 text-sm text-slate-400 font-light">
            Sign in to manage your shortened links and view analytics
          </p>
        </div>

        {/* Card */}
        <div class="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-slate-800/80">
          {/* Subtle top decoration line */}
          <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent"></div>

          {error && (
            <div class="mb-6 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-shake">
              <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form class="space-y-6" onSubmit={handleSubmit}>
            {/* Username/Email Input */}
            <div class="space-y-2">
              <label htmlFor="emailOrUsername" class="text-sm font-semibold text-slate-300">
                Email Address or Username
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail class="w-5 h-5" />
                </div>
                <input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  required
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  class="w-full glass-input pl-11"
                  placeholder="name@example.com or username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label htmlFor="password" class="text-sm font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock class="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  class="w-full glass-input pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              class="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group text-base font-semibold"
            >
              {loading ? (
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn class="w-5 h-5" />
                  Sign In
                  <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div class="mt-8 pt-6 border-t border-slate-800/60 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
