
import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

const destinationData = [
  { name: 'Europa', value: 30, color: '#0088FE' },
  { name: 'América do Norte', value: 25, color: '#00C49F' },
  { name: 'Ásia', value: 20, color: '#FFBB28' },
  { name: 'América do Sul', value: 15, color: '#FF8042' },
  { name: 'Outros', value: 10, color: '#8884D8' }
];

export default function DestinationChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={destinationData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {destinationData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
