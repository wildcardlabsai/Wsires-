'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatNumber, formatPrice } from '@/lib/utils';
import type { MonthPoint, StatusCount } from '@/lib/admin/data';
import { WEBSITE_STATUS } from '@/lib/status';

const monthLabel = (key: string) =>
  new Date(`${key}-02`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

export function MrrChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
        <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `£${v}`} tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          labelFormatter={monthLabel}
          formatter={(value: number) => [`£${value}`, 'MRR']}
          contentStyle={{ borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 13 }}
        />
        <Line type="monotone" dataKey="value" stroke="#C8102E" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CustomersChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
        <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
        <Tooltip
          labelFormatter={monthLabel}
          formatter={(value: number) => [formatNumber(value), 'New customers']}
          contentStyle={{ borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 13 }}
        />
        <Bar dataKey="value" fill="#2F5444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
        <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `£${v}`} tick={{ fontSize: 11, fill: '#87837A' }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          labelFormatter={monthLabel}
          formatter={(value: number) => [formatPrice(value * 100), 'Revenue']}
          contentStyle={{ borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 13 }}
        />
        <Bar dataKey="value" fill="#C8102E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLORS: Record<string, string> = {
  lead: '#B0ADA5',
  purchased: '#3B82F6',
  awaiting_information: '#F59E0B',
  in_production: '#3B82F6',
  awaiting_customer_approval: '#C8102E',
  changes_requested: '#F59E0B',
  approved: '#3F6C58',
  domain_setup: '#3B82F6',
  live: '#2F5444',
  suspended: '#DC2626',
  cancelled: '#87837A',
};

export function WebsiteStatusChart({ data }: { data: StatusCount[] }) {
  const chartData = data.map((d) => ({ ...d, label: WEBSITE_STATUS[d.status as keyof typeof WEBSITE_STATUS]?.label ?? d.status }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="count" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#87837A'} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, _name, props) => [formatNumber(value), props.payload.label]} contentStyle={{ borderRadius: 8, border: '1px solid #E8E4DC', fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
