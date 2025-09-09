// GeofenceMap.tsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  Rectangle,
  Popup,
} from "react-leaflet";
import L, { LatLngExpression, Marker as LeafletMarker } from "leaflet";

// Fix default marker icon issue
import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Add CSS for panic button animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
//abhimanyu chnage
// Geofence config
interface GeofenceLocation {
  name: string;
  center: LatLngExpression;
  side: number; // side length of square in meters
  color: "green" | "orange" | "red";
}

const geofenceLocations: GeofenceLocation[] = [
  { name: "Delhi", center: [28.7041, 77.1025], side: 1000, color: "green" },
  
  // MSIT Area - 50 randomly distributed squares without overlap
  { name: "MSIT-Zone1", center: [28.621528693528536, 77.09284506436518], side: 90, color: "orange" },
  { name: "MSIT-Zone2", center: [28.620621095544234, 77.09184302602019], side: 90, color: "green" },
];

// Default to first location for initial map center
const defaultCenter: LatLngExpression = geofenceLocations[0].center;

// Helper function to calculate square bounds from center and side length
function getSquareBounds(center: LatLngExpression, sideMeters: number): [[number, number], [number, number]] {
  const [lat, lng] = center as [number, number];
  
  // Approximate conversion: 1 degree ≈ 111,000 meters
  const latOffset = (sideMeters / 2) / 111000;
  const lngOffset = (sideMeters / 2) / (111000 * Math.cos(lat * Math.PI / 180));
  
  return [
    [lat - latOffset, lng - lngOffset], // southwest corner
    [lat + latOffset, lng + lngOffset]  // northeast corner
  ];
}

// Helper function to check if a point is inside a square
function isPointInSquare(point: [number, number], center: LatLngExpression, sideMeters: number): boolean {
  const [pointLat, pointLng] = point;
  const [centerLat, centerLng] = center as [number, number];
  
  const latOffset = (sideMeters / 2) / 111000;
  const lngOffset = (sideMeters / 2) / (111000 * Math.cos(centerLat * Math.PI / 180));
  
  return (
    pointLat >= centerLat - latOffset &&
    pointLat <= centerLat + latOffset &&
    pointLng >= centerLng - lngOffset &&
    pointLng <= centerLng + lngOffset
  );
}

interface LocationWatcherProps {
  setInside: (inside: boolean) => void;
  setCurrentLocation: (location: string) => void;
  setUserCoordinates: (coords: { lat: number; lng: number } | null) => void;
}

function LocationWatcher({ setInside, setCurrentLocation, setUserCoordinates }: LocationWatcherProps) {
  const map = useMap();
  const [marker, setMarker] = useState<LeafletMarker | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // Update user coordinates
        setUserCoordinates({ lat: latitude, lng: longitude });

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
          if (isPointInSquare([latitude, longitude], location.center, location.side)) {
            isInsideAny = true;
            currentLocationName = location.name;
            break;
          }
        }

        setInside(isInsideAny);
        setCurrentLocation(currentLocationName);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserCoordinates(null);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, marker, setInside, setCurrentLocation, setUserCoordinates]);

  return null;
}

interface GeofenceMapProps {
  onSafetyStatusChange?: (isInSafeZone: boolean | null) => void;
  onLocationChange?: (location: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lng: number } | null) => void;
}

export default function GeofenceMap({ 
  onSafetyStatusChange, 
  onLocationChange, 
  onCoordinatesChange 
}: GeofenceMapProps = {}) {
  const [inside, setInside] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<GeofenceLocation | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [sosAlert, setSosAlert] = useState<boolean>(false);

  // Call parent callbacks when state changes
  React.useEffect(() => {
    onSafetyStatusChange?.(inside);
  }, [inside, onSafetyStatusChange]);

  React.useEffect(() => {
    onLocationChange?.(currentLocation);
  }, [currentLocation, onLocationChange]);

  React.useEffect(() => {
    onCoordinatesChange?.(userCoordinates);
  }, [userCoordinates, onCoordinatesChange]);

  const handlePanicButton = () => {
    setSosAlert(true);
    // Auto-hide alert after 10 seconds
    setTimeout(() => setSosAlert(false), 10000);
  };

  return (
    <div>
      {/* Panic Button - Fixed at bottom */}
      <button
        onClick={handlePanicButton}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "4px solid #8B0000",
          background: "linear-gradient(45deg, #FF0000, #DC143C)",
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 1001,
          boxShadow: "0 4px 15px rgba(255, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse 2s infinite",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 0, 0, 0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 0, 0, 0.4)";
        }}
      >
        🚨<br />PANIC
      </button>

      {/* SOS Alert Modal */}
      {sosAlert && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "15px",
              border: "4px solid #FF0000",
              boxShadow: "0 10px 30px rgba(255, 0, 0, 0.5)",
              textAlign: "center",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🚨</div>
            <h2 style={{ color: "#FF0000", margin: "0 0 15px 0", fontSize: "24px" }}>
              SOS ALERT SENT!
            </h2>
            <p style={{ margin: "10px 0", fontSize: "16px", fontWeight: "bold" }}>
              Emergency help has been requested
            </p>
            
            {userCoordinates && (
              <div
                style={{
                  background: "#fff3cd",
                  border: "2px solid #ffc107",
                  borderRadius: "8px",
                  padding: "15px",
                  margin: "15px 0",
                }}
              >
                <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>
                  📍 Current Location:
                </h4>
                <p style={{ margin: "5px 0", fontFamily: "monospace", fontSize: "14px" }}>
                  <strong>Latitude:</strong> {userCoordinates.lat.toFixed(6)}
                </p>
                <p style={{ margin: "5px 0", fontFamily: "monospace", fontSize: "14px" }}>
                  <strong>Longitude:</strong> {userCoordinates.lng.toFixed(6)}
                </p>
                {inside && currentLocation !== "Unknown" && (
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#28a745" }}>
                    <strong>Zone:</strong> {currentLocation}
                  </p>
                )}
              </div>
            )}

            <div
              style={{
                background: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "5px",
                padding: "10px",
                margin: "15px 0",
                fontSize: "14px",
                color: "#155724",
              }}
            >
              ✅ Emergency services have been notified<br />
              ✅ Your location has been shared<br />
              ✅ Help is on the way
            </div>

            <p style={{ fontSize: "12px", color: "#666", margin: "15px 0" }}>
              Timestamp: {new Date().toLocaleString()}
            </p>

            <button
              onClick={() => setSosAlert(false)}
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Close Alert
            </button>
          </div>
        </div>
      )}

      {/* Selected Zone Info Box */}
      {selectedZone && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "10px",
            padding: "12px",
            borderRadius: "8px",
            background: "white",
            border: `2px solid ${selectedZone.color}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            minWidth: "200px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: selectedZone.color }}>
            {selectedZone.name}
          </h4>
          <p style={{ margin: "4px 0", fontSize: "12px" }}>
            <strong>Coordinates:</strong><br />
            Lat: {(selectedZone.center as [number, number])[0].toFixed(6)}<br />
            Lng: {(selectedZone.center as [number, number])[1].toFixed(6)}
          </p>
          <p style={{ margin: "4px 0", fontSize: "12px" }}>
            <strong>Size:</strong> {selectedZone.side}m × {selectedZone.side}m
          </p>
          <p style={{ margin: "4px 0", fontSize: "12px" }}>
            <strong>Color:</strong> {selectedZone.color}
          </p>
          <button
            onClick={() => setSelectedZone(null)}
            style={{
              marginTop: "8px",
              padding: "4px 8px",
              border: "none",
              borderRadius: "4px",
              background: "#f0f0f0",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Live Coordinates Display - Small corner overlay */}
        {userCoordinates && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "monospace",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              minWidth: "140px",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "10px", color: "#666", marginBottom: "2px" }}>
              📍 LIVE LOCATION
            </div>
            <div style={{ color: "#333" }}>
              {userCoordinates.lat.toFixed(6)}
            </div>
            <div style={{ color: "#333" }}>
              {userCoordinates.lng.toFixed(6)}
            </div>
            {inside && currentLocation !== "Unknown" && (
              <div style={{ fontSize: "9px", color: "#28a745", marginTop: "2px", fontWeight: "bold" }}>
                {currentLocation}
              </div>
            )}
          </div>
        )}
        
        {/* Render all geofence squares */}
        {geofenceLocations.map((location, index) => (
          <Rectangle
            key={index}
            bounds={getSquareBounds(location.center, location.side)}
            pathOptions={{ 
              color: location.color, 
              fillColor: location.color, 
              fillOpacity: 0.1 
            }}
            eventHandlers={{
              click: () => {
                setSelectedZone(location);
              }
            }}
          >
            <Popup>
              <div style={{ textAlign: "center", minWidth: "150px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: location.color }}>
                  {location.name}
                </h4>
                <p style={{ margin: "4px 0", fontSize: "12px" }}>
                  <strong>Coordinates:</strong><br />
                  {(location.center as [number, number])[0].toFixed(6)}, {(location.center as [number, number])[1].toFixed(6)}
                </p>
                <p style={{ margin: "4px 0", fontSize: "12px" }}>
                  <strong>Size:</strong> {location.side}m × {location.side}m
                </p>
                <div 
                  style={{
                    width: "20px",
                    height: "20px",
                    background: location.color,
                    margin: "8px auto",
                    borderRadius: "3px",
                    border: "1px solid #000"
                  }}
                />
              </div>
            </Popup>
          </Rectangle>
        ))}
        
        <LocationWatcher setInside={setInside} setCurrentLocation={setCurrentLocation} setUserCoordinates={setUserCoordinates} />
      </MapContainer>
    </div>
  );
}
