"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Scatter
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp,
  CreditCard, Activity, Users, ShoppingCart, Wallet, Target,
  PiggyBank, TrendingDown
} from "lucide-react";

// Dummy Data
const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 28000, profit: 17000 },
  { month: "Feb", revenue: 52000, expenses: 31000, profit: 21000 },
  { month: "Mar", revenue: 48000, expenses: 29000, profit: 19000 },
  { month: "Apr", revenue: 61000, expenses: 35000, profit: 26000 },
  { month: "May", revenue: 55000, expenses: 33000, profit: 22000 },
  { month: "Jun", revenue: 67000, expenses: 38000, profit: 29000 },
  { month: "Jul", revenue: 72000, expenses: 41000, profit: 31000 },
  { month: "Aug", revenue: 69000, expenses: 39000, profit: 30000 },
  { month: "Sep", revenue: 78000, expenses: 43000, profit: 35000 },
  { month: "Oct", revenue: 85000, expenses: 47000, profit: 38000 },
  { month: "Nov", revenue: 82000, expenses: 45000, profit: 37000 },
  { month: "Dec", revenue: 91000, expenses: 50000, profit: 41000 },
];

const categoryData = [
  { name: "Marketing", value: 30, amount: 15000 },
  { name: "Operations", value: 25, amount: 12500 },
  { name: "Salaries", value: 35, amount: 17500 },
  { name: "Technology", value: 10, amount: 5000 },
];

const transactionsData = [
  { id: 1, name: "Marketing Campaign", amount: -2500, date: "2025-10-28", type: "expense", category: "Marketing" },
  { id: 2, name: "Client Payment", amount: 15000, date: "2025-10-27", type: "income", category: "Revenue" },
  { id: 3, name: "Software Subscription", amount: -199, date: "2025-10-26", type: "expense", category: "Technology" },
  { id: 4, name: "Consulting Fee", amount: 8500, date: "2025-10-25", type: "income", category: "Revenue" },
  { id: 5, name: "Office Supplies", amount: -450, date: "2025-10-24", type: "expense", category: "Operations" },
  { id: 6, name: "Product Sales", amount: 12300, date: "2025-10-23", type: "income", category: "Revenue" },
  { id: 7, name: "Utilities", amount: -890, date: "2025-10-22", type: "expense", category: "Operations" },
  { id: 8, name: "Freelance Payment", amount: -3200, date: "2025-10-21", type: "expense", category: "Salaries" },
];

const investmentData = [
  { month: "Jan", portfolio: 125000, target: 130000 },
  { month: "Feb", portfolio: 132000, target: 135000 },
  { month: "Mar", portfolio: 128000, target: 140000 },
  { month: "Apr", portfolio: 145000, target: 145000 },
  { month: "May", portfolio: 152000, target: 150000 },
  { month: "Jun", portfolio: 148000, target: 155000 },
  { month: "Jul", portfolio: 165000, target: 160000 },
  { month: "Aug", portfolio: 171000, target: 165000 },
  { month: "Sep", portfolio: 168000, target: 170000 },
  { month: "Oct", portfolio: 182000, target: 175000 },
];

const performanceData = [
  { metric: "Revenue Growth", value: 85, fullMark: 100 },
  { metric: "Cost Efficiency", value: 72, fullMark: 100 },
  { metric: "Customer Satisfaction", value: 90, fullMark: 100 },
  { metric: "Market Position", value: 78, fullMark: 100 },
  { metric: "Innovation", value: 82, fullMark: 100 },
  { metric: "Team Productivity", value: 88, fullMark: 100 },
];

const cashFlowData = [
  { quarter: "Q1", inflow: 180000, outflow: 120000, net: 60000 },
  { quarter: "Q2", inflow: 210000, outflow: 135000, net: 75000 },
  { quarter: "Q3", inflow: 245000, outflow: 155000, net: 90000 },
  { quarter: "Q4", inflow: 280000, outflow: 170000, net: 110000 },
];

const CHART_COLORS = {
  light: {
    primary: "#10b981",    // emerald-500
    secondary: "#3b82f6",  // blue-500
    tertiary: "#f59e0b",   // amber-500
    quaternary: "#8b5cf6", // violet-500
    profit: "#10b981",
    revenue: "#3b82f6",
    expenses: "#ef4444",
    portfolio: "#8b5cf6",
    target: "#94a3b8",
  },
  dark: {
    primary: "#34d399",    // emerald-400
    secondary: "#60a5fa",  // blue-400
    tertiary: "#fbbf24",   // amber-400
    quaternary: "#a78bfa", // violet-400
    profit: "#34d399",
    revenue: "#60a5fa",
    expenses: "#f87171",
    portfolio: "#a78bfa",
    target: "#64748b",
  }
};

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartColors, setChartColors] = useState(CHART_COLORS.light);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
      setChartColors(isDark ? CHART_COLORS.dark : CHART_COLORS.light);
    };
    
    updateTheme();
    
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const PIE_COLORS = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
  ];

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card className="overflow-hidden border-border/40 backdrop-blur-sm bg-card/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground ivy-font group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors">
          <Icon className="h-4 w-4 text-emerald-500 group-hover:text-white transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground ivy-font">{value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={trend === "up" ? "text-emerald-500" : "text-red-500"}>
            {change}
          </span>
          <span>from last month</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground ivy-font mb-2">
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground ivy-font">
              Track your financial performance and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 ivy-font">
              October 2025
            </Badge>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white ivy-font">
              <DollarSign className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$85,000"
            change="+12.5%"
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Net Profit"
            value="$38,000"
            change="+8.2%"
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="Total Expenses"
            value="$47,000"
            change="+4.3%"
            icon={CreditCard}
            trend="up"
          />
          <StatCard
            title="Savings Rate"
            value="44.7%"
            change="+2.1%"
            icon={PiggyBank}
            trend="up"
          />
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="ivy-font">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="ivy-font">Analytics</TabsTrigger>
            <TabsTrigger value="performance" className="ivy-font">Performance</TabsTrigger>
            <TabsTrigger value="cashflow" className="ivy-font">Cash Flow</TabsTrigger>
            <TabsTrigger value="investments" className="ivy-font">Investments</TabsTrigger>
            <TabsTrigger value="transactions" className="ivy-font">Transactions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="col-span-4 border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle className="ivy-font">Revenue vs Expenses</CardTitle>
                  <CardDescription className="ivy-font">
                    Monthly comparison of revenue and expenses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.revenue} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.revenue} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.expenses} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.expenses} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                      <XAxis 
                        dataKey="month" 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f1f5f9' : '#0f172a'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={chartColors.revenue} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke={chartColors.expenses} 
                        fillOpacity={1} 
                        fill="url(#colorExpenses)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-3 border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle className="ivy-font">Expense Breakdown</CardTitle>
                  <CardDescription className="ivy-font">
                    Distribution by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {categoryData.map((cat, idx) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: PIE_COLORS[idx] }}
                          />
                          <span className="text-sm text-muted-foreground ivy-font">{cat.name}</span>
                        </div>
                        <span className="text-sm font-medium ivy-font">${cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle className="ivy-font">Profit Trends</CardTitle>
                  <CardDescription className="ivy-font">
                    Net profit over the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                      <XAxis 
                        dataKey="month" 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke={chartColors.profit} 
                        strokeWidth={3}
                        dot={{ fill: chartColors.profit, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader>
                  <CardTitle className="ivy-font">Monthly Comparison</CardTitle>
                  <CardDescription className="ivy-font">
                    Revenue, expenses, and profit side by side
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                      <XAxis 
                        dataKey="month" 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill={chartColors.revenue} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill={chartColors.expenses} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" fill={chartColors.profit} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="border-border/40 backdrop-blur-sm bg-card/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="ivy-font">Performance Metrics</CardTitle>
                <CardDescription className="ivy-font">
                  Comprehensive view of business performance across key areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '10px' }}
                    />
                    <Radar 
                      name="Performance" 
                      dataKey="value" 
                      stroke={chartColors.primary} 
                      fill={chartColors.primary} 
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {performanceData.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all hover:scale-105 cursor-pointer">
                      <p className="text-sm text-muted-foreground ivy-font mb-1">{item.metric}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold ivy-font">{item.value}%</p>
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="space-y-4">
            <Card className="border-border/40 backdrop-blur-sm bg-card/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="ivy-font">Quarterly Cash Flow Analysis</CardTitle>
                <CardDescription className="ivy-font">
                  Track cash inflows, outflows, and net cash position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                    <XAxis 
                      dataKey="quarter" 
                      stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="inflow" fill={chartColors.revenue} radius={[8, 8, 0, 0]} name="Cash Inflow" />
                    <Bar dataKey="outflow" fill={chartColors.expenses} radius={[8, 8, 0, 0]} name="Cash Outflow" />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke={chartColors.profit} 
                      strokeWidth={3}
                      name="Net Cash Flow"
                      dot={{ fill: chartColors.profit, r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-all hover:scale-105 cursor-pointer">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 ivy-font mb-1">Total Inflow</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 ivy-font">$915K</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all hover:scale-105 cursor-pointer">
                    <p className="text-sm text-red-600 dark:text-red-400 ivy-font mb-1">Total Outflow</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 ivy-font">$580K</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all hover:scale-105 cursor-pointer">
                    <p className="text-sm text-blue-600 dark:text-blue-400 ivy-font mb-1">Net Position</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 ivy-font">$335K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium ivy-font">
                    Portfolio Value
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ivy-font">$182,000</div>
                  <p className="text-xs text-muted-foreground ivy-font">
                    +8.2% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium ivy-font">
                    Target Value
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ivy-font">$175,000</div>
                  <p className="text-xs text-emerald-500 ivy-font">
                    Target achieved! 🎉
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/40 backdrop-blur-sm bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium ivy-font">
                    ROI
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold ivy-font">+45.6%</div>
                  <p className="text-xs text-muted-foreground ivy-font">
                    Year to date
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/40 backdrop-blur-sm bg-card/50">
              <CardHeader>
                <CardTitle className="ivy-font">Portfolio Performance</CardTitle>
                <CardDescription className="ivy-font">
                  Your portfolio value vs target over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={investmentData}>
                    <defs>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.portfolio} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={chartColors.portfolio} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="portfolio" 
                      stroke={chartColors.portfolio} 
                      fillOpacity={1} 
                      fill="url(#colorPortfolio)"
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke={chartColors.target} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card className="border-border/40 backdrop-blur-sm bg-card/50">
              <CardHeader>
                <CardTitle className="ivy-font">Recent Transactions</CardTitle>
                <CardDescription className="ivy-font">
                  Your latest financial activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionsData.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "income" 
                            ? "bg-emerald-500/10 text-emerald-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground ivy-font">
                            {transaction.name}
                          </p>
                          <p className="text-sm text-muted-foreground ivy-font">
                            {transaction.date} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ivy-font ${
                        transaction.type === "income" ? "text-emerald-500" : "text-red-500"
                      }`}>
                        {transaction.type === "income" ? "+" : ""}
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/40 backdrop-blur-sm bg-card/50 hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg ivy-font">Add Income</CardTitle>
                  <CardDescription className="ivy-font">Record new revenue</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border/40 backdrop-blur-sm bg-card/50 hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg ivy-font">Add Expense</CardTitle>
                  <CardDescription className="ivy-font">Track new spending</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border/40 backdrop-blur-sm bg-card/50 hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg ivy-font">View Report</CardTitle>
                  <CardDescription className="ivy-font">Generate insights</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
