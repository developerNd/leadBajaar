"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare,
  Settings, 
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Link as LinkIcon,
  MessagesSquare
} from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Live Chat', href: '/live-chat', icon: MessagesSquare },
  { name: 'Chatbot', href: '/chatbot', icon: MessageSquare },
  { name: 'Meetings', href: '/meetings', icon: Calendar },
  { name: 'Integrations', href: '/integrations', icon: LinkIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div className={cn(
      "relative border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-20 hidden lg:flex h-8 w-8 rounded-full border shadow-md z-50"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex h-full max-h-screen flex-col">
        <div className={cn(
          "flex h-14 items-center border-b px-4 transition-all duration-300",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <Link 
            className="flex items-center gap-2 font-semibold" 
            href={{ pathname: "/" } as const}
          >
            <span className={cn(
              "text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent",
              collapsed && "hidden"
            )}>
              LeadBajar
            </span>
            {collapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LB
              </span>
            )}
          </Link>
        </div>
        <SidebarContent collapsed={collapsed} />
        <div className="mt-auto border-t p-4">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()

  return (
    <ScrollArea className="flex-1 py-2">
      <nav className="grid gap-1 px-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className={cn(
              "w-full justify-start",
              pathname === item.href 
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-100 dark:hover:bg-blue-900/75" 
                : "hover:bg-gray-200/80 dark:hover:bg-gray-800/50",
              collapsed && "justify-center px-0"
            )}
          >
            <Link href={{ pathname: item.href } as const}>
              <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          </Button>
        ))}
      </nav>
    </ScrollArea>
  )
}

