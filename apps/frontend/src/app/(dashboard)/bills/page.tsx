"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";

export default function BillsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Monthly Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Generate and manage monthly bills for your units. Track electricity,
            water usage, and other charges with payment status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
