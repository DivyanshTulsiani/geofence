import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Eye } from "lucide-react";

interface Boundary {
  id: string;
  name: string;
  description?: string;
  type: string;
  radius: number;
  centerLat: number;
  centerLng: number;
  createdAt: string;
}

interface BoundaryListProps {
  boundaries: Boundary[];
  onEdit?: (boundary: Boundary) => void;
  onDelete?: (id: string) => void;
  onView?: (boundary: Boundary) => void;
}

export function BoundaryList({ boundaries, onEdit, onDelete, onView }: BoundaryListProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "tourist": return "bg-blue-100 text-blue-800";
      case "emergency": return "bg-red-100 text-red-800";
      case "restricted": return "bg-yellow-100 text-yellow-800";
      case "safe": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (boundaries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-center mb-2">No boundaries created yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first geo-boundary using the form above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Existing Boundaries ({boundaries.length})</h3>
      </div>
      
      <div className="grid gap-4">
        {boundaries.map((boundary) => (
          <Card key={boundary.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{boundary.name}</CardTitle>
                  <Badge className={`mt-2 ${getTypeColor(boundary.type)}`}>
                    {boundary.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onView?.(boundary)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit?.(boundary)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete?.(boundary.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {boundary.description && (
                <p className="text-sm text-muted-foreground mb-3">{boundary.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Center:</span>
                  <p className="font-mono">
                    {boundary.centerLat.toFixed(4)}, {boundary.centerLng.toFixed(4)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Radius:</span>
                  <p>{boundary.radius}m</p>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground">
                Created: {formatDate(boundary.createdAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}