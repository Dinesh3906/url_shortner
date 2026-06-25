import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        {/* Header */}
        <div class="text-center">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Create Account
          </h2>
          <p class="mt-2.5 text-sm text-slate-400 font-light">
            Start shortening links and tracking deep click analytics today
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

          <form class="space-y-5" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div class="space-y-1.5">
              <label htmlFor="username" class="text-sm font-semibold text-slate-300">
                Username
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User class="w-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  class="w-full glass-input pl-11"
                  placeholder="johndoe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div class="space-y-1.5">
              <label htmlFor="email" class="text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail class="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  class="w-full glass-input pl-11"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div class="space-y-1.5">
              <label htmlFor="password" class="text-sm font-semibold text-slate-300">
                Password
              </label>
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
                  placeholder="•••••••• (Min 6 chars)"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div class="space-y-1.5">
              <label htmlFor="confirmPassword" class="text-sm font-semibold text-slate-300">
                Confirm Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock class="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
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
              class="w-full btn-primary py-3.5 flex items-center justify-center gap-2 group text-base font-semibold mt-2"
            >
              {loading ? (
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus class="w-5 h-5" />
                  Sign Up
                  <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div class="mt-8 pt-6 border-t border-slate-800/60 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
