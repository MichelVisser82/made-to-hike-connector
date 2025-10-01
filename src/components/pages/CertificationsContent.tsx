import React from 'react';
import { 
  Shield, 
  Award, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle,
  Heart,
  Cloud,
  Radio,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Certification {
  country: string;
  name: string;
  duration: string;
  skillsFocus: string;
  bestFor: string;
}

interface SafetyCertification {
  certification: string;
  provider: string;
  duration: string;
  renewal: string;
  notes: string;
}

const certifications: Certification[] = [
  {
    country: 'France',
    name: 'Accompagnateur en Montagne',
    duration: '600 hours + 2-3 years experience',
    skillsFocus: 'Hiking, navigation, natural environment',
    bestFor: 'Non-technical mountain hiking'
  },
  {
    country: 'Italy',
    name: 'Accompagnatore di Media Montagna',
    duration: '400-500 hours + practical experience',
    skillsFocus: 'Mountain trails, alpine environment, safety',
    bestFor: 'Dolomites hiking and via ferrata'
  },
  {
    country: 'Switzerland',
    name: 'Wanderleiter/Accompagnateur',
    duration: '800 hours over 2 years',
    skillsFocus: 'Hiking leadership, alpine awareness',
    bestFor: 'Swiss Alps hiking tours'
  },
  {
    country: 'Austria',
    name: 'Wanderführer',
    duration: '400 hours + exam',
    skillsFocus: 'Mountain hiking, group management',
    bestFor: 'Alpine hiking in Austria'
  },
  {
    country: 'Germany',
    name: 'Wanderführer DWV',
    duration: '210 hours + practical training',
    skillsFocus: 'Hiking trails, natural history',
    bestFor: 'German mountain regions'
  },
  {
    country: 'Spain',
    name: 'Técnico Deportivo en Media Montaña',
    duration: '600 hours over 2 years',
    skillsFocus: 'Mountain sports, safety, guiding',
    bestFor: 'Pyrenees and Spanish mountains'
  },
  {
    country: 'UK',
    name: 'Mountain Leader (ML)',
    duration: '40+ logged mountain days + training',
    skillsFocus: 'Navigation, hill walking, safety',
    bestFor: 'Scottish Highlands, Lake District'
  },
  {
    country: 'International',
    name: 'IFMGA/UIAGM Mountain Guide',
    duration: '3-7 years + extensive experience',
    skillsFocus: 'Technical climbing, skiing, mountaineering',
    bestFor: 'All mountain environments'
  }
];

const safetyCertifications: SafetyCertification[] = [
  {
    certification: 'Wilderness First Responder (WFR)',
    provider: 'NOLS, WMAI, others',
    duration: '80 hours (8-10 days)',
    renewal: 'Every 3 years',
    notes: 'Standard for mountain guides'
  },
  {
    certification: 'Wilderness First Aid (WFA)',
    provider: 'Various providers',
    duration: '16-20 hours (2 days)',
    renewal: 'Every 2-3 years',
    notes: 'Minimum requirement for hiking guides'
  },
  {
    certification: 'European First Aid Certificate',
    provider: 'Red Cross, St. John Ambulance',
    duration: '8-16 hours',
    renewal: 'Annual',
    notes: 'Basic first aid + CPR'
  }
];

export function CertificationsContent() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#722F37] to-[#8B4049] text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Reference Guide
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Mountain Guide Certifications: A Quick Reference Guide
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Understanding the qualifications behind your mountain guide ensures safe, professional, 
              and enriching outdoor experiences across Europe's diverse mountain ranges.
            </p>
          </div>
        </div>
      </section>

      {/* Why Certifications Matter */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold mb-4">Why Certifications Matter</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Mountain guide certifications are not just pieces of paper—they represent hundreds of hours 
                  of training, real-world experience, and a commitment to safety and professionalism. When you 
                  book a certified guide through MadeToHike, you're ensuring:
                </p>
                <ul className="space-y-3">
                  {[
                    'Proper risk assessment and emergency response capabilities',
                    'Deep knowledge of local terrain, weather patterns, and mountain conditions',
                    'Training in group management, navigation, and rescue techniques',
                    'Insurance coverage and professional liability protection',
                    'Adherence to international safety standards and ethical guiding practices'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Five International Standards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              The Five International Standards
            </h2>
            <div className="grid gap-6">
              {[
                {
                  number: 1,
                  title: 'IFMGA/UIAGM - The Gold Standard',
                  description: 'The International Federation of Mountain Guides Associations represents the highest level of mountain guiding qualification worldwide, covering rock climbing, alpinism, and ski mountaineering.'
                },
                {
                  number: 2,
                  title: 'National Mountain Leader Qualifications',
                  description: 'Country-specific certifications for non-technical mountain hiking and trekking, regulated by national mountain training boards and associations.'
                },
                {
                  number: 3,
                  title: 'Wilderness First Aid Certification',
                  description: 'Medical training specific to remote mountain environments where professional medical help may be hours or days away.'
                },
                {
                  number: 4,
                  title: 'Technical Rescue Training',
                  description: 'Specialized skills in rope rescue, avalanche response, and emergency evacuation procedures in mountain terrain.'
                },
                {
                  number: 5,
                  title: 'Environmental Education Credentials',
                  description: 'Training in natural history, geology, ecology, and Leave No Trace principles to enhance the educational value of mountain experiences.'
                }
              ].map((standard) => (
                <Card key={standard.number}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{standard.number}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{standard.title}</h3>
                        <p className="text-muted-foreground">{standard.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Country-by-Country Guide */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Mountain className="h-8 w-8 text-primary" />
              Country-by-Country Guide to Hiking Certifications
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Country</TableHead>
                        <TableHead className="font-semibold">Certification Name</TableHead>
                        <TableHead className="font-semibold">Training Duration</TableHead>
                        <TableHead className="font-semibold">Skills Focus</TableHead>
                        <TableHead className="font-semibold">Best For</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certifications.map((cert, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cert.country}</TableCell>
                          <TableCell>{cert.name}</TableCell>
                          <TableCell className="text-sm">{cert.duration}</TableCell>
                          <TableCell className="text-sm">{cert.skillsFocus}</TableCell>
                          <TableCell className="text-sm">{cert.bestFor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  * Training durations and requirements may vary by certifying body and individual circumstances
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Outdoor First Aid Certifications */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Outdoor First Aid Certifications
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Certification</TableHead>
                        <TableHead className="font-semibold">Provider</TableHead>
                        <TableHead className="font-semibold">Course Duration</TableHead>
                        <TableHead className="font-semibold">Renewal Period</TableHead>
                        <TableHead className="font-semibold">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safetyCertifications.map((cert, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{cert.certification}</TableCell>
                          <TableCell>{cert.provider}</TableCell>
                          <TableCell>{cert.duration}</TableCell>
                          <TableCell>{cert.renewal}</TableCell>
                          <TableCell className="text-sm">{cert.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Missing Checklist */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-primary" />
              What's Missing from Your Mountain Guide's Checklist?
            </h2>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <p className="text-foreground mb-6 font-medium">
                  A certificate alone doesn't tell the whole story. Always verify:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Current Certification Status',
                      description: 'Ask to see certification cards and verify they\'re not expired'
                    },
                    {
                      title: 'Insurance Coverage',
                      description: 'Professional liability insurance should be active and adequate for group size'
                    },
                    {
                      title: 'Recent Experience',
                      description: 'Certifications are great, but recent experience in specific terrain matters more'
                    },
                    {
                      title: 'First Aid Currency',
                      description: 'Wilderness first aid certifications should be renewed within the last 2-3 years'
                    },
                    {
                      title: 'Local Knowledge',
                      description: 'Guides should have recent, firsthand knowledge of the specific area you\'ll be hiking'
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Weather Organizations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Cloud className="h-8 w-8 text-primary" />
              Weather Organizations Guides Trust
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: 'MeteoSwiss',
                  region: 'Switzerland',
                  description: 'Official Swiss meteorological service with specialized alpine forecasts'
                },
                {
                  name: 'Météo-France Montagne',
                  region: 'France',
                  description: 'Mountain-specific forecasts for French Alps and Pyrenees'
                },
                {
                  name: 'Met Office Mountain Forecasts',
                  region: 'United Kingdom',
                  description: 'Detailed highland and mountain forecasts for Scottish regions'
                },
                {
                  name: 'ZAMG Bergwetter',
                  region: 'Austria',
                  description: 'Alpine weather service covering Austrian mountain ranges'
                }
              ].map((org, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{org.name}</h3>
                    <Badge variant="secondary" className="mb-3">{org.region}</Badge>
                    <p className="text-sm text-muted-foreground">{org.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rescue Information */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary" />
              Mountain Rescue Organizations
            </h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6">
                  Professional guides maintain communication with regional rescue services. 
                  Key emergency numbers to know:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold mb-1">European Emergency Number</p>
                    <p className="text-2xl font-bold text-primary">112</p>
                    <p className="text-sm text-muted-foreground">Works across all EU countries</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold mb-1">Alpine Emergency (Some regions)</p>
                    <p className="text-2xl font-bold text-primary">140</p>
                    <p className="text-sm text-muted-foreground">Austria, Switzerland alpine rescue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Steps Guide Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Your Certification Guide in 5 Steps</h2>
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: 'Check the Certification',
                  description: 'Look for recognized national or international mountain guiding certifications listed on the guide\'s profile'
                },
                {
                  step: 2,
                  title: 'Verify First Aid Training',
                  description: 'Ensure your guide has current Wilderness First Aid (WFA) or Wilderness First Responder (WFR) certification'
                },
                {
                  step: 3,
                  title: 'Review Experience Level',
                  description: 'Check the guide\'s years of experience, number of tours completed, and client reviews on MadeToHike'
                },
                {
                  step: 4,
                  title: 'Confirm Local Knowledge',
                  description: 'Verify the guide has recent, firsthand experience in the specific region and terrain you\'ll be exploring'
                },
                {
                  step: 5,
                  title: 'Ask Questions',
                  description: 'Don\'t hesitate to message guides through MadeToHike to ask about their qualifications and approach to safety'
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-br from-[#722F37] to-[#8B4049] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-4">The Bottom Line</h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              All certifications are not created equal, and the "best" certification depends on the terrain 
              and activity. A UK Mountain Leader is perfect for Scottish Highlands hiking but may not have the 
              technical skills for alpine environments. Always match the guide's qualifications to your planned adventure.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#722F37] hover:bg-white/90 font-semibold"
              onClick={() => window.location.href = '/'}
            >
              <Search className="h-5 w-5 mr-2" />
              Find Your Certified Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Confirmation Booking Note */}
      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">MadeToHike's Commitment</h3>
                    <p className="text-muted-foreground">
                      Every guide on MadeToHike undergoes a verification process to ensure they hold valid, 
                      current certifications appropriate for the tours they offer. We verify insurance coverage, 
                      first aid credentials, and conduct background checks to maintain the highest safety standards 
                      for our community.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
