
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart, PieChart, Users } from "lucide-react";

const metrics = [
  {
    label: "Receita Mensal",
    value: "R$ 72.440",
    change: "+16%",
    icon: TrendingUp,
    bg: "from-emerald-500 to-teal-400",
  },
  {
    label: "Ticket Médio",
    value: "R$ 845",
    change: "+7%",
    icon: BarChart,
    bg: "from-sky-500 to-indigo-400",
  },
  {
    label: "Clientes Ativos",
    value: "191",
    change: "+5%",
    icon: Users,
    bg: "from-pink-500 to-fuchsia-500",
  },
  {
    label: "Meta do Mês",
    value: "R$ 100K",
    change: "72% atingido",
    icon: PieChart,
    bg: "from-amber-400 to-yellow-300",
  },
];

export default function DashboardKPICards() {
  return (
    <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br shadow-lg border-0 text-white relative overflow-hidden"
          style={{ backgroundImage: `linear-gradient(135deg,var(--tw-gradient-stops))` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} opacity-90`}></div>
          <CardContent className="relative flex flex-col gap-1 z-10">
            <div className="flex items-center justify-between mt-6">
              <span className="text-lg font-medium">{m.label}</span>
              <m.icon className="w-8 h-8 opacity-75" />
            </div>
            <div className="text-3xl font-bold my-2">{m.value}</div>
            <span className="text-white/80">{m.change}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
