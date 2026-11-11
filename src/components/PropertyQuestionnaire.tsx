import React, { useState } from 'react';
import {
  Building2,
  Bed,
  Bath,
  Users,
  Wifi,
  Upload,
  X,
  Image as ImageIcon,
  Check,
  Mail,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import { PropertyInput, PropertyPhoto, PropertyType } from '../types/advisor';
import { COMMON_AMENITIES, DC_NEIGHBORHOOD_OPTIONS } from '../utils/pricingEngine';

interface PropertyQuestionnaireProps {
  onSubmit: (input: PropertyInput) => void;
  isLoading: boolean;
  initialValues?: Partial<PropertyInput>;
}

export const PropertyQuestionnaire: React.FC<PropertyQuestionnaireProps> = ({
  onSubmit,
  isLoading,
  initialValues,
}) => {
  const [neighborhood, setNeighborhood] = useState<string>(
    initialValues?.neighborhood || 'Dupont Circle, Connecticut Avenue/K Street'
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialValues?.propertyType || 'condo'
  );
  const [bedrooms, setBedrooms] = useState<number>(
    initialValues?.bedrooms !== undefined ? initialValues.bedrooms : 1
  );
  const [bathrooms, setBathrooms] = useState<number>(
    initialValues?.bathrooms !== undefined ? initialValues.bathrooms : 1
  );
  const [maxGuests, setMaxGuests] = useState<number>(
    initialValues?.maxGuests || 2
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialValues?.amenities || [
      'High-speed Wi-Fi',
      'Dedicated workspace',
      'In-unit washer & dryer',
      'Full chef’s kitchen',
      'Central air conditioning',
      'Keyless self check-in',
    ]
  );
  const [photos, setPhotos] = useState<PropertyPhoto[]>(
    initialValues?.photos || []
  );
  const [email, setEmail] = useState<string>(initialValues?.email || '');
  const [notes, setNotes] = useState<string>(initialValues?.notes || '');
  const [dragActive, setDragActive] = useState<boolean>(false);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    const remainingSlots = 4 - photos.length;
    const toProcess = files.slice(0, remainingSlots);

    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: PropertyPhoto = {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            dataUrl: event.target.result as string,
          };
          setPhotos((prev) => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLoadSamplePhotos = async () => {
    // Load generated real DC sample interior & bedroom
    try {
      const sample1 = await fetch('/src/assets/images/luxury_dc_interior_1794425282058.jpg');
      const blob1 = await sample1.blob();
      const reader1 = new FileReader();
      reader1.onload = () => {
        const p1: PropertyPhoto = {
          id: 'sample-living',
          name: 'Modern Dupont Living Room.jpg',
          dataUrl: reader1.result as string,
        };

        const reader2 = new FileReader();
        fetch('/src/assets/images/designer_bedroom_suite_1794425282229.jpg')
          .then((res) => res.blob())
          .then((blob2) => {
            reader2.onload = () => {
              const p2: PropertyPhoto = {
                id: 'sample-bedroom',
                name: 'Exposed Brick Master Bedroom.jpg',
                dataUrl: reader2.result as string,
              };
              setPhotos([p1, p2]);
            };
            reader2.readAsDataURL(blob2);
          });
      };
      reader1.readAsDataURL(blob1);
    } catch (e) {
      console.warn('Could not load sample photos directly:', e);
    }
  };

  const handleResetToDupontSample = () => {
    setNeighborhood('Dupont Circle, Connecticut Avenue/K Street');
    setPropertyType('condo');
    setBedrooms(1);
    setBathrooms(1);
    setMaxGuests(2);
    setSelectedAmenities([
      'High-speed Wi-Fi',
      'Dedicated workspace',
      'In-unit washer & dryer',
      'Full chef’s kitchen',
      'Central air conditioning',
      'Keyless self check-in',
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      neighborhood,
      propertyType,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities: selectedAmenities,
      photos,
      email,
      notes,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 questionnaire-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
            Property Questionnaire
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Enter Your Washington, DC Property Specifications
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            All pricing calculations are computed deterministically from active Inside Airbnb market data.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDupontSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset to Dupont Circle Default</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Row 1: Neighborhood & Property Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DC Neighborhood */}
          <div>
            <label
              htmlFor="neighborhood-select"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              DC Neighborhood <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="neighborhood-select"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all cursor-pointer font-medium"
              >
                {DC_NEIGHBORHOOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Defaults to Dupont Circle (validated benchmark test case).</span>
            </p>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Property Classification <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { type: 'condo', label: 'Condo' },
                  { type: 'apartment', label: 'Apartment' },
                  { type: 'house', label: 'House' },
                  { type: 'townhouse', label: 'Townhouse' },
                ] as const
              ).map(({ type, label }) => {
                const isSelected = propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Engine matches same type, expanding to complementary residential units if inventory requires.
            </p>
          </div>
        </div>

        {/* Row 2: Bedrooms, Bathrooms, Max Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-indigo-600" />
              <span>Bedrooms</span>
            </label>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {[
                { val: 0, label: 'Studio' },
                { val: 1, label: '1 BR' },
                { val: 2, label: '2 BR' },
                { val: 3, label: '3 BR' },
                { val: 4, label: '4+ BR' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBedrooms(val)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    bedrooms === val
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-indigo-600" />
              <span>Bathrooms</span>
            </label>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {[1, 1.5, 2, 2.5, 3].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBathrooms(val)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    bathrooms === val
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Max Guests */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Max Capacity</span>
            </label>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {[1, 2, 4, 6, 8].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMaxGuests(val)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    maxGuests === val
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {val} {val === 1 ? 'Guest' : 'Guests'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Key Amenities */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-900">
              Property Amenities & Features
            </label>
            <span className="text-xs text-slate-500">
              {selectedAmenities.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {COMMON_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 text-indigo-950 border-indigo-300 font-semibold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Optional Property Photos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Property Photography (Optional)
              </label>
              <p className="text-xs text-slate-500">
                Upload real photos of your space for qualitative multimodal AI staging and lighting interpretation.
              </p>
            </div>

            {photos.length === 0 && (
              <button
                type="button"
                onClick={handleLoadSamplePhotos}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors shrink-0"
              >
                + Load DC Sample Photos
              </button>
            )}
          </div>

          {/* Drag & drop dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files) {
                processFiles(Array.from(e.dataTransfer.files));
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="photo-upload-input"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="photo-upload-input"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-900">
                Click to browse or drag & drop property photos
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, WebP up to 4 photos
              </span>
            </label>
          </div>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3"
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 p-1 text-[10px] text-white truncate px-2">
                    {photo.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 5: Optional Owner Email & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
          <div>
            <label
              htmlFor="owner-email"
              className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Owner Email (Optional)</span>
            </label>
            <input
              type="email"
              id="owner-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Used strictly for attaching to your downloadable valuation report memo.
            </p>
          </div>

          <div>
            <label
              htmlFor="owner-notes"
              className="block text-sm font-semibold text-slate-900 mb-2"
            >
              Special Features or Owner Notes (Optional)
            </label>
            <input
              type="text"
              id="owner-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Historic high ceilings, private balcony, newly renovated kitchen"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Included in the AI qualitative assessment.
            </p>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span className="font-semibold text-slate-700">Deterministic Guarantee:</span>{' '}
            Prices are computed empirically via IQR quartile math. AI will never fabricate pricing numbers.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-indigo-900 hover:bg-indigo-950 rounded-lg transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>{isLoading ? 'Generating Analysis...' : 'Generate Data-Backed Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
