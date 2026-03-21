'use client';

/**
 * Admin Analytics Dashboard
 * 
 * KPI dashboard displaying key business metrics.
 * Uses mock data for display - will connect to real analytics later.
 */

import { useState } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@ember/ui-components';
import { cn } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Date range options
const dateRanges = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 12 months', value: '12m' },
];

// Mock data for KPI cards
const mockKPIs = {
  mrr: {
    value: 24750,
    change: 12.5,
    trend: 'up' as const,
  },
  activeUsers: {
    value: 1284,
    change: 8.2,
    trend: 'up' as const,
  },
  conversionRate: {
    value: 3.8,
    change: -0.5,
    trend: 'down' as const,
  },
  churnRate: {
    value: 2.1,
    change: -0.3,
    trend: 'down' as const,
  },
};

// Mock revenue trend data (12 months)
const mockRevenueData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 14200 },
  { month: 'Mar', revenue: 15800 },
  { month: 'Apr', revenue: 16400 },
  { month: 'May', revenue: 17200 },
  { month: 'Jun', revenue: 18500 },
  { month: 'Jul', revenue: 19800 },
  { month: 'Aug', revenue: 20600 },
  { month: 'Sep', revenue: 21400 },
  { month: 'Oct', revenue: 22800 },
  { month: 'Nov', revenue: 23900 },
  { month: 'Dec', revenue: 24750 },
];

// Mock user signups data (30 days)
const mockSignupsData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  signups: Math.floor(Math.random() * 50) + 10,
}));

// Mock feature usage data
const mockFeatureUsage = [
  { name: 'Editor', value: 45, color: '#f43f5e' },
  { name: 'AI Generation', value: 25, color: '#8b5cf6' },
  { name: 'Steam Calibration', value: 15, color: '#3b82f6' },
  { name: 'Voice Fingerprint', value: 10, color: '#22c55e' },
  { name: 'Export', value: 5, color: '#f59e0b' },
];

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  trend,
  prefix = '',
  suffix = '',
  icon: Icon,
}: {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
}) {
  const isPositive = (trend === 'up' && change > 0) || (trend === 'down' && title.toLowerCase().includes('churn'));
  
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-rose-500/10 p-2">
          <Icon className="h-5 w-5 text-rose-500" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-sm font-medium',
            isPositive ? 'text-green-500' : 'text-red-500'
          )}
        >
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">
          {prefix}
          {typeof value === 'number' && value >= 1000
            ? value.toLocaleString()
            : value}
          {suffix}
        </p>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Overview</h1>
          <p className="text-muted-foreground">
            Track your key business metrics and growth
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {dateRanges.map((range) => (
            <Button
              key={range.value}
              variant={dateRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range.value)}
              className={cn(
                dateRange === range.value && 'bg-rose-500 hover:bg-rose-600'
              )}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly Recurring Revenue"
          value={mockKPIs.mrr.value}
          change={mockKPIs.mrr.change}
          trend={mockKPIs.mrr.trend}
          prefix="$"
          icon={DollarSign}
        />
        <KPICard
          title="Active Users"
          value={mockKPIs.activeUsers.value}
          change={mockKPIs.activeUsers.change}
          trend={mockKPIs.activeUsers.trend}
          icon={Users}
        />
        <KPICard
          title="Conversion Rate"
          value={mockKPIs.conversionRate.value}
          change={mockKPIs.conversionRate.change}
          trend={mockKPIs.conversionRate.trend}
          suffix="%"
          icon={TrendingUp}
        />
        <KPICard
          title="Churn Rate"
          value={mockKPIs.churnRate.value}
          change={mockKPIs.churnRate.change}
          trend={mockKPIs.churnRate.trend}
          suffix="%"
          icon={TrendingDown}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold">Revenue Trend</h3>
            <p className="text-sm text-muted-foreground">
              Monthly recurring revenue over time
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#f43f5e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Signups Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold">User Signups</h3>
            <p className="text-sm text-muted-foreground">
              New user registrations over the last 30 days
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSignupsData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => [value, 'Signups']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="signups"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Usage Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold">Feature Usage</h3>
            <p className="text-sm text-muted-foreground">
              Distribution of feature usage across the platform
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockFeatureUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockFeatureUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Usage']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              {mockFeatureUsage.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: feature.color }}
                  />
                  <span className="flex-1 text-sm">{feature.name}</span>
                  <span className="text-sm font-medium">{feature.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-rose-500" />
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[
            { action: 'New subscriber', user: 'jane@example.com', plan: 'Pro', time: '2 minutes ago' },
            { action: 'Subscription upgraded', user: 'john@example.com', plan: 'Enterprise', time: '15 minutes ago' },
            { action: 'New signup', user: 'sarah@example.com', plan: 'Free', time: '1 hour ago' },
            { action: 'Subscription cancelled', user: 'mike@example.com', plan: 'Pro', time: '2 hours ago' },
            { action: 'New subscriber', user: 'emma@example.com', plan: 'Pro', time: '3 hours ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.user}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-500">
                  {activity.plan}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
