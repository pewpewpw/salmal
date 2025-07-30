"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - replace with your actual analytics data
const performanceData = [
  { date: "Jan 1", fcp: 1.2, lcp: 2.1, cls: 0.05, inp: 120 },
  { date: "Jan 2", fcp: 1.1, lcp: 2.0, cls: 0.04, inp: 115 },
  { date: "Jan 3", fcp: 1.3, lcp: 2.2, cls: 0.06, inp: 125 },
  { date: "Jan 4", fcp: 1.0, lcp: 1.9, cls: 0.03, inp: 110 },
  { date: "Jan 5", fcp: 0.9, lcp: 1.8, cls: 0.02, inp: 105 },
  { date: "Jan 6", fcp: 1.1, lcp: 2.0, cls: 0.04, inp: 115 },
  { date: "Jan 7", fcp: 1.2, lcp: 2.1, cls: 0.05, inp: 120 },
]

const trafficData = [
  { source: "Google", visitors: 5421 },
  { source: "Direct", visitors: 3245 },
  { source: "Twitter", visitors: 2134 },
  { source: "Reddit", visitors: 1876 },
  { source: "Hacker News", visitors: 1542 },
]

const pageData = [
  { page: "/home", views: 3245 },
  { page: "/products", views: 2134 },
  { page: "/blog", views: 1876 },
  { page: "/about", views: 1542 },
  { page: "/contact", views: 987 },
]

export default function WebAnalyticsDashboard() {
  const [percentile, setPercentile] = useState("p75")
  const [timeframe, setTimeframe] = useState("7d")

  // Calculate the Real Experience Score (sample calculation)
  const latestData = performanceData[performanceData.length - 1]
  const fcpScore = Math.min(100, Math.max(0, 100 - (latestData.fcp - 0.8) * 50))
  const lcpScore = Math.min(100, Math.max(0, 100 - (latestData.lcp - 1.2) * 30))
  const clsScore = Math.min(100, Math.max(0, 100 - (latestData.cls - 0.01) * 500))
  const inpScore = Math.min(100, Math.max(0, 100 - (latestData.inp - 80) * 0.5))

  // Weighted average based on the weights from the documentation
  const realExperienceScore = Math.round(fcpScore * 0.15 + lcpScore * 0.3 + inpScore * 0.3 + clsScore * 0.25)

  // Determine the score category
  let scoreCategory = "Poor"
  let scoreColor = "text-red-500"
  if (realExperienceScore >= 90) {
    scoreCategory = "Good"
    scoreColor = "text-green-500"
  } else if (realExperienceScore >= 50) {
    scoreCategory = "Needs Improvement"
    scoreColor = "text-orange-500"
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Web Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your website performance and traffic metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Real Experience Score</CardTitle>
            <CardDescription>Overall performance score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <span className={`text-5xl font-bold ${scoreColor}`}>{realExperienceScore}</span>
                <p className={`text-sm font-medium ${scoreColor}`}>{scoreCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Visitors</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <span className="text-5xl font-bold">12,218</span>
                <p className="text-sm text-green-500 font-medium">+8.1% vs previous</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Bounce Rate</CardTitle>
            <CardDescription>Percentage of single-page sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <span className="text-5xl font-bold">42.3%</span>
                <p className="text-sm text-red-500 font-medium">+2.5% vs previous</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <div className="flex space-x-2">
            <Select value={percentile} onValueChange={setPercentile}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Percentile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p75">P75</SelectItem>
                <SelectItem value="p90">P90</SelectItem>
                <SelectItem value="p95">P95</SelectItem>
                <SelectItem value="p99">P99</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="core-vitals">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="core-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="traffic">Traffic & Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="core-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals Trends</CardTitle>
              <CardDescription>Track how your Core Web Vitals change over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="fcp"
                      name="FCP (s)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="lcp" name="LCP (s)" stroke="#82ca9d" />
                    <Line yAxisId="left" type="monotone" dataKey="cls" name="CLS" stroke="#ffc658" />
                    <Line yAxisId="right" type="monotone" dataKey="inp" name="INP (ms)" stroke="#ff8042" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>First Contentful Paint</CardTitle>
                <CardDescription>Time until the first content is painted (Good: ≤1.8s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestData.fcp}s</span>
                  <span
                    className={`text-lg font-semibold ${fcpScore >= 90 ? "text-green-500" : fcpScore >= 50 ? "text-orange-500" : "text-red-500"}`}
                  >
                    {Math.round(fcpScore)}/100
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Largest Contentful Paint</CardTitle>
                <CardDescription>Time until largest content element is visible (Good: ≤2.5s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestData.lcp}s</span>
                  <span
                    className={`text-lg font-semibold ${lcpScore >= 90 ? "text-green-500" : lcpScore >= 50 ? "text-orange-500" : "text-red-500"}`}
                  >
                    {Math.round(lcpScore)}/100
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cumulative Layout Shift</CardTitle>
                <CardDescription>Measures visual stability (Good: ≤0.1)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestData.cls}</span>
                  <span
                    className={`text-lg font-semibold ${clsScore >= 90 ? "text-green-500" : clsScore >= 50 ? "text-orange-500" : "text-red-500"}`}
                  >
                    {Math.round(clsScore)}/100
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interaction to Next Paint</CardTitle>
                <CardDescription>Responsiveness metric (Good: ≤200ms)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestData.inp}ms</span>
                  <span
                    className={`text-lg font-semibold ${inpScore >= 90 ? "text-green-500" : inpScore >= 50 ? "text-orange-500" : "text-red-500"}`}
                  >
                    {Math.round(inpScore)}/100
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Traffic Sources</CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      visitors: {
                        label: "Visitors",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <BarChart data={trafficData} layout="vertical" margin={{ left: 80 }}>
                      <XAxis type="number" />
                      <YAxis dataKey="source" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="visitors" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most viewed pages on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      views: {
                        label: "Page Views",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <BarChart data={pageData} layout="vertical" margin={{ left: 80 }}>
                      <XAxis type="number" />
                      <YAxis dataKey="page" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="views" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

