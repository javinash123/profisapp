import React from 'react';
import { useMatchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Users, Settings, Database, Activity, LayoutDashboard, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAdminLoggedIn, logoutAdmin } = useMatchStore();

  if (!isAdminLoggedIn) {
      setLocation('/admin/login');
      return null;
  }

  const handleLogout = () => {
      logoutAdmin();
      setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-foreground font-sans flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#0D1321]">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
                <img src="/logo.jpeg" alt="Logo" className="h-20 w-auto rounded-md" />
                <h1 className="text-xl font-bold text-primary">PEGPRO ADMIN</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground font-mono">v1.0.0</div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:bg-red-950/30 hover:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
          </div>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
          {/* Quick Stats */}
          <Card className="p-6 bg-[#111823] border-[#202A3A] col-span-full md:col-span-2 lg:col-span-3">
             <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">System Status</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Active Matches</div>
                    <div className="text-2xl font-bold text-primary">12</div>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Weather API</div>
                    <div className="text-2xl font-bold text-emerald-500">Online</div>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Database Sync</div>
                    <div className="text-2xl font-bold text-blue-400">Ok</div>
                </div>
                <div className="bg-black/20 p-4 rounded-lg">
                    <div className="text-xs text-muted-foreground">Version</div>
                    <div className="text-2xl font-bold text-white">1.0.0</div>
                </div>
             </div>
          </Card>

          {/* Menu Items */}
          <Link href="/admin/matches">
            <Card className="p-6 bg-[#111823] border-[#202A3A] hover:border-primary/50 transition-colors cursor-pointer group h-full">
                <LayoutDashboard className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">Match Management</h3>
                <p className="text-sm text-muted-foreground">Monitor live matches, export data, and manage archives.</p>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="p-6 bg-[#111823] border-[#202A3A] hover:border-primary/50 transition-colors cursor-pointer group h-full">
                <Users className="h-8 w-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage user accounts, permissions, and club details.</p>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="p-6 bg-[#111823] border-[#202A3A] hover:border-primary/50 transition-colors cursor-pointer group h-full">
                <Settings className="h-8 w-8 text-muted-foreground mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">System Settings</h3>
                <p className="text-sm text-muted-foreground">Configure global defaults, units, and API keys.</p>
            </Card>
          </Link>
        </div>
    </div>
  );
}
