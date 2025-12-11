import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Search, Filter, MoreHorizontal, Eye, Trash2, StopCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

export default function MatchesManagement() {
  const matches = [
    { id: 'M-1023', title: 'Sunday Open', peg: '12', user: 'John Doe', status: 'Live', weight: 45.5, started: '10:00 AM' },
    { id: 'M-1022', title: 'Club Championship', peg: '05', user: 'Mike Smith', status: 'Finished', weight: 120.2, started: 'Yesterday' },
    { id: 'M-1021', title: 'Evening Practice', peg: '08', user: 'Sarah Jones', status: 'Finished', weight: 15.0, started: 'Yesterday' },
    { id: 'M-1020', title: 'Winter League #4', peg: '22', user: 'David Brown', status: 'Finished', weight: 89.4, started: '2 days ago' },
    { id: 'M-1019', title: 'Casual Session', peg: '01', user: 'Guest User', status: 'Finished', weight: 0.0, started: '3 days ago' },
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
                <h1 className="text-xl font-bold text-white">Matches Management</h1>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
            {/* Filters */}
            <div className="flex gap-4 items-center bg-[#111823] p-4 rounded-lg border border-[#202A3A]">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search matches..." className="pl-9 bg-black/20 border-white/10" />
                </div>
                <Button variant="outline" className="border-white/10 bg-white/5">
                    <Filter className="mr-2 h-4 w-4" /> Filter Status
                </Button>
                <div className="ml-auto">
                    <Button className="bg-[#4EB3B5] text-[#0D1321] font-bold">Export All</Button>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-[#111823] border-[#202A3A] overflow-hidden">
                <Table>
                    <TableHeader className="bg-[#0D1321]">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-white">Match ID</TableHead>
                            <TableHead className="text-white">Title</TableHead>
                            <TableHead className="text-white">User</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white text-right">Total Weight</TableHead>
                            <TableHead className="text-white text-right">Started</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((match) => (
                            <TableRow key={match.id} className="border-white/5 hover:bg-white/5">
                                <TableCell className="font-mono text-muted-foreground">{match.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{match.title}</span>
                                        <span className="text-xs text-muted-foreground">Peg {match.peg}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{match.user}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="outline" 
                                        className={
                                            match.status === 'Live' 
                                            ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" 
                                            : "border-white/20 text-muted-foreground"
                                        }
                                    >
                                        {match.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-white">
                                    {match.weight.toFixed(2)} lb
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{match.started}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#111823] border-[#202A3A] text-white">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <Link href={`/admin/matches/${match.id}`}>
                                                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                            </Link>
                                            {match.status === 'Live' && (
                                                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer text-orange-400">
                                                    <StopCircle className="mr-2 h-4 w-4" /> Force End
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer text-red-400">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Record
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
