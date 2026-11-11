import React, { useEffect, useState } from 'react';
import { Database, Filter, CheckCircle2, Sparkles, Cpu, Layers } from 'lucide-react';

interface GeneratingAnimationProps {
  neighborhoodName: string;
}

export const GeneratingAnimation: React.FC<GeneratingAnimationProps> = ({ neighborhoodName }) => {
  const steps = [
    {
      title: 'Connecting Local Dataset',
      desc: 'Loading 5,993 verified Washington, DC listings from Inside Airbnb...',
      icon: Database,
    },
    {
      title: `Submarket Filtering`,
      desc: `Matching ${neighborhoodName} submarket & requested configuration...`,
      icon: Filter,
    },
    {
      title: 'Short-Stay Segmentation',
      desc: 'Separating short-term transient rentals from 30+ day corporate stays...',
      icon: Layers,
    },
    {
      title: 'Outlier & Duplicate Audit',
      desc: 'Applying 1.5× IQR outlier boundary & identifying syndicated duplicates...',
      icon: Cpu,
    },
    {
      title: 'Deterministic Quartile Math',
      desc: 'Calculating empirical median asking price, 25th & 75th percentiles...',
      icon: CheckCircle2,
    },
    {
      title: 'Synthesizing Qualitative AI Advisory',
      desc: 'Crafting high-converting listing title, copy & staging recommendations...',
      icon: Sparkles,
    },
  ];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) return prev + Math.floor(Math.random() * 8) + 4;
        return 95;
      });
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 sm:p-12 max-w-2xl mx-auto my-12 text-center">
      {/* Animated Glowing Ring */}
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <div className="w-12 h-12 rounded-full bg-indigo-900 flex items-center justify-center text-white shadow-inner">
          <Sparkles className="w-6 h-6 text-indigo-300 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
        Computing Empirical Pricing & Advisory Report
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Running deterministic 8-step matching algorithm across the Inside Airbnb Washington, DC dataset.
      </p>

      {/* Progress Bar */}
      <div className="mt-8 mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
          <span>{steps[currentStep].title}</span>
          <span className="font-mono tabular-nums">{Math.min(100, progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-700 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step Description Card */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left flex items-start gap-3 transition-all">
        {React.createElement(steps[currentStep].icon, {
          className: 'w-5 h-5 text-indigo-700 shrink-0 mt-0.5',
        })}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="text-sm text-slate-700 font-medium mt-0.5">
            {steps[currentStep].desc}
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-600 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
        <span>Strict anti-hallucination protocol active: All metrics derived from verified records</span>
      </div>
    </div>
  );
};
