import React, { useState } from 'react';
import { ComparableListing } from '../types/advisor';
import { Search, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface ComparableListingsTableProps {
  comparables: ComparableListing[];
  benchmarkPrice: number;
}

export const ComparableListingsTable: React.FC<ComparableListingsTableProps> = ({
  comparables,
  benchmarkPrice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'reviews'>('price_asc');
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = comparables
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property_type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return (b.reviews_count || 0) - (a.reviews_count || 0);
    });

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Verified Submarket Comparable Inventory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing verified clean inliers from the Washington, DC dataset ({comparables.length} total).
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="reviews">Most Reviewed</option>
          </select>
        </div>
      </div>

      {/* Comparable Listings Grid / Rows */}
      <div className="space-y-3">
        {displayed.map((comp) => {
          const priceDiff = comp.price - benchmarkPrice;
          const isAboveMedian = priceDiff > 0;

          return (
            <div
              key={comp.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {comp.name}
                  </h4>
                </div>

                {/* Clean unboxed metadata with typographic separators (§1.A) */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{comp.property_type}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{comp.bedrooms} BR / {comp.bathrooms} BA</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Up to {comp.accommodates} guests</span>
                  {comp.rating > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{comp.rating.toFixed(2)}</span>
                        <span className="text-slate-400 font-normal">({comp.reviews_count})</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Price Column */}
              <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="text-base font-bold font-mono tabular-nums text-slate-950">
                  ${comp.price.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500">/night</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {Math.abs(priceDiff) < 1 ? (
                    <span className="text-indigo-700 font-medium">Exact Median Match</span>
                  ) : isAboveMedian ? (
                    <span className="text-slate-600">
                      +${priceDiff.toFixed(2)} vs benchmark
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      -${Math.abs(priceDiff).toFixed(2)} vs benchmark
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-500">
            No comparable properties matching your search query.
          </div>
        )}
      </div>

      {/* View More / View Less */}
      {filtered.length > 8 && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          {visibleCount < filtered.length ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filtered.length))}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 py-1.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <span>Show {filtered.length - visibleCount} More Comparables</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setVisibleCount(8)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span>Collapse List</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
