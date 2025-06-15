
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

export default function DashboardFilters() {
  return (
    <div className="flex gap-2">
      <Button variant="outline">
        <Calendar className="mr-2 h-4 w-4" />
        Período
      </Button>
      <Button>
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
    </div>
  );
}
