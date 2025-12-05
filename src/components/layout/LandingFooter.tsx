import { useNavigate } from 'react-router-dom';

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Footer Links */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div>
            <h4 className="text-burgundy-light mb-4 uppercase text-sm tracking-wider">For Hikers</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><button onClick={() => navigate('/tours')} className="hover:text-burgundy-light">Browse Tours</button></li>
              <li><button onClick={() => navigate('/guides')} className="hover:text-burgundy-light">Our Guides</button></li>
              <li><button onClick={() => navigate('/how-it-works')} className="hover:text-burgundy-light">How It Works</button></li>
              <li><button onClick={() => navigate('/safety')} className="hover:text-burgundy-light">Safety Standards</button></li>
              <li><button onClick={() => navigate('/certifications')} className="hover:text-burgundy-light">Certification Reference Guide</button></li>
              <li><button onClick={() => navigate('/reviews')} className="hover:text-burgundy-light">Reviews</button></li>
              <li><button onClick={() => navigate('/custom-requests')} className="hover:text-burgundy-light">Custom Requests</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-burgundy-light mb-4 uppercase text-sm tracking-wider">For Guides</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><button onClick={() => navigate('/guide/signup')} className="hover:text-burgundy-light">Become a Guide</button></li>
              <li><button onClick={() => navigate('/guide/economics')} className="hover:text-burgundy-light">Why Guides use Made to Hike</button></li>
              <li><button onClick={() => navigate('/guide/verification')} className="hover:text-burgundy-light">Verification</button></li>
              <li><button onClick={() => navigate('/guide/resources')} className="hover:text-burgundy-light">Guide Resources</button></li>
              <li><button onClick={() => navigate('/partnerships')} className="hover:text-burgundy-light">Brand Partnerships</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-burgundy-light mb-4 uppercase text-sm tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><button onClick={() => navigate('/about')} className="hover:text-burgundy-light">Our Story</button></li>
              <li><button onClick={() => navigate('/environmental')} className="hover:text-burgundy-light">Environmental Report</button></li>
              <li><button onClick={() => navigate('/press')} className="hover:text-burgundy-light">Press Kit</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-burgundy-light">Contact</button></li>
              <li><button onClick={() => navigate('/careers')} className="hover:text-burgundy-light">Careers</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/60">
          <p className="mb-4">
            © 2025 MadeToHike | <button onClick={() => navigate('/privacy')} className="hover:text-burgundy-light">Privacy Policy</button> | <button onClick={() => navigate('/terms')} className="hover:text-burgundy-light">Terms</button> | GDPR Compliant
          </p>
          <p className="text-xs">
            Hosted on renewable energy (Hetzner, DE) | Payment processing by Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}