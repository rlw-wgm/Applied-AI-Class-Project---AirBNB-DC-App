import React from 'react';
import { Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block leading-tight">
                DC Airbnb Property Advisor
              </span>
              <span className="text-xs text-slate-500">
                District Host Advisors LLC · Washington, DC
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <a
              href="https://insideairbnb.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Inside Airbnb Source Data
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="https://dob.dc.gov/short-term-rentals"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              DC Short-Term Rental Act (DC DOB)
            </a>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <a
              href="#market-insights"
              className="hover:text-slate-900 transition-colors"
            >
              DC Submarket Reports
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} District Host Advisors LLC. Deterministic pricing calculations derived from open data under Creative Commons Attribution 4.0.
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            Empirical Model · DC Submarket Engine
          </p>
        </div>
      </div>
    </footer>
  );
};
