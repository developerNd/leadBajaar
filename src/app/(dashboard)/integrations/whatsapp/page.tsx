'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2, MessageSquare, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { integrationApi } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WhatsAppAccount {
  id: number;
  business_name: string;
  phone_number: string;
  status: string;
  templates_count: number;
  last_synced: string;
}

interface MessageTemplate {
  id: number;
  name: string;
  category: string;
  language: string;
  status: string;
  components: TemplateComponent[];
  attachments?: {
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    url?: string;
    filename?: string;
  }[];
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  example?: {
    header_handle: string[];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
    text: string;
    url?: string;
    phone_number?: string;
    code?: string;
  }>;
}

interface NewTemplate {
  name: string;
  category: string;
  language: string;
  components: TemplateComponent[];
}

export default function WhatsAppManagementPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([])
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppAccount | null>(null)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({
    name: '',
    category: 'MARKETING',
    language: 'en',
    components: [
      { type: 'HEADER', format: 'TEXT', text: '' },
      { type: 'BODY', text: '' },
      { type: 'FOOTER', text: '' }
    ]
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await integrationApi.getWhatsAppAccounts()
      console.log(response);
      setAccounts(response.accounts)
      if (response.accounts && response.accounts.length > 0) {
        setTemplates(response.accounts[0].templates || [])
        setSelectedAccount(response.accounts[0])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch WhatsApp accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async (accountId: number) => {
    try {
      const response = await integrationApi.getWhatsAppTemplates(accountId)
      console.log(response)
      setTemplates(response.templates)  
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch templates",
        variant: "destructive",
      })
    }
  }

  const syncTemplates = async (accountId: number) => {
    try {
      await integrationApi.syncWhatsAppTemplates(accountId)
      toast({
        title: "Success",
        description: "Templates synced successfully",
      })
      fetchTemplates(accountId)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sync templates",
        variant: "destructive",
      })
    }
  }

  const handleCreateTemplate = async () => {
    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Please select an account first",
        variant: "destructive",
      });
      return;
    }

    try {
      await integrationApi.createWhatsAppTemplate(selectedAccount.id, newTemplate);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      setShowNewTemplate(false);
      fetchTemplates(selectedAccount.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const indexOfLastTemplate = currentPage * itemsPerPage
  const indexOfFirstTemplate = indexOfLastTemplate - itemsPerPage
  const currentTemplates = templates.slice(indexOfFirstTemplate, indexOfLastTemplate)
  const totalPages = Math.ceil(templates.length / itemsPerPage)
  console.log(isLoading)
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">WhatsApp Management</h1>
        <Button onClick={() => setShowNewTemplate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Connected WhatsApp Business Accounts</CardTitle>
              <CardDescription>
                Manage your connected WhatsApp Business accounts and their templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Templates</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.business_name}</TableCell>
                      <TableCell>{account.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.templates_count}</TableCell>
                      <TableCell>{account.last_synced}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => syncTemplates(account.id)}
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account)
                              fetchTemplates(account.id)
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Manage your WhatsApp message templates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAccount ? (
                <div className="space-y-4">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Name</TableHead>
                          <TableHead className="min-w-[100px]">Category</TableHead>
                          <TableHead className="min-w-[100px]">Language</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Attachments</TableHead>
                          <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.category}</TableCell>
                            <TableCell>{template.language}</TableCell>
                            <TableCell>
                              <Badge variant={template.status === 'APPROVED' ? 'default' : 'secondary'}>
                                {template.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.components.map((component, idx) => (
                                component.format && component.format !== 'TEXT' && (
                                  <Badge key={idx} variant="outline" className="mr-1">
                                    {component.format.toLowerCase()}
                                  </Badge>
                                )
                              ))}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setPreviewTemplate(template)
                                  setShowPreview(true)
                                }}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {indexOfFirstTemplate + 1} to {Math.min(indexOfLastTemplate, templates.length)} of {templates.length} templates
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Select an account to view templates
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[600px]">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="welcome_message"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    name: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate(prev => ({
                    ...prev,
                    category: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Language</Label>
                <Select
                  value={newTemplate.language}
                  onValueChange={(value) => setNewTemplate(prev => ({
                    ...prev,
                    language: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Header</Label>
                  <Select
                    value={newTemplate.components[0].format}
                    onValueChange={(value: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT') => {
                      const components = [...newTemplate.components];
                      components[0] = { ...components[0], format: value };
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                    </SelectContent>
                  </Select>
                  {newTemplate.components[0].format === 'TEXT' ? (
                    <Input
                      placeholder="Header text"
                      value={newTemplate.components[0].text || ''}
                      onChange={(e) => {
                        const components = [...newTemplate.components];
                        components[0] = { ...components[0], text: e.target.value };
                        setNewTemplate(prev => ({ ...prev, components }));
                      }}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept={
                          newTemplate.components[0].format === 'IMAGE' ? 'image/*' :
                          newTemplate.components[0].format === 'VIDEO' ? 'video/*' :
                          newTemplate.components[0].format === 'DOCUMENT' ? '.pdf,.doc,.docx' :
                          undefined
                        }
                        onChange={(e) => {
                          // Handle file upload logic here
                          const file = e.target.files?.[0];
                          if (file) {
                            // You'll need to implement the file upload logic
                            // and update the template with the file URL
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {newTemplate.components[0].format === 'IMAGE' && 'Supported formats: JPG, PNG (max 5MB)'}
                        {newTemplate.components[0].format === 'VIDEO' && 'Supported formats: MP4 (max 16MB)'}
                        {newTemplate.components[0].format === 'DOCUMENT' && 'Supported formats: PDF, DOC (max 100MB)'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Body</Label>
                  <Textarea
                    placeholder="Message body text"
                    value={newTemplate.components[1].text || ''}
                    onChange={(e) => {
                      const components = [...newTemplate.components];
                      components[1] = { ...components[1], text: e.target.value };
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Footer</Label>
                  <Input
                    placeholder="Footer text"
                    value={newTemplate.components[2].text || ''}
                    onChange={(e) => {
                      const components = [...newTemplate.components];
                      components[2] = { ...components[2], text: e.target.value };
                      setNewTemplate(prev => ({ ...prev, components }));
                    }}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate && (
              <div className="bg-muted rounded-lg p-4 space-y-3">
                {previewTemplate.components.map((component, idx) => {
                  if (component.type === 'HEADER') {
                    return (
                      <div key={idx} className="space-y-2">
                        {component.format === 'TEXT' && (
                          <p className="font-semibold">{component.text}</p>
                        )}
                        {component.format === 'IMAGE' && (
                          <div className="bg-background rounded-lg p-3 text-center">
                            <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center">
                              {component.example?.header_handle?.[0] ? (
                                <img 
                                  src={component.example.header_handle[0]} 
                                  alt="Header" 
                                  className="max-h-full rounded-md object-contain"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Image Preview</p>
                              )}
                            </div>
                          </div>
                        )}
                        {component.format === 'VIDEO' && (
                          <div className="bg-background rounded-lg p-3 text-center">
                            <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center">
                              {component.example?.header_handle?.[0] ? (
                                <video 
                                  src={component.example.header_handle[0]} 
                                  controls 
                                  className="max-h-full rounded-md"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Video Preview</p>
                              )}
                            </div>
                          </div>
                        )}
                        {component.format === 'DOCUMENT' && (
                          <div className="bg-background rounded-lg p-3 text-center">
                            <div className="bg-muted-foreground/10 rounded-md p-4 flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">
                                📄 Document Attachment
                                {component.example?.header_handle?.[0] && (
                                  <span className="block text-xs mt-1">
                                    {component.example.header_handle[0].split('/').pop()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }
                  if (component.type === 'BODY') {
                    return (
                      <div key={idx} className="text-sm whitespace-pre-line">
                        {component.text}
                      </div>
                    )
                  }
                  if (component.type === 'FOOTER') {
                    return (
                      <div key={idx} className="text-xs text-muted-foreground">
                        {component.text}
                      </div>
                    )
                  }
                  if (component.type === 'BUTTONS' && component.buttons) {
                    return (
                      <div key={idx} className="space-y-2 pt-2 border-t">
                        {component.buttons.map((button, buttonIdx) => (
                          <div
                            key={buttonIdx}
                            className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-md p-2 text-sm text-center cursor-pointer"
                          >
                            {button.type === 'URL' && (
                              <div className="flex items-center justify-center gap-1">
                                <span>🔗</span>
                                <span>{button.text}</span>
                              </div>
                            )}
                            {button.type === 'PHONE_NUMBER' && (
                              <div className="flex items-center justify-center gap-1">
                                <span>📞</span>
                                <span>{button.text}</span>
                              </div>
                            )}
                            {button.type === 'QUICK_REPLY' && (
                              <span>{button.text}</span>
                            )}
                            {button.type === 'COPY_CODE' && (
                              <div className="flex items-center justify-center gap-1">
                                <span>📋</span>
                                <span>{button.text}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 