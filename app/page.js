"use client";

import { useState, useEffect } from "react";
import StaggeredMenu from "@/components/StaggeredMenu";
import ModelViewer from "@/components/ModelViewer";

export default function Home() {
  const modelUrl = "/models/data_chart_graphic_table_infographic.glb";
  const [menuBtnColor, setMenuBtnColor] = useState('#000000');

  useEffect(() => {
    // Set initial color
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setMenuBtnColor(isDark ? '#ffffff' : '#000000');
    };
    
    updateColor();
    
    // Watch for theme changes
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
  <main className="relative min-h-screen w-full">
      {/* Navbar */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="pointer-events-auto">
          <StaggeredMenu
            position="right"
            isFixed={true}
            logoUrl="/favicon.ico"
            accentColor="#22c55e"
            colors={["#0f172a", "#111827", "#1f2937"]}
            menuButtonColor={menuBtnColor}
            openMenuButtonColor="#22c55e"
            items={[
              { label: "Home", link: "#hero", ariaLabel: "Go to Home" },
              { label: "Features", link: "#features", ariaLabel: "View Features" },
              { label: "Pricing", link: "#pricing", ariaLabel: "View Pricing" },
              { label: "Contact", link: "#contact", ariaLabel: "Contact us" },
            ]}
            socialItems={[
              { label: "LinkedIn", link: "https://linkedin.com" },
              { label: "Twitter", link: "https://x.com" },
              { label: "GitHub", link: "https://github.com" },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <section id="hero" className="relative z-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 sm:gap-10 px-4 sm:px-6 pb-16 sm:pb-24 pt-20 sm:pt-28 md:grid-cols-2 md:gap-12 md:pb-28 md:pt-36 lg:gap-16">
          {/* Left: Copy */}
          <div className="order-2 flex flex-col items-start md:order-1">
            <span className="mb-3 sm:mb-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/10">
              Smart Finance, Clear Insights
            </span>
            <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-5xl xl:text-6xl">
              Grow your wealth with
              <span className="ml-2 bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                clarity
              </span>
            </h1>
            <p className="mb-6 sm:mb-8 max-w-xl text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Track spending, forecast cashflow, and make data-driven decisions. Our real-time analytics help you stay ahead and reach your financial goals faster.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <a
                href="#get-started"
                className="rounded-xl bg-emerald-500 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:bg-emerald-600 text-center backdrop-blur-sm"
              >
                Get Started
              </a>
              <a
                href="#features"
                className="rounded-xl border border-slate-300 bg-white/80 backdrop-blur-sm px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900 text-center"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Right: 3D Model */}
          <div className="order-1 md:order-2 w-full">
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-2 sm:p-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="w-full aspect-square max-w-[570px] mx-auto">
                <ModelViewer
                  url={modelUrl}
                  defaultRotationX={9}
                  environmentPreset="city"
                  enableMouseParallax={true}
                  fadeIn={true}
                  showScreenshotButton={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
