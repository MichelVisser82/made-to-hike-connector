import { 
  Mountain, 
  Shield, 
  Euro,
  Users,
  Calendar,
  TrendingUp,
  Leaf,
  Award,
  CheckCircle2,
  Star,
  BarChart3,
  FileText,
  Heart,
  MapPin,
  Clock,
  Check,
  ArrowRight,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SmartImage } from "@/components/SmartImage";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AppNavigation } from "@/components/layout/AppNavigation";

export default function GuidePitchDeckPage() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-cream">
      <Helmet>
        <title>Why Guides Use Made to Hike | 95% Revenue Share Platform</title>
        <meta name="description" content="Join Europe's first guide-owned marketplace. Keep 95% of your earnings, get smart waiver management, and build your professional profile. First 50 guides get 2% commission forever." />
        <meta property="og:title" content="Why Guides Use Made to Hike | Guide Platform Benefits" />
        <meta property="og:description" content="Keep 95% of your earnings. Smart waiver management. Professional profiles. Join 50 founding guides building the future of mountain guiding in Europe." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://madetohike.com/guide/invite" />
      </Helmet>

      {/* Header */}
      <AppNavigation />

      {/* Add print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          section {
            page-break-inside: avoid;
          }
          
          .print\\:page-break-after {
            page-break-after: always;
          }
        }
      `}</style>

      {/* PAGE 1: COVER - SPLIT SCREEN */}
      <section className="min-h-screen flex flex-col lg:flex-row print:page-break-after">
        {/* Left: Image with contour overlay */}
        <div className="lg:w-1/2 h-[50vh] lg:h-screen relative overflow-hidden">
          <SmartImage
            category="hero"
            tags={["Alps", "mountain", "summit"]}
            alt="Mountain summit sunrise in the Alps"
            className="w-full h-full object-cover"
            priority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-charcoal/30 to-charcoal/60" />
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="contours" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,20 Q25,10 50,20 T100,20" stroke="white" fill="none" strokeWidth="0.5"/>
                  <path d="M0,40 Q25,35 50,40 T100,40" stroke="white" fill="none" strokeWidth="0.5"/>
                  <path d="M0,60 Q25,55 50,60 T100,60" stroke="white" fill="none" strokeWidth="0.5"/>
                  <path d="M0,80 Q25,75 50,80 T100,80" stroke="white" fill="none" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#contours)" />
            </svg>
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:w-1/2 bg-charcoal text-white flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-xl">
            <Badge className="bg-burgundy-light/20 text-burgundy-light border border-burgundy-light/30 mb-8 px-6 py-2 text-xs tracking-[0.3em] uppercase">
              Exclusive Invitation
            </Badge>
            
            <h1 className="text-6xl lg:text-7xl text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Made to Hike
            </h1>
            
            <div className="text-xl lg:text-2xl text-burgundy-light mb-8 tracking-wide uppercase">
              Guide Platform — First Testers Programme
            </div>
            
            <p className="text-lg text-cream/90 mb-6 leading-relaxed">
              Join us in building Europe's first guide-owned marketplace.
            </p>
            <p className="text-lg text-cream/90 mb-12 leading-relaxed">
              Where your expertise is valued. Where you stay in control.
            </p>

            <div className="grid grid-cols-3 gap-6 mb-12 pb-12 border-b border-white/20">
              <div>
                <div className="text-5xl text-burgundy-light mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>95%</div>
                <div className="text-sm text-cream/70 uppercase tracking-wider">Revenue to You</div>
              </div>
              <div>
                <div className="text-5xl text-burgundy-light mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>€0</div>
                <div className="text-sm text-cream/70 uppercase tracking-wider">Setup Fees</div>
              </div>
              <div>
                <div className="text-5xl text-burgundy-light mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>100%</div>
                <div className="text-sm text-cream/70 uppercase tracking-wider">Your Control</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 2: THE OPPORTUNITY */}
      <section className="min-h-screen bg-cream py-16 px-8 lg:px-16 flex items-center print:page-break-after">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-12">
            <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">The Opportunity</div>
            <h2 className="text-4xl lg:text-6xl text-charcoal mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Connect to a Community of Enthusiastic Hikers
            </h2>
            <p className="text-xl text-charcoal/70 leading-relaxed max-w-3xl">
              Let us <strong>handle the marketing</strong> while you spend your time in the mountains. We connect you to outdoor lovers who value authentic experiences with certified local guides.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: TrendingUp,
                title: "Marketing Done for You",
                opportunity: "Professional booking platform & advertising (Google, Facebook, Instagram, etc)",
                impact: "Focus on guiding, not admin",
              },
              {
                icon: Shield,
                title: "Safety First",
                opportunity: "Integrated digital waiver & insurance system. Automated packing lists and easy communication",
                impact: "Protected & professional",
              },
              {
                icon: Euro,
                title: "Fair Earnings",
                opportunity: "Keep what you earn, 5% platform fee",
                impact: "€800 tour → €760 to you",
              }
            ].map((item) => (
              <Card key={item.title} className="p-6 border-charcoal/10 bg-white hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-burgundy" />
                </div>
                <h3 className="text-xl text-charcoal mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {item.title}
                </h3>
                <p className="text-sm text-charcoal/70 mb-2 leading-relaxed">{item.opportunity}</p>
                <p className="text-sm text-burgundy italic">{item.impact}</p>
              </Card>
            ))}
          </div>

          <div className="bg-charcoal text-white p-10 rounded-lg">
            <p className="text-2xl lg:text-3xl leading-relaxed italic text-cream" style={{ fontFamily: 'Playfair Display, serif' }}>
              "We built Made to Hike to help guides thrive. Spend your time where you belong—in the mountains—while we connect you with hikers who appreciate your expertise."
            </p>
            <div className="mt-6 text-burgundy-light tracking-wider text-sm uppercase">— The Made to Hike Team</div>
          </div>
        </div>
      </section>

      {/* PAGE 3: DASHBOARD SCREENSHOT */}
      <section className="min-h-screen bg-charcoal text-white py-16 px-8 lg:px-16 flex items-center print:page-break-after">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-10">
            <div className="text-xs tracking-[0.3em] text-burgundy-light mb-6 uppercase text-center">Your Command Center</div>
            <h2 className="text-4xl lg:text-6xl text-white mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
              Complete Guide Dashboard
            </h2>
            <p className="text-xl text-cream/80 text-center max-w-2xl mx-auto">
              Manage bookings, track revenue, monitor waivers—all in one place.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-burgundy p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mountain className="w-6 h-6 text-white" />
                <span className="text-white text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Guide Dashboard</span>
              </div>
            </div>
            
            <div className="p-8">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Active Tours", value: "12", icon: Mountain },
                  { label: "This Month", value: "€3,840", icon: Euro },
                  { label: "Bookings", value: "28", icon: Calendar },
                  { label: "Rating", value: "4.9★", icon: Star }
                ].map((stat) => (
                  <div key={stat.label} className="bg-cream p-5 rounded-lg border border-burgundy/10">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-4 h-4 text-burgundy" />
                      <span className="text-xs text-charcoal/60 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="text-2xl text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Bookings */}
              <div className="mb-6">
                <h3 className="text-xs text-charcoal uppercase tracking-wider mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {[
                    { tour: "Dolomites Via Ferrata", client: "Anna K.", date: "Jun 15-18", status: "Confirmed", amount: "€680" },
                    { tour: "Scottish Highlands Trek", client: "James M.", date: "Jun 22-24", status: "Waiver Pending", amount: "€450" },
                    { tour: "Pyrenees High Route", client: "Sophie L.", date: "Jul 2-6", status: "Confirmed", amount: "€750" }
                  ].map((booking, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-cream/50 rounded-lg border border-burgundy/10">
                      <div className="flex-1">
                        <div className="text-charcoal mb-1">{booking.tour}</div>
                        <div className="text-sm text-charcoal/60">{booking.client} • {booking.date}</div>
                      </div>
                      <Badge className={`text-xs ${booking.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"} border-0`}>
                        {booking.status}
                      </Badge>
                      <div className="text-sm text-burgundy w-20 text-right" style={{ fontFamily: 'Playfair Display, serif' }}>{booking.amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { icon: BarChart3, label: "Revenue" },
                  { icon: Calendar, label: "Bookings" },
                  { icon: FileText, label: "Waivers" },
                  { icon: Users, label: "Clients" },
                  { icon: Star, label: "Reviews" }
                ].map((action) => (
                  <div key={action.label} className="bg-white border border-burgundy/10 p-4 rounded-lg text-center hover:bg-burgundy/5 transition-colors">
                    <action.icon className="w-6 h-6 text-burgundy mx-auto mb-2" />
                    <div className="text-xs text-charcoal/70">{action.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 4: WAIVER SYSTEM - SPLIT SCREEN */}
      <section className="min-h-screen flex flex-col lg:flex-row print:page-break-after">
        {/* Left: Content */}
        <div className="lg:w-1/2 bg-cream text-charcoal flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-xl">
            <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">Digital Safety System</div>
            <h2 className="text-4xl lg:text-5xl text-charcoal mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Smart Waiver Management
            </h2>
            <p className="text-lg text-charcoal/70 mb-8 leading-relaxed">
              Automated waiver collection with real-time tracking. Multi-party support for group bookings.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Automated email invites to all participants",
                "10-section comprehensive waiver form",
                "Medical history & emergency contacts",
                "Insurance verification with upload",
                "Real-time status tracking per booking",
                "Mobile-optimized signing experience"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0 mt-0.5" />
                  <span className="text-charcoal/80 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-burgundy/10 border-l-4 border-burgundy p-6 rounded-r">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-burgundy flex-shrink-0" />
                <div>
                  <h4 className="text-lg text-charcoal mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Legal Compliance Built-In
                  </h4>
                  <p className="text-sm text-charcoal/70 leading-relaxed">
                    Secure cloud storage, participant verification, and status tracking for every booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Waiver Status Mockup */}
        <div className="lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-lg shadow-2xl border border-charcoal/10 overflow-hidden">
              <div className="bg-burgundy p-6 text-white">
                <h3 className="text-lg mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Waiver Status Dashboard</h3>
                <p className="text-sm text-burgundy-light">Booking: Dolomites Via Ferrata - Jun 15-18</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {[
                    { name: "Anna K. (Lead)", status: "Complete", email: "anna@email.com", statusColor: "green" },
                    { name: "Mark K.", status: "Complete", email: "mark@email.com", statusColor: "green" },
                    { name: "Lisa P.", status: "Pending", email: "lisa@email.com", statusColor: "amber" },
                    { name: "Tom R.", status: "Not Started", email: "tom@email.com", statusColor: "red" }
                  ].map((participant, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-cream/50 rounded-lg border border-burgundy/10">
                      <div className="flex-1">
                        <div className="text-charcoal mb-1">{participant.name}</div>
                        <div className="text-sm text-charcoal/60">{participant.email}</div>
                      </div>
                      <Badge className={`text-xs ${
                        participant.statusColor === "green" ? "bg-green-100 text-green-700" :
                        participant.statusColor === "amber" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      } border-0`}>
                        {participant.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mb-6 pt-6 border-t border-charcoal/10">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-charcoal/70">Completion</span>
                    <span className="text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>50% (2/4)</span>
                  </div>
                  <div className="w-full bg-charcoal/10 rounded-full h-3">
                    <div className="bg-burgundy h-3 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                <Button className="w-full bg-burgundy hover:bg-burgundy/90 text-white">
                  Send Reminder Emails
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 5: GUIDE PROFILE & CERTIFICATION */}
      <section className="min-h-screen bg-cream py-16 px-8 lg:px-16 flex items-center print:page-break-after">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Profile Setup */}
            <div>
              <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">15-Step Profile Setup</div>
              <h2 className="text-4xl lg:text-5xl text-charcoal mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Build Your Professional Profile
              </h2>
              <p className="text-lg text-charcoal/70 mb-8 leading-relaxed">
                Showcase your expertise with certifications, specialties, and tour offerings.
              </p>

              {/* Profile Preview Card */}
              <Card className="p-6 border-charcoal/10 bg-white mb-8 shadow-lg">
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 bg-burgundy/20 rounded-full flex items-center justify-center">
                    <Mountain className="w-10 h-10 text-burgundy" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl text-charcoal mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Marco Albertini
                    </h3>
                    <p className="text-sm text-charcoal/60 mb-3">IFMGA Mountain Guide • Dolomites</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>4.9</span>
                      <span className="text-xs text-charcoal/60">(47 reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-burgundy text-white text-xs">IFMGA Certified</Badge>
                  <Badge className="bg-burgundy/10 text-burgundy border-burgundy/20 text-xs">Via Ferrata</Badge>
                  <Badge className="bg-burgundy/10 text-burgundy border-burgundy/20 text-xs">Alpine Climbing</Badge>
                  <Badge className="bg-burgundy/10 text-burgundy border-burgundy/20 text-xs">Ski Touring</Badge>
                </div>

                <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                  "20+ years guiding in the Dolomites. Passionate about sustainable mountain experiences and small group adventures."
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>127</div>
                    <div className="text-xs text-charcoal/60">Tours Led</div>
                  </div>
                  <div>
                    <div className="text-xl text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>15</div>
                    <div className="text-xs text-charcoal/60">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-xl text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>8</div>
                    <div className="text-xs text-charcoal/60">Specialties</div>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="text-sm text-charcoal uppercase tracking-wider mb-4">Profile Sections</h4>
                {[
                  "Personal Info & Bio",
                  "Certifications & Badges",
                  "Specialties & Skills",
                  "Languages Spoken",
                  "Tour Listings",
                  "Pricing & Availability",
                  "Insurance & Documents"
                ].map((section, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-charcoal/10">
                    <Check className="w-5 h-5 text-burgundy" />
                    <span className="text-sm text-charcoal/70">{section}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Certification Badges */}
            <div>
              <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">Trust & Verification</div>
              <h2 className="text-4xl lg:text-5xl text-charcoal mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Certification Badge System
              </h2>
              <p className="text-lg text-charcoal/70 mb-8 leading-relaxed">
                Display your credentials with verified badges that build trust.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { name: "IFMGA Certified", desc: "International Guide", icon: Award },
                  { name: "UIMLA Verified", desc: "Mountain Leader", icon: Award },
                  { name: "First Aid Cert", desc: "Wilderness First Responder", icon: Heart },
                  { name: "Avalanche Level 3", desc: "Advanced Training", icon: Shield },
                  { name: "Climbing Instructor", desc: "Technical Skills", icon: Mountain },
                  { name: "Leave No Trace", desc: "Environmental Steward", icon: Leaf }
                ].map((badge) => (
                  <Card key={badge.name} className="p-5 border-burgundy/10 bg-white hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center mb-4">
                      <badge.icon className="w-6 h-6 text-burgundy" />
                    </div>
                    <h4 className="text-sm text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {badge.name}
                    </h4>
                    <p className="text-xs text-charcoal/60">{badge.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="bg-charcoal text-white p-6 rounded-lg">
                <h4 className="text-lg mb-3 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Star className="w-6 h-6 text-burgundy-light" />
                  Build Trust with Verified Credentials
                </h4>
                <p className="text-sm text-cream/80 leading-relaxed">
                  Upload certifications once and display verified badges on your profile. Hikers see your expertise at a glance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 6: REFERRAL & REVENUE */}
      <section className="min-h-screen bg-charcoal text-white py-16 px-8 lg:px-16 flex items-center print:page-break-after">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Revenue Model */}
            <div>
              <div className="text-xs tracking-[0.3em] text-burgundy-light mb-6 uppercase">Fair Pricing Model</div>
              <h2 className="text-4xl lg:text-5xl text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                95% Revenue Share
              </h2>
              <p className="text-lg text-cream/80 mb-8 leading-relaxed">
                Keep what you earn. We only take 5% to maintain the platform.
              </p>

              {/* Comparison Table */}
              <div className="bg-white rounded-lg overflow-hidden mb-8">
                <div className="bg-burgundy p-5 text-white">
                  <h3 className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Commission Comparison: €800 Tour
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { platform: "Made to Hike", commission: "5%", you: "€760", fee: "€40", highlight: true },
                      { platform: "Platform A", commission: "20%", you: "€640", fee: "€160", highlight: false },
                      { platform: "Platform B", commission: "25%", you: "€600", fee: "€200", highlight: false },
                      { platform: "Platform C", commission: "30%", you: "€560", fee: "€240", highlight: false }
                    ].map((row, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 rounded-lg ${row.highlight ? 'bg-burgundy/10 border-2 border-burgundy' : 'bg-cream/50'}`}>
                        <div className="flex-1">
                          <div className={`${row.highlight ? 'text-charcoal' : 'text-charcoal/70'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                            {row.platform}
                          </div>
                          <div className="text-xs text-charcoal/60">{row.commission} commission</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl ${row.highlight ? 'text-burgundy' : 'text-charcoal/70'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                            {row.you}
                          </div>
                          <div className="text-xs text-charcoal/60">to you</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-charcoal/10 bg-burgundy/5 -mx-6 -mb-6 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal/70">You save vs. competitors:</span>
                      <span className="text-2xl text-burgundy" style={{ fontFamily: 'Playfair Display, serif' }}>
                        €120 - €200
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-burgundy/20 border border-burgundy-light/30 text-white p-6 rounded-lg">
                <h4 className="text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Award className="w-6 h-6 text-burgundy-light" />
                  First Testers: 2% Forever
                </h4>
                <p className="text-sm text-burgundy-light">
                  Lock in lifetime founder rate. First 50 guides pay only 2% commission—forever.
                </p>
              </div>
            </div>

            {/* Referral Program */}
            <div>
              <div className="text-xs tracking-[0.3em] text-burgundy-light mb-6 uppercase">Grow Together</div>
              <h2 className="text-4xl lg:text-5xl text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Referral Program
              </h2>
              <p className="text-lg text-cream/80 mb-8 leading-relaxed">
                Earn €50 for every guide you refer. Give hikers €25 vouchers.
              </p>

              {/* Referral Dashboard Mockup */}
              <Card className="p-6 border-burgundy/10 bg-cream mb-8">
                <h3 className="text-lg text-charcoal mb-6 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Users className="w-6 h-6 text-burgundy" />
                  Your Referral Dashboard
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-5 rounded-lg border border-burgundy/10">
                    <div className="text-3xl text-burgundy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      €250
                    </div>
                    <div className="text-xs text-charcoal/60 uppercase tracking-wider">Earned</div>
                  </div>
                  <div className="bg-white p-5 rounded-lg border border-burgundy/10">
                    <div className="text-3xl text-burgundy mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      5
                    </div>
                    <div className="text-xs text-charcoal/60 uppercase tracking-wider">Guides Referred</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-xs text-charcoal/70 uppercase tracking-wider mb-3">Recent Referrals</div>
                  {[
                    { name: "Sofia R.", status: "Active", earned: "€50" },
                    { name: "Jean P.", status: "Active", earned: "€50" },
                    { name: "Anna M.", status: "Pending Setup", earned: "€0" }
                  ].map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-burgundy/10">
                      <span className="text-charcoal">{ref.name}</span>
                      <div className="flex items-center gap-3">
                        <Badge className={`text-xs ${ref.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"} border-0`}>
                          {ref.status}
                        </Badge>
                        <span className="text-burgundy w-12 text-right" style={{ fontFamily: 'Playfair Display, serif' }}>{ref.earned}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-burgundy/5 border border-burgundy/20 rounded-lg p-4">
                  <div className="text-xs text-charcoal/70 mb-2">Your Referral Link</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white px-3 py-2 rounded border border-burgundy/10 font-mono">
                      madetohike.com/ref/marco_a
                    </code>
                    <Button size="sm" className="bg-burgundy hover:bg-burgundy/90 text-white text-xs px-4">
                      Copy
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 p-6 rounded-lg text-center">
                  <div className="text-3xl text-burgundy-light mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>€50</div>
                  <div className="text-xs text-cream/70 uppercase tracking-wider">Per Guide Referral</div>
                </div>
                <div className="bg-white/10 border border-white/20 p-6 rounded-lg text-center">
                  <div className="text-3xl text-burgundy-light mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>€25</div>
                  <div className="text-xs text-cream/70 uppercase tracking-wider">Hiker Voucher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 7: VALUES & FIRST TESTER BENEFITS */}
      <section className="min-h-screen bg-cream py-16 px-8 lg:px-16 flex items-center print:page-break-after">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Values */}
            <div>
              <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">Our Values</div>
              <h2 className="text-4xl lg:text-5xl text-charcoal mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Sustainable.<br />Authentic.
              </h2>
              <p className="text-lg text-charcoal/70 mb-8 leading-relaxed">
                Protect the mountains. Support local communities. Build lasting experiences.
              </p>

              <div className="space-y-5 mb-8">
                {[
                  {
                    icon: Leaf,
                    title: "Environmental Stewardship",
                    points: ["Small groups (2-8 people)", "Leave No Trace", "Local ecology focus"]
                  },
                  {
                    icon: MapPin,
                    title: "Local Community",
                    points: ["Partner with refugios", "Support villages", "Regional networks"]
                  }
                ].map((pillar) => (
                  <Card key={pillar.title} className="p-6 border-charcoal/10 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <pillar.icon className="w-6 h-6 text-burgundy" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-charcoal mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {pillar.title}
                        </h3>
                        <ul className="space-y-2">
                          {pillar.points.map((point) => (
                            <li key={point} className="flex items-center gap-2 text-sm text-charcoal/70">
                              <CheckCircle2 className="w-4 h-4 text-burgundy flex-shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-charcoal text-white p-8 rounded-lg">
                <p className="text-xl lg:text-2xl italic leading-relaxed text-cream" style={{ fontFamily: 'Playfair Display, serif' }}>
                  "The mountains will be here long after we're gone. Our job is to protect them while sharing their beauty."
                </p>
              </div>
            </div>

            {/* Right: First Tester Benefits */}
            <div>
              <div className="text-xs tracking-[0.3em] text-burgundy mb-6 uppercase">Exclusive Opportunity</div>
              <h2 className="text-4xl lg:text-5xl text-charcoal mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                First Tester Benefits
              </h2>
              <p className="text-lg text-charcoal/70 mb-8 leading-relaxed">
                Join as a founding guide and get exclusive perks.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: Euro,
                    title: "Zero Fees for 6 Months",
                    desc: "Keep 100% during testing phase",
                    badge: "€0"
                  },
                  {
                    icon: Award,
                    title: "Lifetime Founder Rate",
                    desc: "Lock in 2% forever (vs. 5% standard)",
                    badge: "2%"
                  },
                  {
                    icon: Star,
                    title: "Featured Guide Status",
                    desc: "Top visibility on launch day",
                    badge: "Priority"
                  },
                  {
                    icon: Users,
                    title: "Shape the Platform",
                    desc: "Direct input on features & policies",
                    badge: "Influence"
                  },
                  {
                    icon: Heart,
                    title: "1-on-1 Support",
                    desc: "Personal onboarding & optimization",
                    badge: "VIP"
                  },
                  {
                    icon: TrendingUp,
                    title: "Co-Marketing",
                    desc: "Featured in launch campaigns",
                    badge: "Exposure"
                  }
                ].map((benefit) => (
                  <Card key={benefit.title} className="p-5 border-charcoal/10 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-burgundy" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base text-charcoal mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-charcoal/60">{benefit.desc}</p>
                      </div>
                      <Badge className="bg-burgundy text-white border-0 text-xs">
                        {benefit.badge}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-burgundy text-white p-8 rounded-lg text-center">
                <h3 className="text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Limited to 50 Guides
                </h3>
                <p className="text-sm text-burgundy-light mb-4">
                  Small cohort for quality feedback & support
                </p>
                <div className="inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Closes when we reach 50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 8: HOW IT WORKS */}
      <section className="min-h-screen bg-charcoal text-white py-16 px-8 lg:px-16 flex items-center print:page-break-after">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <div className="text-xs tracking-[0.3em] text-burgundy-light mb-6 uppercase text-center">Simple Process</div>
            <h2 className="text-4xl lg:text-6xl text-white mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
              From Sign-Up to Launch
            </h2>
          </div>

          <div className="space-y-5">
            {[
              {
                step: "01",
                title: "Sign Up as a Guide",
                description: "Visit madetohike.com and click 'Become a Guide' to start your journey.",
                duration: "2 min"
              },
              {
                step: "02",
                title: "Complete Your Profile",
                description: "15-step setup: bio, certifications (IFMGA/UIMLA), specialties, photos, experience.",
                duration: "2-3 hrs"
              },
              {
                step: "03",
                title: "Create Your Tours",
                description: "List tours with descriptions, pricing, difficulty, itineraries, and availability.",
                duration: "1-2 hrs"
              },
              {
                step: "04",
                title: "Testing Phase",
                description: "Start taking bookings at 0% commission. Test features and give feedback.",
                duration: "6 months"
              },
              {
                step: "05",
                title: "Official Launch",
                description: "Keep your 2% founder rate and featured status forever.",
                duration: "Ongoing"
              }
            ].map((phase) => (
              <div key={phase.step} className="flex gap-5 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {phase.step}
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 p-6 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {phase.title}
                    </h3>
                    <Badge className="bg-burgundy-light/20 text-burgundy-light border-burgundy-light/30 text-xs">
                      {phase.duration}
                    </Badge>
                  </div>
                  <p className="text-sm text-cream/70 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-burgundy/20 border border-burgundy-light/30 text-white p-8 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Get Started?
              </h3>
              <p className="text-burgundy-light">No application. No approval. Just sign up and start building.</p>
            </div>
            <ArrowRight className="w-10 h-10 text-burgundy-light" />
          </div>
        </div>
      </section>

      {/* PAGE 9: CALL TO ACTION - SPLIT SCREEN */}
      <section className="min-h-screen flex flex-col lg:flex-row">
        {/* Left: Image with contour overlay */}
        <div className="lg:w-1/2 h-[50vh] lg:h-screen relative overflow-hidden">
          <SmartImage
            category="hero"
            tags={["Pyrenees", "hiking", "mountain"]}
            alt="Mountain guide leading group through the Pyrenees"
            className="w-full h-full object-cover"
            priority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/70 via-burgundy/50 to-charcoal/70" />
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-contours" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M0,30 Q30,20 60,30 T120,30" stroke="white" fill="none" strokeWidth="1"/>
                  <path d="M0,60 Q30,50 60,60 T120,60" stroke="white" fill="none" strokeWidth="1"/>
                  <path d="M0,90 Q30,80 60,90 T120,90" stroke="white" fill="none" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-contours)" />
            </svg>
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:w-1/2 bg-burgundy text-white flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-xl">
            <h2 className="text-5xl lg:text-6xl text-white mb-8 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Take Control of Your<br />Guiding Business
            </h2>
            
            <p className="text-xl text-burgundy-light mb-10 leading-relaxed">
              Join 50 founding guides building the future of mountain guiding in Europe.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              <Button 
                onClick={() => navigate('/guide/signup')}
                className="bg-white hover:bg-cream text-burgundy px-10 py-6 text-lg"
              >
                Sign Up as Guide
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/contact')}
                className="border-2 border-burgundy text-burgundy bg-white hover:bg-cream px-10 py-6 text-lg"
              >
                Questions? Contact Us
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-lg mb-10 text-center">
              <Clock className="w-8 h-8 text-burgundy-light mx-auto mb-3" />
              <div className="text-xs text-burgundy-light mb-2 uppercase tracking-wider">First Tester Programme</div>
              <div className="text-white text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                Rolling until 50 guides join
              </div>
            </div>

            <div className="pt-8 border-t border-white/20 text-center">
              <p className="text-burgundy-light mb-4">
                Made to Hike • Built by Guides, For Guides
              </p>
              <div className="flex justify-center gap-4 text-burgundy-light text-xs">
                <span>IFMGA Verified</span>
                <span>•</span>
                <span>UIMLA Certified</span>
                <span>•</span>
                <span>EU Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
