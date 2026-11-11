import React, { useState } from 'react';
import { PricingCalculationResult } from '../types/advisor';
import { TrendingUp, Info } from 'lucide-react';

interface InteractiveComparisonChartProps {
  pricing: PricingCalculationResult;
  neighborhood: string;
}

export const InteractiveComparisonChart: React.FC<InteractiveComparisonChartProps> = ({
  pricing,
  neighborhood,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'conservative' | 'recommended' | 'premium'>('recommended');
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null);

  const {
    benchmarkNightlyPrice,
    q25Price,
    q75Price,
    minComparablePrice,
    maxComparablePrice,
    priceDistribution,
    comparablesCount,
  } = pricing;

  // Compute strategy values
  const targetPrice =
    selectedStrategy === 'conservative'
      ? q25Price
      : selectedStrategy === 'premium'
      ? q75Price
      : benchmarkNightlyPrice;

  // Max bucket count for histogram scaling
  const maxBucketCount = Math.max(...priceDistribution.map((b) => b.count), 1);

  // Range scale math for position bar (min to max)
  const rangeSpan = Math.max(1, maxComparablePrice - minComparablePrice);
  const q25Pos = ((q25Price - minComparablePrice) / rangeSpan) * 100;
  const medPos = ((benchmarkNightlyPrice - minComparablePrice) / rangeSpan) * 100;
  const q75Pos = ((q75Price - minComparablePrice) / rangeSpan) * 100;
  const targetPos = Math.min(100, Math.max(0, ((targetPrice - minComparablePrice) / rangeSpan) * 100));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-700" />
            <span>Interactive Submarket Price Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical distribution across {comparablesCount} verified comparable properties in {neighborhood}.
          </p>
        </div>

        {/* Pricing Strategy Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedStrategy('conservative')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedStrategy === 'conservative'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conservative (Q1)
          </button>
          <button
            type="button"
            onClick={() => setSelectedStrategy('recommended')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedStrategy === 'recommended'
                ? 'bg-white text-indigo-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recommended (Median)
          </button>
          <button
            type="button"
            onClick={() => setSelectedStrategy('premium')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedStrategy === 'premium'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Premium (Q3)
          </button>
        </div>
      </div>

      {/* Target Strategy Explanation Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
            {selectedStrategy === 'recommended'
              ? 'Empirical Market Baseline'
              : selectedStrategy === 'conservative'
              ? 'Rapid-Velocity / Low-Season Baseline'
              : 'Upper-Quartile Staged Asset Target'}
          </span>
          <span className="text-xs text-slate-600 mt-0.5 block">
            {selectedStrategy === 'recommended'
              ? 'Balanced nightly rate optimizing occupancy velocity and maximum net yield.'
              : selectedStrategy === 'conservative'
              ? 'Fast-fill booking strategy recommended for initial launch to accumulate 5-star reviews.'
              : 'Achievable with designer staging, boutique bath amenities, and professional photography.'}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-slate-500 block">Target Nightly Rate</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-950">
            ${targetPrice.toFixed(selectedStrategy === 'conservative' ? 2 : 3)}
          </span>
        </div>
      </div>

      {/* Visual Box-Whisker & Quartile Range Chart */}
      <div className="mb-8 pt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Min: ${minComparablePrice.toFixed(2)}</span>
          <span className="font-semibold text-slate-700">Submarket Quartile Span</span>
          <span>Max: ${maxComparablePrice.toFixed(2)}</span>
        </div>

        {/* Outer Bar */}
        <div className="relative h-10 bg-slate-100 rounded-lg overflow-visible flex items-center px-1 border border-slate-200">
          {/* Interquartile Range (IQR) Colored Band */}
          <div
            className="absolute top-1 bottom-1 bg-indigo-100/90 border border-indigo-300 rounded"
            style={{
              left: `${q25Pos}%`,
              width: `${Math.max(4, q75Pos - q25Pos)}%`,
            }}
            title={`Interquartile Range: $${q25Price.toFixed(2)} – $${q75Price.toFixed(3)}`}
          />

          {/* 25th Percentile Tick */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
            style={{ left: `${q25Pos}%` }}
          />

          {/* Median Benchmark Tick */}
          <div
            className="absolute -top-1 -bottom-1 w-1 bg-indigo-700 z-20 rounded"
            style={{ left: `${medPos}%` }}
          />

          {/* 75th Percentile Tick */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
            style={{ left: `${q75Pos}%` }}
          />

          {/* Active Target Marker Indicator */}
          <div
            className="absolute -top-3 z-30 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${targetPos}%` }}
          >
            <div className="bg-slate-900 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
              ${targetPrice.toFixed(selectedStrategy === 'conservative' ? 2 : 3)}
            </div>
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
          </div>
        </div>

        {/* Labels below the bar */}
        <div className="relative h-6 mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
          <div
            className="absolute transform -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${q25Pos}%` }}
          >
            Q1: ${q25Price.toFixed(2)}
          </div>
          <div
            className="absolute transform -translate-x-1/2 whitespace-nowrap font-bold text-indigo-900"
            style={{ left: `${medPos}%` }}
          >
            Median: ${benchmarkNightlyPrice.toFixed(3)}
          </div>
          <div
            className="absolute transform -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${q75Pos}%` }}
          >
            Q3: ${q75Price.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Histogram of Comparable Listings Distribution */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
          <span className="font-semibold text-slate-800">
            Price Frequency Distribution ({comparablesCount} Listings)
          </span>
          <span className="text-[11px] text-slate-500">
            Hover column for details
          </span>
        </div>

        <div className="h-40 flex items-end gap-2 pt-6 pb-2 border-b border-slate-200">
          {priceDistribution.map((bucket, i) => {
            const heightPercent = Math.max(12, (bucket.count / maxBucketCount) * 100);
            const isTargetInBucket = targetPrice >= bucket.min && targetPrice <= bucket.max;
            const isHovered = hoveredBucket === i;

            return (
              <div
                key={bucket.rangeLabel}
                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                onMouseEnter={() => setHoveredBucket(i)}
                onMouseLeave={() => setHoveredBucket(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] rounded px-2.5 py-1 whitespace-nowrap shadow-lg">
                    <span className="font-bold">{bucket.count} properties</span> ({((bucket.count / comparablesCount) * 100).toFixed(1)}%)
                    <br />
                    <span>{bucket.rangeLabel}</span>
                  </div>
                )}

                {/* Listing Count Label on top */}
                <span className="text-[10px] font-mono tabular-nums text-slate-500 mb-1 group-hover:text-slate-900 font-semibold">
                  {bucket.count}
                </span>

                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    isTargetInBucket
                      ? 'bg-indigo-700 shadow-sm'
                      : isHovered
                      ? 'bg-slate-400'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
          {priceDistribution.map((bucket) => (
            <div key={bucket.rangeLabel} className="flex-1 text-center truncate px-0.5">
              {bucket.rangeLabel}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Calculations are derived from continuous linear quantile interpolation ($k = (n - 1) \times q$) on clean inliers, ensuring full reproducibility with independent benchmark standards.
        </span>
      </div>
    </div>
  );
};
