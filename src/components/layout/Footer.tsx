import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  Mountain, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onNavigateToSearch: (filters?: any) => void;
}

export function Footer({ onNavigate, onNavigateToSearch }: FooterProps) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup');
  };

  return (
    <footer className="bg-muted/30 border-t">
      {/* Main Footer Content */}
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
              Connecting adventurers with expert guides across the Dolomites, Pyrenees, and Scottish Highlands.
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
                  onClick={() => onNavigateToSearch({ region: 'dolomites' })}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  Dolomites Tours
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateToSearch({ region: 'pyrenees' })}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  Pyrenees Adventures
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateToSearch({ region: 'scottish-highlands' })}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  Scottish Highlands
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateToSearch({ difficulty: 'easy' })}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  Beginner Hikes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateToSearch({ difficulty: 'expert' })}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  Expert Expeditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('certifications')}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  Certifications Reference Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('about')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About MadeToHike
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/guides')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Guides
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('safety')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Safety Standards
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('careers')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('press')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Press & Media
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('blog')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Hiking Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Get hiking tips, new tour updates, and exclusive offers delivered to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="text-sm"
                required
              />
              <Button type="submit" size="sm" className="w-full">
                Subscribe to Newsletter
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

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} MadeToHike. All rights reserved. | Connecting adventurers with certified mountain guides across Europe.
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button 
              onClick={() => onNavigate('privacy')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate('terms')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onNavigate('cookies')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookie Policy
            </button>
            <button 
              onClick={() => onNavigate('contact')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Support
            </button>
            <button 
              onClick={() => {
                window.scrollTo(0, 0);
                window.location.href = '/auth?mode=admin';
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Admin Login
            </button>
            <button 
              onClick={() => {
                window.scrollTo(0, 0);
                window.location.href = '/auth?mode=guide';
              }}
              className="text-muted-foreground hover:text-green-600 transition-colors"
            >
              Guide Login
            </button>
          </div>
        </div>

        {/* SEO Keywords */}
        <div className="mt-4 text-xs text-muted-foreground/60 leading-relaxed">
          <p>
            Keywords: Mountain hiking tours, certified mountain guides, European hiking adventures, 
            Dolomites guided tours, Pyrenees trekking, Scottish Highlands hiking, alpine climbing guides, 
            mountain safety experts, hiking vacation packages, wilderness adventures, rock climbing instruction, 
            mountain photography tours, multi-day hiking trips, hiking gear rental, adventure travel Europe.
          </p>
        </div>
      </div>
    </footer>
  );
}