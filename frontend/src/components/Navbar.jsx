import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = ({ onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav class="sticky top-0 z-50 glass-panel border-x-0 border-t-0 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo */}
          <div class="flex items-center">
            <Link to="/" class="flex items-center gap-2 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Link2 class="w-5 h-5 rotate-45" />
              </div>
              <span class="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                ShortLink
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div class="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-indigo-400 bg-indigo-500/5 border border-indigo-500/10' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  class={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/dashboard')
                      ? 'text-indigo-400 bg-indigo-500/5 border border-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <LayoutDashboard class="w-4 h-4" />
                  Dashboard
                </Link>
                <div class="h-4 w-px bg-slate-800 mx-2"></div>
                <div class="flex items-center gap-3 pl-2">
                  <span class="text-slate-400 text-sm flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150 flex items-center gap-1 text-sm font-medium"
                  >
                    <LogOut class="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  class="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  class="ml-2 btn-primary !py-2 !px-4 !text-sm flex items-center gap-1"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div class="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              class="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X class="w-6 h-6" /> : <Menu class="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div class="md:hidden glass-panel border-x-0 border-t-0 border-b border-slate-800 bg-slate-950 px-2 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            class={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
              isActive('/') 
                ? 'text-indigo-400 bg-indigo-500/5' 
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                class={`px-3 py-2.5 rounded-lg text-base font-medium flex items-center gap-2 transition-colors ${
                  isActive('/dashboard')
                    ? 'text-indigo-400 bg-indigo-500/5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard class="w-5 h-5" />
                Dashboard
              </Link>
              <div class="border-t border-slate-800 my-2 px-3 pt-2">
                <p class="text-slate-400 text-sm mb-3 flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Signed in as <strong class="text-slate-200">{user?.username}</strong>
                </p>
                <button
                  onClick={handleLogout}
                  class="w-full py-2.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 hover:text-red-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <LogOut class="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div class="pt-2 border-t border-slate-800 space-y-2 px-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                class="block w-full text-center py-2.5 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                class="block w-full text-center py-2.5 btn-primary text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
