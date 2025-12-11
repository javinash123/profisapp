import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Search, UserPlus, MoreHorizontal, Mail, Shield, UserX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserManagement() {
  const users = [
    { id: 'U-001', name: 'John Doe', email: 'john@example.com', role: 'Member', status: 'Active', joined: 'Jan 2024' },
    { id: 'U-002', name: 'Mike Smith', email: 'mike@example.com', role: 'Admin', status: 'Active', joined: 'Dec 2023' },
    { id: 'U-003', name: 'Sarah Jones', email: 'sarah@example.com', role: 'Member', status: 'Inactive', joined: 'Feb 2024' },
    { id: 'U-004', name: 'David Brown', email: 'david@example.com', role: 'Member', status: 'Active', joined: 'Mar 2024' },
  ];

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
                <h1 className="text-xl font-bold text-white">User Management</h1>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex gap-4 items-center bg-[#111823] p-4 rounded-lg border border-[#202A3A]">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-9 bg-black/20 border-white/10" />
                </div>
                <div className="ml-auto">
                    <Link href="/admin/users/new">
                        <Button className="bg-[#4EB3B5] text-[#0D1321] font-bold">
                            <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-[#111823] border-[#202A3A] overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#0D1321]">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white">User</TableHead>
                            <TableHead className="text-white">Role</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white text-right">Joined</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarFallback className="bg-secondary text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {user.role === 'Admin' && <Shield className="h-3 w-3 text-primary" />}
                                        <span>{user.role}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="outline" 
                                        className={
                                            user.status === 'Active' 
                                            ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" 
                                            : "border-red-500 text-red-500 bg-red-500/10"
                                        }
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{user.joined}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#111823] border-[#202A3A] text-white">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <Link href={`/admin/users/${user.id}`}>
                                                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                                                    <Shield className="mr-2 h-4 w-4" /> Edit Profile
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer text-red-400">
                                                <UserX className="mr-2 h-4 w-4" /> Suspend
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    </div>
  );
}
