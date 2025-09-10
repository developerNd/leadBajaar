"use client"

import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationBell } from "@/components/notification-bell"

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard'
    case '/leads':
      return 'Leads Management'
    case '/live-chat':
      return 'Live Chat'
    case '/chatbot':
      return 'Chatbot'
    case '/imports':
      return 'Import Contacts'
    case '/analytics':
      return 'Analytics'
    case '/settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}

export function Header() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

