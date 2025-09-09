import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SafetyStatus } from "@/components/SafetyStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GeofenceMap from "@/geocomp/geomap";

const Index = () => {
  const { toast } = useToast();
  const [isInSafeZone, setIsInSafeZone] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 40.7580,
    lng: -73.9855,
    address: "Times Square, New York, NY"
  });

  const activeBoundary = {
    name: "Downtown Tourist Zone",
    id: "demo-1"
  };

  // Simulate location tracking
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        // Simulate random location changes
        const newLat = currentLocation.lat + (Math.random() - 0.5) * 0.001;
        const newLng = currentLocation.lng + (Math.random() - 0.5) * 0.001;
        
        setCurrentLocation({
          lat: newLat,
          lng: newLng,
          address: "Updated location coordinates"
        });

        // Randomly toggle safe zone status for demo
        if (Math.random() < 0.1) {
          setIsInSafeZone(prev => !prev);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isTracking, currentLocation.lat, currentLocation.lng]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    toast({
      title: isTracking ? "Tracking Stopped" : "Tracking Started",
      description: isTracking 
        ? "Location monitoring has been paused." 
        : "Real-time location monitoring is now active.",
    });
  };

  const simulateLocationChange = () => {
    setIsInSafeZone(!isInSafeZone);
    toast({
      title: "Location Status Changed",
      description: `Status changed to ${!isInSafeZone ? "SAFE" : "OUTSIDE SAFE ZONE"}`,
      variant: !isInSafeZone ? "default" : "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Safety Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your current location within designated safe boundaries.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SafetyStatus 
              isInSafeZone={isInSafeZone}
              currentLocation={currentLocation}
              activeBoundary={activeBoundary}
            />
          </div>
          
          <div className="space-y-4">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={toggleTracking}
                  variant={isTracking ? "destructive" : "safe"}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 ${isTracking ? "animate-spin" : ""}`} />
                  {isTracking ? "Stop Tracking" : "Start Tracking"}
                </Button>
                
                <Button 
                  onClick={simulateLocationChange}
                  variant="outline"
                  className="w-full"
                >
                  Demo: Toggle Status
                </Button>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Live Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                      🗺️ Leaflet Map Integration
                      <GeofenceMap/>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time location tracking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
