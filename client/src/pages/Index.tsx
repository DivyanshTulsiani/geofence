import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, MapPin, Shield, Zap } from "lucide-react";
import GeofenceMap from "@/geocomp/geomap";

const Index = () => {
  const [isInSafeZone, setIsInSafeZone] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("Locating...");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Enhanced Mobile-First Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Safety Monitor
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Real-time geofence protection with instant alerts
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Enhanced Mobile-Optimized Safety Status Box */}
          <Card className={`relative overflow-hidden transition-all duration-500 transform hover:scale-[1.02] ${
            isInSafeZone === null 
              ? "border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-xl shadow-slate-200/50"
              : isInSafeZone 
                ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 shadow-xl shadow-emerald-200/60" 
                : "border-red-400 bg-gradient-to-br from-red-50 via-rose-50 to-red-100 shadow-xl shadow-red-200/60"
          }`}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
            </div>
            
            <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
              <div className="flex justify-center mb-4 sm:mb-6">
                {isInSafeZone === null ? (
                  <div className="relative">
                    <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-slate-500 animate-pulse" />
                    <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 bg-slate-400/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 bg-slate-400/20 rounded-full animate-ping animation-delay-75"></div>
                  </div>
                ) : isInSafeZone ? (
                  <div className="relative">
                    <div className="p-3 sm:p-4 bg-emerald-500 rounded-full">
                      <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping animation-delay-150"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="p-3 sm:p-4 bg-red-500 rounded-full animate-bounce">
                      <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-red-400/40 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping animation-delay-100"></div>
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                {isInSafeZone === null 
                  ? "Determining Location..." 
                  : isInSafeZone 
                    ? "You're Safe" 
                    : "Outside Safe Zone"}
              </CardTitle>
              <Badge variant={
                isInSafeZone === null 
                  ? "secondary" 
                  : isInSafeZone 
                    ? "default" 
                    : "destructive"
              } className={`mx-auto mt-3 px-4 py-1 text-sm font-semibold ${
                isInSafeZone === null 
                  ? "bg-slate-200 text-slate-700"
                  : isInSafeZone 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-red-100 text-red-800 border-red-300"
              }`}>
                {isInSafeZone === null 
                  ? "LOCATING" 
                  : isInSafeZone 
                    ? "SECURE" 
                    : "ALERT"}
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {isInSafeZone === null 
                  ? "Getting your current location and checking geofence boundaries..." 
                  : isInSafeZone 
                    ? "You are currently within a designated safe boundary." 
                    : "You have moved outside the safe zone boundaries."}
              </p>
              
              {userCoordinates && (
                <div className={`text-sm space-y-3 p-4 rounded-xl border-2 ${
                  isInSafeZone === null 
                    ? "bg-slate-50 border-slate-200"
                    : isInSafeZone 
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                }`}>
                  <div className="font-mono text-xs tracking-wider bg-white/60 px-3 py-2 rounded-lg border">
                    📍 {userCoordinates.lat.toFixed(6)}, {userCoordinates.lng.toFixed(6)}
                  </div>
                  {currentLocation !== "Unknown" && currentLocation !== "Locating..." && (
                    <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                      isInSafeZone 
                        ? "text-emerald-700 bg-emerald-100/80"
                        : "text-red-700 bg-red-100/80"
                    }`}>
                      🏷️ Zone: {currentLocation}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Geofence Map */}
          <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <span>Interactive Safety Map</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Live geofence monitoring • Tap zones for details • SOS button always available
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[500px] sm:h-[600px] lg:h-[700px] relative">
                <GeofenceMap 
                  onSafetyStatusChange={setIsInSafeZone}
                  onLocationChange={setCurrentLocation}
                  onCoordinatesChange={setUserCoordinates}
                />
                
                {/* Mobile-friendly overlay hints */}
                <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur text-white text-xs sm:text-sm px-3 py-2 rounded-lg max-w-max mx-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-300">Safe</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-orange-300">Caution</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <span className="text-red-300">Danger</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
