'use client'

import React, { useState, useEffect } from 'react'
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
import { Trash2, Plus, Globe, Webhook, CheckCircle2, XCircle, RefreshCcw, ArrowDownToLine, Send, Cloud, Database, Zap, MessageCircle, LucideIcon, ClipboardCopy, Facebook, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { integrationApi } from '@/lib/api'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'

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

interface ConnectedIntegration {
  id: number;
  user_id: number;
  type: string;
  config: {
    phoneNumberId?: string;
    wabaId?: string;
    accessToken?: string;
    enableTemplates?: boolean;
    // Add other possible config fields
  };
  metadata: any;
  environment: string;
  is_active: boolean;
  webhook_url: string | null;
  webhook_secret: string | null;
  created_at: string;
  updated_at: string;
}

interface Integration {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  color: string;
  description: string;
  features: string[];
  allowMultiple: boolean;
}

interface WhatsAppConfig {
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  enableTemplates: boolean;
}

interface FacebookConfig {
  leadFormName: string;
  pageId: string;
  formId: string;
  accessToken: string;
}

interface ConfigError {
  phoneNumberId?: string;
  wabaId?: string;
  accessToken?: string;
  leadFormName?: string;
  pageId?: string;
  formId?: string;
  fbAccessToken?: string;
}

const integrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: Cloud,
    category: 'crm',
    color: '#00A1E0',
    description: 'Connect and sync data with Salesforce CRM',
    features: ['Lead Sync', 'Contact Sync', 'Opportunity Tracking'],
    allowMultiple: false
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: Database,
    category: 'crm',
    color: '#FF7A59',
    description: 'Integrate with HubSpot marketing and CRM tools',
    features: ['Contact Management', 'Email Marketing', 'Analytics'],
    allowMultiple: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: Zap,
    category: 'automation',
    color: '#FF4A00',
    description: 'Automate workflows with Zapier integration',
    features: ['Custom Workflows', 'Multi-app Integration', 'Automated Tasks'],
    allowMultiple: false
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    icon: MessageCircle,
    category: 'messaging',
    color: '#25D366',
    description: 'Connect with customers via WhatsApp Business Platform',
    features: ['Automated Messages', 'Chat Templates', 'Business Profile', 'Message Analytics'],
    allowMultiple: false
  },
  {
    id: 'facebook',
    name: 'Facebook Lead Forms',
    icon: Facebook,
    category: 'marketing',
    color: '#1877F2',
    description: 'Connect and sync Facebook Lead Form submissions',
    features: ['Lead Form Integration', 'Real-time Notifications', 'Automated Lead Capture'],
    allowMultiple: true
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
  const { toast } = useToast()
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>([])
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
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    enableTemplates: false
  })
  const [facebookConfig, setFacebookConfig] = useState<FacebookConfig>({
    leadFormName: '',
    pageId: '',
    formId: '',
    accessToken: ''
  })
  const [configErrors, setConfigErrors] = useState<ConfigError>({})
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null)
  const router = useRouter()
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    fetchConnectedIntegrations()
  }, [])

  const fetchConnectedIntegrations = async () => {
    try {
      const response = await integrationApi.getConnectedIntegrations()
      console.log(response)
      // If response is directly the integration object, wrap it in an array
      const integrationData = response.id ? [response] : []
      setConnectedIntegrations(integrationData)
    } catch (error: any) {
      setConnectedIntegrations([])
      toast({
        title: "Error",
        description: error.message || "Failed to fetch connected integrations",
        variant: "destructive",
      })
    }
  }

  const canConnectIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (!integration) return false

    const isConnected = connectedIntegrations.some(
      ci => ci.type === integrationId && ci.is_active
    )

    return integration.allowMultiple || !isConnected
  }

  const testToast = () => {
    console.log('testToast')
    toast({
      title: "Test Toast",
      description: "This is a test notification",
      variant: "default",
      duration: 3000,
    })
  }

  // const toggleIntegration = async (integrationId: string) => {
  //   try {
  //     const isActive = !activeIntegrations.includes(integrationId);
  //     await integrationApi.updateIntegrationStatus(integrationId, isActive);
  //     setActiveIntegrations(prev => 
  //       isActive 
  //         ? [...prev, integrationId]
  //         : prev.filter(id => id !== integrationId)
  //     );
  //     toast({
  //       title: isActive ? "Integration Enabled" : "Integration Disabled",
  //       description: `The integration has been ${isActive ? 'enabled' : 'disabled'} successfully.`,
  //       variant: "default",
  //     });
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to update integration status. Please try again.",
  //       variant: "destructive",
  //     });
  //     // Revert the UI state if the API call failed
  //     setActiveIntegrations(prev => prev);
  //   }
  // }

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

  const validateConfig = () => {
    const errors: ConfigError = {}
    
    if (!whatsappConfig.phoneNumberId.trim()) {
      errors.phoneNumberId = 'Phone Number ID is required'
    }
    if (!whatsappConfig.wabaId.trim()) {
      errors.wabaId = 'WABA ID is required'
    }
    if (!whatsappConfig.accessToken.trim()) {
      errors.accessToken = 'Access Token is required'
    }
    
    setConfigErrors(errors)
    return Object.keys(errors).length === 0
  }

  // const handleSaveConfig = async () => {
  //   if (validateConfig()) {
  //     try {
  //       await integrationApi.saveIntegration({
  //         type: 'whatsapp',
  //         config: whatsappConfig,
  //         isActive: true,
  //         environment: 'production',
  //       });
  //       toast({
  //         title: "Success",
  //         description: "WhatsApp integration has been configured successfully.",
  //         variant: "default",
  //       });
  //       setSelectedIntegrationId(null);
  //     } catch (error: any) {
  //       toast({
  //         title: "Configuration Failed",
  //         description: error.message || "Unable to save WhatsApp configuration. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   }
  // };

  const validateFacebookConfig = () => {
    const errors: ConfigError = {};
    
    if (!facebookConfig.leadFormName.trim()) {
      errors.leadFormName = 'Lead Form Name is required';
    }
    if (!facebookConfig.pageId.trim()) {
      errors.pageId = 'Page ID is required';
    }
    if (!facebookConfig.formId.trim()) {
      errors.formId = 'Form ID is required';
    }
    if (!facebookConfig.accessToken.trim()) {
      errors.fbAccessToken = 'Access Token is required';
    }
    
    setConfigErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleSaveFacebookConfig = async () => {
  //   if (validateFacebookConfig()) {
  //     try {
  //       await integrationApi.saveIntegration({
  //         type: 'facebook',
  //         config: facebookConfig,
  //         isActive: true,
  //         environment: 'production',
  //       });
  //       toast({
  //         title: "Success",
  //         description: "Facebook Lead Form integration has been configured successfully.",
  //         variant: "default",
  //       });
  //       setSelectedIntegrationId(null);
  //     } catch (error: any) {
  //       toast({
  //         title: "Configuration Failed",
  //         description: error.message || "Unable to save Facebook configuration. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   }
  // };

  const handleIntegrationConnect = async (type: string, config: any) => {
    // Clear previous errors
    setConfigErrors({});
    setServerError(null);

    // Validate based on integration type
    if (type === 'whatsapp') {
      if (!config.phoneNumberId?.trim()) {
        setConfigErrors(prev => ({ ...prev, phoneNumberId: 'Phone Number ID is required' }));
        return;
      }
      if (!config.wabaId?.trim()) {
        setConfigErrors(prev => ({ ...prev, wabaId: 'WABA ID is required' }));
        return;
      }
      if (!config.accessToken?.trim()) {
        setConfigErrors(prev => ({ ...prev, accessToken: 'Access Token is required' }));
        return;
      }
    } else if (type === 'facebook') {
      if (!config.leadFormName?.trim()) {
        setConfigErrors(prev => ({ ...prev, leadFormName: 'Lead Form Name is required' }));
        return;
      }
      if (!config.pageId?.trim()) {
        setConfigErrors(prev => ({ ...prev, pageId: 'Page ID is required' }));
        return;
      }
      if (!config.formId?.trim()) {
        setConfigErrors(prev => ({ ...prev, formId: 'Form ID is required' }));
        return;
      }
      if (!config.accessToken?.trim()) {
        setConfigErrors(prev => ({ ...prev, fbAccessToken: 'Access Token is required' }));
        return;
      }
    }

    setIsConnecting(true);
    try {
      const response = await integrationApi.saveIntegration({
        type,
        config,
        isActive: true,
        environment: 'production'
      });

      // Update connected integrations list with the correct structure
      setConnectedIntegrations(prev => [...prev, {
        id: response.data.id,
        user_id: response.data.user_id,
        type: type,
        config: config,
        metadata: null,
        environment: 'production',
        is_active: true,
        webhook_url: null,
        webhook_secret: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      toast({
        title: "Success",
        description: "Integration connected successfully",
      });

      setConfigErrors({});
      setSelectedIntegrationId(null);
    } catch (error: any) {
      console.error('Integration error:', error);
      
      if (error.response) {
        // Server responded with error
        const serverError = error.response.data;
        
        if (error.response.status === 422) {
          // Validation errors from server
          if (serverError.errors) {
            setConfigErrors(prev => ({
              ...prev,
              ...Object.keys(serverError.errors).reduce((acc: any, key) => {
                acc[key] = serverError.errors[key][0];
                return acc;
              }, {})
            }));
          }
        } else {
          // Set general server error for other error types
          setServerError(
            serverError?.message || 
            error.message || 
            "An error occurred while configuring the integration. Please try again."
          );
        }
      } else {
        // Handle non-response errors
        setServerError("Unable to connect to the server. Please check your internet connection.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 p-2 overflow-y-scroll h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
        <Button onClick={testToast}>
          Test Toast
        </Button>
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
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {React.createElement(integration.icon, {
                            className: "h-5 w-5",
                            style: { color: integration.color }
                          })}
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                        </div>
                        {connectedIntegrations.some(ci => 
                          ci.type === integration.id && 
                          ci.is_active
                        ) && (
                          <Badge variant="secondary" className="flex gap-1 items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Connected
                            {integration.allowMultiple && (
                              <span className="ml-1 text-xs">
                                ({connectedIntegrations.filter(ci => ci.type === integration.id && ci.is_active).length})
                              </span>
                            )}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <Dialog 
                        open={selectedIntegrationId === integration.id} 
                        onOpenChange={(open) => setSelectedIntegrationId(open ? integration.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedIntegrationId(integration.id)}
                            disabled={!canConnectIntegration(integration.id)}
                          >
                            {connectedIntegrations.some(ci => 
                              ci.type === integration.id && 
                              ci.is_active
                            ) ? 'Connected' : 'Connect'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col">
                          <DialogHeader className="flex-none">
                            <DialogTitle>{integration.name} Configuration</DialogTitle>
                            <DialogDescription>
                              {integration.id === 'whatsapp' 
                                ? 'Configure your WhatsApp Business API credentials'
                                : integration.id === 'facebook'
                                ? 'Configure your Facebook Lead Form settings'
                                : `Configure your ${integration.name} settings`}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="flex-1 overflow-y-auto pr-2">
                            {serverError && (
                              <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-500/10 rounded-md">
                                <p>{serverError}</p>
                              </div>
                            )}

                            <div className="space-y-6">
                              {integration.id === 'whatsapp' ? (
                                <>
                                  <div className="grid gap-4">
                                    <div className="space-y-2">
                                      <Label>Phone Number ID</Label>
                                      <Input 
                                        type="text" 
                                        placeholder="Enter Phone Number ID"
                                        value={whatsappConfig.phoneNumberId}
                                        onChange={(e) => {
                                          setWhatsappConfig(prev => ({
                                            ...prev,
                                            phoneNumberId: e.target.value
                                          }))
                                          if (configErrors.phoneNumberId) {
                                            setConfigErrors(prev => ({
                                              ...prev,
                                              phoneNumberId: undefined
                                            }))
                                          }
                                        }}
                                        className={cn(
                                          configErrors.phoneNumberId && "border-red-500"
                                        )}
                                      />
                                      {configErrors.phoneNumberId && (
                                        <p className="text-sm text-red-500">{configErrors.phoneNumberId}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label>WABA ID</Label>
                                      <Input 
                                        type="text" 
                                        placeholder="Enter WhatsApp Business Account ID"
                                        value={whatsappConfig.wabaId}
                                        onChange={(e) => {
                                          setWhatsappConfig(prev => ({
                                            ...prev,
                                            wabaId: e.target.value
                                          }))
                                          if (configErrors.wabaId) {
                                            setConfigErrors(prev => ({
                                              ...prev,
                                              wabaId: undefined
                                            }))
                                          }
                                        }}
                                        className={cn(
                                          configErrors.wabaId && "border-red-500"
                                        )}
                                      />
                                      {configErrors.wabaId && (
                                        <p className="text-sm text-red-500">{configErrors.wabaId}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Access Token</Label>
                                      <Input 
                                        type="password" 
                                        placeholder="Enter Access Token"
                                        value={whatsappConfig.accessToken}
                                        onChange={(e) => {
                                          setWhatsappConfig(prev => ({
                                            ...prev,
                                            accessToken: e.target.value
                                          }))
                                          if (configErrors.accessToken) {
                                            setConfigErrors(prev => ({
                                              ...prev,
                                              accessToken: undefined
                                            }))
                                          }
                                        }}
                                        className={cn(
                                          configErrors.accessToken && "border-red-500"
                                        )}
                                      />
                                      {configErrors.accessToken && (
                                        <p className="text-sm text-red-500">{configErrors.accessToken}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Webhook URL</Label>
                                      <div className="flex gap-2">
                                        <Input 
                                          type="text" 
                                          value="https://your-domain.com/api/whatsapp/webhook" 
                                          readOnly
                                        />
                                        <Button variant="outline" size="icon">
                                          <ClipboardCopy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Verify Token</Label>
                                      <div className="flex gap-2">
                                        <Input 
                                          type="text" 
                                          value="your-verify-token-here" 
                                          readOnly
                                        />
                                        <Button variant="outline" size="icon">
                                          <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label>Message Templates</Label>
                                      <p className="text-sm text-muted-foreground">
                                        Enable pre-approved templates
                                      </p>
                                    </div>
                                    <Switch 
                                      checked={whatsappConfig.enableTemplates}
                                      onCheckedChange={(checked) => 
                                        setWhatsappConfig(prev => ({
                                          ...prev,
                                          enableTemplates: checked
                                        }))
                                      }
                                    />
                                  </div>
                                </>
                              ) : integration.id === 'facebook' ? (
                                <div className="grid gap-4">
                                  <div className="space-y-2">
                                    <Label>Lead Form Name</Label>
                                    <Input 
                                      type="text" 
                                      placeholder="Enter Lead Form Name"
                                      value={facebookConfig.leadFormName}
                                      onChange={(e) => {
                                        setFacebookConfig(prev => ({
                                          ...prev,
                                          leadFormName: e.target.value
                                        }))
                                        if (configErrors.leadFormName) {
                                          setConfigErrors(prev => ({
                                            ...prev,
                                            leadFormName: undefined
                                          }))
                                        }
                                      }}
                                      className={cn(
                                        configErrors.leadFormName && "border-red-500"
                                      )}
                                    />
                                    {configErrors.leadFormName && (
                                      <p className="text-sm text-red-500">{configErrors.leadFormName}</p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Page ID</Label>
                                    <Input 
                                      type="text" 
                                      placeholder="Enter Facebook Page ID"
                                      value={facebookConfig.pageId}
                                      onChange={(e) => {
                                        setFacebookConfig(prev => ({
                                          ...prev,
                                          pageId: e.target.value
                                        }))
                                        if (configErrors.pageId) {
                                          setConfigErrors(prev => ({
                                            ...prev,
                                            pageId: undefined
                                          }))
                                        }
                                      }}
                                      className={cn(
                                        configErrors.pageId && "border-red-500"
                                      )}
                                    />
                                    {configErrors.pageId && (
                                      <p className="text-sm text-red-500">{configErrors.pageId}</p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Form ID</Label>
                                    <Input 
                                      type="text" 
                                      placeholder="Enter Lead Form ID"
                                      value={facebookConfig.formId}
                                      onChange={(e) => {
                                        setFacebookConfig(prev => ({
                                          ...prev,
                                          formId: e.target.value
                                        }))
                                        if (configErrors.formId) {
                                          setConfigErrors(prev => ({
                                            ...prev,
                                            formId: undefined
                                          }))
                                        }
                                      }}
                                      className={cn(
                                        configErrors.formId && "border-red-500"
                                      )}
                                    />
                                    {configErrors.formId && (
                                      <p className="text-sm text-red-500">{configErrors.formId}</p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Access Token</Label>
                                    <Input 
                                      type="password" 
                                      placeholder="Enter Access Token"
                                      value={facebookConfig.accessToken}
                                      onChange={(e) => {
                                        setFacebookConfig(prev => ({
                                          ...prev,
                                          accessToken: e.target.value
                                        }))
                                        if (configErrors.fbAccessToken) {
                                          setConfigErrors(prev => ({
                                            ...prev,
                                            fbAccessToken: undefined
                                          }))
                                        }
                                      }}
                                      className={cn(
                                        configErrors.fbAccessToken && "border-red-500"
                                      )}
                                    />
                                    {configErrors.fbAccessToken && (
                                      <p className="text-sm text-red-500">{configErrors.fbAccessToken}</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                // Generic configuration form for other integrations
                                <div className="grid gap-4">
                                  <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <Input 
                                      type="password" 
                                      placeholder="Enter API Key"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>API Secret</Label>
                                    <Input 
                                      type="password" 
                                      placeholder="Enter API Secret"
                                    />
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
                              )}
                            </div>
                          </div>

                          <DialogFooter className="flex-none">
                            <Button variant="outline" onClick={() => {
                              setSelectedIntegrationId(null);
                              setServerError(null);
                            }}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => {
                                if (integration.id === 'whatsapp') {
                                  handleIntegrationConnect('whatsapp', whatsappConfig);
                                } else if (integration.id === 'facebook') {
                                  handleIntegrationConnect('facebook', facebookConfig);
                                } else {
                                  // Handle other integrations
                                  setSelectedIntegrationId(null);
                                }
                              }}
                              disabled={isConnecting}
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                'Connect'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {integration.id === 'whatsapp' && 
                        connectedIntegrations.some(ci => ci.type === 'whatsapp' && ci.is_active) && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => router.push('/integrations/whatsapp')}
                        >
                          Manage WhatsApp
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

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

