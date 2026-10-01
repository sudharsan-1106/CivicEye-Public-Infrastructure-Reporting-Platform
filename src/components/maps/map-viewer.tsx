'use client';

import React, { useEffect, useRef } from 'react';

interface MapViewerProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  className?: string;
}

export function MapViewer({
  latitude,
  longitude,
  address,
  zoom = 15,
  className = 'w-full h-56',
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !containerRef.current) return;

      const L = await import('leaflet');

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView([latitude, longitude], zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-pin-viewer',
        html: `<div style="background-color:#0284c7; width:26px; height:26px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 3px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#ffffff;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

      if (address) {
        marker.bindPopup(`<strong style="font-size:12px;">Incident Location</strong><br/><span style="font-size:11px;">${address}</span>`).openPopup();
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, address, zoom]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-slate-200 overflow-hidden shadow-xs relative ${className}`}
    />
  );
}
