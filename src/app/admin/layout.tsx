'use client';

/**
 * Admin Layout
 * 
 * Layout for admin dashboard with sidebar navigation.
 * Protected route - only accessible by admin users.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Flame,
  Flag,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@ember/ui-components';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Admin navigation items
const navItems = [
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Feature Flags',
    href: '/admin/feature-flags',
    icon: Flag,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user has admin role
        // For now, check against a list of admin emails or a user_roles table
        const adminEmails = [
          'admin@88away.com',
          'reese@88away.com',
          // Add more admin emails as needed
        ];

        const isUserAdmin = adminEmails.includes(user.email || '');
        
        if (!isUserAdmin) {
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-rose-500" />
          <p className="text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/admin/analytics" className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-rose-500" />
            {sidebarOpen && (
              <span className="font-bold">Admin Dashboard</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform',
                !sidebarOpen && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Back to App */}
        <div className="border-t p-4">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground',
              !sidebarOpen && 'justify-center'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            {sidebarOpen && <span>Back to App</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        {/* Top Bar - Mobile */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Admin Dashboard</span>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
