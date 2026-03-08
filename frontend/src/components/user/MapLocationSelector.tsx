import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapLocationSelector.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl, iconUrl, shadowUrl
});

interface MapLocationSelectorProps {
  onLocationChange: (lat: number, lng: number) => void;
  defaultPosition?: { lat: number; lng: number };
}

const BANGALORE_PALACE = { lat: 12.9988, lng: 77.5921 };

const MapController = ({ center }: { center: { lat: number, lng: number }}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 15);
  }, [center, map]);
  return null;
}

const LocationMarker = ({ position, setPosition, onLocationChange }: any) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
          onLocationChange(pos.lat, pos.lng);
        },
      }}
    ></Marker>
  );
};

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({ onLocationChange, defaultPosition }) => {
  const [position, setPosition] = useState(defaultPosition || BANGALORE_PALACE);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
       const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
       const data = await res.json();
       if (data && data.length > 0) {
         const lat = parseFloat(data[0].lat);
         const lng = parseFloat(data[0].lon);
         setPosition({ lat, lng });
         onLocationChange(lat, lng);
       }
    } catch (error) {
       console.error("Search failed", error);
    } finally {
       setIsSearching(false);
    }
  };

  return (
    <div className="map-selector-container split-pane-style">
      {/* Search Bar Overlay */}
      <div className="map-search-overlay">
         <form onSubmit={handleSearch} className="map-search-form">
            <Search size={18} color="#696b79" />
            <input 
              type="text" 
              placeholder="Search for your area..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? '...' : <Search size={16} />}
            </button>
         </form>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={position} />
          <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange} />
        </MapContainer>
        <div className="map-overlay-instructions">
          Drag the pin to your exact location
        </div>
      </div>
    </div>
  );
};

export default MapLocationSelector;
