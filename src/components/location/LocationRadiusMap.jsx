import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink } from 'lucide-react';

const meetingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MAP_LAYERS = {
  GOOGLE_ROADMAP: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps'
  },
  GOOGLE_SATELLITE: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite'
  },
  OSM: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  }
};

export const LocationRadiusMap = ({
  meetingLat,
  meetingLon,
  radius = 100,
  userLat,
  userLon,
  userAccuracy,
  locationName = 'Meeting Point'
}) => {
  const [selectedLayerKey, setSelectedLayerKey] = useState('GOOGLE_ROADMAP');

  if (!meetingLat || !meetingLon) return null;

  const center = [meetingLat, meetingLon];
  const currentTile = MAP_LAYERS[selectedLayerKey];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${meetingLat},${meetingLon}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
          {Object.keys(MAP_LAYERS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedLayerKey(key)}
              className={`px-2 py-0.5 rounded-lg transition ${
                selectedLayerKey === key
                  ? 'bg-cyan-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {MAP_LAYERS[key].name}
            </button>
          ))}
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:underline flex items-center space-x-1 font-semibold"
        >
          <span>Open in Google Maps App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="w-full h-72 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <MapContainer center={center} zoom={16} scrollWheelZoom={false}>
          <TileLayer attribution={currentTile.attribution} url={currentTile.url} />

          {/* Meeting Target Marker */}
          <Marker position={[meetingLat, meetingLon]} icon={meetingIcon}>
            <Popup>
              <div className="text-slate-900 font-semibold">
                🎯 {locationName}
                <br />
                Radius: {radius}m
              </div>
            </Popup>
          </Marker>

          {/* Allowed Radius Circle */}
          <Circle
            center={[meetingLat, meetingLon]}
            radius={radius}
            pathOptions={{
              color: '#0284c7',
              fillColor: '#0284c7',
              fillOpacity: 0.2,
              weight: 2
            }}
          />

          {/* User Current Position Marker */}
          {userLat && userLon && (
            <>
              <Marker position={[userLat, userLon]} icon={userIcon}>
                <Popup>
                  <div className="text-slate-900 font-semibold">
                    📍 Your Location
                    {userAccuracy && (
                      <div className="text-xs text-slate-600 font-normal">
                        Accuracy: ~{Math.round(userAccuracy)}m
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>

              {userAccuracy && (
                <Circle
                  center={[userLat, userLon]}
                  radius={userAccuracy}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    dashArray: '4, 4',
                    weight: 1
                  }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};
