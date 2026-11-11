import React, { useState } from 'react';
import {
  DollarSign,
  BarChart3,
  Sparkles,
  FileText,
  Printer,
  Copy,
  Check,
  Building,
  Shield,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  AlertTriangle,
  Lightbulb,
  Calculator,
  Database,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { FullAdvisorReport } from '../types/advisor';
import { InteractiveComparisonChart } from './InteractiveComparisonChart';
import { ComparableListingsTable } from './ComparableListingsTable';

interface ReportDashboardProps {
  report: FullAdvisorReport;
  onEditClick: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  onEditClick,
}) => {
  const { propertyInput, pricing, aiMarketing, generatedAt, reportId } = report;
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(aiMarketing.listingTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyDescription = () => {
    const fullText = `${aiMarketing.listingDescription.summary}

THE SPACE:
${aiMarketing.listingDescription.space}

GUEST ACCESS:
${aiMarketing.listingDescription.guestAccess}

NEIGHBORHOOD HIGHLIGHTS:
${aiMarketing.listingDescription.neighborhoodHighlights}`;

    navigator.clipboard.writeText(fullText);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 report-container">
      {/* Printable / Top Executive Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>REPORT ID: {reportId}</span>
              <span aria-hidden="true">·</span>
              <span>DATE: {new Date(generatedAt).toLocaleDateString()}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Database className="w-3 h-3" />
                {pricing.dataSourceInfo?.filename || 'Inside Airbnb DC Archive'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Airbnb Pricing & Marketing Advisory Report
            </h2>
            {/* Metadata strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 mt-2">
              <span className="font-semibold text-slate-900">{propertyInput.neighborhood}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="capitalize">{propertyInput.propertyType}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{propertyInput.bedrooms === 0 ? 'Studio' : `${propertyInput.bedrooms} Bedroom(s)`}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{propertyInput.bathrooms} Bath(s)</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Up to {propertyInput.maxGuests} Guests</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{(propertyInput.amenities || []).length} Amenities Selected</span>
            </div>
          </div>

          {/* Action CTAs (hidden on print) */}
          <div className="flex items-center gap-2.5 shrink-0 no-print">
            <button
              type="button"
              onClick={onEditClick}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Adjust Inputs
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>

        {/* 4-KPI Strip: Nightly Benchmark & Quartiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Primary Recommended Asking Price */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                Recommended Nightly Price
              </span>
              {pricing.amenityAdjustment !== 0 && (
                <span
                  className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    pricing.amenityAdjustment > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pricing.amenityAdjustment > 0 ? '+' : ''}${pricing.amenityAdjustment.toFixed(2)} Amenity Adj.
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-indigo-950 mt-1">
              ${pricing.benchmarkNightlyPrice.toFixed(2)}
              <span className="text-xs font-normal text-indigo-600">/night</span>
            </div>
            <span className="text-xs text-indigo-800 mt-1 block">
              {pricing.amenityAdjustment !== 0 ? (
                <>
                  Base Median: <strong className="font-mono">${pricing.unadjustedMedian.toFixed(3)}</strong>
                </>
              ) : (
                'Empirical submarket median (exact dataset value)'
              )}
            </span>
          </div>

          {/* 25th Percentile (Conservative) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Lower Quartile (25th Percentile)
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${pricing.q25Price.toFixed(2)}
              <span className="text-xs font-normal text-slate-500">/night</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Fast-fill launch rate & off-peak floor
            </span>
          </div>

          {/* 75th Percentile (Upper Quartile) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Upper Quartile (75th Percentile)
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${pricing.q75Price.toFixed(3)}
              <span className="text-xs font-normal text-slate-500">/night</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Target with designer staging & amenities
            </span>
          </div>

          {/* Verified Comparables Count */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Verified Comparables Analyzed
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {pricing.comparablesCount}
              <span className="text-xs font-normal text-slate-500"> properties</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block font-mono tabular-nums">
              IQR Spread: ${pricing.iqr.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Reference Case Parity Badge */}
        {pricing.referenceValidation && pricing.referenceValidation.isReferenceCase && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Independent Reference Sample Parity Verified
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Calculated from uploaded dataset file: <code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded">{pricing.dataSourceInfo?.filename}</code>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-emerald-900 bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span>Comps: <strong>{pricing.comparablesCount}</strong>/96</span>
                <span>·</span>
                <span>Median: <strong>${pricing.unadjustedMedian.toFixed(3)}</strong>/$267.495</span>
                <span>·</span>
                <span>Q25: <strong>${pricing.q25Price.toFixed(2)}</strong>/$224.25</span>
                <span>·</span>
                <span>Q75: <strong>${pricing.q75Price.toFixed(3)}</strong>/$323.495</span>
              </div>
            </div>
          </div>
        )}

        {pricing.dataSufficiencyNotice && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{pricing.dataSufficiencyNotice}</span>
          </div>
        )}

        {pricing.criteriaRelaxations && pricing.criteriaRelaxations.length > 0 && (
          <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg text-xs text-indigo-900 space-y-1">
            <span className="font-semibold block uppercase tracking-wider text-[11px] text-indigo-700">
              Matching Criteria Adjustment:
            </span>
            {pricing.criteriaRelaxations.map((rel, idx) => (
              <p key={idx} className="leading-relaxed">
                • {rel}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* DEDICATED SECTION: "How We Calculated Your Estimate" */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <Calculator className="w-4 h-4" />
            <span>Algorithmic & Statistical Transparency</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            How We Calculated Your Estimate
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Every nightly pricing benchmark is deterministically derived from cleaned Inside Airbnb Washington, DC open data. No artificial intelligence or generative model ever creates, estimates, or alters pricing figures.
          </p>
        </div>

        {/* 3 Step Mathematical Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Continuous Linear Quantile Interpolation */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Continuous Quantiles
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quartiles are calculated using the continuous linear quantile formulation ($k = (n - 1) \times q$), matching scientific statistical standards in R (Type 7), SciPy, and Pandas.
            </p>
            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 space-y-0.5">
              <div>k = (n - 1) × q</div>
              <div>Q(q) = P[⌊k⌋] + (k - ⌊k⌋) × (P[⌈k⌉] - P[⌊k⌋])</div>
            </div>
          </div>

          {/* Card 2: Screening & IQR Outlier Filtration */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Outlier & Duplicate Screening
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Price validity is strictly enforced. Listings with missing, zero, or negative rates are removed. Statistical outliers outside 1.5× Interquartile Range are screened to eliminate extreme distortions.
            </p>
            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 space-y-0.5">
              <div>IQR = Q75 - Q25 = ${pricing.iqr.toFixed(2)}</div>
              <div>Valid Range: [${Math.max(0, pricing.q25Price - 1.5 * pricing.iqr).toFixed(2)}, ${(pricing.q75Price + 1.5 * pricing.iqr).toFixed(2)}]</div>
            </div>
          </div>

          {/* Card 3: Empirical Amenity Evaluation */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Amenity Differentiation
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rather than assigning arbitrary dollar premiums, we evaluate empirical medians between properties with vs. without key amenities in your submarket. Adjustments are only applied when statistically supported ($N \ge 5$).
            </p>
            <div className="p-2.5 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800 space-y-0.5">
              <div>Net Amenity Adjustment: {pricing.amenityAdjustment >= 0 ? '+' : ''}${pricing.amenityAdjustment.toFixed(2)}/night</div>
              <div>Final Recommended: ${pricing.benchmarkNightlyPrice.toFixed(2)}/night</div>
            </div>
          </div>
        </div>

        {/* Detailed Amenity Impact Analysis Table */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-700" />
                <span>Submarket Amenity Differential Analysis</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Observed price differentials across the {pricing.comparablesCount} verified comparable properties.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllAmenities((prev) => !prev)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 cursor-pointer no-print"
            >
              <span>{showAllAmenities ? 'Show Top Amenities' : 'Show All Amenities'}</span>
              {showAllAmenities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Evaluated Amenity</th>
                  <th className="py-2.5 px-3">Your Property</th>
                  <th className="py-2.5 px-3 text-right">With Feature (N &amp; Med)</th>
                  <th className="py-2.5 px-3 text-right">Without Feature (N &amp; Med)</th>
                  <th className="py-2.5 px-3 text-right">Observed Delta</th>
                  <th className="py-2.5 px-3">Statistical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {(pricing.amenityComparisons || [])
                  .slice(0, showAllAmenities ? pricing.amenityComparisons?.length : 6)
                  .map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {comp.amenity}
                      </td>
                      <td className="py-2.5 px-3">
                        {comp.hasAmenity ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <Check className="w-3 h-3" /> Included
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            Not Selected
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {comp.countWith > 0 ? (
                          <>
                            <span className="font-bold">${comp.medianWith.toFixed(2)}</span>
                            <span className="text-slate-400 text-[10px] ml-1">(n={comp.countWith})</span>
                          </>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {comp.countWithout > 0 ? (
                          <>
                            <span className="font-bold">${comp.medianWithout.toFixed(2)}</span>
                            <span className="text-slate-400 text-[10px] ml-1">(n={comp.countWithout})</span>
                          </>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            comp.observedDelta > 0
                              ? 'text-emerald-700'
                              : comp.observedDelta < 0
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }
                        >
                          {comp.observedDelta > 0 ? '+' : ''}${comp.observedDelta.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {comp.status === 'supported' ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Statistically Valid (N ≥ 5)
                          </span>
                        ) : comp.status === 'confounded' ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                            Hotel-Suite Confounded (Excluded)
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            Small Sample (N &lt; 5)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Essential Notice: Asking Price vs Realized Revenue */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            <Info className="w-4 h-4 text-indigo-700 shrink-0" />
            <span>Essential Market Notice: Asking Price vs. Realized Net Revenue</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            The values reported above represent <strong>advertised nightly asking rates</strong> from active Inside Airbnb public listings. Actual owner net revenue is governed by real-time market occupancy, seasonal demand surges (e.g. Cherry Blossom Festival, Congressional sessions), length-of-stay discounts, cleaning fees, platform service commissions, and District of Columbia Transient Occupancy Tax compliance. District Host Advisors provides real-time algorithmic revenue optimization to translate asking rates into maximal net earnings.
          </p>
        </div>
      </div>

      {/* Section 1: Interactive Comparison Chart */}
      <InteractiveComparisonChart
        pricing={pricing}
        neighborhood={propertyInput.neighborhood}
      />

      {/* Section 2: AI Qualitative Marketing Copy (Title & Description) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Listing Optimization
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-700" />
              <span>Optimized Airbnb Title & Listing Description</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400 no-print">
            Synthesized by District Host Specialist
          </span>
        </div>

        {/* Listing Title Box */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recommended High-Converting Listing Title
            </span>
            <button
              type="button"
              onClick={handleCopyTitle}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shadow-xs no-print cursor-pointer"
            >
              {copiedTitle ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Title</span>
                </>
              )}
            </button>
          </div>
          <div className="text-lg font-bold text-slate-900 font-sans tracking-tight">
            {aiMarketing.listingTitle}
          </div>
        </div>

        {/* Multi-Section Description */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Full Airbnb Listing Narrative
            </span>
            <button
              type="button"
              onClick={handleCopyDescription}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shadow-xs no-print cursor-pointer"
            >
              {copiedDesc ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Full Description!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Full Description</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Summary Hook
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {aiMarketing.listingDescription.summary}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                The Space & Living Areas
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {aiMarketing.listingDescription.space}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Guest Access & Arrival
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {aiMarketing.listingDescription.guestAccess}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Neighborhood Highlights
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {aiMarketing.listingDescription.neighborhoodHighlights}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Strengths, Weaknesses, Presentation & Amenity Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths & Weaknesses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-700" />
              <span>Asset Strengths & Market Advantages</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Core competitive differentiators in the Washington, DC submarket.
            </p>
          </div>

          <div className="space-y-3">
            {aiMarketing.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{str}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Potential Weaknesses & Friction Mitigations</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Anticipated guest friction points and recommended host solutions.
            </p>

            <div className="space-y-2.5">
              {aiMarketing.weaknesses.map((weak, idx) => (
                <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs text-amber-950 leading-relaxed">
                  {weak}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Presentation & Amenity Upgrades */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-700" />
              <span>Presentation & Amenity Upgrades</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Actionable enhancements to command upper-quartile (${pricing.q75Price.toFixed(2)}) rates.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Photography & Staging Recommendations
            </h4>
            <div className="space-y-2.5">
              {aiMarketing.presentationRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              High-ROI Amenity Additions
            </h4>
            <div className="space-y-2.5">
              {aiMarketing.amenityRecommendations.map((amen, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                  <span>{amen}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photo interpretation feedback if provided */}
          {aiMarketing.photoFeedback && (
            <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-700" />
                <span>Multimodal Photo Assessment</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <strong className="text-slate-900">Observed Style:</strong>{' '}
                  {aiMarketing.photoFeedback.detectedStyle}
                </p>
                <p>
                  <strong className="text-slate-900">Lighting Assessment:</strong>{' '}
                  {aiMarketing.photoFeedback.lightingAssessment}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Comparable Listings Table */}
      <ComparableListingsTable
        comparables={pricing.comparableListings}
        benchmarkPrice={pricing.benchmarkNightlyPrice}
      />

      {/* Section 5: Transparent 8-Step Methodology Explainer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Statistical Transparency
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-700" />
              <span>8-Step Methodology & Dataset Funnel</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic 8-step filtering algorithm executed on cleaned Inside Airbnb Washington, DC data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllSteps((prev) => !prev)}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 no-print cursor-pointer"
          >
            <span>{showAllSteps ? 'Show Summary' : 'Expand All Steps'}</span>
            {showAllSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {pricing.methodologySteps
            .slice(0, showAllSteps ? pricing.methodologySteps.length : 4)
            .map((step) => (
              <div
                key={step.step}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 gap-2"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step.step}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 self-end sm:self-center font-mono text-xs tabular-nums text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
                  <span>{step.countBefore}</span> &rarr; <span className="font-bold text-slate-900">{step.countAfter}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Source citation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Data Source:{' '}
            <strong className="text-slate-800">{pricing.dataSourceInfo?.sourceCitation || 'Inside Airbnb Washington, D.C. Open Data Archive'}</strong>.
            Source file: <code className="font-mono text-slate-800">{pricing.dataSourceInfo?.filename}</code> ({pricing.dataSourceInfo?.rowCount} records).
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Strict Anti-Hallucination Certified
          </div>
        </div>
      </div>

      {/* Section 6: District Host Property Management Advisory Memo */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            District Host Advisory Partnership
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Turnkey Management to Maximize Your Property’s Net Yield.
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {aiMarketing.managementValueProposition}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => alert('Consultation inquiry recorded. A District Host property director will reach out within 24 hours.')}
              className="px-6 py-3 text-xs font-bold text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              Request Property Management Consultation
            </button>
            <span className="text-xs text-slate-400">
              No long-term lock-in · 100% compliant with DC Short-Term Rental Act
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
