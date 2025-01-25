'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TableColumnToggle } from '@/components/ui/table-column-toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { 
  User, Mail, Phone, Building2, Tag, Globe, Calendar,
  CheckCircle, Clock, Star, AlertCircle, Globe2, 
  Facebook, Linkedin, MonitorSmartphone, MessageSquare,
  Pencil, Trash, FileUp, FileDown, Search, Filter,
  Settings2, Plus, Loader2, X, FileSpreadsheet,
  CheckCircle2, Flame, ThermometerSun, Snowflake, Thermometer
} from 'lucide-react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const columns = [
  { id: 'name', label: 'Name', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'status', label: 'Stage', icon: Tag },
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'source', label: 'Source', icon: Globe },
  { id: 'lastContact', label: 'Last Contact', icon: Calendar },
  { id: 'actions', label: 'Actions' },
]

// Add interface for column mapping
interface ColumnMapping {
  csvHeader: string;
  leadField: string;
}

// Add temperature configuration
type TemperatureType = 'Hot' | 'Warm' | 'Cold';

const temperatureConfig: Record<TemperatureType, { color: string; icon: LucideIcon }> = {
  'Hot': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: Flame },
  'Warm': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', icon: ThermometerSun },
  'Cold': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Snowflake }
} as const;

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  temperature: TemperatureType;
  source: string;
  lastContact: string;
}

const initialLeads: Lead[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    company: 'Tech Corp',
    status: 'New',
    temperature: 'Warm',
    source: 'Website',
    lastContact: '2024-03-15',
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+1 234 567 891',
    company: 'Design Co',
    status: 'Contacted',
    temperature: 'Hot',
    source: 'Referral',
    lastContact: '2024-03-14',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 234 567 892',
    company: 'Marketing Inc',
    status: 'Qualified',
    temperature: 'Cold',
    source: 'LinkedIn',
    lastContact: '2024-03-13',
  },
]

// Add interfaces for error tracking
interface ImportError {
  row: number;
  field: string;
  value: string;
  reason: string;
}

interface ImportStats {
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  errors: ImportError[];
  skippedColumns: string[];
}

// Add a function to generate unique IDs
function generateUniqueId(): number {
  return Date.now()
}

const defaultStages = {
  'Lead': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: User },
  'Appointment Booked': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', icon: Calendar },
  'Qualified': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: CheckCircle },
  'Disqualified': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: AlertCircle },
  'Not Connected': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100', icon: Phone },
  'Deal Closed': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100', icon: CheckCircle },
  'DNP': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', icon: AlertCircle },
  'Follow Up': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100', icon: Clock },
  'Call Back': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100', icon: Phone },
  'Consultation': { color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100', icon: MessageSquare },
  'Not Interested': { color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100', icon: X },
  'Broadcast Done': { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100', icon: Globe },
  'Wrong Number': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: Phone },
  'Payment Received': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: CheckCircle },
}

// Add source configuration
const sourceConfig = {
  'Website': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', icon: Globe2 },
  'Facebook Ad': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Facebook },
  'LinkedIn': { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100', icon: Linkedin },
  'Referral': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: MessageSquare },
  'Google Ad': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: MonitorSmartphone }
}

// Add icons mapping
const iconMapping = {
  User,
  Mail,
  Phone,
  Building2,
  Tag,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Globe2,
  Facebook,
  Linkedin,
  MonitorSmartphone,
  MessageSquare
}

// Type guard for temperature
const isTemperatureType = (value: string): value is TemperatureType => {
  return ['Hot', 'Warm', 'Cold'].includes(value as TemperatureType)
}

// Type guard for lead fields
type LeadField = keyof Omit<Lead, 'id' | 'temperature'>
const isLeadField = (field: string): field is LeadField => {
  return ['name', 'email', 'phone', 'company', 'status', 'source', 'lastContact'].includes(field)
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibleColumns, setVisibleColumns] = useState(['name', 'email', 'status', 'source', 'actions'])
  
  // Add states for import functionality
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [showMapping, setShowMapping] = useState(false)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([])
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [showGeneratingReport, setShowGeneratingReport] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Add ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsSectionRef = useRef<HTMLDivElement>(null)

  // Add these states
  const [stages, setStages] = useState<Record<string, { color: string; icon: LucideIcon }>>(defaultStages)
  const [showStageManager, setShowStageManager] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedIcon] = useState<keyof typeof iconMapping>('User')
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [showStageChange, setShowStageChange] = useState(false)
  const [editingStage, setEditingStage] = useState<string | null>(null)
  const [editedStageName, setEditedStageName] = useState('')
  const [editedStageColor, setEditedStageColor] = useState('')
  const [showEditLead, setShowEditLead] = useState(false)
  const [editedLead, setEditedLead] = useState<Lead | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setImportError(null)
    setImportStats(null)
    
    if (!selectedFile) {
      setImportError('No file selected')
      return
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n')
        
        if (lines.length < 2) {
          setImportError('CSV file is empty or has no data rows')
          return
        }

        const result = lines.map(line => line.split(',').map(cell => cell.trim()))
        setPreview(result.slice(0, 5))
        
        // Initialize column mapping
        const csvHeaders = result[0]
        setColumnMapping(csvHeaders.map(header => ({
          csvHeader: header,
          leadField: 'skip'
        })))
        setShowMapping(true)
      } catch (err) {
        console.error('Failed to read CSV file:', err)
        setImportError('Failed to read CSV file. Please check the file format.')
      }
    }

    reader.onerror = () => {
      setImportError('Failed to read the file')
    }

    reader.readAsText(selectedFile)
  }

  const handleColumnMapChange = (csvHeader: string, leadField: string) => {
    setColumnMapping(current =>
      current.map(mapping =>
        mapping.csvHeader === csvHeader
          ? { ...mapping, leadField }
          : mapping
      )
    )
  }

  const validateRow = (row: string[], csvHeaders: string[], rowIndex: number): ImportError[] => {
    const errors: ImportError[] = []
    
    columnMapping.forEach((mapping) => {
      if (mapping.leadField !== 'skip') {
        const value = row[csvHeaders.indexOf(mapping.csvHeader)]
        
        // Validate required fields
        if (['name', 'email'].includes(mapping.leadField) && !value) {
          errors.push({
            row: rowIndex + 2, // Add 2 to account for 1-based indexing and header row
            field: mapping.leadField,
            value: value,
            reason: `${mapping.leadField} is required`
          })
        }
        
        // Validate email format
        if (mapping.leadField === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({
            row: rowIndex + 2,
            field: 'email',
            value: value,
            reason: 'Invalid email format'
          })
        }
      }
    })
    
    return errors
  }

  const handleImport = () => {
    if (!file || !preview.length) return
    
    // First show the generating report UI
    setShowGeneratingReport(true)
    
    // Scroll to the report section first
    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
      
      // Start the import process after scrolling
      setTimeout(() => {
        startImport()
      }, 800) // Wait for scroll animation
    }, 100)
  }

  const startImport = () => {
    if (!file) return
    
    setIsImporting(true)
    setImportError(null)
    setImportStats(null)

    const csvHeaders = preview[0]
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n')
        const allRows = lines
          .map(line => line.split(',').map(cell => cell.trim()))
          .filter((row, index) => {
            // Skip empty rows or rows with only empty cells
            if (index === 0) return true // Keep header row
            return row.some(cell => cell !== '')
          })
        const dataRows = allRows.slice(1) // Skip header row

        const stats: ImportStats = {
          totalRows: dataRows.length,
          successfulRows: 0,
          skippedRows: 0,
          errors: [],
          skippedColumns: columnMapping
            .filter(m => m.leadField === 'skip')
            .map(m => m.csvHeader)
        }

        const newLeads = dataRows.map((row, rowIndex) => {
          const rowErrors = validateRow(row, csvHeaders, rowIndex)
          if (rowErrors.length > 0) {
            stats.errors.push(...rowErrors)
            stats.skippedRows++
            return null
          }

          const lead: Lead = {
            id: generateUniqueId(),
            name: '',
            email: '',
            phone: '',
            company: '',
            status: 'New',
            temperature: 'Warm',
            source: '',
            lastContact: new Date().toISOString().split('T')[0],
          }

          columnMapping.forEach((mapping) => {
            if (mapping.leadField && mapping.leadField !== 'skip') {
              const csvIndex = csvHeaders.indexOf(mapping.csvHeader)
              if (csvIndex !== -1) {
                const value = row[csvIndex]
                if (mapping.leadField === 'temperature' && isTemperatureType(value)) {
                  lead.temperature = value as TemperatureType
                } else if (isLeadField(mapping.leadField)) {
                  lead[mapping.leadField] = value
                }
              }
            }
          })

          stats.successfulRows++
          return lead
        }).filter((lead): lead is Lead => lead !== null)

        setImportStats(stats)
        if (newLeads.length > 0) {
          setLeads(current => [...current, ...newLeads])
        }
        
        // Delay hiding the generating animation slightly
        setTimeout(() => {
          setShowGeneratingReport(false)
          // Scroll to results after the generating animation
          setTimeout(() => {
            resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }, 1000)

      } catch (err) {
        console.error('Failed to process CSV data:', err)
        setImportError('Failed to process CSV data')
        setShowGeneratingReport(false)
      } finally {
        setIsImporting(false)
      }
    }

    reader.onerror = () => {
      setImportError('Failed to read the file')
      setIsImporting(false)
      setShowGeneratingReport(false)
    }

    reader.readAsText(file)
  }

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns(current =>
      current.includes(columnId)
        ? current.filter(id => id !== columnId)
        : [...current, columnId]
    )
  }

  const filteredLeads = leads.filter(lead =>
    (statusFilter === 'all' || lead.status === statusFilter) &&
    Object.values(lead).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const resetImport = () => {
    setFile(null)
    setPreview([])
    setShowMapping(false)
    setColumnMapping([])
    setImportError(null)
    setImportStats(null)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  // Add pagination calculation
  const totalItems = filteredLeads.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredLeads.slice(startIndex, endIndex)

  // Update pagination controls
  const PaginationControls = () => {
    const pageNumbers: number[] = []
    const maxVisiblePages = 5
    const safeTotalPages = Math.max(1, totalPages || 1)
    const safeCurrentPage = Math.min(currentPage, safeTotalPages)
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    const handlePageChange = (page: number) => {
      setCurrentPage(Math.min(Math.max(1, page), safeTotalPages))
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={safeCurrentPage === 1}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {startPage > 1 && (
              <>
                <Button
                  variant={safeCurrentPage === 1 ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  className="hidden sm:flex"
                >
                  1
                </Button>
                {startPage > 2 && (
                  <div className="flex items-center px-2">...</div>
                )}
              </>
            )}

            {pageNumbers.map(number => (
              <Button
                key={number}
                variant={safeCurrentPage === number ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(number)}
              >
                {number}
              </Button>
            ))}

            {endPage < safeTotalPages && (
              <>
                {endPage < safeTotalPages - 1 && (
                  <div className="flex items-center px-2">...</div>
                )}
                <Button
                  variant={safeCurrentPage === safeTotalPages ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(safeTotalPages)}
                  className="hidden sm:flex"
                >
                  {safeTotalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === safeTotalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(safeTotalPages)}
            disabled={safeCurrentPage === safeTotalPages}
            className="hidden sm:flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const handleAddStage = () => {
    if (newStageName && !stages[newStageName]) {
      setStages(prev => ({
        ...prev,
        [newStageName]: {
          color: `bg-${selectedColor}-100 text-${selectedColor}-800 dark:bg-${selectedColor}-900 dark:text-${selectedColor}-100`,
          icon: iconMapping[selectedIcon as keyof typeof iconMapping] || User
        }
      }))
      setNewStageName('')
    }
  }

  const handleStageChange = (leadId: number | undefined, newStage: string) => {
    if (typeof leadId === 'number') {
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStage } : lead
      ))
      setShowStageChange(false)
      setEditingLead(null)
    }
  }

  const handleEditStage = (stageName: string) => {
    setEditingStage(stageName)
    setEditedStageName(stageName)
    setEditedStageColor(stages[stageName].color.split(' ')[0].replace('bg-', '').replace('-100', ''))
  }

  const handleUpdateStage = () => {
    if (editedStageName && editingStage) {
      const stageConfig = stages[editingStage]
      const updatedStages = { ...stages }
      
      // Delete old stage if name changed
      if (editingStage !== editedStageName) {
        delete updatedStages[editingStage]
      }

      // Add updated stage
      updatedStages[editedStageName] = {
        ...stageConfig,
        color: `bg-${editedStageColor}-100 text-${editedStageColor}-800 dark:bg-${editedStageColor}-900 dark:text-${editedStageColor}-100`
      }

      setStages(updatedStages)
      setEditingStage(null)
      setEditedStageName('')
      setEditedStageColor('')
    }
  }

  const handleDeleteStage = (stageName: string) => {
    const updatedStages = { ...stages }
    delete updatedStages[stageName]
    setStages(updatedStages)
  }

  const handleEditLead = (lead: Lead) => {
    setEditedLead({ ...lead })
    setShowEditLead(true)
  }

  const handleUpdateLead = (updatedLead: Lead | null) => {
    if (!updatedLead) return
    setLeads(prev => prev.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ))
    setShowEditLead(false)
    setEditedLead(null)
  }

  return (
    <div className="space-y-4 p-2 h-full overflow-scroll">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Leads</CardTitle>
          <div className="flex items-center gap-2">
            <TableColumnToggle
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowStageManager(true)}>
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage Lead Stages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="hidden"
              />
              <Button onClick={handleImportClick}>
                <FileUp className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <Dialog open={showMapping} onOpenChange={(open) => !open && resetImport()}>
              <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 m-0">
                <div className="h-full flex flex-col overflow-scroll">
                  <div className="border-b p-6">
                    <DialogHeader className="flex flex-row items-center justify-between">
                      <DialogTitle className="text-2xl">Import Leads from CSV</DialogTitle>
                      <Button variant="ghost" size="icon" onClick={resetImport}>
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogHeader>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1400px] mx-auto space-y-8">
                      {importError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                          {importError}
                        </div>
                      )}

                      {/* Mapping Section */}
                      <div className="rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Map CSV Columns to Lead Fields</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {columnMapping.map((mapping) => (
                            <div 
                              key={mapping.csvHeader} 
                              className="flex flex-col space-y-2 p-3 rounded-md border "
                            >
                              <span className="text-sm font-medium text-gray-700">
                                {mapping.csvHeader}
                              </span>
                              <Select
                                value={mapping.leadField}
                                onValueChange={(value) => handleColumnMapChange(mapping.csvHeader, value)}
                              >
                                <SelectTrigger className="w-full ">
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="skip">Skip this column</SelectItem>
                                  {columns
                                    .filter(col => col.id !== 'actions' && col.id !== 'id')
                                    .map(col => (
                                      <SelectItem key={col.id} value={col.id}>
                                        {col.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Section */}
                      {preview.length > 0 && (
                        <div className="rounded-lg border p-6">
                          <h3 className="text-lg font-semibold mb-4">Data Preview</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {preview[0]?.map((header, index) => (
                                    <TableHead key={index} className="whitespace-nowrap">
                                      {header}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {preview.slice(1).map((row, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                      <TableCell key={cellIndex} className="whitespace-nowrap">
                                        {cell}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                      {/* Generating Report Animation */}
                      {showGeneratingReport && (
                        <div ref={resultsSectionRef} className="rounded-lg border border-gray-200 bg-gray-50 p-12 space-y-6">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                              <div className={cn(
                                "relative transition-transform duration-700",
                                isImporting ? "scale-90" : "scale-100"
                              )}>
                                <FileSpreadsheet className={cn(
                                  "h-12 w-12 transition-colors duration-500",
                                  isImporting ? "text-blue-400" : "text-gray-400",
                                  "animate-pulse"
                                )} />
                                <div className="absolute -right-2 -top-2">
                                  <div className="animate-spin">
                                    <Loader2 className="h-6 w-6 text-blue-500" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="transition-opacity duration-500">
                              <h3 className="text-lg font-semibold">
                                {isImporting ? 'Importing Your Data' : 'Preparing Import Process'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {isImporting 
                                  ? 'Please wait while we process and validate your data...' 
                                  : 'Getting everything ready for your import...'}
                              </p>
                            </div>
                            <div className="w-full max-w-xs">
                              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                                  style={{
                                    animation: 'progress 1.5s ease-in-out infinite',
                                    transformOrigin: 'left center',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Import Stats Section - Moved to bottom */}
                      {importStats && !showGeneratingReport && (
                        <div ref={resultsSectionRef} className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                              <h3 className="text-lg font-semibold">Import Results</h3>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={resetImport}
                              className="flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Close
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="text-sm font-medium text-gray-500">Total Rows</div>
                              <div className="text-2xl font-semibold">{importStats.totalRows}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="text-sm font-medium text-gray-500">Successfully Imported</div>
                              <div className="text-2xl font-semibold text-green-600">{importStats.successfulRows}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="text-sm font-medium text-gray-500">Skipped Rows</div>
                              <div className="text-2xl font-semibold text-yellow-600">{importStats.skippedRows}</div>
                            </div>
                          </div>

                          {importStats.skippedColumns.length > 0 && (
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="text-sm font-medium text-gray-500 mb-2">Skipped Columns</div>
                              <div className="flex flex-wrap gap-2">
                                {importStats.skippedColumns.map((col) => (
                                  <span key={col} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {col}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {importStats.errors.length > 0 && (
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="text-sm font-medium text-gray-500 mb-2">Errors</div>
                              <div className="space-y-2">
                                {importStats.errors.map((error, index) => (
                                  <div key={index} className="text-sm text-red-600">
                                    Row {error.row}: {error.reason} (Field: {error.field}, Value: {error.value || 'empty'})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-center pt-4">
                            <Button 
                              onClick={resetImport}
                              className="min-w-[200px]"
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t p-6">
                    <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {file && <span>File: {file.name}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={resetImport}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleImport}
                          disabled={!file || columnMapping.every(m => m.leadField === 'skip') || isImporting}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            'Import Leads'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Stage Manager Dialog */}
            <Dialog open={showStageManager} onOpenChange={setShowStageManager}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Manage Lead Stages</DialogTitle>
                  <DialogDescription>
                    Create and manage your lead stages to track your sales pipeline.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Add New Stage Section */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="New stage name"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                      />
                    </div>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange', 'cyan', 'indigo'].map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddStage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Stages List */}
                  <div className="border rounded-md">
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="space-y-0">
                        {Object.entries(stages).map(([name, config]) => (
                          <div 
                            key={name} 
                            className={cn(
                              "flex items-center justify-between p-3 border-b last:border-0",
                              editingStage === name ? "bg-gray-50" : ""
                            )}
                          >
                            {editingStage === name ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editedStageName}
                                  onChange={(e) => setEditedStageName(e.target.value)}
                                  className="max-w-[200px]"
                                />
                                <Select value={editedStageColor} onValueChange={setEditedStageColor}>
                                  <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Color" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange', 'cyan', 'indigo'].map(color => (
                                      <SelectItem key={color} value={color}>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                                          {color}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={handleUpdateStage}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setEditingStage(null)}
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  {React.createElement(config.icon, { className: "h-4 w-4" })}
                                  <span>{name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn("w-fit", config.color)}>
                                    Example
                                  </Badge>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditStage(name)}
                                  >
                                    <Pencil className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteStage(name)}
                                    disabled={Object.keys(stages).length <= 1}
                                  >
                                    <Trash className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Stage Change Dialog */}
            <Dialog open={showStageChange} onOpenChange={setShowStageChange}>
              <DialogContent className="max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Change Lead Stage</DialogTitle>
                  <DialogDescription>
                    Select a new stage for this lead.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid gap-2 py-4">
                    {Object.entries(stages).map(([name, config]) => (
                      <Button
                        key={name}
                        variant="outline"
                        className={cn(
                          "justify-start",
                          editingLead?.status === name && "border-blue-500"
                        )}
                        onClick={() => {
                          if (editingLead?.id !== undefined) {
                            handleStageChange(editingLead.id, name)
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {React.createElement(config.icon, { className: "h-4 w-4" })}
                          <span>{name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Edit Lead Dialog */}
            <Dialog open={showEditLead} onOpenChange={setShowEditLead}>
              <DialogContent className="max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Lead</DialogTitle>
                  <DialogDescription>
                    Update lead information and stage.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input
                      value={editedLead?.name || ''}
                      onChange={(e) => setEditedLead(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={editedLead?.email || ''}
                      onChange={(e) => setEditedLead(prev => prev ? { ...prev, email: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input
                      value={editedLead?.phone || ''}
                      onChange={(e) => setEditedLead(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Company</Label>
                    <Input
                      value={editedLead?.company || ''}
                      onChange={(e) => setEditedLead(prev => prev ? { ...prev, company: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Stage</Label>
                    <Select
                      value={editedLead?.status || ''}
                      onValueChange={(value) => setEditedLead(prev => prev ? { ...prev, status: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(stages).map(([name, config]) => (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                              {React.createElement(config.icon, { className: "h-4 w-4" })}
                              <span>{name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Temperature</Label>
                    <Select
                      value={editedLead?.temperature || ''}
                      onValueChange={(value) => {
                        if (value in temperatureConfig) {
                          setEditedLead(prev => prev ? { ...prev, temperature: value as TemperatureType } : null)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select temperature" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(temperatureConfig) as TemperatureType[]).map((name) => (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                              {React.createElement(temperatureConfig[name].icon, { className: "h-4 w-4" })}
                              <span>{name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Source</Label>
                    <Select
                      value={editedLead?.source || ''}
                      onValueChange={(value) => setEditedLead(prev => prev ? { ...prev, source: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(sourceConfig).map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditLead(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleUpdateLead(editedLead)}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns
                      .filter(column => visibleColumns.includes(column.id))
                      .map(column => (
                        <TableHead key={column.id}>{column.label}</TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((lead) => (
                    <TableRow key={lead.id}>
                      {columns
                        .filter(column => visibleColumns.includes(column.id))
                        .map(column => (
                          <TableCell key={column.id}>
                            {column.id === 'actions' ? (
                              <div className="flex gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEditLead(lead)}
                                      >
                                        <Pencil className="h-4 w-4 text-blue-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Lead</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                      >
                                        <Trash className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Lead</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ) : column.id === 'status' ? (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={cn(
                                    "flex w-fit items-center gap-1 cursor-pointer",
                                    stages[lead.status]?.color
                                  )}
                                  onClick={() => {
                                    setEditingLead(lead)
                                    setShowStageChange(true)
                                  }}
                                >
                                  {React.createElement(
                                    stages[lead.status]?.icon || Tag,
                                    { className: "h-3 w-3" }
                                  )}
                                  {lead.status}
                                </Badge>
                              </div>
                            ) : column.id === 'temperature' ? (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={cn(
                                    "flex w-fit items-center gap-1",
                                    temperatureConfig[lead.temperature as TemperatureType]?.color
                                  )}
                                >
                                  {React.createElement(
                                    temperatureConfig[lead.temperature as TemperatureType]?.icon || Thermometer,
                                    { className: "h-3 w-3" }
                                  )}
                                  {lead.temperature}
                                </Badge>
                              </div>
                            ) : column.id === 'source' ? (
                              <Badge 
                                className={cn(
                                  "flex w-fit items-center gap-1",
                                  sourceConfig[lead.source as keyof typeof sourceConfig]?.color
                                )}
                              >
                                {React.createElement(
                                  sourceConfig[lead.source as keyof typeof sourceConfig]?.icon || Globe,
                                  { className: "h-3 w-3" }
                                )}
                                {lead.source}
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                {column.icon && React.createElement(column.icon, { 
                                  className: "h-4 w-4 text-gray-500" 
                                })}
                                <span>{lead[column.id as keyof typeof lead]}</span>
                              </div>
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalItems > 0 && <PaginationControls />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

