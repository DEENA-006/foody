"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Mail, Phone, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import Toast from './Toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setToastMessage('Please enter a valid email address.');
      return;
    }
    setToastMessage('Thank you for subscribing to Foodiee Deals & Recipes! 🎉');
    setEmail('');
  };

  return (
    <footer className="bg-card border-t border-border text-foreground pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl font-black text-brand tracking-tight">Foodiee</span>
            </Link>
            <p className="text-foreground/70 text-xs leading-relaxed">
              Delivering gourmet happiness, one meal at a time. Over 300+ international recipes cooked fresh by local top chefs.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/70 hover:text-brand hover:border-brand/40 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/70 hover:text-brand hover:border-brand/40 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-foreground/70 hover:text-brand hover:border-brand/40 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 16 5h2V0h-3.808C10.592 0 9 1.592 9 4.715V8z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Quick Navigation</h3>
            <ul className="space-y-2.5 text-xs text-foreground/70">
              <li><Link href="/" className="hover:text-brand transition-colors">Home Showcase</Link></li>
              <li><Link href="/menu" className="hover:text-brand transition-colors">Full Food Menu</Link></li>
              <li><Link href="/favorites" className="hover:text-brand transition-colors">My Favorites</Link></li>
              <li><Link href="/orders" className="hover:text-brand transition-colors">Order Tracking</Link></li>
              <li><Link href="/#about" className="hover:text-brand transition-colors">About Our Kitchen</Link></li>
              <li><Link href="/#contact" className="hover:text-brand transition-colors">Help & Contact</Link></li>
            </ul>
          </div>
          
          {/* Col 3: Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Kitchen Contact</h3>
            <ul className="space-y-3 text-xs text-foreground/70">
              <li className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                <span>123 Food Street, Culinary District, FL 33101</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                <span>support@foodiee.com</span>
              </li>
            </ul>
          </div>
          
          {/* Col 4: Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2">VIP Food Club</h3>
            <p className="text-xs text-foreground/70 mb-4">
              Get exclusive $5 coupons & weekly chef specials delivered to your inbox.
            </p>
            <form className="space-y-2" onSubmit={handleSubscribe}>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3.5 py-2.5 w-full rounded-xl text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button 
                  type="submit"
                  className="bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl transition-all font-bold text-xs shadow-md shadow-brand/20 active:scale-95 flex-shrink-0"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Foodiee Delivery Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for food enthusiasts everywhere.
          </p>
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage('')}
      />
    </footer>
  );
}
