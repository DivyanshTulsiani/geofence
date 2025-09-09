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
interface GeofenceLocation {
  name: string;
  center: LatLngExpression;
  radius: number;
  color: "green" | "orange" | "red";
}

const geofenceLocations: GeofenceLocation[] = [
  { name: "Delhi", center: [28.7041, 77.1025], radius: 500, color: "green" },
  { name: "MSIT", center: [28.621212148168926, 77.0924230197659], radius: 150, color: "orange" },
  { name: "Smoker hub", center: [28.618676501588496, 77.0918869629507], radius: 20, color: "red" },
  { name: "Chennai", center: [13.0827, 80.2707], radius: 500, color: "green" },
];

// Default to first location for initial map center
const defaultCenter: LatLngExpression = geofenceLocations[0].center;

interface LocationWatcherProps {
  setInside: (inside: boolean) => void;
  setCurrentLocation: (location: string) => void;
}

function LocationWatcher({ setInside, setCurrentLocation }: LocationWatcherProps) {
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

        // Check if inside any geofence
        let isInsideAny = false;
        let currentLocationName = "Unknown";

        for (const location of geofenceLocations) {
          const distance = map.distance([latitude, longitude], location.center);
          if (distance <= location.radius) {
            isInsideAny = true;
            currentLocationName = location.name;
            break;
          }
        }

        setInside(isInsideAny);
        setCurrentLocation(currentLocationName);
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, marker, setInside, setCurrentLocation]);

  return null;
}

export default function GeofenceMap() {
  const [inside, setInside] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");

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
          ? `✅ Inside ${currentLocation} geofence`
          : "❌ Outside all geofences"}
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Render all geofence circles */}
        {geofenceLocations.map((location, index) => (
          <Circle
            key={index}
            center={location.center}
            radius={location.radius}
            pathOptions={{ 
              color: location.color, 
              fillColor: location.color, 
              fillOpacity: 0.1 
            }}
          />
        ))}
        
        <LocationWatcher setInside={setInside} setCurrentLocation={setCurrentLocation} />
      </MapContainer>
    </div>
  );
}
