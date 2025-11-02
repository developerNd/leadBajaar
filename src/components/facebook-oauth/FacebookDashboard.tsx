'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Facebook, 
  MessageCircle, 
  Globe, 
  Instagram, 
  TrendingUp, 
  Users, 
  Phone, 
  Settings, 
  Loader2, 
  RefreshCw,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ServiceAnalytics {
  total_pages: number
  total_waba: number
  total_instagram: number
  total_ad_accounts: number
  total_phone_numbers: number
}

interface PageInsight {
  name: string
  period: string
  values: Array<{
    value: number
    end_time: string
  }>
}

interface FacebookPage {
  id: string
  page_id: string
  name: string
  category?: string
  tasks: string[]
  insights: PageInsight[]
  connected_at: string
}

interface WhatsAppAccount {
  id: string
  waba_id: string
  name: string
  timezone?: string
  currency?: string
  phone_numbers: Array<{
    id: string
    display_phone_number: string
    verified_name?: string
  }>
  phone_numbers_count: number
  connected_at: string
}

export function FacebookDashboard() {
  const [analytics, setAnalytics] = useState<ServiceAnalytics | null>(null)
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load analytics
      const analyticsResponse = await fetch('/api/facebook/services/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }

      // Load pages with insights
      const pagesResponse = await fetch('/api/facebook/services/pages/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json()
        setPages(pagesData.pages || [])
      }

      // Load WhatsApp accounts
      const whatsappResponse = await fetch('/api/facebook/services/whatsapp/details', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (whatsappResponse.ok) {
        const whatsappData = await whatsappResponse.json()
        setWhatsappAccounts(whatsappData.accounts || [])
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load Facebook services data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncServices = async () => {
    try {
      setIsSyncing(true)
      
      const response = await fetch('/api/facebook/services/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Sync Successful",
          description: `Synced ${data.pages_synced} pages, ${data.waba_synced} WhatsApp accounts, and more`
        })
        loadDashboardData()
      } else {
        throw new Error('Sync failed')
      }
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync services",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getTotalImpressions = (insights: PageInsight[]) => {
    return insights.reduce((total, insight) => {
      return total + insight.values.reduce((sum, value) => sum + value.value, 0)
    }, 0)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Facebook services...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Facebook Services Dashboard</h2>
          <p className="text-gray-600">Manage your connected Facebook, WhatsApp, and Instagram accounts</p>
        </div>
        <Button onClick={handleSyncServices} disabled={isSyncing}>
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Services
        </Button>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.total_pages}</p>
                  <p className="text-sm text-gray-600">Facebook Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.total_waba}</p>
                  <p className="text-sm text-gray-600">WhatsApp Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.total_phone_numbers}</p>
                  <p className="text-sm text-gray-600">Phone Numbers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Instagram className="h-8 w-8 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.total_instagram}</p>
                  <p className="text-sm text-gray-600">Instagram Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.total_ad_accounts}</p>
                  <p className="text-sm text-gray-600">Ad Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">Facebook Pages</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Business</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facebook Pages & Insights</CardTitle>
              <CardDescription>
                View your connected Facebook pages and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Impressions (30d)</TableHead>
                      <TableHead>Connected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.name}</TableCell>
                        <TableCell>{page.category || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {page.tasks.slice(0, 2).map((task) => (
                              <Badge key={task} variant="outline" className="text-xs">
                                {task.replace('_', ' ')}
                              </Badge>
                            ))}
                            {page.tasks.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{page.tasks.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                            <span>{formatNumber(getTotalImpressions(page.insights))}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(page.connected_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No Facebook pages connected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Accounts</CardTitle>
              <CardDescription>
                Manage your WhatsApp Business accounts and phone numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {whatsappAccounts.length > 0 ? (
                <div className="space-y-4">
                  {whatsappAccounts.map((account) => (
                    <Card key={account.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <CardDescription>
                          ID: {account.waba_id} • {account.timezone || 'No timezone'} • {account.currency || 'No currency'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium">Phone Numbers ({account.phone_numbers_count}):</h4>
                          {account.phone_numbers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {account.phone_numbers.map((phone) => (
                                <div key={phone.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <div>
                                    <p className="font-medium">{phone.display_phone_number}</p>
                                    {phone.verified_name && (
                                      <p className="text-sm text-gray-500">{phone.verified_name}</p>
                                    )}
                                  </div>
                                  <Badge variant="secondary">Verified</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No phone numbers available</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No WhatsApp Business accounts connected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
                <CardDescription>Top performing Facebook pages</CardDescription>
              </CardHeader>
              <CardContent>
                {pages.length > 0 ? (
                  <div className="space-y-2">
                    {pages
                      .sort((a, b) => getTotalImpressions(b.insights) - getTotalImpressions(a.insights))
                      .slice(0, 5)
                      .map((page, index) => (
                        <div key={page.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-lg">#{index + 1}</span>
                            <span className="font-medium">{page.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatNumber(getTotalImpressions(page.insights))} impressions
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Usage</CardTitle>
                <CardDescription>Phone number distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {whatsappAccounts.length > 0 ? (
                  <div className="space-y-2">
                    {whatsappAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium">{account.name}</span>
                        <Badge variant="outline">{account.phone_numbers_count} numbers</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


