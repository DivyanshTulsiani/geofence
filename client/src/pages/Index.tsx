import { useState,useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, MapPin } from "lucide-react";
import GeofenceMap from "@/geocomp/geomap";

const Index = () => {
  const [isInSafeZone, setIsInSafeZone] = useState<boolean | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("Locating...");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  // Notifications are triggered from the map component upon restricted zone entry
  
  // useEffect(() => {
  //   if (isInSafeZone === false) {
  //     alertWrongArea();
  //   }
  // }, [isInSafeZone]);

  // Notification is handled in map component when entering restricted zones.

  

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Safety Monitor</h1>
          <p className="text-muted-foreground">
            Interactive geofence map with multiple boundary zones.
          </p>
        </div>

        <div className="space-y-6">
          {/* Safety Status Box */}
          <Card className={`relative overflow-hidden ${
            isInSafeZone === null 
              ? "border-muted bg-gradient-to-br from-muted/5 to-muted/10"
              : isInSafeZone 
                ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100" 
                : "border-red-500 bg-gradient-to-br from-red-50 to-red-100"
          }`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {isInSafeZone === null ? (
                  <MapPin className="h-12 w-12 text-muted-foreground animate-pulse" />
                ) : isInSafeZone ? (
                  <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
                ) : (
                  <>
                  <AlertTriangle className="h-12 w-12 text-red-600 animate-bounce" />
                  </>
                  
                )}
              </div>
              <CardTitle className="text-xl">
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
              } className="mx-auto">
                {isInSafeZone === null 
                  ? "LOCATING" 
                  : isInSafeZone 
                    ? "SECURE" 
                    : "ALERT"}
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground">
                {isInSafeZone === null 
                  ? "Getting your current location and checking geofence boundaries..." 
                  : isInSafeZone 
                    ? "You are currently within a designated safe boundary." 
                    : "You have moved outside the safe zone boundaries."}
              </p>
              
              {userCoordinates && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="font-mono">
                    📍 {userCoordinates.lat.toFixed(6)}, {userCoordinates.lng.toFixed(6)}
                  </div>
                  {currentLocation !== "Unknown" && currentLocation !== "Locating..." && (
                    <div className="text-xs font-medium text-blue-600">
                      📍 Zone: {currentLocation}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geofence Map */}
          <Card>
            <CardHeader>
              <CardTitle>Geofence Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px]">
                <GeofenceMap 
                  onSafetyStatusChange={setIsInSafeZone}
                  onLocationChange={setCurrentLocation}
                  onCoordinatesChange={setUserCoordinates}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
