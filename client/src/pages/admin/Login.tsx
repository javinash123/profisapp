import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMatchStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { loginAdmin } = useMatchStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock login delay
    setTimeout(() => {
      if (email === 'admin@pegpro.com' && password === 'admin') {
        loginAdmin();
        setLocation('/admin');
      } else {
        setError('Invalid credentials. Try admin@pegpro.com / admin');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0D1321] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
            <img src="/logo.jpeg" alt="PegPro Logo" className="h-48 w-auto rounded-xl mb-6" />
            <h1 className="text-3xl font-bold text-white tracking-tight">PegPro Admin</h1>
            <p className="text-muted-foreground">Sign in to manage the platform</p>
        </div>

        <Card className="p-8 bg-[#111823] border-[#202A3A]">
            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                <div className="space-y-2">
                    <Label className="text-white">Email Address</Label>
                    <div className="relative">
                        <Input 
                            type="email" 
                            placeholder="admin@pegpro.com" 
                            className="bg-black/20 border-white/10 text-white pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="absolute left-3 top-2.5 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-white">Password</Label>
                    <div className="relative">
                        <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="bg-black/20 border-white/10 text-white pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                         <div className="absolute left-3 top-2.5 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-bold bg-[#4EB3B5] hover:bg-[#3d9193] text-[#0D1321]"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing In..." : "Sign In"}
                </Button>
            </form>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
            <p>Protected System • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
