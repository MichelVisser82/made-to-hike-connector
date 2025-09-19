import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
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
          <CardTitle>🏔️ Welcome to MadeToHike</CardTitle>
          <CardDescription>
            Choose how you'd like to get started with your hiking adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={() => {
                window.location.href = '/auth?mode=signin';
                onClose();
              }}
              className="w-full"
            >
              Sign In to Your Account
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = '/auth?mode=signup';
                onClose();
              }}
              className="w-full"
            >
              Create New Account
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue as guest
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full"
          >
            Browse Tours as Guest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}