import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { type User } from '../../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if signing in with existing admin account
    if (isLogin && email === 'admin@madetohike.com') {
      const adminUser: User = {
        id: 'admin',
        email: 'admin@madetohike.com',
        name: 'Admin User',
        role: 'admin',
        verified: true,
        verification_status: 'approved'
      };
      onLogin(adminUser);
      return;
    }

    // Check if signing in with existing guide accounts
    if (isLogin) {
      const savedUsers = localStorage.getItem('madetohike-users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const existingUser = users.find((u: User) => u.email === email);
        if (existingUser) {
          onLogin(existingUser);
          return;
        }
      }
    }
    
    // Create new user (registration)
    const mockUser: User = {
      id: 'user-' + Date.now(),
      email,
      name: isLogin ? 'John Hiker' : name,
      role: 'hiker',
      verified: true,
      verification_status: 'approved'
    };
    
    onLogin(mockUser);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-muted rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
          <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to your MadeToHike account' 
              : 'Join MadeToHike to book your adventure'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Demo Accounts */}
          {isLogin && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setEmail('admin@madetohike.com');
                    setPassword('admin');
                  }}
                  className="block w-full text-left hover:bg-muted p-1 rounded"
                >
                  <strong>Admin:</strong> admin@madetohike.com
                </button>
                <button
                  onClick={() => {
                    setEmail('marco@alpineguides.com');
                    setPassword('guide');
                  }}
                  className="block w-full text-left hover:bg-muted p-1 rounded"
                >
                  <strong>Guide:</strong> marco@alpineguides.com
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}