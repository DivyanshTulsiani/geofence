import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { BoundaryForm } from "@/components/BoundaryForm";
import { BoundaryList } from "@/components/BoundaryList";
import { useToast } from "@/hooks/use-toast";

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

const BoundaryManagement = () => {
  const { toast } = useToast();
  const [boundaries, setBoundaries] = useState<Boundary[]>([
    {
      id: "demo-1",
      name: "Downtown Tourist Zone",
      description: "Safe area for tourists with major attractions",
      type: "tourist",
      radius: 1000,
      centerLat: 40.7580,
      centerLng: -73.9855,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const handleBoundaryAdd = (newBoundary: Boundary) => {
    setBoundaries(prev => [...prev, newBoundary]);
  };

  const handleBoundaryEdit = (boundary: Boundary) => {
    toast({
      title: "Edit Boundary",
      description: "Edit functionality will be connected to your form.",
    });
  };

  const handleBoundaryDelete = (id: string) => {
    setBoundaries(prev => prev.filter(b => b.id !== id));
    toast({
      title: "Boundary Deleted",
      description: "The geo-boundary has been removed successfully.",
    });
  };

  const handleBoundaryView = (boundary: Boundary) => {
    toast({
      title: "View Boundary",
      description: "This will focus the map view on this boundary.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Boundary Management</h1>
          <p className="text-muted-foreground">
            Create and manage geo-fencing boundaries for safety monitoring.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <BoundaryForm onBoundaryAdd={handleBoundaryAdd} />
          </div>
          
          <div>
            <BoundaryList
              boundaries={boundaries}
              onEdit={handleBoundaryEdit}
              onDelete={handleBoundaryDelete}
              onView={handleBoundaryView}
            />
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-8">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              📍 Your Leaflet map will be integrated here
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Map will show all boundaries and allow interactive boundary creation
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoundaryManagement;