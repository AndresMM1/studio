import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
  return (
    <Card className="bg-gray-100 text-black">
      <div className="flex">
        <div className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
          </CardContent>
        </div>
        <div className="flex items-center justify-center px-4">
          <Icon className="text-blue-500 h-8 w-8" />
        </div>
      </div>
    </Card>
  );
}
