'use client';
import {
  ContainerScrollAnimation,
  ContainerScrollInsetX,
  ContainerScrollScale,
  ContainerScrollTranslate,
} from '@/components/ui/ScrollTriggerAnimations';

const COLUMN_1_BASE = [
  '/menu/Caramel%20Macchiato.png',
  '/menu/Hot%20Choco.png',
  '/menu/Spanish%20Latte.png',
];
const COLUMN_1 = [...COLUMN_1_BASE, ...COLUMN_1_BASE, ...COLUMN_1_BASE, ...COLUMN_1_BASE];

const COLUMN_2_BASE = [
  '/menu/Iced%20Black%20Americano.png',
  '/menu/Iced%20Choco.png',
  '/menu/Matcha%20Latte.png',
];
const COLUMN_2 = [...COLUMN_2_BASE, ...COLUMN_2_BASE, ...COLUMN_2_BASE, ...COLUMN_2_BASE];

const COLUMN_3_BASE = [
  '/menu/Coffee%20Mocha%20-%20Sundae%20Swirl.png',
  '/menu/Creamy%20Vanilla%20-%20Sundae%20Swirl.png',
  '/menu/Milk%20Tea%20-%20Sundae%20Swirl.png',
];
const COLUMN_3 = [...COLUMN_3_BASE, ...COLUMN_3_BASE, ...COLUMN_3_BASE, ...COLUMN_3_BASE];

const COLUMN_4_BASE = [
  '/menu/Spanish%20Latte.png',
  '/menu/Milk%20Tea%20-%20Sundae%20Swirl.png',
  '/menu/Caramel%20Macchiato.png',
];
const COLUMN_4 = [...COLUMN_4_BASE, ...COLUMN_4_BASE, ...COLUMN_4_BASE, ...COLUMN_4_BASE];

const COLUMN_5_BASE = [
  '/menu/Iced%20Choco.png',
  '/menu/Creamy%20Vanilla%20-%20Sundae%20Swirl.png',
  '/menu/Matcha%20Latte.png',
];
const COLUMN_5 = [...COLUMN_5_BASE, ...COLUMN_5_BASE, ...COLUMN_5_BASE, ...COLUMN_5_BASE];

const imgStyle = {
};

export default function MenuScrollGallery() {
  return (
    <ContainerScrollAnimation className="overflow-hidden w-full">
      <ContainerScrollTranslate className="h-dvh relative">
        <ContainerScrollInsetX className="h-full relative">
          <ContainerScrollScale
            className="flex gap-1 justify-center mx-auto w-full overflow-hidden px-2 md:px-4 h-full"
            style={{ backgroundColor: '#4B2E2B' }}
          >

            {/* Column 1 — scrolls up */}
            <ContainerScrollTranslate
              yRange={['0%', '-10%']}
              className="flex flex-col gap-1 flex-1"
            >
              {COLUMN_1.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="aspect-[4/3] w-full h-auto object-contain rounded-xl"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 2 — scrolls down (opposite) */}
            <ContainerScrollTranslate
              yRange={['0%', '20%']}
              className="flex flex-col gap-1 flex-1 mt-[-20%] relative"
            >
              {COLUMN_2.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="aspect-[4/3] w-full h-auto object-contain rounded-xl"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 3 — scrolls up, hidden on mobile */}
            <ContainerScrollTranslate
              yRange={['0%', '-10%']}
              className="hidden md:flex flex-col gap-1 flex-1"
            >
              {COLUMN_3.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="aspect-[4/3] w-full h-auto object-contain rounded-xl"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 4 — scrolls down (opposite), hidden on smaller screens */}
            <ContainerScrollTranslate
              yRange={['0%', '20%']}
              className="hidden lg:flex flex-col gap-1 flex-1 mt-[-20%] relative"
            >
              {COLUMN_4.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="aspect-[4/3] w-full h-auto object-contain rounded-xl"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 5 — scrolls up, hidden on smaller screens */}
            <ContainerScrollTranslate
              yRange={['0%', '-10%']}
              className="hidden xl:flex flex-col gap-1 flex-1"
            >
              {COLUMN_5.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="aspect-[4/3] w-full h-auto object-contain rounded-xl"
                />
              ))}
            </ContainerScrollTranslate>

          </ContainerScrollScale>
        </ContainerScrollInsetX>
      </ContainerScrollTranslate>
    </ContainerScrollAnimation>
  );
}
