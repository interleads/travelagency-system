import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ListChecks, BarChart, Briefcase, Percent, DollarSign } from "lucide-react";
import { useDashboardDateRange } from "./useDashboardDateRange";
import { useSales } from "@/hooks/useSales";
import { useTransactions } from "@/hooks/useTransactions";

function filterDataByRange(data: any[], range: any) {
  if (!range?.from || !range?.to) return data;
  return data.filter(
    (item) => {
      const itemDate = new Date(item.created_at || item.date);
      return itemDate >= range.from && itemDate <= range.to;
    }
  );
}

function calculateMetrics(filteredSales: any[], filteredTransactions: any[]) {
  const totalSales = filteredSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
  const numSales = filteredSales.length;
  const avgTicket = numSales ? totalSales / numSales : 0;
  
  // Get packages count from sale products
  const totalPackages = filteredSales.length; // Each sale is considered a package for now
  
  // Calculate profit from transactions
  const receitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((acc, t) => acc + Number(t.value), 0);
  const despesas = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((acc, t) => acc + Number(t.value), 0);
  const profit = receitas - despesas;
  
  // Profit margin calculation
  const marginPercent = receitas > 0 ? (profit / receitas) * 100 : 0;

  return [
    {
      label: "Faturamento",
      value: `R$ ${totalSales.toLocaleString("pt-BR")}`,
      icon: TrendingUp,
      bg: "from-emerald-500 to-teal-400",
      description: "Valor total vendido no período",
    },
    {
      label: "Vendas",
      value: numSales.toLocaleString("pt-BR"),
      icon: ListChecks,
      bg: "from-sky-600 to-cyan-400",
      description: "Quantidade de vendas realizadas",
    },
    {
      label: "Ticket Médio",
      value: `R$ ${avgTicket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: BarChart,
      bg: "from-sky-500 to-indigo-400",
      description: "Média por venda",
    },
    {
      label: "Pacotes",
      value: totalPackages.toLocaleString("pt-BR"),
      icon: Briefcase,
      bg: "from-orange-400 to-yellow-400",
      description: "Pacotes vendidos",
    },
    {
      label: "Margem de Lucro",
      value: `${marginPercent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
      icon: Percent,
      bg: "from-purple-500 to-indigo-400",
      description: "Percentual de lucro",
    },
    {
      label: "Lucro Líquido",
      value: `R$ ${profit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      bg: "from-lime-500 to-green-400",
      description: "Receitas menos despesas",
    },
  ];
}

export default function DashboardKPICards() {
  const { dateRange } = useDashboardDateRange();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  
  const filteredSales = React.useMemo(
    () => filterDataByRange(sales, dateRange),
    [sales, dateRange]
  );
  
  const filteredTransactions = React.useMemo(
    () => filterDataByRange(transactions, dateRange),
    [transactions, dateRange]
  );
  
  const metrics = React.useMemo(
    () => calculateMetrics(filteredSales, filteredTransactions),
    [filteredSales, filteredTransactions]
  );

  if (salesLoading || transactionsLoading) {
    return (
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-20 md:h-32">
            <CardContent className="p-3 md:p-6">
              <div className="animate-pulse">
                <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2" />
                <div className="h-5 md:h-8 bg-gray-200 rounded mb-1 md:mb-2" />
                <div className="h-2 md:h-3 bg-gray-200 rounded w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br shadow-lg border-0 text-white relative overflow-hidden min-h-[80px] sm:min-h-[140px]"
          style={{ backgroundImage: `linear-gradient(135deg,var(--tw-gradient-stops))` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} opacity-90`} />
          <CardContent className="relative flex flex-col gap-1 z-10 p-3 sm:p-6">
            <div className="flex items-center justify-between mt-1 sm:mt-6">
              <span className="text-xs sm:text-lg font-medium">{m.label}</span>
              <m.icon className="w-4 h-4 sm:w-8 sm:h-8 opacity-75" />
            </div>
            <div className="text-lg sm:text-3xl font-bold my-0 sm:my-2 break-all">{m.value}</div>
            <span className="text-white/80 text-[10px] sm:text-xs leading-tight">{m.description}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
