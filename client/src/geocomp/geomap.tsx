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

// Add CSS for enhanced mobile-friendly animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4); }
    50% { transform: scale(1.02); box-shadow: 0 12px 35px rgba(255, 65, 108, 0.6); }
    100% { transform: scale(1); box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4); }
  }
  
  @keyframes slideIn {
    from { 
      transform: translateY(-50px) scale(0.9); 
      opacity: 0; 
      filter: blur(5px);
    }
    to { 
      transform: translateY(0) scale(1); 
      opacity: 1; 
      filter: blur(0);
    }
  }
  
  @keyframes slideInUp {
    from { 
      transform: translateY(100px); 
      opacity: 0; 
    }
    to { 
      transform: translateY(0); 
      opacity: 1; 
    }
  }
  
  @keyframes slideInLeft {
    from { 
      transform: translateX(-50px); 
      opacity: 0; 
    }
    to { 
      transform: translateX(0); 
      opacity: 1; 
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
    20%, 40%, 60%, 80% { transform: translateX(3px); }
  }
  
  @keyframes fadeIn {
    from { 
      opacity: 0; 
      transform: scale(0.95); 
      filter: blur(3px);
    }
    to { 
      opacity: 1; 
      transform: scale(1); 
      filter: blur(0);
    }
  }
  
  @keyframes glow {
    0%, 100% { 
      box-shadow: 0 8px 25px rgba(255, 65, 108, 0.4), 0 0 20px rgba(255, 65, 108, 0.3);
    }
    50% { 
      box-shadow: 0 12px 35px rgba(255, 65, 108, 0.7), 0 0 40px rgba(255, 65, 108, 0.5);
    }
  }
  
  @keyframes heartbeat {
    0%, 50%, 100% { transform: scale(1); }
    25%, 75% { transform: scale(1.1); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  /* Enhanced glassmorphism */
  .glass-enhanced {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .glass-danger {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(220, 53, 69, 0.15);
    border: 1px solid rgba(220, 53, 69, 0.3);
    box-shadow: 0 8px 32px rgba(220, 53, 69, 0.2);
  }
  
  .glass-success {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(40, 167, 69, 0.15);
    border: 1px solid rgba(40, 167, 69, 0.3);
    box-shadow: 0 8px 32px rgba(40, 167, 69, 0.2);
  }
  
  /* Mobile touch interactions */
  .touch-bounce {
    transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  .touch-bounce:active {
    transform: scale(0.95);
  }
  
  /* Safe area for iPhone notch */
  @supports (padding: max(0px)) {
    .safe-area-top {
      padding-top: max(20px, env(safe-area-inset-top));
    }
    .safe-area-bottom {
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }
    .safe-area-left {
      padding-left: max(20px, env(safe-area-inset-left));
    }
    .safe-area-right {
      padding-right: max(20px, env(safe-area-inset-right));
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .glass-enhanced {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  }
`;
document.head.appendChild(style);

// Simple notification helper functions
// Simple notification functions
const requestNotificationPermission = () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        // Test notification
        new Notification("Notifications Enabled!", {
          body: "You will now receive geofence alerts",
          icon: "/favicon.ico"
        });
      }
    });
  }
};

const sendRedZoneNotification = (zoneName: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⚠️ Danger Zone Alert", {
      body: `You entered: ${zoneName}`,
      icon: "/favicon.ico"
    });
  }
};

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
  { name: "MSIT-Zone1", center: [28.621528693528536, 77.09284506436518], side: 90, color: "red" },
  { name: "MSIT-Zone2", center: [28.620621095544234, 77.09184302602019], side: 90, color: "red" },
  { name: "Danger Zone", center: [28.621200, 77.09250], side: 100, color: "red" },
  { name: "Restricted Area", center: [28.621800, 77.09150], side: 80, color: "red" },
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
  setInside: (inSafeZone: boolean) => void; // Updated: now specifically tracks if in SAFE zone
  setCurrentLocation: (location: string) => void;
  setUserCoordinates: (coords: { lat: number; lng: number } | null) => void;
  setCurrentZone: (zone: GeofenceLocation | null) => void;
}

function LocationWatcher({ setInside, setCurrentLocation, setUserCoordinates, setCurrentZone }: LocationWatcherProps) {
  const map = useMap();
  const [marker, setMarker] = useState<LeafletMarker | null>(null);
  const [previousZone, setPreviousZone] = useState<GeofenceLocation | null>(null);

  useEffect(() => {
    // Request notification permission on component mount
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
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
        let currentZone: GeofenceLocation | null = null;
        let isInSafeZone = false; // Only green and orange zones are considered safe

        for (const location of geofenceLocations) {
          const isInside = isPointInSquare([latitude, longitude], location.center, location.side);
          
          if (isInside) {
            isInsideAny = true;
            currentLocationName = location.name;
            currentZone = location;
            
            // Only consider green and orange zones as "safe"
            if (location.color === "green" || location.color === "orange") {
              isInSafeZone = true;
            }
            break;
          }
        }

        // Red zone notification - only send if entering a new red zone
        if (currentZone && currentZone.color === "red") {
          if (!previousZone || previousZone.name !== currentZone.name) {
            sendRedZoneNotification(currentZone.name);
          }
        }

        // Update states - setInside now represents if in a SAFE zone, not just any zone
        setInside(isInSafeZone);
        setCurrentLocation(currentLocationName);
        setCurrentZone(currentZone);
        setPreviousZone(currentZone);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserCoordinates(null);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, marker, setInside, setCurrentLocation, setUserCoordinates, setCurrentZone, previousZone]);

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
  const [currentZone, setCurrentZone] = useState<GeofenceLocation | null>(null);
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
    // Enhanced haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]); // More pronounced vibration pattern
    }
    
    // Add a ripple effect
    const button = document.querySelector('[data-panic-button]') as HTMLElement;
    if (button) {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin-left: -10px;
        margin-top: -10px;
      `;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    
    setSosAlert(true);
    // Auto-hide alert after 10 seconds
    setTimeout(() => setSosAlert(false), 10000);
  };

  return (
    <div>
      {/* Enhanced Mobile-Friendly Panic Button */}
      <button
        data-panic-button
        onClick={handlePanicButton}
        className="touch-bounce safe-area-bottom safe-area-right"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "4px solid rgba(255, 255, 255, 0.9)",
          background: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 50%, #FF416C 100%)",
          color: "white",
          fontSize: "12px",
          fontWeight: "800",
          cursor: "pointer",
          zIndex: 1001,
          boxShadow: "0 12px 35px rgba(255, 65, 108, 0.5), 0 6px 18px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse 2.5s infinite, glow 4s infinite, float 3s ease-in-out infinite",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
          overflow: "hidden",
          filter: "drop-shadow(0 8px 16px rgba(255, 65, 108, 0.3))",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
          e.currentTarget.style.boxShadow = "0 16px 45px rgba(255, 65, 108, 0.7), 0 8px 25px rgba(0, 0, 0, 0.25)";
          e.currentTarget.style.filter = "drop-shadow(0 12px 24px rgba(255, 65, 108, 0.4)) brightness(1.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          e.currentTarget.style.boxShadow = "0 12px 35px rgba(255, 65, 108, 0.5), 0 6px 18px rgba(0, 0, 0, 0.2)";
          e.currentTarget.style.filter = "drop-shadow(0 8px 16px rgba(255, 65, 108, 0.3))";
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = "scale(0.9) rotate(-2deg)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 65, 108, 0.6), 0 3px 12px rgba(0, 0, 0, 0.3)";
          // Enhanced haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = "scale(1.05) rotate(0deg)";
          setTimeout(() => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
          }, 150);
        }}
      >
        <div style={{ 
          fontSize: "22px", 
          marginBottom: "2px",
          animation: "heartbeat 1.5s infinite",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))"
        }}>
          🚨
        </div>
        <div style={{ 
          fontSize: "11px", 
          fontWeight: "800", 
          letterSpacing: "1px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"
        }}>
          SOS
        </div>
      </button>

      {/* Enhanced SOS Alert Modal */}
      {sosAlert && (
        <div
          className="safe-area-top safe-area-bottom"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            animation: "fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            padding: "20px",
            boxSizing: "border-box",
          }}
          onClick={() => setSosAlert(false)}
        >
          <div
            className="glass-enhanced touch-bounce"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%)",
              padding: "40px 32px",
              borderRadius: "28px",
              border: "3px solid rgba(255, 65, 108, 0.4)",
              boxShadow: "0 30px 60px rgba(255, 65, 108, 0.25), 0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              maxWidth: "420px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button for better UX */}
            <button
              onClick={() => setSosAlert(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(0, 0, 0, 0.1)",
                color: "#6c757d",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.2)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>

            <div style={{ 
              fontSize: "64px", 
              marginBottom: "20px",
              animation: "heartbeat 1s infinite, float 2s ease-in-out infinite",
              filter: "drop-shadow(0 6px 12px rgba(255, 65, 108, 0.4))"
            }}>🚨</div>
            
            <h2 style={{ 
              color: "#FF416C", 
              margin: "0 0 12px 0", 
              fontSize: "28px",
              fontWeight: "800",
              letterSpacing: "-1px",
              textShadow: "0 2px 4px rgba(255, 65, 108, 0.2)"
            }}>
              SOS Alert Sent!
            </h2>
            
            <div style={{
              background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
              color: "white",
              padding: "12px 20px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              margin: "0 0 24px 0",
              boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>✅</span>
              Emergency services have been notified
            </div>
            
            <p style={{ 
              margin: "0 0 28px 0", 
              fontSize: "16px", 
              fontWeight: "500",
              color: "#6c757d",
              lineHeight: "1.5"
            }}>
              Stay calm. Help is on the way to your location.
            </p>
            
            {userCoordinates && (
              <div
                style={{
                  background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                  border: "2px solid #ffc107",
                  borderRadius: "16px",
                  padding: "20px",
                  margin: "20px 0",
                  boxShadow: "0 4px 12px rgba(255, 193, 7, 0.2)",
                }}
              >
                <h4 style={{ 
                  margin: "0 0 12px 0", 
                  color: "#856404",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}>
                  <span style={{ fontSize: "16px" }}>📍</span>
                  Current Location
                </h4>
                <div style={{ 
                  fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace", 
                  fontSize: "13px",
                  lineHeight: "1.6",
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 193, 7, 0.3)"
                }}>
                  <div style={{ marginBottom: "4px" }}>
                    <strong>Lat:</strong> {userCoordinates.lat.toFixed(6)}
                  </div>
                  <div>
                    <strong>Lng:</strong> {userCoordinates.lng.toFixed(6)}
                  </div>
                </div>
                {inside && currentLocation !== "Unknown" && (
                  <div style={{ 
                    margin: "12px 0 0 0", 
                    fontSize: "12px", 
                    color: "#28a745",
                    fontWeight: "600",
                    background: "rgba(40, 167, 69, 0.1)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(40, 167, 69, 0.2)"
                  }}>
                    <strong>Zone:</strong> {currentLocation}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                background: "linear-gradient(135deg, #d4edda 0%, #a3d9a4 100%)",
                border: "1px solid #c3e6cb",
                borderRadius: "16px",
                padding: "20px",
                margin: "20px 0",
                fontSize: "14px",
                color: "#155724",
                fontWeight: "500",
                lineHeight: "1.6",
                boxShadow: "0 4px 12px rgba(195, 230, 203, 0.3)",
              }}
            >
              <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>✅</span>
                Emergency services notified
              </div>
              <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>✅</span>
                Location shared with authorities
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>✅</span>
                Help is on the way
              </div>
            </div>

            <p style={{ 
              fontSize: "11px", 
              color: "#6c757d", 
              margin: "20px 0",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace"
            }}>
              {new Date().toLocaleString()}
            </p>

            <button
              onClick={() => setSosAlert(false)}
              style={{
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                minHeight: "44px",
                minWidth: "120px",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                transition: "all 0.2s ease",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(40, 167, 69, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.3)";
              }}
            >
              Close Alert
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Zone Info Box */}
      {selectedZone && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `2px solid ${selectedZone.color}`,
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            minWidth: "220px",
            maxWidth: "calc(100vw - 40px)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: "12px"
          }}>
            <h4 style={{ 
              margin: "0", 
              color: selectedZone.color,
              fontSize: "16px",
              fontWeight: "700",
              letterSpacing: "-0.3px"
            }}>
              {selectedZone.name}
            </h4>
            <div 
              style={{
                width: "12px",
                height: "12px",
                background: selectedZone.color,
                borderRadius: "50%",
                boxShadow: `0 0 0 3px ${selectedZone.color}20`,
              }}
            />
          </div>
          
          <div style={{
            background: "rgba(248, 249, 250, 0.8)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}>
            <p style={{ 
              margin: "0 0 12px 0", 
              fontSize: "12px",
              fontWeight: "600",
              color: "#6c757d",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Coordinates
            </p>
            <div style={{ 
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace", 
              fontSize: "13px",
              lineHeight: "1.5",
              color: "#495057"
            }}>
              <div>Lat: {(selectedZone.center as [number, number])[0].toFixed(6)}</div>
              <div>Lng: {(selectedZone.center as [number, number])[1].toFixed(6)}</div>
            </div>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "16px"
          }}>
            <div>
              <p style={{ 
                margin: "0 0 4px 0", 
                fontSize: "11px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Size
              </p>
              <p style={{ 
                margin: "0", 
                fontSize: "14px",
                fontWeight: "600",
                color: "#495057"
              }}>
                {selectedZone.side}m × {selectedZone.side}m
              </p>
            </div>
            <div>
              <p style={{ 
                margin: "0 0 4px 0", 
                fontSize: "11px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Type
              </p>
              <div style={{ 
                background: selectedZone.color,
                color: "white",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "capitalize"
              }}>
                {selectedZone.color}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedZone(null)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              background: "rgba(248, 249, 250, 0.8)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              color: "#6c757d",
              transition: "all 0.2s ease",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
              minHeight: "44px",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(233, 236, 239, 0.9)";
              e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(248, 249, 250, 0.8)";
              e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
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
        
        {/* Enhanced Live Coordinates Display */}
        {userCoordinates && (
          <div
            className="glass-enhanced safe-area-bottom safe-area-left"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              padding: "18px 20px",
              borderRadius: "20px",
              fontSize: "11px",
              fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', monospace",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
              zIndex: 1000,
              minWidth: "180px",
              maxWidth: "calc(100vw - 140px)",
              animation: "slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ 
              fontWeight: "800", 
              fontSize: "10px", 
              color: "#6c757d", 
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ 
                fontSize: "14px",
                animation: "pulse 2s infinite"
              }}>📍</span>
              <span>Live Location</span>
            </div>
            
            <div style={{ 
              background: "linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(233, 236, 239, 0.7) 100%)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "14px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.05)"
            }}>
              <div style={{ 
                color: "#495057", 
                fontWeight: "600",
                fontSize: "12px",
                marginBottom: "4px",
                letterSpacing: "0.5px"
              }}>
                {userCoordinates.lat.toFixed(6)}
              </div>
              <div style={{ 
                color: "#495057", 
                fontWeight: "600",
                fontSize: "12px",
                letterSpacing: "0.5px"
              }}>
                {userCoordinates.lng.toFixed(6)}
              </div>
            </div>
            
            {/* Zone Status Indicators */}
            {inside && currentLocation !== "Unknown" && (
              <div style={{ 
                fontSize: "9px", 
                color: "#28a745", 
                fontWeight: "600",
                background: "rgba(40, 167, 69, 0.1)",
                padding: "6px 10px",
                borderRadius: "8px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(40, 167, 69, 0.2)"
              }}>
                <span>✅</span>
                <span>{currentLocation}</span>
              </div>
            )}
            
            {currentZone && currentZone.color === "red" && (
              <div style={{ 
                fontSize: "9px", 
                color: "#dc3545", 
                fontWeight: "600",
                background: "rgba(220, 53, 69, 0.1)",
                padding: "6px 10px",
                borderRadius: "8px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(220, 53, 69, 0.2)",
                animation: "shake 0.5s ease-in-out"
              }}>
                <span>⚠️</span>
                <span>{currentLocation} (DANGER)</span>
              </div>
            )}
            
            {currentZone && currentZone.color === "orange" && (
              <div style={{ 
                fontSize: "9px", 
                color: "#ffc107", 
                fontWeight: "600",
                background: "rgba(255, 193, 7, 0.1)",
                padding: "6px 10px",
                borderRadius: "8px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(255, 193, 7, 0.2)"
              }}>
                <span>⚠️</span>
                <span>{currentLocation} (CAUTION)</span>
              </div>
            )}
            
            {/* Notification Status */}
            <div style={{ 
              fontSize: "8px", 
              color: Notification.permission === "granted" ? "#28a745" : "#dc3545", 
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 0"
            }}>
              <span style={{ fontSize: "10px" }}>🔔</span>
              <span>{Notification.permission === "granted" ? "Alerts ON" : "Alerts OFF"}</span>
            </div>
          </div>
        )}

        {/* Simple Notification Button */}
        {Notification.permission !== "granted" && (
          <button
            onClick={() => requestNotificationPermission()}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              zIndex: 1000,
            }}
          >
            Enable Notifications
          </button>
        )}

        {/* Notification Status */}
        {Notification.permission === "granted" && (
          <div style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "8px 12px",
            background: "#28a745",
            color: "white",
            borderRadius: "5px",
            fontSize: "12px",
            zIndex: 1000,
          }}>
            ✅ Notifications ON
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
        
        <LocationWatcher 
          setInside={setInside} 
          setCurrentLocation={setCurrentLocation} 
          setUserCoordinates={setUserCoordinates}
          setCurrentZone={setCurrentZone}
        />
      </MapContainer>
    </div>
  );
}
