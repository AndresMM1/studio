"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dummy data for pretended incidents per month for the last year
const data = [
  { month: "Oct '24", incidents: 7 },
  { month: "Nov '24", incidents: 9 },
  { month: "Dec '24", incidents: 8 },
  { month: "Jan '25", incidents: 4 },
  { month: "Feb '25", incidents: 3 },
  { month: "Mar '25", incidents: 5 },
  { month: "Apr '25", incidents: 4 },
  { month: "May '25", incidents: 6 },
  { month: "Jun '25", incidents: 5 },
  { month: "Jul '25", incidents: 7 },
  { month: "Aug '25", incidents: 8 },
  { month: "Sep '25", incidents: 6 },
];

export function IncidentsLineChart() {
  return (
    // Set a specific height for the chart container
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10, // Adjust to prevent Y-axis labels from being cut off
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #cccccc",
              borderRadius: "0.5rem",
            }}
          />
          <Line
            type="monotone"
            dataKey="incidents"
            stroke="#3b82f6" // Blue color for the line
            strokeWidth={2}
            dot={{ r: 4, fill: "#3b82f6" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}