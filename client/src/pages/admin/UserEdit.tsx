import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useRoute, useLocation } from 'wouter';
import { ArrowLeft, Save, User, Mail, Shield, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function UserEdit() {
  const [, params] = useRoute("/admin/users/:id");
  const [, setLocation] = useLocation();
  const userId = params?.id;
  const isNew = userId === 'new';

  // Mock data fetching would happen here
  const userData = isNew ? {
    name: '',
    email: '',
    role: 'Member',
    status: 'Active',
    joined: new Date().toISOString().split('T')[0]
  } : {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Member',
    status: 'Active',
    joined: '2024-01-15'
  };

  const handleSave = () => {
    // Save logic here
    setLocation('/admin/users');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-foreground font-sans">
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#0D1321]">
          <div className="flex items-center gap-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">
                    {isNew ? 'Create New User' : `Edit User: ${userData.name}`}
                </h1>
            </div>
          </div>
          <Button className="bg-[#4EB3B5] text-[#0D1321] font-bold" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save User
          </Button>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
            <Card className="bg-[#111823] border-[#202A3A]">
                <CardHeader>
                    <CardTitle className="text-white">User Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-white">Full Name</Label>
                            <div className="relative">
                                <Input defaultValue={userData.name} className="bg-black/20 border-white/10 text-white pl-10" />
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Email Address</Label>
                            <div className="relative">
                                <Input defaultValue={userData.email} className="bg-black/20 border-white/10 text-white pl-10" />
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-white">Role</Label>
                            <Select defaultValue={userData.role}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111823] border-[#202A3A] text-white">
                                    <SelectItem value="Member">Member</SelectItem>
                                    <SelectItem value="Admin">Administrator</SelectItem>
                                    <SelectItem value="Moderator">Moderator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white">Account Status</Label>
                            <Select defaultValue={userData.status}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111823] border-[#202A3A] text-white">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!isNew && (
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-900/30 rounded-lg">
                                <div>
                                    <h3 className="text-red-400 font-bold mb-1">Danger Zone</h3>
                                    <p className="text-xs text-red-300/70">Permanently delete this user and all associated data.</p>
                                </div>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
