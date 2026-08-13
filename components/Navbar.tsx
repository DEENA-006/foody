"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, LogOut, Settings } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [activeLink, setActiveLink] = useState('home');

  // Scroll spy to update active link based on section IDs
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'menu', 'about', 'contact'];
      const scrollPos = window.scrollY + 200; // offset for earlier activation
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden">
                <Image src="/logo.png" alt="Foodiee Logo" fill className="object-cover" priority />
              </div>
              <span className="text-2xl font-black tracking-tighter text-brand hidden sm:block">Foodiee</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'home' ? 'border-b-2 border-brand' : ''}`}>Home</Link>
            <Link href="/menu" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'menu' ? 'border-b-2 border-brand' : ''}`}>Menu</Link>
            <Link href="#about" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'about' ? 'border-b-2 border-brand' : ''}`}>About</Link>
            <Link href="#contact" className={`text-foreground/80 hover:text-brand transition-colors font-medium ${activeLink === 'contact' ? 'border-b-2 border-brand' : ''}`}>Contact</Link>
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
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand w-48 transition-all focus:w-64"
              />
              <Search className="h-4 w-4 absolute left-3 text-gray-400" />
            </div>
            
            <Link href="/cart" className="text-foreground hover:text-brand transition-colors relative p-2">
              <ShoppingCart className="h-6 w-6" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 bg-brand text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            {session ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-foreground hover:text-brand transition-colors hidden md:block p-2"
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
            <button className="text-foreground md:hidden p-2">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
