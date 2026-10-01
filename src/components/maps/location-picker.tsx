'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onChange: (coords: { latitude: number; longitude: number; address?: string }) => void;
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  onChange,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default coordinate (Civic center or capital)
  const defaultLat = latitude || 28.6139;
  const defaultLng = longitude || 77.2090;

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Leaflet on client side
    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = await import('leaflet');

      // Ensure leaflet styles are present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 14);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom SVG marker pin
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color:#0284c7; width:28px; height:28px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#ffffff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([defaultLat, defaultLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      const handleCoordChange = async (lat: number, lng: number) => {
        try {
          // Attempt reverse geocoding via Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            const formattedAddress = data.display_name;
            onChange({ latitude: lat, longitude: lng, address: formattedAddress });
            return;
          }
        } catch {
          // Silently fallback to coordinates
        }
        onChange({ latitude: lat, longitude: lng });
      };

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleCoordChange(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleCoordChange(lat, lng);
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (res.ok) {
            const data = await res.json();
            onChange({ latitude: lat, longitude: lng, address: data.display_name });
            setIsLocating(false);
            return;
          }
        } catch {
          // Fallback
        }

        onChange({ latitude: lat, longitude: lng });
        setIsLocating(false);
      },
      (err) => {
        setErrorMsg('Could not retrieve your location. Please check browser permissions.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          Click on map or drag pin to adjust precise incident location
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGetCurrentLocation}
          isLoading={isLocating}
          className="text-xs"
        >
          <Navigation className="w-3.5 h-3.5 mr-1 text-sky-600" />
          Use Current GPS Location
        </Button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 rounded-xl border border-slate-300 shadow-inner overflow-hidden relative"
      />

      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
        <span>Lat: {latitude ? latitude.toFixed(6) : 'Not selected'}</span>
        <span>Lng: {longitude ? longitude.toFixed(6) : 'Not selected'}</span>
      </div>
    </div>
  );
}
