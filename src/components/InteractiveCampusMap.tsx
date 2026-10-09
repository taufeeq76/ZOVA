import React, { useState } from 'react';
import { SOSLocation } from '../types/index.ts';
import { MapPin, Navigation, Compass, ExternalLink, ShieldAlert, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveCampusMapProps {
  location: SOSLocation | null;
  locationError?: string;
  locationHistory?: SOSLocation[];
  campusName?: string;
  isLiveTracking?: boolean;
  className?: string;
}

export const InteractiveCampusMap: React.FC<InteractiveCampusMapProps> = ({
  location,
  locationError,
  locationHistory = [],
  campusName = 'Campus Perimeter',
  isLiveTracking = false,
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(17);
  const [activeLayer, setActiveLayer] = useState<'campus_radar' | 'satellite' | 'street'>('campus_radar');

  if (!location) {
    return (
      <div className={`p-6 rounded-2xl bg-[#0B0F19] border border-amber-900/40 text-center ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#F9FAFB]">Location Coordinate Lock Unavailable</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {locationError || 'Student location could not be acquired (permissions declined or indoor GPS obstruction). Emergency response dispatched via campus directory IP jurisdiction.'}
        </p>
      </div>
    );
  }

  const { latitude, longitude, accuracy, campusZone, addressHint, timestamp } = location;
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className={`rounded-2xl border border-[#064E3B]/70 bg-[#0B0F19] overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* Map Header Toolbar */}
      <div className="p-3.5 bg-[#111827] border-b border-[#064E3B]/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 tracking-wide uppercase">
                {isLiveTracking ? 'Live GPS Stream Locked' : 'Emergency Location Fix'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                ±{accuracy ? accuracy.toFixed(1) : '5.0'}m
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs">
              {campusZone || 'Zone 1: Academic & Residential Quad'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="flex items-center bg-[#1F2937] p-0.5 rounded-lg border border-slate-700/60 text-[10px]">
            <button
              onClick={() => setActiveLayer('campus_radar')}
              className={`px-2 py-1 rounded transition-colors font-medium ${
                activeLayer === 'campus_radar' ? 'bg-[#10B981] text-[#111827] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Radar Grid
            </button>
            <button
              onClick={() => setActiveLayer('street')}
              className={`px-2 py-1 rounded transition-colors font-medium ${
                activeLayer === 'street' ? 'bg-[#10B981] text-[#111827] font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              OSM Map
            </button>
          </div>

          {/* External Google Maps Navigation */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] border border-[#10B981]/40 text-xs font-semibold transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open GPS</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* Map View Canvas / Display */}
      <div className="relative w-full h-72 sm:h-80 bg-[#0B0F19] overflow-hidden select-none">
        {activeLayer === 'street' ? (
          // Embedded OpenStreetMap interactive frame with marker
          <iframe
            title="Emergency Location Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.003}%2C${latitude - 0.002}%2C${longitude + 0.003}%2C${latitude + 0.002}&layer=mapnik&marker=${latitude}%2C${longitude}`}
            className="w-full h-full border-0 filter brightness-90 contrast-110"
            loading="lazy"
          />
        ) : (
          // ZOVA Tactical High-Tech Campus Radar View
          <div className="w-full h-full relative bg-[#090D16] flex items-center justify-center overflow-hidden">
            {/* Grid Lines Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #10B981 1px, transparent 1px),
                  linear-gradient(to bottom, #10B981 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px',
              }}
            />

            {/* Simulated Campus Building Outlines */}
            <div className="absolute inset-4 border border-teal-900/40 rounded-xl pointer-events-none">
              {/* Hostel Block A */}
              <div className="absolute top-8 left-10 w-28 h-20 border border-teal-500/30 bg-teal-950/20 rounded flex items-center justify-center text-[10px] font-mono text-teal-400/80">
                Hostel Block A
              </div>
              {/* Library Quad */}
              <div className="absolute bottom-8 left-16 w-32 h-24 border border-teal-500/30 bg-teal-950/20 rounded flex items-center justify-center text-[10px] font-mono text-teal-400/80">
                Central Library
              </div>
              {/* Science Block */}
              <div className="absolute top-10 right-12 w-32 h-28 border border-teal-500/30 bg-teal-950/20 rounded flex items-center justify-center text-[10px] font-mono text-teal-400/80">
                Science & Tech Wing
              </div>
              {/* Main Gate & Security Post */}
              <div className="absolute bottom-6 right-16 w-24 h-14 border border-emerald-500/40 bg-emerald-950/30 rounded flex items-center justify-center text-[9px] font-mono text-emerald-400">
                Security Post #1
              </div>
            </div>

            {/* Concentric Radar Rings around coordinates */}
            <div className="absolute flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-rose-500/20 animate-ping" />
              <div className="w-36 h-36 rounded-full border border-rose-500/30 animate-pulse absolute" />
              <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/40 absolute" />
            </div>

            {/* Breadcrumb Trail of Previous Locations */}
            {locationHistory.map((hist, idx) => (
              <div
                key={idx}
                className="absolute w-2 h-2 rounded-full bg-rose-400/60"
                style={{
                  transform: `translate(${(idx - locationHistory.length / 2) * 16}px, ${(idx - locationHistory.length / 2) * -12}px)`,
                }}
                title={`Track point ${idx + 1}`}
              />
            ))}

            {/* Central Student SOS Pin Marker */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-600/80 border-2 border-white animate-bounce">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="w-3 h-1.5 rounded-full bg-black/60 mx-auto blur-[1px] mt-1" />
              </div>

              {/* Pin Callout Box */}
              <div className="mt-1 px-3 py-1.5 rounded-lg bg-[#111827]/95 border border-rose-500/60 text-center shadow-2xl backdrop-blur-sm pointer-events-none">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">
                  SOS TRANSMITTER ACTIVE
                </span>
                <span className="text-[11px] font-mono text-[#F9FAFB] block">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </div>
            </div>

            {/* Compass Rose */}
            <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#111827]/80 border border-slate-700/60 text-slate-400 flex items-center gap-1 text-[10px]">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono">N</span>
            </div>

            {/* Interactive Zoom Overlay */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-[#111827]/80 p-1 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setZoomLevel((z) => Math.min(20, z + 1))}
                className="p-1 hover:bg-[#1F2937] text-slate-300 rounded"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(12, z - 1))}
                className="p-1 hover:bg-[#1F2937] text-slate-300 rounded"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Metadata */}
      <div className="p-3 bg-[#111827] border-t border-[#064E3B]/40 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="font-mono text-[11px]">
            {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E
          </span>
          {addressHint && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 text-[11px] truncate max-w-xs">{addressHint}</span>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Last fix:{' '}
          <span className="text-emerald-400 font-mono">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
