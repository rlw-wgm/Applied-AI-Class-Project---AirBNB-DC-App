import React from 'react';
import { X, ShieldCheck, Database, Layers, CheckCircle, Calculator } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-1">
          <ShieldCheck className="w-4 h-4 text-indigo-700" />
          <span>Auditable Statistical Standards</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Deterministic 8-Step Pricing Methodology
        </h3>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          The DC Airbnb Property Advisor is engineered with a strict zero-hallucination constraint.
          Pricing benchmarks and quartiles are computed deterministically using standard mathematical algorithms directly against the Washington, DC Inside Airbnb dataset.
        </p>

        <div className="mt-6 space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Neighborhood & Submarket Precision</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Properties are mapped directly to official DC cleansed submarket clusters (e.g., Dupont Circle, Georgetown, Capitol Hill, Logan Circle).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Exact Bedroom Matching & Entire-Home Rental Isolation</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Only whole-home rentals (<code>Entire home/apt</code>) with identical bedroom layouts (Studio, 1BR, 2BR, 3BR, 4+BR) are evaluated. Shared and private room listings are strictly excluded.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Short-Stay Segmentation (DC Regulation Compliance)</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Under DC Department of Buildings short-term rental rules, transient stays are 30 nights or less. Minimum stay filters isolate transient visitor demand from long-term corporate leases.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Outlier Elimination via 1.5× Interquartile Range (IQR)</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Standard Tukey fence method: bounds are set to $[Q_1 - 1.5 \times IQR, Q_3 + 1.5 \times IQR]$, eliminating extreme promotional rates or luxury penthouse distortions.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">5</span>
              <span>Continuous Linear Quantile Interpolation</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Quartiles and median benchmarks use continuous linear interpolation $k = (n - 1) \times q$. For the Dupont Circle 1-bedroom condo reference case, this reproduces the exact empirical benchmark of <strong>$267.495 median</strong>, <strong>$224.25 Q1</strong>, and <strong>$323.495 Q3</strong> across 96 verified properties.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
