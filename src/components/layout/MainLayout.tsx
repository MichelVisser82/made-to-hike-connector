import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube,
  Twitter,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Newsletter subscription",
      description: "Thank you for subscribing to our newsletter!",
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 text-primary">
                <Mountain className="h-8 w-8" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">MadeToHike</div>
                <div className="text-xs text-muted-foreground">Guided Adventures</div>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/guide/signup')}>
                Become a Guide
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mountain className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-lg font-semibold">MadeToHike</div>
                  <div className="text-xs text-muted-foreground">Guided Adventures</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Europe's premier marketplace for certified mountain guides and authentic hiking experiences.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Based in European Alps</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>hello@madetohike.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('/')}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    Find Tours
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    About MadeToHike
                  </button>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">
                Get hiking tips and exclusive offers.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="text-sm"
                  required
                />
                <Button type="submit" size="sm" className="w-full">
                  Subscribe
                </Button>
              </form>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Follow Us</p>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                    <Facebook className="h-4 w-4 text-primary" />
                  </button>
                  <button className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                    <Instagram className="h-4 w-4 text-primary" />
                  </button>
                  <button className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                    <Youtube className="h-4 w-4 text-primary" />
                  </button>
                  <button className="w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                    <Twitter className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} MadeToHike. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
