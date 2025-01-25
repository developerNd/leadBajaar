'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const conversionData = [
  { name: 'Jan', rate: 40 },
  { name: 'Feb', rate: 45 },
  { name: 'Mar', rate: 50 },
  { name: 'Apr', rate: 55 },
  { name: 'May', rate: 60 },
  { name: 'Jun', rate: 65 },
  { name: 'Jul', rate: 70 },
]

const leadSourceData = [
  { name: 'Website', value: 400 },
  { name: 'Referral', value: 300 },
  { name: 'Social Media', value: 200 },
  { name: 'Email', value: 100 },
  { name: 'Other', value: 50 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 p-2 h-full overflow-y-scroll">
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadSourceData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

