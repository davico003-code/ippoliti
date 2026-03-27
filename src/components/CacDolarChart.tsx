'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface DataPoint {
  label: string
  cac: number
  dolar: number
}

export default function CacDolarChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="w-full h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}`,
              name === 'cac' ? 'CAC (base 100)' : 'Dólar Blue (base 100)',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value: string) =>
              value === 'cac' ? 'Índice CAC' : 'Dólar Blue'
            }
          />
          <Line
            type="monotone"
            dataKey="cac"
            stroke="#1A5C38"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#1A5C38' }}
          />
          <Line
            type="monotone"
            dataKey="dolar"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#f97316' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
