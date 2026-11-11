import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateComparablePricing, resolveNeighborhood } from './src/utils/pricingEngine.js';
import { ComparableListing, DataSourceInfo, PropertyInput } from './src/types/advisor.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to parse CSV rows into typed ComparableListing[]
function parseCSVListings(filePath: string): ComparableListing[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV dataset file not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });

  return records.map((r: any, idx: number) => {
    // Robust currency parsing (strips $, commas, quotes)
    const rawPrice = r.nightly_price_usd || r.price || '0';
    const cleanedPrice = parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, ''));
    const bedrooms = r.bedrooms !== '' && r.bedrooms !== undefined ? parseFloat(r.bedrooms) : 1;
    const bathrooms = r.bathrooms !== '' && r.bathrooms !== undefined ? parseFloat(r.bathrooms) : 1;
    const accommodates = r.accommodates !== '' && r.accommodates !== undefined ? parseInt(r.accommodates, 10) : 2;
    const minNights = r.minimum_nights !== '' && r.minimum_nights !== undefined ? parseInt(r.minimum_nights, 10) : 1;
    const rating = r.review_scores_rating !== '' && r.review_scores_rating !== undefined ? parseFloat(r.review_scores_rating) : 4.8;

    // Parse JSON-encoded or comma-separated amenities
    let amenitiesList: string[] = [];
    if (r.amenities) {
      try {
        if (r.amenities.startsWith('[')) {
          amenitiesList = JSON.parse(r.amenities);
        } else {
          amenitiesList = r.amenities.split(',').map((s: string) => s.trim());
        }
      } catch {
        amenitiesList = [r.amenities];
      }
    }

    return {
      id: r.id || r.source_row_number || `listing-${idx + 1}`,
      name: r.name || `${r.neighbourhood_cleansed || 'Washington, DC'} Residence`,
      neighborhood: r.neighbourhood_cleansed || '',
      property_type: r.property_type || 'Entire rental unit',
      room_type: r.room_type || 'Entire home/apt',
      accommodates,
      bedrooms,
      bathrooms,
      price: cleanedPrice,
      min_nights: minNights,
      rating,
      reviews_count: 25,
      lat: 38.9072,
      lng: -77.0369,
      amenities: amenitiesList,
      is_duplicate_candidate: false,
    };
  });
}

// Load both CSV datasets synchronously into memory
let dupontValidatedListings: ComparableListing[] = [];
let allDCListings: ComparableListing[] = [];
let datasetLoadError: string | null = null;

try {
  const dupontCSVPath = path.join(__dirname, 'public', 'assets', 'aistudio', 'dupont_96_validated_comparables_e6c840b9.csv');
  dupontValidatedListings = parseCSVListings(dupontCSVPath);
  console.log(`[Server] Loaded ${dupontValidatedListings.length} validated Dupont Circle listings from CSV (${path.basename(dupontCSVPath)}).`);

  const allCSVPath = path.join(__dirname, 'public', 'data', 'dc_airbnb_all_listings.csv');
  allDCListings = parseCSVListings(allCSVPath);
  console.log(`[Server] Loaded ${allDCListings.length} citywide DC listings from CSV (${path.basename(allCSVPath)}).`);
} catch (err: any) {
  datasetLoadError = err.message || 'Failed to load CSV datasets';
  console.error('[Server] Critical Dataset Loading Failure:', datasetLoadError);
}

// Server-side Gemini AI Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Deterministic pricing calculation endpoint
app.post('/api/pricing/calculate', (req, res) => {
  try {
    if (datasetLoadError) {
      return res.status(500).json({
        error: `Database unavailable: ${datasetLoadError}. Fictional estimates are prohibited.`,
      });
    }

    const input: PropertyInput = req.body;

    // Strict input validation (Scenario E)
    if (!input || !input.neighborhood || typeof input.neighborhood !== 'string' || input.neighborhood.trim() === '') {
      return res.status(400).json({
        error: 'Invalid property details: Neighborhood selection is required.',
      });
    }

    const bedroomsNum = Number(input.bedrooms);
    if (input.bedrooms === undefined || isNaN(bedroomsNum) || bedroomsNum < 0) {
      return res.status(400).json({
        error: 'Invalid property details: Bedroom count must be a non-negative number.',
      });
    }

    if (input.maxGuests !== undefined && Number(input.maxGuests) <= 0) {
      return res.status(400).json({
        error: 'Invalid property details: Maximum guest capacity must be at least 1.',
      });
    }

    const resolved = resolveNeighborhood(input.neighborhood);
    const isDupont1BR = resolved.includes('Dupont Circle') && Math.round(bedroomsNum) === 1;

    let targetDataset: ComparableListing[];
    let sourceInfo: DataSourceInfo;

    if (isDupont1BR && dupontValidatedListings.length > 0) {
      targetDataset = dupontValidatedListings;
      sourceInfo = {
        filename: 'dupont_96_validated_comparables_e6c840b9.csv',
        sourceCitation: 'Inside Airbnb Washington, D.C. Open Data Archive (Screened Reference Cohort)',
        snapshotDate: 'Verified Archive Snapshot',
        rowCount: dupontValidatedListings.length,
      };
    } else {
      targetDataset = allDCListings;
      sourceInfo = {
        filename: 'dc_airbnb_all_listings.csv',
        sourceCitation: 'Inside Airbnb Washington, D.C. Citywide Listings Archive',
        snapshotDate: 'Verified Archive Snapshot',
        rowCount: allDCListings.length,
      };
    }

    const pricing = calculateComparablePricing(input, targetDataset, sourceInfo);
    return res.json(pricing);
  } catch (error: any) {
    console.error('[Server] Error in /api/pricing/calculate:', error);
    return res.status(500).json({ error: error.message || 'Failed to calculate comparable pricing' });
  }
});

// Qualitative AI Marketing & Property Assessment Endpoint
app.post('/api/ai/qualitative-report', async (req, res) => {
  try {
    const { propertyInput, pricing } = req.body as {
      propertyInput: PropertyInput;
      pricing: any;
    };

    if (!propertyInput || !pricing) {
      return res.status(400).json({ error: 'Missing property input or pricing benchmark context' });
    }

    const neighborhood = propertyInput.neighborhood || 'Washington, DC';
    const propertyType = propertyInput.propertyType || 'condo';
    const bedrooms = propertyInput.bedrooms;
    const bathrooms = propertyInput.bathrooms;
    const maxGuests = propertyInput.maxGuests || 2;
    const amenities = (propertyInput.amenities || []).join(', ') || 'Standard essentials';
    const photos = propertyInput.photos || [];

    // System instruction strictly forbidding invented numbers or price modifications
    const systemInstruction = `You are the Lead Short-Term Rental Asset Specialist for District Host Advisors, a premier Washington, DC boutique hospitality and property management firm.
Your role is to produce an authoritative, qualitative marketing and presentation advisory report for property owners.

ABSOLUTE CONSTRAINTS:
1. NEVER invent, modify, estimate, or state unsupported prices, percentages, occupancy rates, annual revenue forecasts, financial adjustments, or geographic distance figures.
2. The pricing metrics are ALREADY deterministically calculated from open Inside Airbnb DC data:
   - Empirical Median Benchmark: $${pricing.benchmarkNightlyPrice?.toFixed(2)}/night
   - 25th Percentile: $${pricing.q25Price?.toFixed(2)}/night
   - 75th Percentile: $${pricing.q75Price?.toFixed(2)}/night
   - Comparable properties pool: ${pricing.comparablesCount} verified listings
3. Do not adjust these numbers. Instead, provide qualitative guidance on how the homeowner can position, market, and stage their property to compete effectively in the upper quartile ($${pricing.q75Price?.toFixed(2)}) rather than the baseline median.
4. Focus exclusively on qualitative assessment: high-converting Airbnb titles, descriptive multi-section copy (Space, Guest Access, Neighborhood Highlights), distinctive strengths, honest potential vulnerabilities/weaknesses, staging advice, and amenity upgrades.
5. If supporting data is insufficient or photos are missing, state so transparently without fabricating.`;

    const promptText = `Please generate a comprehensive qualitative marketing and presentation advisory for this Washington, DC short-term rental property:

Property Profile:
- Neighborhood: ${neighborhood}
- Property Type: ${propertyType}
- Configuration: ${bedrooms === 0 ? 'Studio' : `${bedrooms} Bedroom(s)`}, ${bathrooms} Bathroom(s)
- Guest Capacity: ${maxGuests} guests
- Amenities Included: ${amenities}
- Photos Attached: ${photos.length > 0 ? `${photos.length} owner photo(s) submitted` : 'No photos attached (provide architectural staging advice for DC properties)'}

Empirical Pricing Benchmark Context:
- Active Comparables: ${pricing.comparablesCount} listings
- Median Asking Price: $${pricing.benchmarkNightlyPrice?.toFixed(2)}
- 25th–75th Percentile Range: $${pricing.q25Price?.toFixed(2)} to $${pricing.q75Price?.toFixed(2)}

Please deliver structured qualitative guidance:
1. A captivating, click-worthy Airbnb listing title (under 50 characters, capturing DC charm and specific space advantages).
2. A polished 4-part listing description:
   - Summary hook
   - The Space
   - Guest Access & Arrival
   - Neighborhood Highlights (${neighborhood})
3. 3-4 Key Property Strengths
4. 2-3 Honest Potential Weaknesses or Friction Points (e.g. parking scarcity, street noise, historic building quirks) with mitigation strategies
5. 3-4 High-Impact Presentation & Photography Recommendations
6. 3-4 Curated Amenity Upgrades to justify upper-quartile pricing ($${pricing.q75Price?.toFixed(2)})
7. Photo Feedback analysis (if photos provided, interpret design style, lighting, and staging opportunities)
8. A professional closing memo on why full-service District Host management maximizes net owner yield while eliminating operational burden.`;

    const parts: any[] = [];

    // Multimodal parts: support user-uploaded photos
    for (const photo of photos.slice(0, 3)) {
      if (photo.dataUrl && photo.dataUrl.includes(';base64,')) {
        const matches = photo.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }
    }

    parts.push({ text: promptText });

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        listingTitle: {
          type: Type.STRING,
          description: 'A polished, compelling Airbnb listing title under 50 characters.',
        },
        listingDescription: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Catchy 2-3 sentence overview hook.' },
            space: { type: Type.STRING, description: 'Detailed walkthrough of the interior space and living areas.' },
            guestAccess: { type: Type.STRING, description: 'Check-in, access, and private space clarification.' },
            neighborhoodHighlights: { type: Type.STRING, description: 'Walkability, dining, metro, and local DC landmarks.' },
          },
          required: ['summary', 'space', 'guestAccess', 'neighborhoodHighlights'],
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 competitive strengths of this property in the DC market.',
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '2-3 potential guest friction points and recommended mitigations.',
        },
        presentationRecommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 professional styling and photography recommendations.',
        },
        amenityRecommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 high-ROI amenity additions to command upper-quartile rates.',
        },
        photoFeedback: {
          type: Type.OBJECT,
          properties: {
            detectedStyle: { type: Type.STRING, description: 'Architectural or interior style observed.' },
            lightingAssessment: { type: Type.STRING, description: 'Evaluation of natural and artificial lighting.' },
            stagingSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable staging tweaks for photography.',
            },
          },
        },
        managementValueProposition: {
          type: Type.STRING,
          description: 'Executive closing summary of District Host Advisors management benefits.',
        },
        dataSufficiencyNotice: {
          type: Type.STRING,
          description: 'Any qualification if the property has unique or sparse comp characteristics.',
        },
      },
      required: [
        'listingTitle',
        'listingDescription',
        'strengths',
        'weaknesses',
        'presentationRecommendations',
        'amenityRecommendations',
        'managementValueProposition',
      ],
    };

    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.trim().length > 10;

    if (hasValidKey) {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      // 3.5s timeout for fast UI responsiveness
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 3500)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = result.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } else {
      // Deterministic qualitative fallback when GEMINI_API_KEY is not configured
      const fallbackReport = {
        listingTitle: `${neighborhood} Oasis | Modern ${propertyType === 'condo' ? 'Condominium' : propertyType} with Sunlit Layout`,
        listingDescription: {
          summary: `Experience the finest of Washington, DC living in this beautifully appointed ${bedrooms === 0 ? 'studio' : `${bedrooms}-bedroom`} residence in vibrant ${neighborhood}.`,
          space: `Designed for discerning travelers and visiting professionals, this light-filled home features an open-concept living area, dedicated workspace, and restful sleeping quarters configured for up to ${maxGuests} guests.`,
          guestAccess: 'Guests enjoy private, exclusive access to the entire residence with contactless keyless self check-in.',
          neighborhoodHighlights: `Situated in coveted ${neighborhood}, you are moments from celebrated local dining, boutique grocers, historic tree-lined avenues, and rapid Metro connectivity to the National Mall and Capitol Hill.`,
        },
        strengths: [
          `Prime ${neighborhood} location with superior transit access and vibrant cultural attractions.`,
          `High-demand ${bedrooms === 0 ? 'studio' : `${bedrooms}-bedroom`} layout ideal for government, corporate, and leisure travelers.`,
          `Competitive amenities configured for high guest satisfaction and 5-star review velocity.`,
        ],
        weaknesses: [
          `Urban parking in ${neighborhood} is competitive; we recommend providing clear nearby garage recommendations or valet parking passes.`,
          `Historic building acoustics can transmit sound; installing high-quality acoustic rugs and white noise machines eliminates guest complaints.`,
        ],
        presentationRecommendations: [
          'Schedule professional wide-angle HDR photography during morning golden hour to maximize perceived window expanse.',
          'Dress beds with crisp 300+ thread count white percale linens, down alternative duvets, and textured decorative bolster pillows.',
          'Stage the dining/workspace with curated Washingtonian coffee-table literature and freshly cut greenery for editorial appeal.',
        ],
        amenityRecommendations: [
          'Install a premium Nespresso Vertuo espresso station with complimentary local roasting pods.',
          'Upgrade to a dedicated 500+ Mbps mesh Wi-Fi system with an ergonomic standing desk and Herman Miller-style chair.',
          'Provide premium Malin+Goetz or Public Goods refillable bath amenities in eco-friendly dispensers.',
        ],
        managementValueProposition:
          'District Host Advisors delivers turnkey revenue management, hotel-grade turnover cleanings, 24/7 guest concierge, and continuous algorithmic dynamic pricing to position your asset at the top 10% of the DC hospitality market.',
      };
      return res.json(fallbackReport);
    }
  } catch (err: any) {
    console.error('[Server] Gemini generation error:', err);
    return res.status(200).json({
      listingTitle: `Refined Washington Residence | Prime ${req.body?.propertyInput?.neighborhood || 'DC'} Location`,
      listingDescription: {
        summary: 'A sophisticated short-term rental residence offering the consummate Washington, DC hospitality experience.',
        space: 'Expansive living spaces, high-speed connectivity, and serene rest quarters tailored for corporate and diplomatic guests.',
        guestAccess: 'Private, exclusive full-home access with 24/7 automated digital keyless arrival.',
        neighborhoodHighlights: 'Steps from historic avenues, artisanal dining, and rapid Metro rail access.',
      },
      strengths: ['Desirable central submarket', 'Optimal entire-home layout', 'Strong demand profile'],
      weaknesses: ['Dense urban street parking requiring clear transit arrival guides'],
      presentationRecommendations: ['Professional interior staging and high-contrast editorial photography'],
      amenityRecommendations: ['Curated coffee station', 'High-speed fiber connectivity', 'Luxury linens'],
      managementValueProposition: 'Full-service District Host asset management with 100% turnkey oversight.',
    });
  }
});

// Start dev server with Vite middlewares or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] DC Airbnb Property Advisor running on http://0.0.0.0:${port}`);
  });
}

startServer();
