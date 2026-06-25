import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
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
    <nav class="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link to="/" class="flex items-center gap-2 group">
            <div class="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white group-hover:bg-zinc-800 transition-colors">
              <Link2 class="w-3.5 h-3.5 rotate-45" />
            </div>
            <span class="text-sm font-semibold text-zinc-900">ShortLink</span>
          </Link>

          {/* Right side */}
          <div class="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  class={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Dashboard
                </Link>
                <span class="text-xs text-zinc-400 px-2">{user?.username}</span>
                <button
                  onClick={handleLogout}
                  class="p-1.5 text-zinc-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut class="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  class="text-zinc-500 hover:text-zinc-900 px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  class="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div class="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              class="p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X class="w-5 h-5" /> : <Menu class="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            class="md:hidden border-t border-zinc-100 bg-white px-4 py-3 space-y-1"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              class={`block px-3 py-2 rounded-md text-xs font-medium ${
                isActive('/') ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  class={`block px-3 py-2 rounded-md text-xs font-medium ${
                    isActive('/dashboard') ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500'
                  }`}
                >
                  Dashboard
                </Link>
                <div class="border-t border-zinc-100 my-2 pt-2 px-3">
                  <p class="text-zinc-400 text-xs mb-2">
                    Signed in as <strong class="text-zinc-700">{user?.username}</strong>
                  </p>
                  <button
                    onClick={handleLogout}
                    class="w-full py-2 text-red-500 text-xs font-medium cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div class="pt-2 border-t border-zinc-100 space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  class="block w-full text-center py-2 text-zinc-600 rounded-md text-xs font-medium border border-zinc-200 hover:bg-zinc-50"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  class="block w-full text-center py-2 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
