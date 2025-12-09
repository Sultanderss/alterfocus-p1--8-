import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Loader2, Check, MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (location: { lat: number; lng: number; address: string; name: string }) => void;
    onClose: () => void;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition, onDragEnd }: any) {
    const markerRef = useRef<any>(null);

    // Fly to position when it changes externally (e.g. GPS)
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    onDragEnd(marker.getLatLng());
                }
            },
        }),
        [onDragEnd],
    );

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onDragEnd(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
        >
            <Popup>¡Estás aquí! Arrástrame para ajustar.</Popup>
        </Marker>
    );
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationSelect, onClose }) => {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState("Selecciona una ubicación en el mapa");

    // Try to get GPS on mount if no initial position
    useEffect(() => {
        if (!initialLat && !initialLng) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const latlng = new L.LatLng(latitude, longitude);
                    setPosition(latlng);
                    handleReverseGeocode(latlng);
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
        } else if (initialLat && initialLng) {
            handleReverseGeocode(new L.LatLng(initialLat, initialLng));
        }
    }, []);

    const handleReverseGeocode = async (latlng: L.LatLng) => {
        setIsLoading(true);
        try {
            // Use OpenStreetMap Nominatim for free reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'es' } } // Request Spanish
            );
            const data = await response.json();

            // Format address nicely
            let addr = data.display_name;
            let name = "";

            if (data.address) {
                // Try to find a precise name (building, shop, etc)
                name = data.address.amenity || data.address.building || data.address.shop || data.address.leisure || data.address.office || data.address.tourism || data.address.road || "Ubicación seleccionada";

                // Construct a shorter address
                const parts = [
                    data.address.road,
                    data.address.house_number,
                    data.address.neighbourhood || data.address.suburb,
                    data.address.city || data.address.town
                ].filter(Boolean);

                if (parts.length > 0) {
                    addr = parts.join(', ');
                }
            }

            setAddress(addr || "Dirección desconocida");
            // Also store pure name for the "name" field

            // Auto-update parent/state logic could go here, but we wait for confirmation
        } catch (error) {
            console.error("Geocoding error:", error);
            setAddress(`Coordenadas: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if (position) {
            // Need to extract the specific name if possible, otherwise use generic
            // We'll pass the full address string we found
            // Extract a short name from address if we can, or just use "Ubicación personalizada"

            const shortName = address.split(',')[0]; // Simple heuristic

            onLocationSelect({
                lat: position.lat,
                lng: position.lng,
                address: address,
                name: shortName
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col h-[80vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MapPin size={18} className="text-amber-500" /> Elige tu ubicación
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Toca o arrastra el marcador
                        </p>
                    </div>
                </div>

                {/* Map */}
                <div className="flex-1 relative bg-slate-100">
                    <MapContainer
                        center={position || [4.6097, -74.0817]} // Default to Bogota if no GPS yet
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                            position={position}
                            setPosition={setPosition}
                            onDragEnd={(latlng: L.LatLng) => {
                                setPosition(latlng);
                                handleReverseGeocode(latlng);
                            }}
                        />
                    </MapContainer>

                    {/* Floating address card */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-white/10 z-[1000] flex items-center gap-3">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {isLoading ? "Buscando dirección..." : (address.split(',')[0] || "Ubicación seleccionada")}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!position || isLoading}
                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
