import { AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SafetyStatusProps {
  isInSafeZone: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  activeBoundary?: {
    name: string;
    id: string;
  };
}

export function SafetyStatus({ isInSafeZone, currentLocation, activeBoundary }: SafetyStatusProps) {
  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className={`relative overflow-hidden ${
        isInSafeZone 
          ? "border-safe bg-gradient-to-br from-safe/5 to-safe/10" 
          : "border-danger bg-gradient-to-br from-danger/5 to-danger/10"
      }`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {isInSafeZone ? (
              <CheckCircle className="h-16 w-16 text-safe animate-pulse" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-danger animate-bounce" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isInSafeZone ? "You're Safe" : "Outside Safe Zone"}
          </CardTitle>
          <Badge variant={isInSafeZone ? "default" : "destructive"} className="mx-auto">
            {isInSafeZone ? "SECURE" : "ALERT"}
          </Badge>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            {isInSafeZone 
              ? "You are currently within the designated safe boundary." 
              : "You have moved outside the safe zone. Please return to the designated area."}
          </p>
        </CardContent>
      </Card>

      {/* Location Details */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Current Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Latitude:</span>
                <p className="font-mono">{currentLocation.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Longitude:</span>
                <p className="font-mono">{currentLocation.lng.toFixed(6)}</p>
              </div>
            </div>
            {currentLocation.address && (
              <div>
                <span className="text-muted-foreground">Address:</span>
                <p className="text-sm">{currentLocation.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Boundary */}
      {activeBoundary && (
        <Card>
          <CardHeader>
            <CardTitle>Active Boundary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{activeBoundary.name}</span>
              <Badge variant="outline">ID: {activeBoundary.id}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}