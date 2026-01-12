"use client";

import { usePropertiesControllerFindAll } from "@/lib/api/properties/properties";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function PropertiesPage() {
  const { data: properties, isLoading, error } = usePropertiesControllerFindAll();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading properties: {error.message}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties?.data.length === 0 ? (
          <p className="text-muted-foreground col-span-full">
            No properties found.
          </p>
        ) : (
          properties?.data.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{property.name}</span>
                  <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {property.code}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {property.address || "No address provided"}
                </p>
                <div className="text-xs space-y-1">
                  <div>Electric ID: {property.electric_id || "-"}</div>
                  <div>Water ID: {property.water_id || "-"}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
