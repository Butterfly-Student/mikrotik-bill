"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, FileText, TrendingUp, Users, DollarSign, Calendar, Filter } from "lucide-react"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("revenue")
  const [dateRange, setDateRange] = useState("30days")
  const [exportFormat, setExportFormat] = useState("pdf")

  // Mock data for charts
  const revenueData = [
    { month: "Jan", revenue: 45000000, users: 1200 },
    { month: "Feb", revenue: 52000000, users: 1350 },
    { month: "Mar", revenue: 48000000, users: 1280 },
    { month: "Apr", revenue: 61000000, users: 1450 },
    { month: "May", revenue: 55000000, users: 1380 },
    { month: "Jun", revenue: 67000000, users: 1520 },
  ]

  const userGrowthData = [
    { date: "2024-01-01", hotspot: 800, pppoe: 400, total: 1200 },
    { date: "2024-01-15", hotspot: 850, pppoe: 450, total: 1300 },
    { date: "2024-02-01", hotspot: 900, pppoe: 450, total: 1350 },
    { date: "2024-02-15", hotspot: 920, pppoe: 480, total: 1400 },
    { date: "2024-03-01", hotspot: 880, pppoe: 400, total: 1280 },
    { date: "2024-03-15", hotspot: 950, pppoe: 500, total: 1450 },
  ]

  const serviceDistribution = [
    { name: "Hotspot Users", value: 65, count: 980 },
    { name: "PPPoE Users", value: 35, count: 520 },
  ]

  const topResellers = [
    { name: "PT. Internet Sejahtera", sales: 15750000, users: 234, commission: 2362500 },
    { name: "CV. Digital Network", sales: 8900000, users: 156, commission: 1068000 },
    { name: "Warnet Maju Jaya", sales: 3200000, users: 67, commission: 320000 },
    { name: "ISP Nusantara", sales: 2800000, users: 45, commission: 280000 },
    { name: "Net Solution", sales: 2100000, users: 38, commission: 210000 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const exportReport = () => {
    // Simulate export functionality
    console.log(`Exporting ${reportType} report as ${exportFormat}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and performance reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="users">User Analytics</SelectItem>
                  <SelectItem value="resellers">Reseller Performance</SelectItem>
                  <SelectItem value="usage">Usage Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(67000000)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,520</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.8%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line type="monotone" dataKey="hotspot" stroke="#8884d8" name="Hotspot" />
                <Line type="monotone" dataKey="pppoe" stroke="#82ca9d" name="PPPoE" />
                <Line type="monotone" dataKey="total" stroke="#ffc658" name="Total" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Resellers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Resellers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reseller</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topResellers.map((reseller, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{reseller.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(reseller.sales)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reseller.users}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">{formatCurrency(reseller.commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Revenue Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hotspot Services:</span>
                    <span className="font-medium">{formatCurrency(42000000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPPoE Services:</span>
                    <span className="font-medium">{formatCurrency(25000000)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{formatCurrency(67000000)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">User Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>New Users:</span>
                    <span className="font-medium text-green-600">+234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Churned Users:</span>
                    <span className="font-medium text-red-600">-48</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Growth:</span>
                    <span className="font-bold text-green-600">+186</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ARPU:</span>
                    <span className="font-medium">{formatCurrency(44000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer LTV:</span>
                    <span className="font-medium">{formatCurrency(520000)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Satisfaction:</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
