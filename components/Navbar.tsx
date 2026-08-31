"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Search, LogOut, Settings, Heart, Sun, Moon, ShoppingBag, Shield } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('home');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update active link based on pathname and scroll
  useEffect(() => {
    if (pathname === '/menu') {
      setActiveLink('menu');
      return;
    }

    const handleScroll = () => {
      if (pathname !== '/') return;
      
      const sections = ['home', 'about', 'contact'];
      const scrollPos = window.scrollY + 200; // offset for earlier activation
      
      // Default to home if at the very top
      if (window.scrollY < 100) {
        setActiveLink('home');
        return;
      }
      
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveLink(sec);
            break;
          }
        }
      }
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    setMounted(true);
    // Restore dark mode preference
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden">
                <Image src="/logo.png" alt="Foodiee Logo" fill className="object-cover" sizes="40px" priority />
              </div>
              <span className="text-2xl font-black tracking-tighter text-brand hidden sm:block">Foodiee</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'home' ? 'border-b-2 border-brand' : ''}`}>Home</Link>
            <Link href="/menu" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'menu' ? 'border-b-2 border-brand' : ''}`}>Menu</Link>
            <Link href="/#about" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'about' ? 'border-b-2 border-brand' : ''}`}>About</Link>
            <Link href="/#contact" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'contact' ? 'border-b-2 border-brand' : ''}`}>Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center relative">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    router.push(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }}
                className="pl-10 pr-9 py-2 bg-card border border-border rounded-full text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand w-48 transition-all focus:w-64"
              />
              <Search className="h-4 w-4 absolute left-3 text-gray-400 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-foreground/40 hover:text-foreground hover:bg-brand/10 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          {session ? (
            <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-foreground hover:text-brand transition-colors hidden md:block p-2"
                  aria-label="User Account Menu"
                >
                  <User className="h-6 w-6" />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                      <p className="text-xs text-foreground/70 truncate">{session.user?.email}</p>
                    </div>
                    <Link 
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand font-semibold hover:bg-brand/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-brand" /> Admin Panel
                    </Link>
                    <Link 
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>
                    <Link 
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-foreground hover:text-brand transition-colors hidden md:flex items-center gap-2 p-2">
                <span className="text-sm font-medium">Log in</span>
                <User className="h-6 w-6" />
              </Link>
            )}

            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-foreground/70 hover:text-brand hover:bg-brand/10 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* Favorites */}
            <Link href="/favorites" className="text-foreground/70 hover:text-brand transition-colors hidden md:block p-2" aria-label="Favorites">
              <Heart className="h-6 w-6" />
            </Link>

            <Link href="/cart" className="text-foreground hover:text-brand transition-colors relative p-2" aria-label="View Shopping Cart">
              <ShoppingCart className="h-6 w-6" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 bg-brand text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            <button
              className="text-foreground md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-4 py-6 space-y-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchTerm.trim()) {
                  router.push(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
                  setMobileMenuOpen(false);
                }
              }}
              className="relative mb-4"
            >
              <input
                type="text"
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground hover:bg-brand/10 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <Link href="/" className="block py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors">Home</Link>
            <Link href="/menu" className="block py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors">Menu</Link>
            <Link href="/#about" className="block py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors">About</Link>
            <Link href="/#contact" className="block py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors">Contact</Link>
            <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors">
              <Heart className="w-4 h-4" /> Favorites
            </Link>

            {/* Dark mode toggle in mobile drawer */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-2 py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <div className="border-t border-border mt-4 pt-4">
              {session ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-semibold">{session.user?.name}</p>
                    <p className="text-xs text-foreground/60">{session.user?.email}</p>
                  </div>
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 rounded-xl text-brand font-semibold hover:bg-brand/10 transition-colors">
                    <Shield className="w-4 h-4 text-brand" /> Admin Panel
                  </Link>
                  <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-brand/10 hover:text-brand transition-colors">
                    <ShoppingBag className="w-4 h-4" /> My Orders
                  </Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-brand/10 hover:text-brand transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 py-3 px-4 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-3 px-4 rounded-xl font-medium hover:bg-brand/10 hover:text-brand transition-colors">
                  <User className="h-5 w-5" /> Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
