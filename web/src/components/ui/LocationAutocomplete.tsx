import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;

interface LocationData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationAutocompleteProps {
  label?: string;
  value: string;
  onChange: (location: LocationData) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function LocationAutocomplete({
  label,
  value,
  onChange,
  onInputChange,
  placeholder = '場所を検索...',
  required,
  error,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    // Use environment variable or fallback to the API key from iOS config
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDvDEIGImbCrkgYIvuccyo6WiyEsxKUhtY';

    if (!apiKey) {
      console.error('Google Maps API key is not set');
      return;
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ja`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps script');

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    // Create autocomplete instance
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'jp' }, // 日本に限定
      fields: ['name', 'formatted_address', 'geometry.location'],
      types: ['establishment', 'geocode'], // 施設と住所
    });

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.geometry || !place.geometry.location) {
        return;
      }

      const locationData: LocationData = {
        name: place.name || place.formatted_address || '',
        address: place.formatted_address || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      onChange(locationData);
    });
  }, [isLoaded, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-white',
          'text-base placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
          'transition-all duration-200',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error && 'border-[var(--destructive)] focus:ring-[var(--destructive)]'
        )}
      />
      {error && (
        <p className="mt-1.5 text-sm text-[var(--destructive)]">{error}</p>
      )}
      {!isLoaded && (
        <p className="mt-1.5 text-sm text-gray-500">地図を読み込んでいます...</p>
      )}
    </div>
  );
}
