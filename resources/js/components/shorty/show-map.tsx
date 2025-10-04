import { Dialog, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

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

// Zoom level 11 is approximately 5km view
const DEFAULT_ZOOM = 11;

// Component to add scale control to react-leaflet map
function ScaleControl() {
  const map = useMap();

  useEffect(() => {
    const scale = L.control.scale({ position: 'bottomleft', imperial: false });
    scale.addTo(map);

    return () => {
      scale.remove();
    };
  }, [map]);

  return null;
}

export function ShowMap({ latitude, longitude, popupText = 'Location', zoom = DEFAULT_ZOOM, ratio = 1 }: ShowMapProps) {
  const [showMapModal, setShowMapModal] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const thumbnailMapRef = useRef<L.Map | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const isValidLocation =
    latitude !== null &&
    longitude !== null &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  // Clamp ratio between 1/3 and 3/1
  const clampedRatio = Math.max(1 / 3, Math.min(3, ratio));

  useEffect(() => {
    const updateDimensions = () => {
      if (thumbnailContainerRef.current) {
        const parent = thumbnailContainerRef.current.parentElement;
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
    if (thumbnailContainerRef.current?.parentElement) {
      resizeObserver.observe(thumbnailContainerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [clampedRatio]);

  useEffect(() => {
    if (!isValidLocation || !thumbnailContainerRef.current || dimensions.width === 0) return;

    // Create thumbnail map
    const map = L.map(thumbnailContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    L.marker([latitude, longitude]).addTo(map);

    // Add scale control to thumbnail
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    thumbnailMapRef.current = map;

    // Invalidate size after a short delay to ensure proper rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
    };
  }, [latitude, longitude, zoom, isValidLocation, dimensions]);

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

      <div className="mt-2">
        {isValidLocation ? (
          <div
            ref={thumbnailContainerRef}
            className="w-full cursor-pointer rounded-lg border transition-opacity hover:opacity-80"
            style={{
              width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
              height: dimensions.height > 0 ? `${dimensions.height}px` : '360px',
              minWidth: '360px',
              minHeight: '360px',
            }}
            onClick={() => setShowMapModal(true)}
          />
        ) : (
          <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            No location data available
          </div>
        )}
      </div>

      {/* Interactive Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogPortal>
          <DialogOverlay className="z-[9998] bg-black/80" />
          <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[9999] h-[90vh] w-[90vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg bg-background p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle>Map Location</DialogTitle>
              <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </DialogHeader>
            <div className="mt-4 h-[calc(90vh-8rem)]">
              {isValidLocation && (
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={zoom}
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                  scrollWheelZoom={true}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>{popupText}</Popup>
                  </Marker>
                  <ScaleControl />
                </MapContainer>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
