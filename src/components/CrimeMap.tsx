import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MLHotspot } from '../services/hotspotService';
import CrimePopup from './CrimePopup';

interface CrimeMapProps {
  locations: MLHotspot[];
  selectedCrime?: MLHotspot | null;
  onMarkerClick?: (location: MLHotspot) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Center coordinates for Karnataka, India
const KARNATAKA_CENTER: [number, number] = [15.3173, 75.7139];
const DEFAULT_ZOOM = 7;

// Risk zone visual config
const RISK_CONFIG = {
  High: {
    markerBg:    '#EF4444',
    markerBorder:'#991B1B',
    markerGlow:  'rgba(239, 68, 68, 0.8)',
    circleColor: '#EF4444',
    circleFill:  'rgba(239, 68, 68, 0.12)',
    circleRadius: 1200,   // meters
  },
  Medium: {
    markerBg:    '#F97316',
    markerBorder:'#9A3412',
    markerGlow:  'rgba(249, 115, 22, 0.8)',
    circleColor: '#F97316',
    circleFill:  'rgba(249, 115, 22, 0.10)',
    circleRadius: 800,
  },
  Low: {
    markerBg:    '#10B981',
    markerBorder:'#065F46',
    markerGlow:  'rgba(16, 185, 129, 0.8)',
    circleColor: '#10B981',
    circleFill:  'rgba(16, 185, 129, 0.08)',
    circleRadius: 400,
  },
} as const;

/**
 * Custom pin icon with pulsing glow for selected / high-risk markers.
 */
const getMarkerIcon = (risk: MLHotspot['risk_level'], isSelected = false) => {
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Low;
  const size = isSelected ? 36 : 26;
  const pulse = risk === 'High' || isSelected;

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 8}px;display:flex;align-items:center;justify-content:center;">
      ${pulse ? `
        <div style="
          position:absolute;
          width:${size + 14}px;height:${size + 14}px;
          border-radius:50%;
          background:${cfg.markerGlow};
          top:50%;left:50%;
          transform:translate(-50%,-60%);
          animation:riskPulse 1.8s ease-out infinite;
          pointer-events:none;
        "></div>` : ''}
      <div style="
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50% 50% 50% 0;
        background:${cfg.markerBg};
        border:2.5px solid ${cfg.markerBorder};
        transform:rotate(-45deg);
        box-shadow:0 0 14px ${cfg.markerGlow};
      "></div>
      <div style="
        position:absolute;
        width:${Math.round(size / 2.8)}px;height:${Math.round(size / 2.8)}px;
        background:#ffffff;
        border-radius:50%;
        top:${Math.round(size / 4)}px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'crime-marker-icon',
    iconSize:   [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor:[0, -(size + 8)],
  });
};

/**
 * Injects the CSS keyframe for the pulse animation once.
 */
const PulseStyle: React.FC = () => {
  useEffect(() => {
    const id = 'risk-pulse-style';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = `
        @keyframes riskPulse {
          0%   { opacity:0.7; transform:translate(-50%,-60%) scale(0.6); }
          70%  { opacity:0;   transform:translate(-50%,-60%) scale(1.7); }
          100% { opacity:0;   transform:translate(-50%,-60%) scale(1.7); }
        }
      `;
      document.head.appendChild(el);
    }
  }, []);
  return null;
};

/**
 * On-map floating legend.
 */
const MapLegend: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const legend = new (L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd() {
        const div = L.DomUtil.create('div');
        div.innerHTML = `
          <div style="
            background:rgba(255,255,255,0.92);
            border:1px solid rgba(0,0,0,0.1);
            border-radius:10px;
            padding:10px 14px;
            font-family:monospace;
            font-size:11px;
            color:#334155;
            backdrop-filter:blur(8px);
            min-width:136px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          ">
            <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#475569;margin-bottom:7px;font-weight:700;">Risk Level</div>
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#EF4444;box-shadow:0 0 6px rgba(239,68,68,0.6);"></span>
              High Risk
            </div>
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F97316;box-shadow:0 0 6px rgba(249,115,22,0.6);"></span>
              Medium Risk
            </div>
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#10B981;box-shadow:0 0 6px rgba(16,185,129,0.6);"></span>
              Low Risk
            </div>
            <div style="border-top:1px solid rgba(0,0,0,0.08);padding-top:7px;font-size:9px;color:#64748b;letter-spacing:0.08em;text-transform:uppercase;">
              Circles = Risk Radius
            </div>
          </div>
        `;
        L.DomEvent.disableClickPropagation(div);
        return div;
      },
    }))();
    legend.addTo(map);
    return () => { legend.remove(); };
  }, [map]);

  return null;
};

/**
 * Controller Component to dynamically handle map zoom, fits, and animations.
 */
const MapViewUpdater: React.FC<{
  locations: MLHotspot[];
  selectedCrime?: MLHotspot | null;
  center?: [number, number];
  zoom?: number;
}> = ({ locations, selectedCrime, center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedCrime) {
      map.flyTo([selectedCrime.latitude, selectedCrime.longitude], 16, { duration: 1.2 });
    } else if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.0 });
    } else if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [selectedCrime, center, zoom, map]);

  return null;
};

export const CrimeMap: React.FC<CrimeMapProps> = ({
  locations = [],
  selectedCrime = null,
  onMarkerClick,
  center = KARNATAKA_CENTER,
  zoom = DEFAULT_ZOOM,
  className = 'w-full h-full min-h-[450px]',
}) => {
  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white ${className}`}>
      <PulseStyle />
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
        touchZoom={true}
        closePopupOnClick={false}
        className="w-full h-full z-0"
        style={{ background: '#f8fafc' }}
      >
        {/* Light map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapViewUpdater
          locations={locations}
          selectedCrime={selectedCrime}
          center={center}
          zoom={zoom}
        />

        <MapLegend />

        {/* Risk zone circles rendered first (bottom layer) */}
        {locations.map((loc) => {
          const cfg = RISK_CONFIG[loc.risk_level] || RISK_CONFIG.Low;
          const isSelected = selectedCrime?.id === loc.id;
          return (
            <Circle
              key={`zone-${loc.id}`}
              center={[loc.latitude, loc.longitude]}
              radius={isSelected ? cfg.circleRadius * 1.4 : cfg.circleRadius}
              pathOptions={{
                color:       cfg.circleColor,
                fillColor:   cfg.circleColor,
                fillOpacity: isSelected ? 0.22 : 0.11,
                weight:      isSelected ? 2 : 1,
                opacity:     isSelected ? 0.9 : 0.55,
                dashArray:   loc.risk_level === 'High' ? undefined : '6 4',
              }}
              eventHandlers={{ click: () => onMarkerClick?.(loc) }}
            />
          );
        })}

        {/* Pin markers rendered on top */}
        {locations.map((loc) => {
          const isSelected = selectedCrime?.id === loc.id;
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={getMarkerIcon(loc.risk_level, isSelected)}
              zIndexOffset={isSelected ? 1000 : loc.risk_level === 'High' ? 500 : 0}
              eventHandlers={{ click: () => onMarkerClick?.(loc) }}
            />
          );
        })}

        {/* Popup for selected hotspot */}
        {selectedCrime && (
          <Popup
            position={[selectedCrime.latitude, selectedCrime.longitude]}
            className="light-leaflet-popup"
            eventHandlers={{
              remove: () => {
                if (onMarkerClick) onMarkerClick(null as any);
              }
            }}
          >
            <CrimePopup location={selectedCrime} />
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default CrimeMap;
