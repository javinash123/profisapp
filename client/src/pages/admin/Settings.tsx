import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Save, Cloud, Database, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function SystemSettings() {
  return (
    <div className="min-h-screen bg-[#0A0F1A] text-foreground font-sans">
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#0D1321]">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
                <img src="/logo.jpeg" alt="Logo" className="h-20 w-auto rounded-md" />
                <h1 className="text-xl font-bold text-white">System Settings</h1>
            </div>
          </div>
          <Button className="bg-[#4EB3B5] text-[#0D1321] font-bold">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>

        <div className="p-6 max-w-4xl mx-auto space-y-6">
            
            {/* General Config */}
            <Card className="bg-[#111823] border-[#202A3A]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <CardTitle className="text-white">General Configuration</CardTitle>
                    </div>
                    <CardDescription>Global defaults for the PegPro application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Default Unit System</Label>
                            <Select defaultValue="lb">
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111823] border-[#202A3A] text-white">
                                    <SelectItem value="lb">Imperial (LB/OZ)</SelectItem>
                                    <SelectItem value="kg">Metric (KG/G)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Max Net Limit</Label>
                            <Input type="number" defaultValue={6} className="bg-black/20 border-white/10 text-white" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-base text-white">Field Mode Default</Label>
                            <p className="text-sm text-muted-foreground">Force high-contrast mode for all new users initially</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Weather API */}
            <Card className="bg-[#111823] border-[#202A3A]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-primary" />
                        <CardTitle className="text-white">Weather Integration</CardTitle>
                    </div>
                    <CardDescription>Configure OpenWeather or Tomorrow.io API connection.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>API Provider</Label>
                        <Select defaultValue="openweather">
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111823] border-[#202A3A] text-white">
                                <SelectItem value="openweather">OpenWeatherMap</SelectItem>
                                <SelectItem value="tomorrow">Tomorrow.io</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex gap-2">
                            <Input type="password" value="************************" className="bg-black/20 border-white/10 text-white font-mono" readOnly />
                            <Button variant="secondary">Test</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-[#111823] border-[#202A3A]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-red-400" />
                        <CardTitle className="text-white">Admin Security</CardTitle>
                    </div>
                    <CardDescription>Manage access controls and backups.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Admin Session Timeout (Minutes)</Label>
                        <Input type="number" defaultValue={60} className="bg-black/20 border-white/10 text-white" />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            <Database className="mr-2 h-4 w-4" /> Backup Database
                        </Button>
                        <Button variant="destructive" className="bg-red-900/50 hover:bg-red-900 border border-red-900 text-red-100">
                            Clear All Cache
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
