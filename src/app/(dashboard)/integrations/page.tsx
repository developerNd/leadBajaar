'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icons } from '@/components/icons'
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Globe, Webhook, CheckCircle2, XCircle, RefreshCcw, ArrowDownToLine, Send, X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  mapping: {
    sourceField: string;
    targetField: string;
  }[];
}

interface Integration {
  id: string
  name: string
  icon: string
  category: string
  color: string
  description: string
  features: string[]
}

const integrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: 'cloud',
    category: 'crm',
    color: '#00A1E0',
    description: 'Connect and sync data with Salesforce CRM',
    features: ['Lead Sync', 'Contact Sync', 'Opportunity Tracking']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: 'database',
    category: 'crm',
    color: '#FF7A59',
    description: 'Integrate with HubSpot marketing and CRM tools',
    features: ['Contact Management', 'Email Marketing', 'Analytics']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: 'zap',
    category: 'automation',
    color: '#FF4A00',
    description: 'Automate workflows with Zapier integration',
    features: ['Custom Workflows', 'Multi-app Integration', 'Automated Tasks']
  }
]

const dummyLogs = [
  { 
    id: 1, 
    integration: 'Salesforce', 
    action: 'Data sync', 
    status: 'Success', 
    timestamp: '2023-06-15 10:30:00',
    icon: RefreshCcw
  },
  { 
    id: 2, 
    integration: 'HubSpot', 
    action: 'Contact import', 
    status: 'Failed', 
    timestamp: '2023-06-15 11:45:00',
    icon: ArrowDownToLine
  },
  { 
    id: 3, 
    integration: 'Mailchimp', 
    action: 'Campaign sync', 
    status: 'Success', 
    timestamp: '2023-06-15 13:15:00',
    icon: RefreshCcw
  },
  { 
    id: 4, 
    integration: 'Zapier', 
    action: 'Trigger update', 
    status: 'Success', 
    timestamp: '2023-06-15 14:30:00',
    icon: Send
  },
  { 
    id: 5, 
    integration: 'Calendly', 
    action: 'Appointment sync', 
    status: 'Success', 
    timestamp: '2023-06-15 15:45:00',
    icon: RefreshCcw
  },
]

export default function IntegrationsPage() {
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Lead Form Webhook',
      url: 'https://example.com/webhook1',
      events: ['lead.created', 'lead.updated'],
      isActive: true,
      mapping: [
        { sourceField: 'name', targetField: 'full_name' },
        { sourceField: 'email', targetField: 'email_address' }
      ]
    }
  ])
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false)
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    name: '',
    url: '',
    events: [],
    mapping: []
  })

  const toggleIntegration = (integrationId: string) => {
    setActiveIntegrations(prev => 
      prev.includes(integrationId) 
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    )
  }

  const addWebhook = () => {
    if (newWebhook.name && newWebhook.url) {
      setWebhooks(prev => [...prev, {
        id: Date.now().toString(),
        name: newWebhook.name!,
        url: newWebhook.url!,
        events: newWebhook.events || [],
        isActive: true,
        mapping: newWebhook.mapping || []
      }])
      setNewWebhook({ name: '', url: '', events: [], mapping: [] })
      setShowNewWebhookDialog(false)
    }
  }

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
  }

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, isActive: !webhook.isActive } : webhook
    ))
  }

  const addFieldMapping = (webhookId: string) => {
    setWebhooks(prev => prev.map(webhook => {
      if (webhook.id === webhookId) {
        return {
          ...webhook,
          mapping: [...webhook.mapping, { sourceField: '', targetField: '' }]
        }
      }
      return webhook
    }))
  }

  const updateFieldMapping = (webhookId: string, index: number, field: 'sourceField' | 'targetField', value: string) => {
    setWebhooks(prev => prev.map(webhook => {
      if (webhook.id === webhookId) {
        const newMapping = [...webhook.mapping]
        newMapping[index] = { ...newMapping[index], [field]: value }
        return { ...webhook, mapping: newMapping }
      }
      return webhook
    }))
  }

  const removeFieldMapping = (webhookId: string, index: number) => {
    setWebhooks(prev => prev.map(webhook => {
      if (webhook.id === webhookId) {
        const newMapping = webhook.mapping.filter((_, i) => i !== index)
        return { ...webhook, mapping: newMapping }
      }
      return webhook
    }))
  }

  return (
    <div className="container mx-auto py-10 p-2 overflow-y-scroll h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>
        {['all', 'crm', 'marketing', 'messaging', 'payments', 'automation', 'scheduling'].map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations
                .filter(integration => category === 'all' || integration.category === category)
                .map(integration => (
                  <Card 
                    key={integration.id} 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedIntegration === integration.id && "border-primary",
                      activeIntegrations.includes(integration.id) && "bg-muted"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{integration.name}</CardTitle>
                        <Switch
                          checked={activeIntegrations.includes(integration.id)}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                        />
                      </div>
                      <CardDescription>{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{integration.features.join(', ')}</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedIntegration(integration.id)}
                      >
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Show configuration panel when an integration is selected */}
      {selectedIntegration && (
        <Card className="mt-8">
          <CardHeader className="relative">
            <div className="absolute right-4 top-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedIntegration(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Configure settings for {integrations.find(i => i.id === selectedIntegration)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="text" placeholder="Enter your API key" />
                </div>
                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input type="password" placeholder="Enter your API secret" />
                </div>
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select defaultValue="production">
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync Options</Label>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync data every hour
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates in real-time
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Mapping</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Field</TableHead>
                      <TableHead>Target Field</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Select defaultValue="name">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select defaultValue="fullName">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fullName">Full Name</SelectItem>
                            <SelectItem value="emailAddress">Email Address</SelectItem>
                            <SelectItem value="phoneNumber">Phone Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Button variant="outline" className="w-full mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field Mapping
                </Button>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                  Cancel
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Webhooks</h2>
          <Button onClick={() => setShowNewWebhookDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {webhooks.map(webhook => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Webhook className="h-5 w-5 text-blue-500" />
                    <CardTitle>{webhook.name}</CardTitle>
                  </div>
                  <Switch
                    checked={webhook.isActive}
                    onCheckedChange={() => toggleWebhook(webhook.id)}
                  />
                </div>
                <CardDescription className="mt-2">
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-1 text-gray-500" />
                    {webhook.url}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map(event => (
                      <Badge key={event} variant="secondary">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  {webhook.mapping.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-500 mb-2">Field Mapping</p>
                      <div className="space-y-1">
                        {webhook.mapping.map((map, index) => (
                          <div key={index} className="text-sm flex justify-between">
                            <span>{map.sourceField}</span>
                            <span className="text-gray-500">→</span>
                            <span>{map.targetField}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => deleteWebhook(webhook.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configure</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Configure Webhook</DialogTitle>
                      <DialogDescription>
                        Set up webhook endpoints and configure data mapping.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Webhook Name</Label>
                        <Input value={webhook.name} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Endpoint URL</Label>
                        <Input value={webhook.url} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Events</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select events to trigger webhook" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead.created">Lead Created</SelectItem>
                            <SelectItem value="lead.updated">Lead Updated</SelectItem>
                            <SelectItem value="lead.deleted">Lead Deleted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Field Mapping</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          <div className="space-y-2">
                            {webhook.mapping.map((map, index) => (
                              <div key={index} className="flex gap-2">
                                <Select
                                  value={map.sourceField}
                                  onValueChange={(value) => updateFieldMapping(webhook.id, index, 'sourceField', value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Source field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                  </SelectContent>
                                </Select>
                                <span className="flex items-center">→</span>
                                <Select
                                  value={map.targetField}
                                  onValueChange={(value) => updateFieldMapping(webhook.id, index, 'targetField', value)}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Target field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="fullName">Full Name</SelectItem>
                                    <SelectItem value="emailAddress">Email Address</SelectItem>
                                    <SelectItem value="phoneNumber">Phone Number</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeFieldMapping(webhook.id, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <div className="sticky bottom-0 pt-2 bg-white dark:bg-gray-950">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => addFieldMapping(webhook.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field Mapping
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Webhook</DialogTitle>
            <DialogDescription>
              Create a new webhook endpoint and configure its settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Webhook Name</Label>
              <Input 
                value={newWebhook.name} 
                onChange={e => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter webhook name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Endpoint URL</Label>
              <Input 
                value={newWebhook.url}
                onChange={e => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-endpoint.com/webhook"
              />
            </div>
            <div className="grid gap-2">
              <Label>Events</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select events to trigger webhook" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead.created">Lead Created</SelectItem>
                  <SelectItem value="lead.updated">Lead Updated</SelectItem>
                  <SelectItem value="lead.deleted">Lead Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWebhookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addWebhook}>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Integration Settings</h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Data Sync Frequency</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Label htmlFor="sync-frequency">Sync every</Label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Data Mapping</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">Configure how data fields from integrated services map to your CRM fields.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Configure Mapping</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                      <DialogHeader>
                        <DialogTitle>Data Mapping Configuration</DialogTitle>
                        <DialogDescription>
                          Map fields from your integrated services to your CRM fields.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="sourceField" className="text-right">
                            Source Field
                          </Label>
                          <Select>
                            <SelectTrigger className="w-full col-span-3">
                              <SelectValue placeholder="Select source field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="targetField" className="text-right">
                            Target Field
                          </Label>
                          <Select>
                            <SelectTrigger className="w-full col-span-3">
                              <SelectValue placeholder="Select target field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fullName">Full Name</SelectItem>
                              <SelectItem value="emailAddress">Email Address</SelectItem>
                              <SelectItem value="phoneNumber">Phone Number</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save mapping</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Integration Logs</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Integration</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {Icons[log.integration.toLowerCase() as keyof typeof Icons] ? (
                                React.createElement(Icons[log.integration.toLowerCase() as keyof typeof Icons], {
                                  className: "h-4 w-4",
                                  style: { 
                                    color: integrations.find(i => 
                                      i.name.toLowerCase() === log.integration.toLowerCase()
                                    )?.color 
                                  }
                                })
                              ) : (
                                <div className="h-4 w-4" />
                              )}
                              {log.integration}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {React.createElement(log.icon, { className: "h-4 w-4 text-gray-500" })}
                              {log.action}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {log.status === 'Success' ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Success
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Failed
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {log.timestamp}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

