import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Clock, Download, Share2, Calendar, MapPin, User, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MatchDetail() {
  const [, params] = useRoute("/admin/matches/:id");
  const matchId = params?.id || "M-1023";

  // Mock data - in real app would fetch by ID
  const matchData = {
    id: matchId,
    title: 'Sunday Open',
    peg: '12',
    user: 'John Doe',
    status: 'Live',
    startTime: '10:00 AM',
    duration: '5 Hours',
    totalWeight: 45.5,
    nets: [
      { id: 1, weight: 15.2, capacity: 50, status: 'normal' },
      { id: 2, weight: 12.8, capacity: 50, status: 'normal' },
      { id: 3, weight: 17.5, capacity: 50, status: 'normal' },
    ],
    timeline: [
      { time: '10:00 AM', event: 'Match Started' },
      { time: '10:15 AM', event: 'Net 1 +2lb' },
      { time: '10:45 AM', event: 'Net 3 +5lb (Carp)' },
      { time: '11:20 AM', event: 'Net 2 +3.5lb' },
    ]
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-foreground font-sans">
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#0D1321]">
          <div className="flex items-center gap-4">
            <Link href="/admin/matches">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">Match Details: {matchData.title}</h1>
                <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/10">
                    {matchData.status}
                </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Share2 className="mr-2 h-4 w-4" /> Share Report
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111823] border-[#202A3A] p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total Weight</div>
                        <div className="text-2xl font-bold text-primary font-mono">{matchData.totalWeight} lb</div>
                    </Card>
                    <Card className="bg-[#111823] border-[#202A3A] p-4">
                        <div className="text-sm text-muted-foreground mb-1">Peg Number</div>
                        <div className="text-2xl font-bold text-white font-mono">#{matchData.peg}</div>
                    </Card>
                    <Card className="bg-[#111823] border-[#202A3A] p-4">
                        <div className="text-sm text-muted-foreground mb-1">Nets Used</div>
                        <div className="text-2xl font-bold text-white font-mono">{matchData.nets.length}</div>
                    </Card>
                    <Card className="bg-[#111823] border-[#202A3A] p-4">
                        <div className="text-sm text-muted-foreground mb-1">Avg per Net</div>
                        <div className="text-2xl font-bold text-white font-mono">
                            {(matchData.totalWeight / matchData.nets.length).toFixed(1)} lb
                        </div>
                    </Card>
                </div>

                <Card className="bg-[#111823] border-[#202A3A]">
                    <CardHeader>
                        <CardTitle className="text-white">Net Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {matchData.nets.map((net) => (
                                <div key={net.id} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-medium">Net {net.id}</span>
                                        <span className="text-muted-foreground">{net.weight} / {net.capacity} lb</span>
                                    </div>
                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary" 
                                            style={{ width: `${(net.weight / net.capacity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111823] border-[#202A3A]">
                    <CardHeader>
                        <CardTitle className="text-white">Event Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {matchData.timeline.map((event, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="min-w-[80px] text-sm text-muted-foreground font-mono pt-0.5">
                                        {event.time}
                                    </div>
                                    <div className="flex flex-col border-l border-white/10 pl-4 pb-4 last:pb-0 relative">
                                        <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary/50" />
                                        <span className="text-white">{event.event}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card className="bg-[#111823] border-[#202A3A]">
                    <CardHeader>
                        <CardTitle className="text-white">Match Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-white">{matchData.user}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-white">Today, 2024</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-white">Started: {matchData.startTime}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-white">Peg {matchData.peg}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111823] border-[#202A3A]">
                    <CardHeader>
                        <CardTitle className="text-white">Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-emerald-500 font-bold text-sm">Capacity OK</span>
                            </div>
                            <p className="text-xs text-muted-foreground">All nets are operating within safe limits.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
