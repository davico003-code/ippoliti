'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'

interface DataPoint {
  label: string
  value: number
}

export default function InflationMiniChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full h-[160px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Inflación mensual']}
          />
          <Bar dataKey="value" fill="#1A5C38" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
