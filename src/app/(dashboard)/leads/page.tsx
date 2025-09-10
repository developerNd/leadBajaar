'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  User, Mail, Phone, Building2, Tag, Globe,
  CheckCircle, Clock, Star, AlertCircle, Globe2, 
  Facebook, Linkedin, MonitorSmartphone, MessageSquare,
  Pencil, Trash, FileDown, Search,
  Settings2, Plus, Loader2, X, FileSpreadsheet,
  CheckCircle2, Flame, ThermometerSun, Snowflake, Thermometer,
  XCircle, RefreshCcw, Calendar as CalendarIcon,
  FileUp,
  Computer,
  Map
} from 'lucide-react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { 
  createLead, 
  type CreateLeadDto, 
  getLeads, 
  deleteLead, 
  // updateLead, 
  bulkDeleteLeads, 
  bulkUpdateLeadStatus,
  updateLeadStage,
  importLeads,
  exportLeads,
  integrationApi  // Add this
} from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
// import axios from 'axios'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns'
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
// import { addDays } from "date-fns" // Add this import

const columns = [
  { id: 'name', label: 'Name', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'profession', label: 'profession', icon: Computer },
  { id: 'city', label: 'city', icon: Map },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'stage', label: 'Stage', icon: Tag },
  { id: 'status', label: 'Temperature', icon: Thermometer },
  { id: 'source', label: 'Source', icon: Globe },
  { id: 'lastContact', label: 'Last Contact', icon: CalendarIcon },
  { id: 'created_at', label: 'Created At', icon: CalendarIcon }, // Add this line
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
  stage: string;
  status: string;
  source: string;
  last_contact: string;
  created_at: string;
  updated_at: string;
  // Remove last_page and total as they belong to metadata
}

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
// function generateUniqueId(): number {
//   return Date.now()
// }

const defaultStages = {
  'Lead': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: User },
  'Appointment Booked': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', icon: CalendarIcon },
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
  CalendarIcon, // Replace Calendar with CalendarIcon
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
// const isTemperatureType = (value: string): value is TemperatureType => {
//   return ['Hot', 'Warm', 'Cold'].includes(value as TemperatureType)
// }

// Type guard for lead fields
// type LeadField = keyof Omit<Lead, 'id' | 'temperature'>
// const isLeadField = (field: string): field is LeadField => {
//   return ['name', 'email', 'phone', 'company', 'status', 'source', 'last_contact'].includes(field)
// }

// Add this interface if you don't have it already
interface NewLead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: string;
  status: 'Hot' | 'Warm' | 'Cold';
  source?: string;
}

// Add this interface for form validation
interface LeadFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

const ErrorAlert = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
    <div className="flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  </div>
);

// Add new interfaces
interface MessageTemplate {
  id: number;
  name: string;
  category: string;
  language: string;
  status: string;
  components: TemplateComponent[];
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

// Update the LeadsTableSkeleton component to accept props
interface LeadsTableSkeletonProps {
  columns: typeof columns;
  visibleColumns: string[];
}

const LeadsTableSkeleton = ({ columns, visibleColumns }: LeadsTableSkeletonProps) => (
  <div className="w-full animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-8 w-32 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </TableHead>
          {columns
            .filter(column => visibleColumns.includes(column.id))
            .map(column => (
              <TableHead key={column.id}>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </TableHead>
            ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </TableCell>
            {columns
              .filter(column => visibleColumns.includes(column.id))
              .map((column, cellIndex) => (
                <TableCell key={cellIndex}>
                  <div className="flex items-center gap-2">
                    {column.icon && (
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    )}
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </TableCell>
              ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Add this type for the date picker
type DatePickerProps = {
  date?: Date;
  onChange: (date?: Date) => void;
}

// // Add this component for the date picker
// const DatePicker = ({ date, onChange }: DatePickerProps) => {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           className={cn(
//             "w-[240px] justify-start text-left font-normal",
//             !date && "text-muted-foreground"
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {date ? format(date, "PPP") : <span>Pick a date</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={onChange}
//           initialFocus
//         />
//       </PopoverContent>
//     </Popover>
//   )
// }

// Add this type near your other type definitions
// type SourceType = keyof typeof sourceConfig;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibleColumns, setVisibleColumns] = useState([
    'name', 
    'phone', 
    'stage',
    // 'status',
    'city',
    'profession',
    'created_at',
    'actions'
  ])
  
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
  const [showNewLead, setShowNewLead] = useState(false);
  const [newLead, setNewLead] = useState<NewLead>({
    name: '',
    email: '',
    phone: '',
    company: '',
    stage: 'New',
    status: 'Warm',
    source: 'Website'
  });

  // Add these to your state variables at the top of LeadsPage component
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)


  // Add this at the top of your component
  const fetchLeadsConfig = React.useMemo(() => ({
    page: currentPage,
    search: searchTerm,
    status: statusFilter,
    perPage: itemsPerPage
  }), [currentPage, searchTerm, statusFilter, itemsPerPage]);

  // Add this to your state variables
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Add this state for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    leadId: number | null;
    leadName: string;
  }>({
    isOpen: false,
    leadId: null,
    leadName: ''
  });

  // Facebook Lead Retrieval States
  const [showFacebookRetrieval, setShowFacebookRetrieval] = useState(false);
  const [facebookForms, setFacebookForms] = useState<Array<{
    id: string;
    name: string;
    status: string;
    integration_id: number;
    page_id: string;
    source?: string;
    error?: string;
  }>>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);

  const [isRetrievingLeads, setIsRetrievingLeads] = useState(false);
  const [retrievalResults, setRetrievalResults] = useState<{
    total_processed: number;
    new_leads: number;
    existing_leads: number;
    processed_leads: Array<{
      facebook_lead_id: string;
      status: 'created' | 'existing';
      lead_id: number;
      name: string;
    }>;
    } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Add state for export dialog
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Add new state variables
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [variableColumnMapping, setVariableColumnMapping] = useState<Record<string, string>>({})

  // Add new state for templates loading
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Add these new state variables at the top of your component
  const [filters, setFilters] = useState<{
    search: string;
    status: string;
    stage: string;
    source: string;
    dateRange: DateRange | undefined;
    createdAt: DateRange | undefined;
  }>({
    search: '',
    status: 'all',
    stage: 'all',
    source: 'all',
    dateRange: undefined,
    createdAt: undefined
  });

  // Add debounced search for better performance
  const debouncedSearch = useDebounce(filters.search, 500); // 500ms delay
  const [isSearching, setIsSearching] = useState(false);

  // Track when search is happening
  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [filters.search, debouncedSearch]);

  // Add these state variables near your other states
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResponse, setBroadcastResponse] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  // State to hold the CSV data and column mappings
  const [csvData, setCsvData] = useState<string[][]>([]);
  // const [columnMapping, setColumnMapping] = useState<{ csvHeader: string; leadField: string }[]>([]);

  // Function to handle CSV file upload and parsing
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFile = e.target.files?.[0];
  //   if (selectedFile) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       const csv = event.target?.result as string;
  //       const lines = csv.split('\n').map(line => line.split(',').map(cell => cell.trim()));
  //       setCsvData(lines);
  //       // Initialize column mapping based on CSV headers
  //       const headers = lines[0];
  //       const initialMapping = headers.map(header => ({ csvHeader: header, leadField: 'skip' }));
  //       setColumnMapping(initialMapping);
  //     };
  //     reader.readAsText(selectedFile);
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handlefilechange')
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
    console.log('file chenged');

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

  // Move all function definitions here
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      stage: 'all',
      source: 'all',
      dateRange: undefined,
      createdAt: undefined
    });
    setCurrentPage(1);
  };

  // Update the fetchLeads function to properly handle all filters
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.stage !== 'all' && { stage: filters.stage }),
        ...(filters.source !== 'all' && { source: filters.source }),
        ...(filters.dateRange?.from && { 
          last_contact_from: format(filters.dateRange.from, 'yyyy-MM-dd') 
        }),
        ...(filters.dateRange?.to && { 
          last_contact_to: format(filters.dateRange.to, 'yyyy-MM-dd') 
        }),
        ...(filters.createdAt?.from && { 
          created_from: format(filters.createdAt.from, 'yyyy-MM-dd') 
        }),
        ...(filters.createdAt?.to && { 
          created_to: format(filters.createdAt.to, 'yyyy-MM-dd') 
        })
      };

      // Log the params being sent to API
      console.log('Fetching leads with params:', params);

      const response = await getLeads(params);
      
      if (response?.data && Array.isArray(response.data)) {
        setLeads(response.data);
        setTotalItems(response.total || 0);
        setTotalPages(response.last_page || 1);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setLeads([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the old fetchLeadsConfig since we're not using it
  useEffect(() => {
    fetchLeads();
  }, [currentPage, debouncedSearch, filters.status, filters.stage, filters.source, filters.dateRange, filters.createdAt, itemsPerPage]);

  // Update handleAddLead
  const handleAddLead = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await createLead({
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        company: newLead.company,
        stage: newLead.stage,
        status: newLead.status,
        source: newLead.source
      });
      
      // Refresh leads list
      await fetchLeads();
      
      setShowNewLead(false);
      toast.success("Lead created successfully");
      
      // Reset form
      setNewLead({
        name: '',
        email: '',
        phone: '',
        company: '',
        stage: 'New',
        status: 'Warm',
        source: 'Website'
      });
    } catch (error: any) {
      console.error('Failed to create lead:', error);
      
      // Set the error message to be displayed in the form
      setSubmitError(error.message || 'Failed to create lead. Please try again.');
      
      // Don't close the modal, let the user see the error
      setIsSubmitting(false);
    }
  };

  // Update bulk actions
  const handleBulkDelete = async () => {
    if (!confirm('Are you sure you want to delete the selected leads?')) return

    try {
      await bulkDeleteLeads(selectedLeads)
      await fetchLeads() // Refresh the list
      setSelectedLeads([])
      toast.success("Leads deleted successfully")
    } catch (error) {
      console.error('Failed to delete leads:', error)
      toast.error("Failed to delete leads")
    }
  }

  const handleBulkStageChange = async (newStatus: string) => {
    try {
      await bulkUpdateLeadStatus(selectedLeads, newStatus)
      await fetchLeads() // Refresh the list
      setSelectedLeads([])
      setShowStageChange(false)
      toast.success("Lead stages updated successfully")
    } catch (error) {
      console.error('Failed to update lead stages:', error)
      toast.error("Failed to update lead stages")
    }
  }

  // Update single lead delete
  const handleDelete = (lead: Lead) => {
    setDeleteConfirmation({
      isOpen: true,
      leadId: lead.id,
      leadName: lead.name
    });
  };

  // Add this new function to handle the actual deletion
  const confirmDelete = async () => {
    if (!deleteConfirmation.leadId) return;
    
    try {
      await deleteLead(deleteConfirmation.leadId);
      await fetchLeads();
      
      toast.success("Lead deleted successfully");
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error("Failed to delete lead. Please try again.");
    } finally {
      setDeleteConfirmation({ isOpen: false, leadId: null, leadName: '' });
    }
  };

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

  const handleImport = async () => {
    if (!file || isImporting) return;
    
    setIsImporting(true);
    setShowGeneratingReport(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const dataRows = lines.slice(1)
            .filter(line => line.trim())
            .map(line => line.split(',').map(cell => cell.trim()));

          const leads = dataRows.map(row => {
            const lead: CreateLeadDto = {
              name: '',
              email: '',
              stage: 'New',
              status: 'Warm',
            };

            columnMapping.forEach(mapping => {
              if (mapping.leadField !== 'skip') {
                const index = headers.indexOf(mapping.csvHeader);
                if (index !== -1) {
                  const value = row[index];
                  switch (mapping.leadField) {
                    case 'name':
                    case 'email':
                    case 'phone':
                    case 'company':
                    case 'stage':
                    case 'source':
                      lead[mapping.leadField] = value;
                      break;
                    case 'status':
                      if (['Hot', 'Warm', 'Cold'].includes(value)) {
                        lead.status = value as 'Hot' | 'Warm' | 'Cold';
                      }
                      break;
                  }
                }
              }
            });

            return lead;
          });

          // Send to backend
          const response = await importLeads({ leads });
          
          setImportStats({
            totalRows: leads.length,
            successfulRows: response.successful || 0,
            skippedRows: response.skipped || 0,
            errors: response.errors || [],
            skippedColumns: columnMapping
              .filter(m => m.leadField === 'skip')
              .map(m => m.csvHeader)
          });

          // Refresh leads list
          await fetchLeads();
          
          toast.success(`Successfully imported ${response.successful} leads`);

        } catch (error: any) {
          console.error('Import failed:', error);
          setImportError(error.message || 'Failed to import leads');
          toast.error(error.message || "Failed to import leads");
        }

        setIsImporting(false);
        setShowGeneratingReport(false);
      };

      reader.onerror = () => {
        setImportError('Failed to read the file');
        setIsImporting(false);
        setShowGeneratingReport(false);
      };

      reader.readAsText(file);

    } catch (error: any) {
      console.error('Import failed:', error);
      setImportError(error.message || 'Failed to import leads');
      setIsImporting(false);
      setShowGeneratingReport(false);
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns(current =>
      current.includes(columnId)
        ? current.filter(id => id !== columnId)
        : [...current, columnId]
    )
  }

  const resetImport = () => {
    setFile(null);
    setPreview([]);
    setShowMapping(false);
    setColumnMapping([]);
    setImportError(null);
    setImportStats(null);
  };

  const handleImportClick = () => {
    console.log('handleImportClick');
    fileInputRef.current?.click()
  }

  // Update pagination controls
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2">
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

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

  const handleStageChange = async (leadId: number | undefined, newStage: string) => {
    if (typeof leadId !== 'number') return;
    
    try {
      await updateLeadStage(leadId, newStage);
      
      // Update the lead locally instead of fetching
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, stage: newStage }
          : lead
      ));
      
      setShowStageChange(false);
      setEditingLead(null);
      
      toast.success("Lead stage has been updated successfully");

    } catch (error) {
      console.error('Failed to update lead stage:', error);
      
      toast.error("Failed to update lead stage. Please try again.");
    }
  };

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

  // Add this function to handle bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Add this function to handle individual selection
  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Add this before the return statement
  console.log('Current leads state:', leads);
  console.log('Visible columns:', visibleColumns);

  const [formErrors, setFormErrors] = useState<LeadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateAndSubmit = async () => {
    // Reset errors
    setFormErrors({});
    
    // Validate required fields
    const errors: LeadFormErrors = {};
    
    if (!newLead.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newLead.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (newLead.phone && !/^\+?[\d\s-]{10,}$/.test(newLead.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    // If there are errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Submit the form
    setIsSubmitting(true);
    try {
      await handleAddLead();
      // Success! Modal will be closed by handleAddLead
    } catch (error) {
      console.error('Failed to add lead:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add lead");
      // Error handling is done in handleAddLead
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add export handler
  const handleExport = async (exportAll: boolean = false) => {
    try {
      setIsExporting(true);
      await exportLeads(exportAll ? undefined : selectedLeads);
      
      toast.success("Leads exported successfully");
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : "Failed to export leads");
    } finally {
      setIsExporting(false);
    }
  };

  // Add function to extract variables from template
  const extractVariables = (template: MessageTemplate) => {
    const variableRegex = /{{([^}]+)}}/g
    const variables = new Set<string>()
    
    template.components.forEach(component => {
      if (component.text) {
        let match
        while ((match = variableRegex.exec(component.text)) !== null) {
          variables.add(match[1])
        }
      }
    })
    
    return Array.from(variables)
  }

  // Add function to handle broadcast
  const handleBroadcast = async () => {
    if (!selectedTemplate || selectedLeads.length === 0) return;

    setIsSendingBroadcast(true);
    setBroadcastResponse(null);

    try {
        // Prepare the data to be sent
        const broadcastData = {
            template_id: String(selectedTemplate.id),
            lead_ids: selectedLeads,
            variables: variables,
            variable_column_mapping: variableColumnMapping
        };

        // Log the data being sent
        console.log('Sending broadcast data:', broadcastData);

        // Call your API to send broadcast
        const response = await integrationApi.sendBroadcast(broadcastData);
        
        setBroadcastResponse({
            success: true,
            message: `Successfully initiated broadcast to ${selectedLeads.length} leads`
        });
        
    } catch (error: any) {
        setBroadcastResponse({
            success: false,
            error: error.message || "Failed to send broadcast"
        });
    } finally {
        setIsSendingBroadcast(false);
    }
  };

  // Facebook Lead Retrieval Functions
  const fetchFacebookForms = async () => {
    try {
      const response = await integrationApi.getFacebookLeadForms();
      setFacebookForms(response.forms || []);
      
      // Show debug info if no forms found
      if (response.forms && response.forms.length === 0 && response.debug_info) {
        console.log('Debug info:', response.debug_info);
        toast.error(`${response.message} (Found ${response.debug_info.total_integrations} total integrations, types: ${response.debug_info.integration_types.join(', ')})`);
      }
    } catch (error: any) {
      console.error('Failed to fetch Facebook forms:', error);
      toast.error(error.message || "Failed to fetch Facebook lead forms");
    }
  };

  const handleRetrieveFacebookLeads = async () => {
    if (!selectedForm) {
      toast.error("Please select a lead form");
      return;
    }

    if (!dateFrom || !dateTo) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    const selectedFormData = facebookForms.find(f => f.id === selectedForm);
    if (!selectedFormData) {
      toast.error("Selected form not found");
      return;
    }

    try {
      setIsRetrievingLeads(true);
      setRetrievalResults(null);
      setShowProgress(true);
      setProgress(0);
      setProgressMessage('Connecting to Facebook API...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      const messageInterval = setInterval(() => {
        setProgressMessage(prev => {
          const messages = [
            'Connecting to Facebook API...',
            'Fetching lead data...',
            'Processing lead information...',
            'Validating lead details...',
            'Saving leads to database...',
            'Finalizing sync process...'
          ];
          const currentIndex = Math.floor((progress / 90) * messages.length);
          return messages[Math.min(currentIndex, messages.length - 1)];
        });
      }, 1000);

      const response = await integrationApi.retrieveFacebookLeads({
        form_id: selectedForm,
        integration_id: selectedFormData.integration_id,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      // Clear intervals and set final progress
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setProgress(100);
      setProgressMessage('Sync completed successfully!');

      // Wait a moment to show completion
      setTimeout(() => {
        setRetrievalResults(response.data);
        setShowProgress(false);
        setShowResults(true);
      }, 1000);

      // Refresh leads list
      await fetchLeads();

      toast.success(response.message || "Leads synced successfully");

        } catch (error: any) {
      console.error('Failed to retrieve Facebook leads:', error);
      
      // Handle specific Facebook API errors with proper error styling
      let errorMessage = "Failed to retrieve Facebook leads";
      let showAction = false;
      
      if (error.response?.data?.error_code) {
        const errorCode = error.response.data.error_code;
        
        switch (errorCode) {
          case 'TOKEN_EXPIRED':
            errorMessage = "Your Facebook access token has expired. Please refresh your integration in the Integrations page.";
            showAction = true;
            break;
          case 'INVALID_TOKEN':
            errorMessage = "Your Facebook access token is invalid. Please check your integration settings.";
            showAction = true;
            break;
          case 'RATE_LIMIT':
            errorMessage = "Facebook API rate limit exceeded. Please try again later.";
            break;
          case 'INSUFFICIENT_PERMISSIONS':
            errorMessage = "You don't have permission to access this lead form. Please check your Facebook permissions.";
            showAction = true;
            break;
          default:
            errorMessage = error.response.data.error || errorMessage;
        }
      }
      
      if (showAction) {
        toast.error(errorMessage, {
          action: {
            label: "Go to Integrations",
            onClick: () => window.open('/integrations', '_blank')
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsRetrievingLeads(false);
      setShowProgress(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const openFacebookRetrieval = () => {
    setShowFacebookRetrieval(true);
    setShowResults(false);
    setShowProgress(false);
    setRetrievalResults(null);
    setProgress(0);
    setProgressMessage('');
    fetchFacebookForms();
  };



  // Add useEffect to fetch templates when dialog opens
  useEffect(() => {
    if (showBroadcastDialog) {
      fetchTemplates();
    }
  }, [showBroadcastDialog]);

  // Add function to fetch templates
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await integrationApi.getWhatsAppAccounts();
      if (response.accounts && response.accounts.length > 0) {
        setTemplates(response.accounts[0].templates || []);
      } else {
              toast.error("No WhatsApp account found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Add debug logging for leads state changes
  useEffect(() => {
    console.log('Leads state changed:', leads);
  }, [leads]);

  // Remove duplicate useEffect - using the one above with debouncedSearch

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
            <Button onClick={() => setShowNewLead(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 lg:px-3"
              onClick={() => setShowExportDialog(true)}
            >
              <FileDown className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Export</span>
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 lg:px-3"
              onClick={() => setShowImportDialog(true)}
            >
              <FileDown className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Import</span>
            </Button> */}
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
              <Button 
                variant="outline" 
                onClick={openFacebookRetrieval}
                className="h-8 px-2 lg:px-3"
              >
                <Facebook className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Sync Leads</span>
              </Button>

          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Move the filter section here */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                {isSearching ? (
                  <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 animate-spin" />
                ) : (
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                )}
                <Input
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={cn("pl-8", isSearching && "border-blue-300")}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">

              {/* Status filter */}
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Thermometer className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Temperature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Warm">Warm</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>

              {/* Stage filter */}
              <Select 
                value={filters.stage} 
                onValueChange={(value) => handleFilterChange('stage', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Tag className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {Object.keys(defaultStages).map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add back the source filter */}
              <Select 
                value={filters.source} 
                onValueChange={(value) => handleFilterChange('source', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {Object.keys(sourceConfig).map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range filter */}
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => handleFilterChange('dateRange', range)}
                placeholder="Last Contact Date"
                className="w-[280px]"
              />

              {/* Created At Date Range filter */}
              <DateRangePicker
                value={filters.createdAt}
                onChange={(range) => handleFilterChange('createdAt', range)}
                placeholder="Created Date"
                className="w-[280px]"
              />

              {/* Clear filters button */}
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="h-10"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
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
                          editingLead?.stage === name && "border-blue-500"
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
                      value={editedLead?.stage || ''}
                      onValueChange={(value) => setEditedLead(prev => prev ? { ...prev, stage: value } : null)}
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
                    <Label htmlFor="temperature">Temperature</Label>
                    <Select
                      value={editedLead?.status || ''}
                      onValueChange={(value) => {
                        if (value in temperatureConfig) {
                          setEditedLead(prev => prev ? { ...prev, status: value as 'Hot' | 'Warm' | 'Cold' } : null)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select temperature" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(temperatureConfig) as Array<'Hot' | 'Warm' | 'Cold'>).map((temp) => (
                          <SelectItem key={temp} value={temp}>
                            <div className="flex items-center gap-2">
                              {React.createElement(temperatureConfig[temp].icon, { className: "h-4 w-4" })}
                              <span>{temp}</span>
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
                            <div className="flex items-center gap-2">
                              {React.createElement(sourceConfig[source as keyof typeof sourceConfig].icon, { className: "h-4 w-4" })}
                              <span>{source}</span>
                            </div>
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

            {/* Add New Lead Dialog */}
            <Dialog open={showNewLead} onOpenChange={setShowNewLead}>
              <DialogContent className="max-w-[500px] max-h-[85vh] flex flex-col">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new lead.
                  </DialogDescription>
                </DialogHeader>

                {/* Make the form body scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Show error alert if there's a submit error */}
                  {submitError && <ErrorAlert message={submitError} />}

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={newLead.name}
                        onChange={(e) => {
                          setNewLead(prev => ({ ...prev, name: e.target.value }));
                          // Clear error when user types
                          if (formErrors.name) {
                            setFormErrors(prev => ({ ...prev, name: undefined }));
                          }
                        }}
                        placeholder="John Doe"
                        className={cn(formErrors.name && "border-red-500")}
                      />
                      {formErrors.name && (
                        <p className="text-sm text-red-500">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => {
                          setNewLead(prev => ({ ...prev, email: e.target.value }));
                          if (formErrors.email) {
                            setFormErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="john@example.com"
                        className={cn(formErrors.email && "border-red-500")}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={(e) => {
                          setNewLead(prev => ({ ...prev, phone: e.target.value }));
                          if (formErrors.phone) {
                            setFormErrors(prev => ({ ...prev, phone: undefined }));
                          }
                        }}
                        placeholder="+1234567890"
                        className={cn(formErrors.phone && "border-red-500")}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newLead.company}
                        onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company Name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="stage">Stage</Label>
                      <Select
                        value={newLead.stage}
                        onValueChange={(value) => setNewLead(prev => ({ ...prev, stage: value }))}>
                        <SelectTrigger id="stage">
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
                      <Label htmlFor="temperature">Temperature</Label>
                      <Select
                        value={newLead.status}
                        onValueChange={(value) => setNewLead(prev => ({ ...prev, status: value as 'Hot' | 'Warm' | 'Cold' }))}>
                        <SelectTrigger id="temperature">
                          <SelectValue placeholder="Select temperature" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(temperatureConfig) as Array<'Hot' | 'Warm' | 'Cold'>).map((temp) => (
                            <SelectItem key={temp} value={temp}>
                              <div className="flex items-center gap-2">
                                {React.createElement(temperatureConfig[temp].icon, { className: "h-4 w-4" })}
                                <span>{temp}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="source">Source</Label>
                      <Select
                        value={newLead.source}
                        onValueChange={(value) => setNewLead(prev => ({ ...prev, source: value }))}>
                        <SelectTrigger id="source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(sourceConfig).map((source) => (
                            <SelectItem key={source} value={source}>
                              <div className="flex items-center gap-2">
                                {React.createElement(sourceConfig[source as keyof typeof sourceConfig].icon, { className: "h-4 w-4" })}
                                <span>{source}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowNewLead(false);
                    setFormErrors({});
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={validateAndSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Lead'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add bulk actions above the table when leads are selected */}
            {selectedLeads.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBroadcastDialog(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Handle bulk stage change
                      setShowStageChange(true);
                    }}
                  >
                    Change Stage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            {error ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Leads</h3>
                <p className="text-sm text-red-600 max-w-md mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setError(null);
                    fetchLeads();
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search leads..."
                      className="w-64 bg-gray-50"
                      disabled
                    />
                    <Select disabled>
                      <SelectTrigger className="w-36 bg-gray-50">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>
                <LeadsTableSkeleton columns={columns} visibleColumns={visibleColumns} />
              </div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No leads found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedLeads.length > 0 && selectedLeads.length === leads.length}
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    {columns
                      .filter(column => visibleColumns.includes(column.id))
                      .map(column => (
                        <TableHead key={column.id}>{column.label}</TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={`lead-${lead.id}`}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                        />
                      </TableCell>
                      {columns
                        .filter(column => visibleColumns.includes(column.id))
                        .map(column => (
                          <TableCell key={`${lead.id}-${column.id}`}>
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
                                        onClick={() => handleDelete(lead)}
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
                            ) : column.id === 'stage' ? (
                              <Badge 
                                className={cn(
                                  defaultStages[lead.stage as keyof typeof defaultStages]?.color || 'bg-gray-100 text-gray-800',
                                  'flex items-center gap-1'
                                )}
                              >
                                {React.createElement(defaultStages[lead.stage as keyof typeof defaultStages]?.icon || Tag, { 
                                  className: "h-3 w-3" 
                                })}
                                {lead.stage}
                              </Badge>
                            ) : column.id === 'status' ? (
                              <Badge 
                                className={cn(
                                  temperatureConfig[lead.status as TemperatureType]?.color || 'bg-gray-100 text-gray-800',
                                  'flex items-center gap-1'
                                )}
                              >
                                {React.createElement(temperatureConfig[lead.status as TemperatureType]?.icon || Thermometer, { 
                                  className: "h-3 w-3" 
                                })}
                                {lead.status}
                              </Badge>
                            ) : column.id === 'source' ? (
                              <Badge 
                                className={cn(
                                  sourceConfig[lead.source as keyof typeof sourceConfig]?.color || 'bg-gray-100 text-gray-800',
                                  'flex items-center gap-1'
                                )}
                              >
                                {React.createElement(sourceConfig[lead.source as keyof typeof sourceConfig]?.icon || Globe, { 
                                  className: "h-3 w-3" 
                                })}
                                {lead.source}
                              </Badge>
                            ) : column.id === 'lastContact' ? (
                              <div className="flex items-center gap-2">
                                {column.icon && React.createElement(column.icon, { 
                                  className: "h-4 w-4 text-gray-500" 
                                })}
                                <span>{format(new Date(lead.last_contact), "MMM dd, yyyy")}</span>
                              </div>
                            ) : column.id === 'created_at' ? (
                              <div className="flex items-center gap-2">
                                {column.icon && React.createElement(column.icon, { 
                                  className: "h-4 w-4 text-gray-500" 
                                })}
                                {/* <span>{format(new Date(lead.created_at), "MMM dd, yyyy")}</span> */}
                                <span>{format(new Date(lead.created_at), "MMM dd, yyyy 'at' hh:mm a")}</span>
                              </div>
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
            )}
            {totalItems > 0 && <PaginationControls />}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(isOpen) => 
          setDeleteConfirmation(prev => ({ ...prev, isOpen }))
        }
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirmation.leadName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation({ 
                isOpen: false, 
                leadId: null, 
                leadName: '' 
              })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Export Leads</DialogTitle>
            <DialogDescription>
              Choose how you want to export your leads.
            </DialogDescription>
            {selectedLeads.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                You have {selectedLeads.length} leads selected.
              </div>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => handleExport(true)}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export All Leads
                </>
              )}
            </Button>
            {selectedLeads.length > 0 && (
              <Button
                onClick={() => handleExport(false)}
                disabled={isExporting}
                variant="outline"
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Selected ({selectedLeads.length})
                  </>
                )}
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
        <DialogContent className="max-w-[900px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Send Broadcast Message</DialogTitle>
            <DialogDescription>
              Select a template and customize variables to send to {selectedLeads.length} leads.
            </DialogDescription>
          </DialogHeader>
          
          {/* Add ScrollArea for the content */}
          <ScrollArea className="flex-1 h-[calc(85vh-180px)]">
            <div className="flex gap-6 p-4">
              {/* Left side - Template selection and variables */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Select Template</Label>
                  {isLoadingTemplates ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No templates available
                    </div>
                  ) : (
                    <Select
                      value={selectedTemplate?.id.toString()}
                      onValueChange={(value) => {
                        const template = templates.find(t => t.id.toString() === value);
                        setSelectedTemplate(template || null);
                        setVariables({});
                        setVariableColumnMapping({});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem 
                            key={template.id} 
                            value={template.id?.toString() || 'default'}
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {template.status}
                              </Badge>
                              <span>{template.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedTemplate && (
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-3">Template Variables</h4>
                      {extractVariables(selectedTemplate).map(variable => (
                        <div key={variable} className="space-y-2 mb-4">
                          <Label>{variable}</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter value"
                              value={variables[variable] || ''}
                              onChange={(e) => setVariables(prev => ({
                                ...prev,
                                [variable]: e.target.value
                              }))}
                              className="flex-1"
                            />
                            <Select
                              value={variableColumnMapping[variable] || '_manual'}
                              onValueChange={(value) => {
                                setVariableColumnMapping(prev => ({
                                  ...prev,
                                  [variable]: value === '_manual' ? '' : value
                                }))
                                // Clear manual input if column is selected
                                if (value !== '_manual') {
                                  setVariables(prev => ({
                                    ...prev,
                                    [variable]: ''
                                  }))
                                }
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Use column value" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_manual">Manual Input</SelectItem>
                                {columns
                                  .filter(col => col.id !== 'actions')
                                  .map(col => (
                                    <SelectItem key={col.id} value={col.id}>
                                      {col.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Template preview */}
              <div className="w-[350px] border-l pl-6">
                <h4 className="font-medium mb-3">Preview</h4>
                {selectedTemplate ? (
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    {selectedTemplate.components.map((component, idx) => {
                      if (component.type === 'HEADER') {
                        return (
                          <div key={idx} className="space-y-2">
                            {component.format === 'TEXT' && (
                              <p className="font-semibold">
                                {component.text?.replace(/{{([^}]+)}}/g, (_, variable) => 
                                  variables[variable] || `{{${variable}}}`
                                )}
                              </p>
                            )}
                            {component.format === 'IMAGE' && (
                              <div className="bg-background rounded-lg p-3">
                                <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center">
                                  {component.example?.header_handle?.[0] ? (
                                    <img 
                                      src={component.example.header_handle[0]} 
                                      alt="Header" 
                                      className="max-h-full rounded-md object-contain"
                                    />
                                  ) : (
                                    <p className="text-sm text-muted-foreground">Image Header</p>
                                  )}
                                </div>
                              </div>
                            )}
                            {component.format === 'VIDEO' && (
                              <div className="bg-background rounded-lg p-3">
                                <div className="aspect-video bg-muted-foreground/10 rounded-md flex items-center justify-center">
                                  {component.example?.header_handle?.[0] ? (
                                    <video 
                                      src={component.example.header_handle[0]} 
                                      controls 
                                      className="max-h-full rounded-md"
                                    />
                                  ) : (
                                    <p className="text-sm text-muted-foreground">Video Header</p>
                                  )}
                                </div>
                              </div>
                            )}
                            {component.format === 'DOCUMENT' && (
                              <div className="bg-background rounded-lg p-3">
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
                        );
                      }

                      if (component.type === 'BODY') {
                        return (
                          <div key={idx} className="text-sm whitespace-pre-line">
                            {component.text?.replace(/{{([^}]+)}}/g, (_, variable) => 
                              variables[variable] || `{{${variable}}}`
                            )}
                          </div>
                        );
                      }

                      if (component.type === 'FOOTER') {
                        return (
                          <div key={idx} className="text-xs text-muted-foreground">
                            {component.text?.replace(/{{([^}]+)}}/g, (_, variable) => 
                              variables[variable] || `{{${variable}}}`
                            )}
                          </div>
                        );
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
                        );
                      }

                      return null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Select a template to see preview
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="border-t p-4 mt-4">
            {broadcastResponse && (
              <div className={cn(
                "mb-4 p-4 rounded-lg w-full",
                broadcastResponse.success 
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              )}>
                <div className="flex items-center gap-2">
                  {broadcastResponse.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <p className="text-sm">
                    {broadcastResponse.message || broadcastResponse.error}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBroadcastDialog(false);
                  setBroadcastResponse(null);
                }}
              >
                Close
              </Button>
              <Button 
                onClick={handleBroadcast}
                disabled={!selectedTemplate || selectedLeads.length === 0 || isSendingBroadcast}
              >
                {isSendingBroadcast ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  `Send to ${selectedLeads.length} Leads`
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Facebook Lead Retrieval Dialog */}
      <Dialog open={showFacebookRetrieval} onOpenChange={setShowFacebookRetrieval}>
        <DialogContent className="max-w-2xl max-h-[90vh] my-4 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-500" />
              Sync Leads
            </DialogTitle>
            <DialogDescription>
              Select a lead form and sync leads that may have been missed by webhooks
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {!showResults && !showProgress ? (
              // Form View
              <div className="space-y-6">
              {/* Form Selection */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="form-select">Select Lead Form</Label>
                  <Select value={selectedForm} onValueChange={setSelectedForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Facebook lead form">
                        {selectedForm && facebookForms.find(f => f.id === selectedForm)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {facebookForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          <div className="flex flex-col">
                            <span 
                              className={`font-medium truncate ${form.status === 'ERROR' ? 'text-red-600' : ''}`}
                              title={form.name}
                            >
                              {form.name.length > 40 ? form.name.substring(0, 40) + '...' : form.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {form.id} • Status: {form.status}
                              {form.source === 'configured' && (
                                <span className="text-green-600 block">✓ Configured Integration</span>
                              )}
                              {form.error && (
                                <span className="text-red-500 block">Error: {form.error}</span>
                              )}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedForm && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Integration ID: {facebookForms.find(f => f.id === selectedForm)?.integration_id}</span>
                    </div>
                  )}
                </div>

                {/* Date Range Selection */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date-range">Date Range <span className="text-red-500">*</span></Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Select a date range to sync leads that were not captured via webhooks. 
                      Facebook retains lead data for up to 90 days.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date-from">From Date <span className="text-red-500">*</span></Label>
                        <Input
                          id="date-from"
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="date-to">To Date <span className="text-red-500">*</span></Label>
                        <Input
                          id="date-to"
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          min={dateFrom}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : showProgress ? (
            // Progress View
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-6">
                  <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Syncing Facebook Leads</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {progressMessage}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    progress >= 10 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {progress >= 10 ? '✓' : '1'}
                  </div>
                  <span className={`text-sm ${progress >= 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    Connect to Facebook API
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    progress >= 30 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {progress >= 30 ? '✓' : '2'}
                  </div>
                  <span className={`text-sm ${progress >= 30 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    Fetch lead data
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    progress >= 60 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {progress >= 60 ? '✓' : '3'}
                  </div>
                  <span className={`text-sm ${progress >= 60 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    Process and validate leads
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    progress >= 90 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {progress >= 90 ? '✓' : '4'}
                  </div>
                  <span className={`text-sm ${progress >= 90 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    Save to database
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    progress >= 100 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {progress >= 100 ? '✓' : '5'}
                  </div>
                  <span className={`text-sm ${progress >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    Complete sync
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Results View
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sync Completed Successfully!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Your Facebook leads have been synced and added to your leads list.
                </p>
              </div>

              {/* Results Summary */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-card">
                <h4 className="font-semibold mb-4 text-center">Sync Results</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{retrievalResults?.total_processed}</div>
                    <div className="text-gray-600 dark:text-gray-400">Total Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{retrievalResults?.new_leads}</div>
                    <div className="text-gray-600 dark:text-gray-400">New Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{retrievalResults?.existing_leads}</div>
                    <div className="text-gray-600 dark:text-gray-400">Existing Leads</div>
                  </div>
                </div>
                
                {retrievalResults?.processed_leads && retrievalResults.processed_leads.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-medium mb-3 text-center">Processed Leads</h5>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {retrievalResults.processed_leads.map((lead, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                          <span className="font-medium">{lead.name}</span>
                          <Badge variant={lead.status === 'created' ? 'default' : 'secondary'}>
                            {lead.status === 'created' ? 'New' : 'Existing'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                             </div>
             </div>
           )}
          </div>

          <DialogFooter className="flex-shrink-0">
            {!showResults && !showProgress ? (
              // Form View Footer
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowFacebookRetrieval(false);
                    setRetrievalResults(null);
                    setShowResults(false);
                    setShowProgress(false);
                    setSelectedForm('');
                    setDateFrom(new Date().toISOString().split('T')[0]);
                    setDateTo(new Date().toISOString().split('T')[0]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRetrieveFacebookLeads}
                  disabled={!selectedForm || !dateFrom || !dateTo || isRetrievingLeads}
                >
                  {isRetrievingLeads ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Leads'
                  )}
                </Button>
              </div>
            ) : showProgress ? (
              // Progress View Footer - No buttons during progress
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  disabled
                >
                  Please wait...
                </Button>
              </div>
            ) : (
              // Results View Footer
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResults(false);
                    setRetrievalResults(null);
                    setShowProgress(false);
                  }}
                >
                  Back to Form
                </Button>
                <Button 
                  onClick={() => {
                    setShowFacebookRetrieval(false);
                    setRetrievalResults(null);
                    setShowResults(false);
                    setShowProgress(false);
                    setSelectedForm('');
                    setDateFrom(new Date().toISOString().split('T')[0]);
                    setDateTo(new Date().toISOString().split('T')[0]);
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

