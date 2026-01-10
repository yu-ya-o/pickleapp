import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  className?: string;
}

export function GoogleMap({
  latitude,
  longitude,
  title,
  zoom = 15,
  className = 'w-full h-64 rounded-lg',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use environment variable or fallback to the API key from iOS config
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDvDEIGImbCrkgYIvuccyo6WiyEsxKUhtY';

    if (!apiKey) {
      setError('Google Maps APIキーが設定されていません');
      return;
    }

    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ja`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Google Mapsの読み込みに失敗しました');

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      return;
    }

    try {
      const position = { lat: latitude, lng: longitude };

      const map = new google.maps.Map(mapRef.current, {
        center: position,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      new google.maps.Marker({
        position,
        map,
        title: title || '開催場所',
      });
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('地図の初期化に失敗しました');
    }
  }, [isLoaded, latitude, longitude, title, zoom]);

  if (error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <p className="text-gray-500 text-sm">地図を読み込んでいます...</p>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}
