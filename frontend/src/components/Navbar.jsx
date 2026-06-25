import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, Menu, X, LogOut, LayoutDashboard, Terminal, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', private: true },
    { name: 'Analytics', path: '/dashboard', private: true, search: '?tab=analytics' }, // Point to dashboard with analytics tab or specific link
    { name: 'API', path: '#api-docs', private: false },
    { name: 'Docs', path: '#docs', private: false }
  ];

  return (
    <nav class="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05070d]/75 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          
          {/* Left: Brand Logo & Status Badge */}
          <div class="flex items-center gap-4">
            <Link to="/" class="flex items-center gap-2 group">
              <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white border border-indigo-400/30 group-hover:bg-indigo-500 transition-colors">
                <Link2 class="w-4.5 h-4.5 rotate-45" />
              </div>
              <span class="text-base font-semibold tracking-tight text-white font-mono">
                ShortLink
              </span>
            </Link>
            
            {/* Status Badge */}
            <span class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/5 border border-indigo-500/10 text-indigo-400/80 font-mono text-[9px] font-medium tracking-wide">
              <span class="w-1 h-1 rounded-full bg-indigo-400 animate-pulse"></span>
              URL Infrastructure
            </span>
          </div>

          {/* Middle: Navigation Links */}
          <div class="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              // Hide private links if not authenticated
              if (link.private && !isAuthenticated) return null;
              
              const linkPath = link.search ? `${link.path}${link.search}` : link.path;
              const isLinkActive = isActive(link.path);

              return (
                <Link
                  key={link.name}
                  to={linkPath}
                  onMouseEnter={() => setHoveredTab(link.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  class={`relative px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors ${
                    isLinkActive ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isLinkActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      class="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {hoveredTab === link.name && !isLinkActive && (
                    <motion.div
                      layoutId="hoverNavIndicator"
                      class="absolute inset-0 bg-white/[0.015] rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Authentication / Actions */}
          <div class="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div class="flex items-center gap-4">
                <span class="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {user?.username}
                </span>
                
                <Link to="/dashboard" class="saas-btn-primary !py-1.5 !px-3.5 !text-xs font-mono">
                  Console
                </Link>
                
                <button
                  onClick={handleLogout}
                  class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut class="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  class="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  class="saas-btn-primary !py-1.5 !px-3.5 !text-xs font-mono"
                >
                  Create Link
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div class="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              class="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X class="w-5 h-5" /> : <Menu class="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            class="md:hidden border-b border-white/[0.06] bg-[#05070d]/95 px-2 pt-2 pb-4 space-y-1"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              class={`block px-3 py-2 rounded-lg text-xs font-medium font-mono ${
                isActive('/') ? 'text-white bg-white/[0.04]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </Link>

            {navLinks.map((link) => {
              if (link.private && !isAuthenticated) return null;
              const linkPath = link.search ? `${link.path}${link.search}` : link.path;
              return (
                <Link
                  key={link.name}
                  to={linkPath}
                  onClick={() => setMobileMenuOpen(false)}
                  class={`block px-3 py-2 rounded-lg text-xs font-medium font-mono ${
                    isActive(link.path) ? 'text-white bg-white/[0.04]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div class="border-t border-white/[0.06] my-2 pt-2 px-3">
                <p class="text-slate-500 text-xs font-mono mb-3 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Signed in as <strong class="text-slate-300">{user?.username}</strong>
                </p>
                <div class="flex gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    class="flex-1 text-center py-2 bg-white/[0.02] border border-white/[0.08] text-slate-300 rounded-lg text-xs font-mono font-medium"
                  >
                    Console
                  </Link>
                  <button
                    onClick={handleLogout}
                    class="flex-1 py-2 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-xs font-mono font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div class="pt-2 border-t border-white/[0.06] space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  class="block w-full text-center py-2 border border-white/[0.08] text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  class="block w-full text-center py-2 saas-btn-primary text-xs font-mono font-medium"
                >
                  Create Link
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
