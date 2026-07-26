import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

import { Incident } from '../../data/mockCrimeData';

// Fix for default Leaflet icon paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for Crimes
const crimeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Heatmap Layer Component
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // @ts-ignore - leaflet.heat adds heatLayer to L
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 14,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

// Map Bounds Fitter
function MapBoundsFitter({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [map, bounds]);
  return null;
}

import { useCrimeAnalytics } from '../../context/CrimeAnalyticsContext';
import { Loader2 } from 'lucide-react';

export default function CrimeHotspotMap() {
  const { data, loading } = useCrimeAnalytics();

  if (loading || !data) {
    return (
      <div className="bg-panel border border-edge rounded-xl p-4 lg:p-6 min-h-[500px] flex flex-col justify-center items-center relative z-0">
        <Loader2 className="w-8 h-8 text-neon animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm animate-pulse">Loading spatial data...</p>
      </div>
    );
  }

  const incidents = data.incidents;

  // Calculate bounds
  const bounds = incidents.length > 0 
    ? L.latLngBounds(incidents.map((i: any) => [i.location.lat, i.location.lng]))
    : null;

  // Heatmap data [lat, lng, intensity]
  const heatPoints: [number, number, number][] = incidents.map((i: any) => [i.location.lat, i.location.lng, i.riskScore / 100]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ delay: 0.4 }} 
      className="bg-panel border border-edge rounded-xl p-4 lg:p-6 min-h-[500px] flex flex-col relative z-0"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-slate-200">Crime Hotspots & Deployment Map</h3>
          <p className="text-xs font-mono text-slate-400 mt-1">Live spatial distribution and intensity</p>
        </div>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-edge relative isolate">
        <MapContainer 
          center={[12.9716, 77.5946]} 
          zoom={11} 
          scrollWheelZoom={true} 
          className="w-full h-full min-h-[400px] z-0"
          style={{ background: '#0f172a' }}
        >
          {/* Standard map tiles (OpenStreetMap for Google Maps-like vibrant colors) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBoundsFitter bounds={bounds} />
          <HeatmapLayer points={heatPoints} />

          <MarkerClusterGroup 
            chunkedLoading
            maxClusterRadius={40}
            showCoverageOnHover={false}
          >
            {incidents.map(incident => (
              <Marker 
                key={incident.id} 
                position={[incident.location.lat, incident.location.lng]}
                icon={crimeIcon}
              >
                <Popup className="sherlock-popup">
                  <div className="p-1 min-w-[200px]">
                    <h4 className="font-bold text-slate-800 mb-1">{incident.id}</h4>
                    <p className="text-xs text-slate-600 mb-2">{new Date(incident.date).toLocaleString()}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-slate-100 p-1.5 rounded">
                        <span className="text-slate-500 block text-[10px] uppercase">Type</span>
                        <span className="font-semibold text-slate-700">{incident.category}</span>
                      </div>
                      <div className="bg-slate-100 p-1.5 rounded">
                        <span className="text-slate-500 block text-[10px] uppercase">Status</span>
                        <span className={`font-semibold ${incident.status === 'Open' ? 'text-red-500' : 'text-blue-500'}`}>
                          {incident.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold w-16">Location:</span>
                        <span>{incident.location.address}, {incident.location.district}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold w-16">Officer:</span>
                        <span>{incident.officer}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold w-16">Risk:</span>
                        <span className={`${incident.riskScore > 75 ? 'text-red-500 font-bold' : ''}`}>
                          {incident.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* Map Legend/Overlay styling to match the dark theme */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .sherlock-popup .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
        .sherlock-popup .leaflet-popup-tip { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        .marker-cluster-small { background-color: rgba(239, 68, 68, 0.6); }
        .marker-cluster-small div { background-color: rgba(239, 68, 68, 0.9); color: white; }
        .marker-cluster-medium { background-color: rgba(245, 158, 11, 0.6); }
        .marker-cluster-medium div { background-color: rgba(245, 158, 11, 0.9); color: white; }
        .marker-cluster-large { background-color: rgba(220, 38, 38, 0.6); }
        .marker-cluster-large div { background-color: rgba(220, 38, 38, 0.9); color: white; font-weight: bold; }
        .marker-cluster { border-radius: 50%; font-weight: 600; text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .leaflet-control-zoom a { background-color: #1e293b !important; color: #94a3b8 !important; border-color: #334155 !important; }
        .leaflet-control-zoom a:hover { color: #38bdf8 !important; }
      `}</style>
    </motion.div>
  );
}
