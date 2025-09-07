import { Button } from "@/components/ui/button";
import { MapPin, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">GeoGuard</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant={location.pathname === "/boundaries" ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/boundaries" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Boundaries</span>
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Monitor</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}