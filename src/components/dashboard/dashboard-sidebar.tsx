'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Radio,
  Settings,
  BarChart3,
  Wallet,
  Shield,
  Bell,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trading', href: '/trading', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Signals', href: '/signals', icon: Radio, badge: 'Live' },
  { name: 'Strategies', href: '/strategies', icon: BarChart3 },
  { name: 'Positions', href: '/positions', icon: Wallet },
  { name: 'Risk Management', href: '/risk', icon: Shield },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function DashboardSidebar({ isCollapsed = false, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`hidden md:flex h-screen ${isCollapsed ? 'md:w-16' : 'md:w-64'} md:flex-col transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col flex-grow pt-5 bg-gray-900 overflow-y-auto">
        {/* Logo and Toggle */}
        <div className="flex items-center flex-shrink-0 px-4 justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                Fresh Mint
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium bg-emerald-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            {!isCollapsed ? (
              <>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      Trading Bot
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      Live Trading
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Link
                    href="/documentation"
                    className="flex items-center px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Documentation
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center px-2 py-1 text-sm text-gray-400 hover:text-white transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/documentation"
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  title="Documentation"
                >
                  <BookOpen className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors w-full"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
