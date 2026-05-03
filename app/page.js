"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { StarsBackground } from '@/components/ui/stars';
import HeroText from '@/components/ui/hero-shutter-text';
import { BlurFade } from '@/components/ui/blur-fade';
import TextMarquee from '@/components/ui/text-marque';
import ScrollAnimation from '@/components/ui/ScrollAnimation';
import GradientButton from '@/components/ui/GradientButton';
import { useState, useEffect } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Footer from "@/components/layout/Footer";
import MenuScrollGallery from '@/components/menu/MenuScrollGallery';

export default function LandingPage() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const navItems = [
    { name: "Home", link: "#hero" },
    { name: "Gallery", link: "#gallery" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <div id="hero" style={{ position: "relative", width: "100vw", minHeight: "100vh", overflowX: "clip", margin: 0, padding: 0 }}>
      <Navbar>
        {/* Desktop */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <NavbarButton href="/profile" variant="secondary">{session.user.name}</NavbarButton>
                <NavbarButton href="/menu" variant="primary">Go to Menu</NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton href="/login" variant="secondary">Log In</NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#F5F0E8] hover:text-[#C8963E] transition-colors"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4 pt-4">
              {session ? (
                <>
                  <NavbarButton
                    href="/profile"
                    variant="secondary"
                    className="w-full text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {session.user.name}
                  </NavbarButton>
                  <NavbarButton
                    href="/menu"
                    variant="primary"
                    className="w-full text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Go to Menu
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    href="/login"
                    variant="secondary"
                    className="w-full text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <div className="relative w-full">
        <section
          className="relative w-full overflow-hidden sticky top-0 h-screen"
          style={{ zIndex: 0 }}
        >
          {/* Background Image for Home */}
          <div className="absolute inset-0 z-0">
            <img
              src="/menu/BrewsLeeBackgroundForHome.jpg"
              alt="Home Background"
              className="w-full h-full object-cover object-center"
              style={{ filter: "brightness(0.60)" }}
            />
          </div>

          {/* Hero text content */}
          <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center text-center gap-5 px-4 pt-16">
            {/* Main heading — use your coffee shop name */}
            <div className="my-2 w-full max-w-full overflow-hidden">
              <HeroText text="BREWS LEE" />
            </div>

            {/* Tagline */}
            <BlurFade delay={0.4} inView>
              <p
                className="text-lg md:text-xl max-w-2xl font-medium tracking-wide mt-2"
                style={{ color: '#FFF8F0', opacity: 0.9 }}
              >
                Brewed with Love, Served with Passion!
              </p>
            </BlurFade>

            {/* CTA Buttons */}
            <div className="flex gap-4 mt-2 flex-wrap justify-center">
              {session ? (
                <GradientButton href="/menu" variant="primary">
                  Go to Menu
                </GradientButton>
              ) : (
                <>
                  <GradientButton href="/login" variant="primary">
                    Order Now
                  </GradientButton>
                </>
              )}
            </div>
          </div>



        </section>



        <section
          id="gallery"
          className="relative w-full pb-24 pt-12 overflow-hidden"
          style={{ backgroundColor: '#4B2E2B', zIndex: 10, boxShadow: '0 -20px 50px rgba(0,0,0,0.5)' }}
        >
          {/* StarsBackground animated background — absolutely positioned, fills the section */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 0 }}
          >
            <StarsBackground
              starColor="#C08552"
              speed={50}
              factor={0.05}
            />
          </div>

          {/* Dark overlay on top of stars so text is readable */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backgroundColor: 'rgba(75, 46, 43, 0.55)', zIndex: 1 }}
          />

          {/* Pricing content — sits on top of stars and overlay */}
          <div className="relative w-full" style={{ zIndex: 2 }}>

            {/* MenuScrollGallery */}
            <div className="w-full">
              <MenuScrollGallery />
            </div>
          </div>
        </section>
      </div>

      <section className="relative py-8 overflow-hidden border-t" style={{ borderColor: 'rgba(192, 133, 82, 0.2)', color: '#C08552' }}>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/menu/BrewsLeeBackground.png"
            alt="Marquee Background"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.25)" }}
          />
        </div>

        <div className='relative z-10 flex flex-col gap-6 overflow-hidden'>
          <TextMarquee
            baseVelocity={-2}
            clasname='font-bold tracking-[-0.05em] leading-[100%] uppercase text-2xl md:text-4xl'
          >
            <span className="flex items-center gap-6 pr-6 text-[#FFF8F0]">
              BREWS LEE <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" /> TASTE THE PASSION <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" /> BREWS LEE <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" /> TASTE THE PASSION <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" />
            </span>
          </TextMarquee>
          <TextMarquee
            baseVelocity={2}
            clasname='font-bold tracking-[-0.05em] leading-[100%] uppercase text-2xl md:text-4xl'
          >
            <span className="flex items-center gap-6 pr-6 text-[#FFF8F0]">
              THE TASTE THAT LINGERS <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" /> BE THE BREW, MY FRIEND <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" /> THE TASTE THAT LINGERS <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" /> BE THE BREW, MY FRIEND <img src="/icon.png" alt="Icon" className="inline-block h-10 w-auto md:h-16 flex-shrink-0" />
            </span>
          </TextMarquee>
        </div>
      </section>

      <Footer />
    </div>
  );
}