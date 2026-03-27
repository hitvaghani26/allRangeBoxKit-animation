"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEFAULT_FRAME_COLUMNS = 9;
const DEFAULT_FRAME_ROWS = 8;

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const boxSectionRef = useRef<HTMLDivElement>(null);
  const boxSpriteRef = useRef<HTMLDivElement>(null);
  const jarSectionRef = useRef<HTMLDivElement>(null);
  const jarSpriteRef = useRef<HTMLDivElement>(null);
  const customSectionRef = useRef<HTMLDivElement>(null);
  const customSpriteRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      const setupSpriteAnimation = (
        section: HTMLDivElement | null,
        sprite: HTMLDivElement | null,
        frameColumns = DEFAULT_FRAME_COLUMNS,
        frameRows = DEFAULT_FRAME_ROWS,
        reverse = false,
      ) => {
        if (!section || !sprite) return;

        const totalFrames = frameColumns * frameRows;
        const frameState = { frame: reverse ? totalFrames - 1 : 0 };

        const renderFrame = () => {
          const frameIndex = Math.round(frameState.frame);
          const column = frameIndex % frameColumns;
          const row = Math.floor(frameIndex / frameColumns);

          sprite.style.backgroundPosition = `${(column / (frameColumns - 1)) * 100}% ${(row / (frameRows - 1)) * 100}%`;
        };

        renderFrame();

        gsap.to(frameState, {
          frame: reverse ? 0 : totalFrames - 1,
          ease: "none",
          onUpdate: renderFrame,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      };

      setupSpriteAnimation(boxSectionRef.current, boxSpriteRef.current);
      setupSpriteAnimation(jarSectionRef.current, jarSpriteRef.current);
      setupSpriteAnimation(customSectionRef.current, customSpriteRef.current, 9, 9);
      ScrollTrigger.refresh();
    },
    { scope: mainRef },
  );

  return (
    <main ref={mainRef} className="bg-black text-white">
      <section ref={boxSectionRef} className="relative h-[700svh]">
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Scene 01</p>
            <h1 className="text-2xl font-semibold sm:text-4xl">Box Reveal Animation</h1>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              Scroll down to play each frame smoothly from the sprite sequence.
            </p>
          </div>
          <div
            ref={boxSpriteRef}
            className="w-[min(84vw,420px)] rounded-2xl border border-white/10 bg-[url('/box-sprite-desktop.webp')] bg-size-[900%_800%] bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={{ aspectRatio: "4 / 5" }}
            aria-label="Box sprite animation"
            role="img"
          />
          <p className="text-xs text-white/45 sm:text-sm">
            Keep scrolling to continue to the next scene.
          </p>
        </div>
      </section>
      <section ref={jarSectionRef} className="relative h-[700svh]">
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Scene 02</p>
            <h2 className="text-2xl font-semibold sm:text-4xl">Jar Reveal Animation</h2>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              After the box sequence finishes, this second sprite animation starts.
            </p>
          </div>
          <div
            ref={jarSpriteRef}
            className="w-[min(84vw,420px)] rounded-2xl border border-white/10 bg-[url('/jar-sprite-desktop.webp')] bg-size-[900%_800%] bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={{ aspectRatio: "4 / 5" }}
            aria-label="Jar sprite animation"
            role="img"
          />
          <p className="text-xs text-white/45 sm:text-sm">
            The animation is tied directly to your scroll position.
          </p>
        </div>
      </section>
      <section ref={customSectionRef} className="relative h-[700svh]">
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Scene 03</p>
            <h2 className="text-2xl font-semibold sm:text-4xl">Custom Sprite Animation</h2>
          </div>
          <div
            ref={customSpriteRef}
            className="w-[min(84vw,420px)] rounded-2xl border border-white/10 bg-[url('/newimage2.png')] bg-size-[900%_900%] bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={{ aspectRatio: "1 / 1" }}
            aria-label="Custom sprite animation"
            role="img"
          />
          <p className="text-xs text-white/45 sm:text-sm">
            Keep scrolling to scrub through all 81 frames. This preview uses compressed
            image.
          </p>
          <p className="text-xs text-white/45 sm:text-sm">
            You can preview the source{" "}
            <a
              href="/newimage2.png"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-white/70"
            >
              image
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
