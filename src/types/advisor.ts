export type PropertyType = 'condo' | 'apartment' | 'house' | 'townhouse';

export interface PropertyPhoto {
  id: string;
  name: string;
  dataUrl: string;
}

export interface PropertyInput {
  neighborhood: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  photos: PropertyPhoto[];
  email?: string;
  notes?: string;
}

export interface ComparableListing {
  id: string;
  name: string;
  neighborhood: string;
  property_type: string;
  room_type: string;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  min_nights: number;
  max_nights?: number;
  rating: number;
  reviews_count: number;
  lat: number;
  lng: number;
  amenities: string[];
  is_duplicate_candidate?: boolean;
}

export interface MethodologyStep {
  step: number;
  title: string;
  detail: string;
  countBefore: number;
  countAfter: number;
}

export interface AmenityComparison {
  amenity: string;
  hasAmenity: boolean;
  countWith: number;
  countWithout: number;
  medianWith: number;
  medianWithout: number;
  observedDelta: number; // medianWith - medianWithout
  status: 'supported' | 'insufficient_sample' | 'confounded';
  explanation: string;
}

export interface DataSourceInfo {
  filename: string;
  sourceCitation: string;
  snapshotDate: string;
  rowCount: number;
}

export interface PricingCalculationResult {
  benchmarkNightlyPrice: number; // Amenity-adjusted or baseline recommended asking price
  unadjustedMedian: number; // Raw empirical submarket median (exact dataset value)
  amenityAdjustment: number; // Net empirical amenity adjustment
  amenityAdjustedPrice: number; // unadjustedMedian + amenityAdjustment
  q25Price: number; // 25th percentile
  q75Price: number; // 75th percentile
  iqr: number;
  minComparablePrice: number;
  maxComparablePrice: number;
  averageComparablePrice: number;
  comparablesCount: number;
  rawCandidatesCount: number;
  outliersExcludedCount: number;
  duplicatesExcludedCount: number;
  comparableListings: ComparableListing[];
  priceDistribution: {
    rangeLabel: string;
    count: number;
    min: number;
    max: number;
  }[];
  methodologySteps: MethodologyStep[];
  isDataSufficient: boolean;
  dataSufficiencyNotice?: string;
  amenityComparisons: AmenityComparison[];
  dataSourceInfo: DataSourceInfo;
  criteriaRelaxations?: string[];
  referenceValidation?: {
    isReferenceCase: boolean;
    targetComparables: number;
    targetMedian: number;
    targetQ25: number;
    targetQ75: number;
    matchesTarget: boolean;
  };
}

export interface AdvisorAIReport {
  listingTitle: string;
  listingDescription: {
    summary: string;
    space: string;
    guestAccess: string;
    neighborhoodHighlights: string;
  };
  strengths: string[];
  weaknesses: string[];
  presentationRecommendations: string[];
  amenityRecommendations: string[];
  photoFeedback?: {
    detectedStyle: string;
    lightingAssessment: string;
    stagingSuggestions: string[];
  };
  managementValueProposition: string;
  dataSufficiencyNotice?: string;
}

export interface FullAdvisorReport {
  propertyInput: PropertyInput;
  pricing: PricingCalculationResult;
  aiMarketing: AdvisorAIReport;
  generatedAt: string;
  reportId: string;
}
