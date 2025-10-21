import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Zoom level 11 is approximately 5km view
const DEFAULT_ZOOM = 11;

// Default center: Jakarta, Indonesia
const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];

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

interface ClickableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

const ClickableMarker = ({ position, onPositionChange, disabled = false }: ClickableMarkerProps) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);

  useMapEvents({
    click(e) {
      if (!disabled) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        onPositionChange(lat, lng);
      }
    },
  });

  return <Marker position={markerPosition} draggable={false} />;
};

interface InputMapProps {
  latitude: number | null;
  longitude: number | null;
  onLatitudeChange: (value: number | null) => void;
  onLongitudeChange: (value: number | null) => void;
  latitudeError?: string;
  longitudeError?: string;
  ratio?: number;
  zoom?: number;
  required?: boolean;
  disabled?: boolean;
}

export function InputMap({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  latitudeError,
  longitudeError,
  ratio = 1,
  zoom = DEFAULT_ZOOM,
  required = false,
  disabled = false,
}: InputMapProps) {
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLat, setTempLat] = useState(latitude ?? DEFAULT_CENTER[0]);
  const [tempLng, setTempLng] = useState(longitude ?? DEFAULT_CENTER[1]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const thumbnailMapRef = useRef<L.Map | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [mapKey, setMapKey] = useState(0);

  const isValidLocation = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  // Clamp ratio between 1/3 and 3/1
  const clampedRatio = Math.max(1 / 3, Math.min(3, ratio));

  // Force map re-creation when coordinates become valid AND dimensions are ready
  useEffect(() => {
    if (isValidLocation && dimensions.width > 0 && dimensions.height > 0) {
      // Increment mapKey to force re-render with proper dimensions
      setMapKey(prev => prev + 1);
    }
  }, [isValidLocation, dimensions.width, dimensions.height]);

  const updateDimensions = useEffectEvent(() => {
    if (thumbnailContainerRef.current) {
      const parent = thumbnailContainerRef.current.parentElement;
      if (!parent) return;

      const parentStyle = window.getComputedStyle(parent);
      const parentPaddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
      const parentPaddingRight = parseFloat(parentStyle.paddingRight) || 0;
      const availableWidth = parent.clientWidth - parentPaddingLeft - parentPaddingRight;

      let width = Math.min(availableWidth, parent.clientWidth);
      let height = width / clampedRatio;

      if (width < 360) {
        width = 360;
        height = width / clampedRatio;
      }

      if (height < 360) {
        height = 360;
        width = height * clampedRatio;
      }

      if (width > availableWidth) {
        width = availableWidth;
        height = width / clampedRatio;

        if (height < 360) {
          height = 360;
          width = height * clampedRatio;
          if (width > availableWidth) {
            width = availableWidth;
            height = width / clampedRatio;
          }
        }
      }

      setDimensions({ width, height });
    }
  });

  useEffect(() => {
    // Initial calculation
    updateDimensions();
    
    // Retry after a short delay to ensure DOM is ready
    const timer = setTimeout(updateDimensions, 100);
    
    window.addEventListener('resize', updateDimensions);

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (thumbnailContainerRef.current?.parentElement) {
      resizeObserver.observe(thumbnailContainerRef.current.parentElement);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [isValidLocation]);

  useEffect(() => {
    if (!isValidLocation || !thumbnailContainerRef.current || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    // Longer delay to ensure the DOM is ready, especially when transitioning from null to valid location
    const timeoutId = setTimeout(() => {
      if (!thumbnailContainerRef.current) {
        return;
      }

      // Remove existing map if it exists
      if (thumbnailMapRef.current) {
        try {
          thumbnailMapRef.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        thumbnailMapRef.current = null;
      }

      // Clear the container
      thumbnailContainerRef.current.innerHTML = '';

      try {
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
          preferCanvas: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.marker([latitude, longitude]).addTo(map);
        L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

        thumbnailMapRef.current = map;

        // Force immediate invalidation
        requestAnimationFrame(() => {
          map.invalidateSize();
        });
        
        // Multiple invalidateSize calls to ensure proper rendering
        setTimeout(() => map.invalidateSize(), 50);
        setTimeout(() => map.invalidateSize(), 200);
        setTimeout(() => map.invalidateSize(), 500);
      } catch (e) {
        console.error('Error creating map:', e);
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      if (thumbnailMapRef.current) {
        try {
          thumbnailMapRef.current.remove();
        } catch (e) {
          console.warn('Error removing map on cleanup:', e);
        }
        thumbnailMapRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, isValidLocation, dimensions]);

  const handleOpenModal = () => {
    setTempLat(latitude ?? DEFAULT_CENTER[0]);
    setTempLng(longitude ?? DEFAULT_CENTER[1]);
    setShowMapModal(true);
  };

  const handleSelectLocation = () => {
    onLatitudeChange(parseFloat(tempLat.toFixed(3)));
    onLongitudeChange(parseFloat(tempLng.toFixed(3)));
    setShowMapModal(false);
  };

  const handleTempPositionChange = (lat: number, lng: number) => {
    setTempLat(lat);
    setTempLng(lng);
  };

  const handleClearLocation = () => {
    onLatitudeChange(null);
    onLongitudeChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">
            Latitude {required && <span className="text-destructive">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="latitude"
              type="number"
              step="0.001"
              min="-90"
              max="90"
              value={latitude ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const lat = value === '' ? null : parseFloat(value);
                onLatitudeChange(lat);
              }}
              placeholder="Enter latitude"
              className={`${latitudeError ? 'border-destructive' : ''} ${!required && latitude !== null ? 'pr-10' : ''}`}
              disabled={disabled}
            />
            {!required && latitude !== null && (
              <button
                type="button"
                onClick={handleClearLocation}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {latitudeError && <p className="text-sm text-destructive">{latitudeError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">
            Longitude {required && <span className="text-destructive">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="longitude"
              type="number"
              step="0.001"
              min="-180"
              max="180"
              value={longitude ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const lng = value === '' ? null : parseFloat(value);
                onLongitudeChange(lng);
              }}
              placeholder="Enter longitude"
              className={`${longitudeError ? 'border-destructive' : ''} ${!required && longitude !== null ? 'pr-10' : ''}`}
              disabled={disabled}
            />
            {!required && longitude !== null && (
              <button
                type="button"
                onClick={handleClearLocation}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {longitudeError && <p className="text-sm text-destructive">{longitudeError}</p>}
        </div>
      </div>

      <div className="mt-2">
        {isValidLocation ? (
          <div
            key={`map-${mapKey}-${latitude}-${longitude}`}
            ref={thumbnailContainerRef}
            className={`w-full rounded-lg border ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer transition-opacity hover:opacity-80'}`}
            style={{
              width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
              height: dimensions.height > 0 ? `${dimensions.height}px` : '360px',
              minWidth: '360px',
              minHeight: '360px',
            }}
            onClick={disabled ? undefined : handleOpenModal}
          />
        ) : (
          <div
            className={`flex h-64 w-full items-center justify-center rounded-lg border bg-muted/50 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer transition-opacity hover:opacity-80'}`}
            onClick={disabled ? undefined : handleOpenModal}
          >
            <div className="text-center">
              <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to select location on map</p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogPortal>
          <DialogOverlay className="z-[6029] bg-black/80" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[6030] h-[90vh] w-[90vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-lg bg-background p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle>Select Location</DialogTitle>
              <DialogDescription>
                Click on the map to select a location. The coordinates will be displayed above the map.
              </DialogDescription>
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Latitude</Label>
                  <p className="font-medium">{tempLat.toFixed(3)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Longitude</Label>
                  <p className="font-medium">{tempLng.toFixed(3)}</p>
                </div>
              </div>
              <div className="h-[calc(90vh-16rem)]">
                <MapContainer
                  center={[tempLat || DEFAULT_CENTER[0], tempLng || DEFAULT_CENTER[1]]}
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
                  <ClickableMarker position={[tempLat || DEFAULT_CENTER[0], tempLng || DEFAULT_CENTER[1]]} onPositionChange={handleTempPositionChange} disabled={disabled} />
                  <ScaleControl />
                </MapContainer>
              </div>
              <div className="flex justify-between gap-2">
                {!required && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleClearLocation();
                      setShowMapModal(false);
                    }}
                    disabled={disabled}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Location
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setShowMapModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSelectLocation} disabled={disabled}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Select This Location
                  </Button>
                </div>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
