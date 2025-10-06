import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface StatItem {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsOverviewProps {
  stats: StatItem[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend && (
                <div className="flex items-center pt-1">
                  <span
                    className={`text-xs ${stat.trend.isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.trend.isPositive ? "+" : ""}
                    {stat.trend.value}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    vs mes anterior
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
