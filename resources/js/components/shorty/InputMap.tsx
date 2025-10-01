import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

// Define interface for Leaflet Icon prototype
interface LeafletIconPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface DraggableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const DraggableMarker = ({ position, onPositionChange }: DraggableMarkerProps) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onPositionChange(lat, lng);
    },
  });

  return (
    <Marker
      position={markerPosition}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setMarkerPosition([position.lat, position.lng]);
          onPositionChange(position.lat, position.lng);
        },
      }}
    />
  );
};

interface InputMapProps {
  latitude: number;
  longitude: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  latitudeError?: string;
  longitudeError?: string;
  mapHeight?: string;
  required?: boolean;
}

export function InputMap({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  latitudeError,
  longitudeError,
  mapHeight = 'h-96',
  required = false,
}: InputMapProps) {
  const handlePositionChange = (lat: number, lng: number) => {
    onLatitudeChange(parseFloat(lat.toFixed(3)));
    onLongitudeChange(parseFloat(lng.toFixed(3)));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">
            Latitude {required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="latitude"
            type="number"
            step="0.001"
            min="-90"
            max="90"
            value={latitude}
            onChange={(e) => {
              const lat = parseFloat(e.target.value);
              onLatitudeChange(lat);
            }}
            placeholder="Enter latitude"
            className={latitudeError ? 'border-destructive' : ''}
          />
          {latitudeError && <p className="text-sm text-destructive">{latitudeError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">
            Longitude {required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="longitude"
            type="number"
            step="0.001"
            min="-180"
            max="180"
            value={longitude}
            onChange={(e) => {
              const lng = parseFloat(e.target.value);
              onLongitudeChange(lng);
            }}
            placeholder="Enter longitude"
            className={longitudeError ? 'border-destructive' : ''}
          />
          {longitudeError && <p className="text-sm text-destructive">{longitudeError}</p>}
        </div>
      </div>

      <div className={`mt-2 ${mapHeight}`}>
        <MapContainer
          center={[latitude || 0, longitude || 0]}
          zoom={latitude && longitude ? 13 : 2}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker
            position={[latitude || 0, longitude || 0]}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>
    </div>
  );
}
