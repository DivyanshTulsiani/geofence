import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BoundaryFormProps {
  onBoundaryAdd?: (boundary: any) => void;
}

export function BoundaryForm({ onBoundaryAdd }: BoundaryFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    radius: "",
    centerLat: "",
    centerLng: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.type || !formData.radius || !formData.centerLat || !formData.centerLng) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newBoundary = {
      id: `boundary-${Date.now()}`,
      ...formData,
      radius: parseFloat(formData.radius),
      centerLat: parseFloat(formData.centerLat),
      centerLng: parseFloat(formData.centerLng),
      createdAt: new Date().toISOString(),
    };

    onBoundaryAdd?.(newBoundary);
    
    toast({
      title: "Success",
      description: "Geo-boundary created successfully!",
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      type: "",
      radius: "",
      centerLat: "",
      centerLng: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Geo-Boundary</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Boundary Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Tourist Safe Zone"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Boundary Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourist">Tourist Zone</SelectItem>
                  {/* <SelectItem value="emergency">Emergency Area</SelectItem> */}
                  <SelectItem value="restricted">Restricted Zone</SelectItem>
                  {/* <SelectItem value="safe">Safe Zone</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Optional description of this boundary..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="centerLat">Center Latitude *</Label>
              <Input
                id="centerLat"
                type="number"
                step="any"
                value={formData.centerLat}
                onChange={(e) => handleInputChange("centerLat", e.target.value)}
                placeholder="e.g., 40.7128"
              />
            </div>
            
            <div>
              <Label htmlFor="centerLng">Center Longitude *</Label>
              <Input
                id="centerLng"
                type="number"
                step="any"
                value={formData.centerLng}
                onChange={(e) => handleInputChange("centerLng", e.target.value)}
                placeholder="e.g., -74.0060"
              />
            </div>
            
            <div>
              <Label htmlFor="radius">Radius (meters) *</Label>
              <Input
                id="radius"
                type="number"
                value={formData.radius}
                onChange={(e) => handleInputChange("radius", e.target.value)}
                placeholder="e.g., 500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Tip: Click on the map to auto-fill coordinates</span>
          </div>

          <Button type="submit" className="w-full">
            Create Boundary
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}