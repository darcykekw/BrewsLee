'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { IconBrandFacebook as Facebook, IconBrandInstagram as Instagram, IconBrandTwitter as Twitter, IconBrandGithub as Github } from '@tabler/icons-react';
import ScrollAnimation from '@/components/ui/ScrollAnimation';

export default function FooterGlow() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative z-10 w-full overflow-hidden pt-16 pb-8 bg-[#4B2E2B]">
      <style jsx global>{`
        .coffee-glass {
          backdrop-filter: blur(6px) saturate(160%);
          background: radial-gradient(circle, #C0855218 0%, #8C5A3C12 60%, #4B2E2B 100%);
          border: 1px solid #C0855230;
          border-radius: 20px;
          display: flex;
          transition: all 0.3s;
        }
      `}</style>
      
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2 select-none">
        <div 
          className="absolute -top-32 left-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{ background: '#C08552', opacity: 0.15 }}
        ></div>
        <div 
          className="absolute right-1/4 -bottom-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: '#C08552', opacity: 0.15 }}
        ></div>
      </div>
      
      <div className="coffee-glass relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between md:gap-12">
        {/* LEFT COLUMN - Brand */}
        <div className="flex flex-col gap-4 md:w-1/3">
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="Brews Lee" className="h-9 w-9 rounded-full" />
            <span className="text-xl font-bold text-[#FFF8F0]">Brews Lee</span>
          </div>
          <p className="text-[#FFF8F0]/60 text-sm leading-relaxed">
            Freshly brewed coffee and snacks, delivered straight to your door.
            Order online and enjoy your favorite drinks without leaving home.
          </p>
          <div className="mt-2 flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#C08552] hover:text-[#FFF8F0] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#C08552] hover:text-[#FFF8F0] transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#C08552] hover:text-[#FFF8F0] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#C08552] hover:text-[#FFF8F0] transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN - Navigation */}
        <div className="flex w-full flex-wrap gap-8 sm:justify-between md:w-2/3 md:justify-end md:gap-16">
          {/* NAVIGATE */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C08552]">
              Navigate
            </span>
            <div className="flex flex-col gap-2 text-sm text-[#FFF8F0]/70">
              <a href="#hero" className="hover:text-[#C08552] transition-colors">Home</a>
              <Link href="/menu" className="hover:text-[#C08552] transition-colors">Menu</Link>
              <a href="#pricing" className="hover:text-[#C08552] transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-[#C08552] transition-colors">Contact</a>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C08552]">
              Account
            </span>
            <div className="flex flex-col gap-2 text-sm text-[#FFF8F0]/70">
              <Link href="/login" className="hover:text-[#C08552] transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-[#C08552] transition-colors">Register</Link>
              <Link href="/profile" className="hover:text-[#C08552] transition-colors">My Profile</Link>
              <Link href="/profile" className="hover:text-[#C08552] transition-colors">Order History</Link>
            </div>
          </div>

          {/* CONTACT US */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C08552]">
              Contact Us
            </span>
            <div className="flex flex-col gap-3 text-sm text-[#FFF8F0]/60">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#C08552]" />
                <span>brewslee@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#C08552]" />
                <span>+63 XXX XXX XXXX</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-[#C08552] shrink-0 mt-0.5" />
                <span>Your City, Your Province, Philippines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT BAR */}
      <div className="mx-auto mt-12 max-w-6xl px-6">
        <div className="border-t border-[#C08552]/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-[#FFF8F0]/30">All rights reserved.</span>
          <span className="text-[#FFF8F0]/30">&copy; {year} Brews Lee</span>
        </div>
      </div>
    </footer>
  );
}
