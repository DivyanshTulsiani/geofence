// GeofenceMap.tsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Circle,
} from "react-leaflet";
import L, { LatLngExpression, Marker as LeafletMarker } from "leaflet";

// Fix default marker icon issue
import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Geofence config
const fenceCenter: LatLngExpression = [28.7041, 77.1025]; // Delhi
const radius: number = 500; // meters

interface LocationWatcherProps {
  setInside: (inside: boolean) => void;
}

function LocationWatcher({ setInside }: LocationWatcherProps) {
  const map = useMap();
  const [marker, setMarker] = useState<LeafletMarker | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        if (marker) {
          marker.setLatLng([latitude, longitude]);
        } else {
          const newMarker = L.marker([latitude, longitude]).addTo(map);
          setMarker(newMarker);
          map.setView([latitude, longitude], 15);
        }

        // Check if inside geofence
        const distance = map.distance([latitude, longitude], fenceCenter);
        setInside(distance <= radius);
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, marker, setInside]);

  return null;
}

export default function GeofenceMap() {
  const [inside, setInside] = useState<boolean | null>(null);

  return (
    <div>
      {/* Status Box */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          borderRadius: "8px",
          background:
            inside === null ? "lightgray" : inside ? "#d4edda" : "#f8d7da",
          color: inside === null ? "black" : inside ? "#155724" : "#721c24",
          zIndex: 1000,
        }}
      >
        {inside === null
          ? "Checking location…"
          : inside
          ? "✅ Inside geofence"
          : "❌ Outside geofence"}
      </div>

      {/* Map */}
      <MapContainer
        center={fenceCenter}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle
          center={fenceCenter}
          radius={radius}
          pathOptions={{ color: "red" }}
        />
        <LocationWatcher setInside={setInside} />
      </MapContainer>
    </div>
  );
}
