"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import GUI from "lil-gui";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DEFAULT_FRAME_COLUMNS = 9;
const DEFAULT_FRAME_ROWS = 8;

type GuiParams = {
  scene1ScrollVh: number;
  scene2ScrollVh: number;
  scene3ScrollVh: number;
  scene4ScrollVh: number;
  boxCols: number;
  boxRows: number;
  sequenceCols: number;
  sequenceRows: number;
  sequenceFrameCount: number;
  customCols: number;
  customRows: number;
  customFrameCount: number;
  boxScrub: number;
  sequenceScrub: number;
  customScrub: number;
  showMarkers: boolean;
};

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const boxSectionRef = useRef<HTMLDivElement>(null);
  const boxSpriteRef = useRef<HTMLDivElement>(null);
  const sequenceSectionRef = useRef<HTMLDivElement>(null);
  const sequenceSpriteRef = useRef<HTMLDivElement>(null);
  const sequence3SectionRef = useRef<HTMLDivElement>(null);
  const sequence3SpriteRef = useRef<HTMLDivElement>(null);
  const customSectionRef = useRef<HTMLDivElement>(null);
  const customSpriteRef = useRef<HTMLDivElement>(null);
  const customFileInputRef = useRef<HTMLInputElement>(null);

  const guiParams = useRef<GuiParams>({
    scene1ScrollVh: 700,
    scene2ScrollVh: 600,
    scene3ScrollVh: 600,
    scene4ScrollVh: 500,
    boxCols: DEFAULT_FRAME_COLUMNS,
    boxRows: DEFAULT_FRAME_ROWS,
    sequenceCols: 9,
    sequenceRows: 9,
    sequenceFrameCount: 73,
    customCols: 9,
    customRows: 9,
    customFrameCount: 81,
    boxScrub: 0.5,
    sequenceScrub: 0.25,
    customScrub: 0,
    showMarkers: false,
  });

  const [guiTick, setGuiTick] = useState(0);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const bumpGui = () => setGuiTick((n) => n + 1);

  const clearCustomImageRef = useRef<() => void>(() => {});

  const clearCustomImage = useCallback(() => {
    setCustomImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (customFileInputRef.current) customFileInputRef.current.value = "";
    bumpGui();
  }, []);

  clearCustomImageRef.current = clearCustomImage;

  const customImageUrlCleanupRef = useRef<string | null>(null);
  customImageUrlCleanupRef.current = customImageUrl;

  useEffect(() => {
    return () => {
      const url = customImageUrlCleanupRef.current;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    const p = guiParams.current;
    const gui = new GUI({ title: "Sprite & scroll" });

    const globalActions = {
      updateParameters() {
        requestAnimationFrame(() => {
          bumpGui();
          ScrollTrigger.refresh();
        });
      },
    };
    gui.add(globalActions, "updateParameters").name("Update parameters (all scenes)");

    const f1 = gui.addFolder("Scene 1 — Box");
    f1.add(p, "scene1ScrollVh", 200, 1200, 10).name("scroll height (svh)").onChange(bumpGui);
    f1.add(p, "boxCols", 1, 16, 1).name("columns").onChange(bumpGui);
    f1.add(p, "boxRows", 1, 16, 1).name("rows").onChange(bumpGui);
    f1.add(p, "boxScrub", 0, 2, 0.05)
      .name("scrub lag (s), 0 = instant")
      .onFinishChange(bumpGui);

    const f2 = gui.addFolder("Scene 2 — Sequence");
    f2.add(p, "scene2ScrollVh", 200, 1200, 10).name("scroll height (svh)").onChange(bumpGui);
    f2.add(p, "sequenceCols", 1, 16, 1).name("columns").onChange(bumpGui);
    f2.add(p, "sequenceRows", 1, 16, 1).name("rows").onChange(bumpGui);
    f2
      .add(p, "sequenceFrameCount", 1, 81, 1)
      .name("frame count")
      .onChange(bumpGui);
    f2.add(p, "sequenceScrub", 0, 2, 0.05)
      .name("scrub lag (s), 0 = instant")
      .onFinishChange(bumpGui);

    const f3 = gui.addFolder("Scene 3 — Sequence");
    f3.add(p, "scene3ScrollVh", 200, 1200, 10).name("scroll height (svh)").onChange(bumpGui);

    const f4 = gui.addFolder("Scene 4 — Custom upload");
    f4.add(p, "scene4ScrollVh", 200, 1200, 10).name("scroll height (svh)").onChange(bumpGui);
    f4.add(p, "customCols", 1, 16, 1).name("columns (grid)").onChange(bumpGui);
    f4.add(p, "customRows", 1, 16, 1).name("rows (grid)").onChange(bumpGui);
    f4.add(p, "customFrameCount", 1, 144, 1).name("frame count").onChange(bumpGui);
    f4.add(p, "customScrub", 0, 2, 0.05)
      .name("scrub lag (s), 0 = instant")
      .onFinishChange(bumpGui);

    const scene3FileActions = {
      chooseImage() {
        customFileInputRef.current?.click();
      },
      clearImage() {
        clearCustomImageRef.current();
      },
    };
    f4.add(scene3FileActions, "chooseImage").name("Choose image…");
    f4.add(scene3FileActions, "clearImage").name("Clear image");

    gui.add(p, "showMarkers").name("ScrollTrigger markers").onChange(bumpGui);

    f1.open();
    f2.open();
    f3.open();
    f4.open();

    const mq = window.matchMedia("(max-width: 1023px)");
    const syncGuiVisibility = () => {
      gui.domElement.style.display = mq.matches ? "none" : "";
    };
    syncGuiVisibility();
    mq.addEventListener("change", syncGuiVisibility);

    return () => {
      mq.removeEventListener("change", syncGuiVisibility);
      gui.destroy();
    };
  }, []);

  useGSAP(
    () => {
      const p = guiParams.current;
      const ctx = gsap.context(() => {
        ScrollTrigger.config({ ignoreMobileResize: true });

        /** GSAP ScrollTrigger: 0 = instant follow; >0 = smoothing lag in seconds. */
        const scrubValue = (v: number) => (v <= 0 ? 0 : v);

        const setupSpriteAnimation = (
          section: HTMLDivElement | null,
          sprite: HTMLDivElement | null,
          frameColumns: number,
          frameRows: number,
          reverse: boolean,
          frameCount: number | undefined,
          scrub: number,
          markers: boolean,
          /** Drive frames from ScrollTrigger progress (fixes reverse-scroll desync with scrub smoothing). */
          syncFrameFromScrollProgress = false,
        ) => {
          if (!section || !sprite) return;

          const gridFrames = frameColumns * frameRows;
          const totalFrames =
            frameCount !== undefined ? Math.min(frameCount, gridFrames) : gridFrames;
          const emptyTailFrames = Math.max(0, gridFrames - totalFrames);
          const startFrame = reverse ? gridFrames - 1 - emptyTailFrames : 0;
          const endFrame = reverse ? 0 : totalFrames - 1;
          const colDenom = Math.max(1, frameColumns - 1);
          const rowDenom = Math.max(1, frameRows - 1);
          const frameState = { frame: startFrame };

          const renderFrame = () => {
            const maxIndex = totalFrames - 1;
            const frameIndex = Math.min(maxIndex, Math.max(0, Math.round(frameState.frame)));
            const column = frameIndex % frameColumns;
            const row = Math.floor(frameIndex / frameColumns);

            sprite.style.backgroundPosition = `${(column / colDenom) * 100}% ${(row / rowDenom) * 100}%`;
          };

          renderFrame();

          const scrollTriggerConfig: GSAPTweenVars["scrollTrigger"] = {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub,
            markers,
            anticipatePin: 0,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          };

          if (syncFrameFromScrollProgress) {
            scrollTriggerConfig.onUpdate = (self) => {
              const span = Math.max(0, totalFrames - 1);
              frameState.frame = self.progress * span;
              renderFrame();
            };
          }

          gsap.to(frameState, {
            frame: endFrame,
            ease: "none",
            onUpdate: syncFrameFromScrollProgress ? undefined : renderFrame,
            scrollTrigger: scrollTriggerConfig,
          });
        };

        setupSpriteAnimation(
          boxSectionRef.current,
          boxSpriteRef.current,
          p.boxCols,
          p.boxRows,
          false,
          undefined,
          scrubValue(p.boxScrub),
          p.showMarkers,
        );
        setupSpriteAnimation(
          sequenceSectionRef.current,
          sequenceSpriteRef.current,
          p.sequenceCols,
          p.sequenceRows,
          true,
          p.sequenceFrameCount,
          scrubValue(p.sequenceScrub),
          p.showMarkers,
        );
        setupSpriteAnimation(
          sequence3SectionRef.current,
          sequence3SpriteRef.current,
          p.sequenceCols,
          p.sequenceRows,
          true,
          p.sequenceFrameCount,
          scrubValue(p.sequenceScrub),
          p.showMarkers,
        );

        if (customImageUrl) {
          setupSpriteAnimation(
            customSectionRef.current,
            customSpriteRef.current,
            p.customCols,
            p.customRows,
            false,
            p.customFrameCount,
            scrubValue(p.customScrub),
            p.showMarkers,
            true,
          );
        }

        ScrollTrigger.refresh();
      }, mainRef);

      return () => ctx.revert();
    },
    { dependencies: [guiTick, customImageUrl], scope: mainRef },
  );

  const p = guiParams.current;

  const onCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    bumpGui();
  };

  return (
    <main ref={mainRef} className="bg-black text-white">
      <input
        id="custom-sprite-file"
        ref={customFileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onCustomFileChange}
      />

      <section
        ref={boxSectionRef}
        className="relative"
        style={{ height: `${p.scene1ScrollVh}svh` }}
      >
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
            className="w-[min(84vw,420px)] rounded-2xl border border-white/10 bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={{
              aspectRatio: "4 / 5",
              backgroundImage: "url('/box-sprite-desktop.webp')",
              backgroundSize: `${p.boxCols * 100}% ${p.boxRows * 100}%`,
            }}
            aria-label="Box sprite animation"
            role="img"
          />
          <p className="text-xs text-white/45 sm:text-sm">
            Keep scrolling to continue to the next scene.
          </p>
        </div>
      </section>
      <section
        ref={sequenceSectionRef}
        className="relative"
        style={{ height: `${p.scene2ScrollVh}svh` }}
      >
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Scene 02</p>
            <h2 className="text-2xl font-semibold sm:text-4xl">OrangeKit Sequence</h2>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              Tube to bag to box — scroll to scrub through the full sprite sequence.
            </p>
          </div>
          <div
            ref={sequenceSpriteRef}
            className="w-[min(84vw,420px)] rounded-2xl border border-white/10 bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={{
              aspectRatio: "1 / 1",
              backgroundImage: "url('/1aprilimage.png')",
              backgroundSize: `${p.sequenceCols * 100}% ${p.sequenceRows * 100}%`,
            }}
            aria-label="OrangeKit packaging sequence animation"
            role="img"
          />
          <p className="text-xs text-white/45 sm:text-sm">
            Keep scrolling to scrub through {p.sequenceFrameCount} frames (
            {p.sequenceCols} × {p.sequenceRows} sprite sheet).
          </p>
          <p className="text-xs text-white/45 sm:text-sm">
            You can preview the source{" "}
            <a
              href="/1aprilimage.png"
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

      <section
        ref={sequence3SectionRef}
        className="relative"
        style={{ height: `${p.scene3ScrollVh}svh` }}
      >
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Scene 03</p>
            <h2 className="text-2xl font-semibold sm:text-4xl">OrangeKit Sequence 2</h2>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              Same animation settings as Scene 02, using your second sprite sheet.
            </p>
          </div>
          <div
            ref={sequence3SpriteRef}
            className="w-[min(84vw,420px)] rounded-2xl border border-white/10 bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={{
              aspectRatio: "1 / 1",
              backgroundImage: "url('/1aprilimage_2.png')",
              backgroundSize: `${p.sequenceCols * 100}% ${p.sequenceRows * 100}%`,
            }}
            aria-label="OrangeKit sequence 2 animation"
            role="img"
          />
          <p className="text-xs text-white/45 sm:text-sm">
            Keep scrolling to scrub through {p.sequenceFrameCount} frames (
            {p.sequenceCols} × {p.sequenceRows} sprite sheet).
          </p>
          <p className="text-xs text-white/45 sm:text-sm">
            You can preview the source{" "}
            <a
              href="/1aprilimage_2.png"
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

      <section
        ref={customSectionRef}
        className="relative"
        style={{ height: `${p.scene4ScrollVh}svh` }}
      >
        <div className="sticky top-0 flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-8 text-center">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Scene 04</p>
            <h2 className="text-2xl font-semibold sm:text-4xl">Custom sprite</h2>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              Upload a sprite sheet in the panel, set columns × rows and frame count to match your
              grid, then scroll to scrub.
            </p>
          </div>
          <div
            ref={customSpriteRef}
            className="w-[min(84vw,420px)] rounded-2xl border border-dashed border-white/20 bg-zinc-900/50 bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,0.5)] will-change-[background-position]"
            style={
              customImageUrl
                ? {
                    aspectRatio: "1 / 1",
                    backgroundImage: `url("${customImageUrl}")`,
                    backgroundSize: `${p.customCols * 100}% ${p.customRows * 100}%`,
                    borderStyle: "solid",
                    borderColor: "rgba(255,255,255,0.1)",
                  }
                : {
                    aspectRatio: "1 / 1",
                    minHeight: "200px",
                  }
            }
            aria-label="Custom uploaded sprite animation"
            role="img"
          />
          {!customImageUrl ? (
            <p className="max-w-md text-xs text-white/50">
              No image yet — use <span className="text-white/70">Scene 4 — Custom upload</span> →{" "}
              <span className="text-white/70">Choose image…</span> in the floating panel.
            </p>
          ) : (
            <p className="text-xs text-white/45 sm:text-sm">
              Scrubbing {Math.min(p.customFrameCount, p.customCols * p.customRows)} frames (
              {p.customCols} × {p.customRows} grid).
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
