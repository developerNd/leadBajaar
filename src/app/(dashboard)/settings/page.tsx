'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SettingsPage() {
  // Profile Settings
  const [profileSettings, setProfileSettings] = useState<{
    name: string;
    email: string;
    company: string;
    phone: string;
    image: string | null;
  }>({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc',
    phone: '+1 234 567 890',
    image: null
  })

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    leadAssignment: true,
    leadStatusChange: true,
    dailyDigest: false,
    weeklyReport: true
  })

  // Import/Export Settings
  const [importSettings, setImportSettings] = useState({
    defaultStatus: 'New',
    skipDuplicates: true,
    sendNotification: true,
    autoAssign: false
  })

  // Email Template Settings
  const [emailSettings, setEmailSettings] = useState({
    emailSignature: 'Best regards,\nJohn Doe\nAcme Inc',
    replyTo: 'support@acme.com',
    defaultTemplate: 'welcome'
  })

  // Add state for image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      
      // Here you would typically upload the file to your server
      // For now, we'll just store the preview URL
      setProfileSettings(prev => ({ ...prev, image: previewUrl }))
    }
  }

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal and company information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    {(imagePreview || profileSettings.image) ? (
                      <AvatarImage 
                        src={imagePreview || profileSettings.image || undefined} 
                        alt="Profile" 
                      />
                    ) : null}
                    <AvatarFallback>
                      {profileSettings.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a picture to make your profile stand out
                  </p>
                  {imagePreview && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        setImagePreview(null)
                        setProfileSettings(prev => ({ ...prev, image: null }))
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* Rest of the form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileSettings.name}
                    onChange={e => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileSettings.email}
                    onChange={e => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company"
                    value={profileSettings.company}
                    onChange={e => setProfileSettings(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone"
                    value={profileSettings.phone}
                    onChange={e => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={checked => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Assignment</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a lead is assigned to you
                    </p>
                  </div>
                  <Switch
                    checked={notifications.leadAssignment}
                    onCheckedChange={checked => 
                      setNotifications(prev => ({ ...prev, leadAssignment: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lead Status Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when lead status changes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.leadStatusChange}
                    onCheckedChange={checked => 
                      setNotifications(prev => ({ ...prev, leadStatusChange: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of activities
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyDigest}
                    onCheckedChange={checked => 
                      setNotifications(prev => ({ ...prev, dailyDigest: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={checked => 
                      setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Settings */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export Settings</CardTitle>
              <CardDescription>
                Configure how leads are imported and exported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Lead Status</Label>
                    <Select 
                      value={importSettings.defaultStatus}
                      onValueChange={value => 
                        setImportSettings(prev => ({ ...prev, defaultStatus: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Skip Duplicates</Label>
                      <p className="text-sm text-muted-foreground">
                        Skip importing duplicate leads based on email
                      </p>
                    </div>
                    <Switch
                      checked={importSettings.skipDuplicates}
                      onCheckedChange={checked => 
                        setImportSettings(prev => ({ ...prev, skipDuplicates: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Import Notification</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when import is complete
                      </p>
                    </div>
                    <Switch
                      checked={importSettings.sendNotification}
                      onCheckedChange={checked => 
                        setImportSettings(prev => ({ ...prev, sendNotification: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-assign Leads</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically assign imported leads to team members
                      </p>
                    </div>
                    <Switch
                      checked={importSettings.autoAssign}
                      onCheckedChange={checked => 
                        setImportSettings(prev => ({ ...prev, autoAssign: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Template Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure your email templates and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Template</Label>
                  <Select 
                    value={emailSettings.defaultTemplate}
                    onValueChange={value => 
                      setEmailSettings(prev => ({ ...prev, defaultTemplate: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="meeting">Meeting Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reply-To Email</Label>
                  <Input 
                    value={emailSettings.replyTo}
                    onChange={e => 
                      setEmailSettings(prev => ({ ...prev, replyTo: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Signature</Label>
                  <Textarea 
                    value={emailSettings.emailSignature}
                    onChange={e => 
                      setEmailSettings(prev => ({ ...prev, emailSignature: e.target.value }))
                    }
                    className="min-h-[100px]"
                    placeholder="Enter your email signature..."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Email Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

