import React from 'react';
import { Building2, Sparkles, FileText, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onStartClick: () => void;
  onMethodologyClick: () => void;
  hasReport: boolean;
  onViewReportClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onStartClick,
  onMethodologyClick,
  hasReport,
  onViewReportClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a href="/" className="flex items-center gap-2.5 text-slate-900 group">
          <div className="w-9 h-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-5 h-5 text-indigo-200" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
              DC Airbnb Advisor
            </span>
            <span className="text-[11px] font-medium text-slate-700 tracking-wide mt-0.5">
              District Host Real Estate Analytics
            </span>
          </div>
        </a>

        {/* Zone 2: Single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <button
            type="button"
            onClick={onStartClick}
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Valuation Engine
          </button>
          <button
            type="button"
            onClick={onMethodologyClick}
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Empirical Methodology
          </button>
          <a
            href="#market-insights"
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            DC Market Intel
          </a>
          <a
            href="#about-management"
            className="hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Property Management
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasReport && onViewReportClick && (
            <button
              type="button"
              onClick={onViewReportClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-950 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Active Report
            </button>
          )}
          <button
            type="button"
            onClick={onStartClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <span>Analyze Property</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
