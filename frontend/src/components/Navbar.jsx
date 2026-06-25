import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Link2, Menu, X, LogOut, ChevronDown } from 'lucide-react';
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

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', private: true },
        { name: 'Analytics', path: '/dashboard', private: true, search: '?tab=analytics' }
      ]
    : [
        { name: 'Product', path: '#product', private: false, hasDropdown: true },
        { name: 'Solutions', path: '#solutions', private: false, hasDropdown: true },
        { name: 'Developers', path: '#developers', private: false, hasDropdown: true },
        { name: 'Pricing', path: '#pricing', private: false }
      ];

  return (
    <nav class="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#0b0e17]/85 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          
          {/* Left: Brand Logo & Status Badge */}
          <div class="flex items-center gap-4">
            <Link to="/" class="flex items-center gap-2 group">
              <div class="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-200 border border-zinc-800 group-hover:bg-zinc-850 transition-colors">
                <Link2 class="w-4 h-4 rotate-45" />
              </div>
              <span class="text-sm font-bold tracking-tight text-white font-sans">
                ShortLink
              </span>
            </Link>
            
            {/* Status Badge */}
            <span class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] font-medium tracking-wide">
              <span class="w-1 h-1 rounded-full bg-[#10b981]"></span>
              API Infrastructure
            </span>
          </div>

          {/* Middle: Navigation Links */}
          <div class="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              if (link.private && !isAuthenticated) return null;
              
              const linkPath = link.search ? `${link.path}${link.search}` : link.path;
              const isLinkActive = isActive(link.path);

              return (
                <Link
                  key={link.name}
                  to={linkPath}
                  onMouseEnter={() => setHoveredTab(link.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  class={`relative px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors flex items-center gap-1 group ${
                    isLinkActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isLinkActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      class="absolute inset-0 bg-zinc-900 border border-zinc-850 rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {hoveredTab === link.name && !isLinkActive && (
                    <motion.div
                      layoutId="hoverNavIndicator"
                      class="absolute inset-0 bg-zinc-900/50 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  <span class="relative z-10">{link.name}</span>
                  {link.hasDropdown && (
                    <ChevronDown class="w-3 h-3 text-zinc-550 transition-transform group-hover:translate-y-[0.5px] relative z-10 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Authentication / Actions */}
          <div class="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div class="flex items-center gap-4">
                <span class="text-[11px] text-zinc-450 font-sans flex items-center gap-1.5 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  {user?.username}
                </span>
                
                <Link to="/dashboard" class="px-4 py-1.5 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs rounded-lg transition-all font-sans active:scale-[0.98]">
                  Console
                </Link>
                
                <button
                  onClick={handleLogout}
                  class="p-1.5 text-zinc-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut class="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  class="text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  class="px-4 py-1.5 bg-[#4f46e5] hover:bg-[#5f56f3] text-white font-semibold text-xs font-sans rounded-full transition-all duration-150 active:scale-[0.98] shadow-sm shadow-[#4f46e5]/10"
                >
                  Create account
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div class="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              class="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] focus:outline-none transition-colors cursor-pointer"
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
            class="md:hidden border-b border-zinc-800 bg-[#0b0e17]/98 px-2 pt-2 pb-4 space-y-1"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              class={`block px-3 py-2 rounded-lg text-xs font-medium font-sans ${
                isActive('/') ? 'text-white bg-zinc-900' : 'text-zinc-450 hover:text-white'
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
                  class={`block px-3 py-2 rounded-lg text-xs font-medium font-sans ${
                    isActive(link.path) ? 'text-white bg-zinc-900' : 'text-zinc-450 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div class="border-t border-zinc-850 my-2 pt-2 px-3">
                <p class="text-zinc-500 text-xs font-sans mb-3 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                  Signed in as <strong class="text-zinc-300 font-medium">{user?.username}</strong>
                </p>
                <div class="flex gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    class="flex-1 text-center py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-sans font-medium"
                  >
                    Console
                  </Link>
                  <button
                    onClick={handleLogout}
                    class="flex-1 py-2 bg-rose-950/20 border border-rose-900/30 text-rose-450 rounded-lg text-xs font-sans font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div class="pt-2 border-t border-zinc-850 space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  class="block w-full text-center py-2 border border-zinc-800 text-zinc-450 hover:text-white rounded-lg text-xs font-sans font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  class="block w-full text-center py-2 bg-[#4f46e5] text-white hover:bg-[#5f56f3] rounded-lg text-xs font-sans font-semibold"
                >
                  Create account
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
