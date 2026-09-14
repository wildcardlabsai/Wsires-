'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatDate, formatNumber } from '@/lib/utils';

interface DailyPoint {
  date: string;
  pageviews: number;
  sessions: number;
  enquiries: number;
}

export function TrafficChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C8102E" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#C8102E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatDate(d)}
          tick={{ fontSize: 11, fill: '#87837A' }}
          axisLine={false}
          tickLine={false}
          minTickGap={30}
        />
        <YAxis tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          labelFormatter={(d: string) => formatDate(d, 'long')}
          formatter={(value: number, name: string) => [formatNumber(value), name === 'pageviews' ? 'Page views' : 'Sessions']}
          contentStyle={{ borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 13 }}
        />
        <Area type="monotone" dataKey="pageviews" stroke="#C8102E" strokeWidth={2} fill="url(#pv)" />
        <Area type="monotone" dataKey="sessions" stroke="#2F5444" strokeWidth={1.5} fillOpacity={0} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
