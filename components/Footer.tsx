"use client";

import Link from 'next/link';
import { Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-2xl font-bold text-brand">Foodiee</span>
            <p className="text-gray-400 text-sm">
              Delivering happiness, one meal at a time. The best food in town is just a click away.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Mail className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-brand transition-colors"><Phone className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li><Link href="/menu" className="hover:text-brand transition-colors">Menu</Link></li>
              <li><Link href="/about" className="hover:text-brand transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-brand transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>123 Food Street, City, Country</li>
              <li>+1 234 567 8900</li>
              <li>hello@foodiee.com</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe for offers and updates!</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full rounded-l-md text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button 
                type="submit"
                className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-r-md transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Foodiee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
