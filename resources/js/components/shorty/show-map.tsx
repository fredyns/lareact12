import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface ShowMapProps {
  latitude: number | null;
  longitude: number | null;
  popupText?: string;
  zoom?: number;
  ratio?: number;
}

export function ShowMap({ latitude, longitude, popupText = 'Location', zoom = 13, ratio = 1 }: ShowMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Clamp ratio between 1/3 and 3/1
  const clampedRatio = Math.max(1 / 3, Math.min(3, ratio));

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (!parent) return;

        // Get the actual available width (accounting for padding)
        const parentStyle = window.getComputedStyle(parent);
        const parentPaddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
        const parentPaddingRight = parseFloat(parentStyle.paddingRight) || 0;
        const availableWidth = parent.clientWidth - parentPaddingLeft - parentPaddingRight;

        // Calculate dimensions based on ratio
        let width = Math.min(availableWidth, parent.clientWidth);
        let height = width / clampedRatio;

        // Apply minimum constraints
        if (width < 360) {
          width = 360;
          height = width / clampedRatio;
        }

        if (height < 360) {
          height = 360;
          width = height * clampedRatio;
        }

        // Ensure width doesn't exceed available space after height adjustment
        if (width > availableWidth) {
          width = availableWidth;
          height = width / clampedRatio;
          
          // Re-check minimum height constraint
          if (height < 360) {
            height = 360;
            width = height * clampedRatio;
            // If width still exceeds, use available width and adjust ratio
            if (width > availableWidth) {
              width = availableWidth;
              height = width / clampedRatio;
            }
          }
        }

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Use ResizeObserver for better responsiveness
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [clampedRatio]);

  const isValidLocation = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Latitude</p>
          <p className="font-medium">{latitude ?? '-'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Longitude</p>
          <p className="font-medium">{longitude ?? '-'}</p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="mt-2"
        style={{
          width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
          height: dimensions.height > 0 ? `${dimensions.height}px` : '360px',
          minWidth: '360px',
          minHeight: '360px',
        }}
      >
        {isValidLocation ? (
          <MapContainer
            center={[latitude, longitude]}
            zoom={zoom}
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>{popupText}</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <p className="text-sm text-muted-foreground">No location data available</p>
        )}
      </div>
    </>
  );
}
