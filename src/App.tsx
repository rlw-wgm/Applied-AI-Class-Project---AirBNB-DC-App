import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PropertyQuestionnaire } from './components/PropertyQuestionnaire';
import { GeneratingAnimation } from './components/GeneratingAnimation';
import { ReportDashboard } from './components/ReportDashboard';
import { MethodologyModal } from './components/MethodologyModal';
import { Footer } from './components/Footer';
import { FullAdvisorReport, PropertyInput } from './types/advisor';
import { calculateComparablePricing } from './utils/pricingEngine';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  Building,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  const [report, setReport] = useState<FullAdvisorReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingNeighborhood, setLoadingNeighborhood] = useState<string>('Dupont Circle');
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const questionnaireRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const scrollToQuestionnaire = () => {
    questionnaireRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Run the validated Dupont Circle reference sample case
  const handleRunDupontSample = async () => {
    const sampleInput: PropertyInput = {
      neighborhood: 'Dupont Circle, Connecticut Avenue/K Street',
      propertyType: 'condo',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: [
        'High-speed Wi-Fi',
        'Dedicated workspace',
        'In-unit washer & dryer',
        'Full chef’s kitchen',
        'Central air conditioning',
        'Keyless self check-in',
      ],
      photos: [],
      notes: 'Renovated Dupont Circle condominium with high ceilings and private courtyard balcony.',
    };

    await handleGenerateReport(sampleInput);
  };

  const handleGenerateReport = async (input: PropertyInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingNeighborhood(input.neighborhood.split(',')[0]);

    // Scroll to questionnaire or loading area
    questionnaireRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      // Step 1: Calculate deterministic pricing
      const pricingRes = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!pricingRes.ok) {
        const errJson = await pricingRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Calculation error (Status ${pricingRes.status})`);
      }

      const pricingResult = await pricingRes.json();

      // Step 2: Generate Qualitative AI Assessment via Server
      let aiMarketingResult;
      try {
        const aiRes = await fetch('/api/ai/qualitative-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyInput: input,
            pricing: pricingResult,
          }),
        });

        if (aiRes.ok) {
          aiMarketingResult = await aiRes.json();
        } else {
          throw new Error('AI endpoint returned error');
        }
      } catch (aiErr) {
        console.warn('Using client fallback for qualitative advisory:', aiErr);
        aiMarketingResult = {
          listingTitle: `${input.neighborhood.split(',')[0]} Oasis | Modern ${input.propertyType} with Sunlit Layout`,
          listingDescription: {
            summary: `Experience the finest of Washington, DC living in this beautifully appointed ${input.bedrooms === 0 ? 'studio' : `${input.bedrooms}-bedroom`} residence.`,
            space: `Designed for corporate executives and traveling diplomats, this home boasts high-speed connectivity, an ergonomic workspace, and peaceful sleeping quarters for up to ${input.maxGuests} guests.`,
            guestAccess: 'Guests enjoy exclusive access to the entire home with 24/7 keyless contactless self check-in.',
            neighborhoodHighlights: `Situated in coveted ${input.neighborhood.split(',')[0]}, you are steps from historic avenues, vibrant local cafes, and rapid Metro rail access.`,
          },
          strengths: [
            `Coveted location in ${input.neighborhood.split(',')[0]} with superior transit walkability.`,
            `High-demand ${input.bedrooms === 0 ? 'studio' : `${input.bedrooms}-bedroom`} configuration with premium entire-home privacy.`,
            `Optimal amenity package configured for sustained 5-star review velocity.`,
          ],
          weaknesses: [
            `Street parking in central DC is highly restricted; provide a clear garage parking map in your guest arrival guide.`,
            `Acoustic transmission in historic buildings; install noise-dampening rugs and white noise machines.`,
          ],
          presentationRecommendations: [
            'Schedule professional HDR wide-angle photography during morning golden hour.',
            'Dress beds with crisp 300+ thread-count white percale linens and down-alternative duvets.',
            'Stage the workspace with fresh greenery and curated Washingtonian literature.',
          ],
          amenityRecommendations: [
            'Install a Nespresso Vertuo coffee station with complimentary roasting pods.',
            'Equip the desk with high-speed mesh Wi-Fi and universal charging docks.',
            'Provide luxury refillable bath amenities in eco-friendly dispensers.',
          ],
          managementValueProposition:
            'District Host Advisors provides turnkey revenue optimization, hotel-standard turnovers, 24/7 guest communications, and dynamic pricing management to outperform the submarket benchmark.',
        };
      }

      const newReport: FullAdvisorReport = {
        propertyInput: input,
        pricing: pricingResult,
        aiMarketing: aiMarketingResult,
        generatedAt: new Date().toISOString(),
        reportId: `DHA-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setReport(newReport);
      setIsLoading(false);

      // Trigger celebratory confetti for successfully generated report
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#312e81', '#10b981'],
        });
      } catch (e) {
        // ignore if canvas not supported
      }

      // Smooth scroll to the report dashboard
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected error occurred while analyzing the dataset. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        onStartClick={scrollToQuestionnaire}
        onMethodologyClick={() => setShowMethodologyModal(true)}
        hasReport={!!report}
        onViewReportClick={scrollToReport}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onStartClick={scrollToQuestionnaire}
          onRunDupontSample={handleRunDupontSample}
          isLoading={isLoading}
        />

        {/* Questionnaire Section */}
        <div ref={questionnaireRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading ? (
            <GeneratingAnimation neighborhoodName={loadingNeighborhood} />
          ) : (
            <PropertyQuestionnaire
              onSubmit={handleGenerateReport}
              isLoading={isLoading}
              initialValues={report ? report.propertyInput : undefined}
            />
          )}
        </div>

        {/* Results Report Section */}
        {report && !isLoading && (
          <section ref={reportRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <ReportDashboard
              report={report}
              onEditClick={scrollToQuestionnaire}
            />
          </section>
        )}

        {/* DC Market Insights & Knowledge Section (below fold) */}
        <section id="market-insights" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 no-print">
          <div className="pb-8 border-b border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              District of Columbia Market Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Navigating Washington, DC Short-Term Rental Dynamics
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Key seasonal trends, regulatory compliance frameworks, and submarket characteristics across the District.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Peak Spring Cherry Blossom Surge
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                March through May marks the District’s highest transient tourist compression. Dupont Circle, Georgetown, and Capitol Hill see rapid booking velocity with upper-quartile yields exceeding standard off-peak baseline rates.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Congressional & Diplomatic Demand
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                September through November witnesses heavy visiting corporate, embassy, and policy consultant traffic. High-speed mesh Wi-Fi, dedicated workstations, and hotel-standard quietude are essential to capture top per-night premiums.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                DC Short-Term Rental Act Compliance
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                All short-term rental hosts in the District must operate with an approved Short-Term Rental or Vacation Rental license from the DC Department of Buildings (DOB), maintaining liability coverage and smoke/CO sensors.
              </p>
            </div>
          </div>
        </section>

        {/* About Company / Management Callout Section */}
        <section id="about-management" className="bg-white border-t border-slate-200 py-16 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  About District Host Advisors
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  A High-Touch Boutique Management Firm Built for DC Property Owners.
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We bridge the gap between institutional hospitality performance and personalized property care. From architectural photography and professional interior staging to dynamic algorithm-driven daily pricing and 24/7 guest concierge, we unlock your home’s highest potential without taking your time.
                </p>

                <div className="pt-2 grid grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dynamic Algorithmic Rate Optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% Turnkey Linen & Cleaning Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>DC License & Tax Regulatory Filings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>24/7 Diplomatic & VIP Guest Care</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={scrollToQuestionnaire}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <span>Start Your Property Valuation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                  <img
                    src="/src/assets/images/dupont_circle_neighborhood_1794425282553.jpg"
                    alt="Historic Dupont Circle fountain and park"
                    className="w-full h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Dupont Circle Historic District · Washington, DC</span>
                    <span className="font-semibold text-indigo-700">Submarket Hub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodologyModal}
        onClose={() => setShowMethodologyModal(false)}
      />
    </div>
  );
}
