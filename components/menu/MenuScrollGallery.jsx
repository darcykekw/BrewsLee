import {
  ContainerScrollAnimation,
  ContainerScrollInsetX,
  ContainerScrollScale,
  ContainerScrollTranslate,
} from '@/components/ui/ScrollTriggerAnimations';

import img1 from "../../Menu/SrollAnimation/1.jpg";
import img2 from "../../Menu/SrollAnimation/2.jpg";
import img3 from "../../Menu/SrollAnimation/3.jpg";
import img4 from "../../Menu/SrollAnimation/4.jpg";
import img5 from "../../Menu/SrollAnimation/5.jpg";
import img6 from "../../Menu/SrollAnimation/6.jpg";
import img7 from "../../Menu/SrollAnimation/7.jpg";
import img8 from "../../Menu/SrollAnimation/8.jpg";
import img9 from "../../Menu/SrollAnimation/9.jpg";
import img10 from "../../Menu/SrollAnimation/10.jpg";
import img11 from "../../Menu/SrollAnimation/11.jpg";
import ownerImg from "../../Menu/SrollAnimation/OwnerOfBrewsLee.png";

const COLUMN_1_BASE = [img1.src, img2.src];
const COLUMN_1 = [...COLUMN_1_BASE, ...COLUMN_1_BASE, ...COLUMN_1_BASE, ...COLUMN_1_BASE, ...COLUMN_1_BASE, ...COLUMN_1_BASE];

const COLUMN_2_BASE = [img3.src, img4.src, img5.src];
const COLUMN_2 = [...COLUMN_2_BASE, ...COLUMN_2_BASE, ...COLUMN_2_BASE, ...COLUMN_2_BASE];

const COLUMN_3_BASE = [img6.src, ownerImg.src, img7.src];
const COLUMN_3 = [...COLUMN_3_BASE, ...COLUMN_3_BASE, ...COLUMN_3_BASE, ...COLUMN_3_BASE];

const COLUMN_4_BASE = [img8.src, img9.src];
const COLUMN_4 = [...COLUMN_4_BASE, ...COLUMN_4_BASE, ...COLUMN_4_BASE, ...COLUMN_4_BASE, ...COLUMN_4_BASE, ...COLUMN_4_BASE];

const COLUMN_5_BASE = [img10.src, img11.src];
const COLUMN_5 = [...COLUMN_5_BASE, ...COLUMN_5_BASE, ...COLUMN_5_BASE, ...COLUMN_5_BASE, ...COLUMN_5_BASE, ...COLUMN_5_BASE];

const imgStyle = {
};

export default function MenuScrollGallery() {
  return (
    <ContainerScrollAnimation className="overflow-hidden w-full bg-[#4B2E2B]">
      <ContainerScrollTranslate className="h-dvh relative">
        <ContainerScrollInsetX className="h-full relative">
          <ContainerScrollScale
            className="flex gap-1 md:gap-2 justify-center mx-auto w-full overflow-hidden px-2 md:px-4 h-full"
            style={{ backgroundColor: '#4B2E2B' }}
          >

            {/* Column 1 — scrolls up */}
            <ContainerScrollTranslate
              yRange={['0%', '-10%']}
              className="flex flex-col gap-1 md:gap-2 flex-1"
            >
              {COLUMN_1.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 2 — scrolls down (opposite) */}
            <ContainerScrollTranslate
              yRange={['0%', '20%']}
              className="flex flex-col gap-1 md:gap-2 flex-1 mt-[-20%] relative"
            >
              {COLUMN_2.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 3 — scrolls up, hidden on mobile */}
            <ContainerScrollTranslate
              yRange={['0%', '-10%']}
              className="hidden md:flex flex-col gap-1 md:gap-2 flex-1"
            >
              {COLUMN_3.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 4 — scrolls down (opposite), hidden on smaller screens */}
            <ContainerScrollTranslate
              yRange={['0%', '20%']}
              className="hidden lg:flex flex-col gap-1 md:gap-2 flex-1 mt-[-20%] relative"
            >
              {COLUMN_4.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              ))}
            </ContainerScrollTranslate>

            {/* Column 5 — scrolls up, hidden on smaller screens */}
            <ContainerScrollTranslate
              yRange={['0%', '-10%']}
              className="hidden xl:flex flex-col gap-1 md:gap-2 flex-1"
            >
              {COLUMN_5.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Menu item ${index + 1}`}
                  style={imgStyle}
                  className="w-full h-auto rounded-xl shadow-md"
                />
              ))}
            </ContainerScrollTranslate>

          </ContainerScrollScale>
        </ContainerScrollInsetX>
      </ContainerScrollTranslate>
    </ContainerScrollAnimation>
  );
}
