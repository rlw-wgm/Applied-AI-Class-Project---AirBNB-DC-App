import React from 'react';
import { ArrowRight, BarChart3, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  onRunDupontSample: () => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onStartClick,
  onRunDupontSample,
  isLoading,
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              <span>Washington, DC Hospitality Advisory</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Inside Airbnb Open Analytics</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Empirical Airbnb Pricing & Staging Advisory for DC Homeowners.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Receive a data-backed nightly pricing benchmark and executive marketing memo.
              Calculated deterministically from 5,993 verified Washington, DC listings—with{' '}
              <strong className="text-slate-900 font-semibold">zero invented numbers</strong> or speculative estimates.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onStartClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <span>Enter Property Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onRunDupontSample}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Test Dupont Circle 1-Bed Condo Sample</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic 8-Step IQR Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Strictly No Fabricated Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Qualitative AI Marketing Memo</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Real Estate Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white group">
              <img
                src="/src/assets/images/dc_brownstone_hero_1794425281366.jpg"
                alt="Historic Washington DC brownstone in Dupont Circle"
                className="w-full h-[380px] lg:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Overlay card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/60 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                      Sample Case Benchmark
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                      Dupont Circle · 1-Bedroom Condo
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Empirical Median</span>
                    <span className="text-lg font-bold font-mono tabular-nums text-slate-950">
                      $267.50<span className="text-xs font-normal text-slate-500">/nt</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>96 Active Comparables</span>
                  <span className="font-mono tabular-nums text-slate-800">
                    25th: $224.25 · 75th: $323.50
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
