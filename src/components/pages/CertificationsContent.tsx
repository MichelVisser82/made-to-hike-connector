import React from 'react';
import { Shield, Award, Clock, CheckCircle2, AlertTriangle, Users, ExternalLink } from 'lucide-react';
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

interface CountryCertification {
  country: string;
  technical: string;
  hiking: string;
  organization: string;
}

interface FirstAidCertification {
  name: string;
  duration: string;
  renewal: string;
  bestFor: string;
  recognition: string;
}

const countryCertifications: CountryCertification[] = [
  {
    country: 'Netherlands',
    technical: 'IFMGA (via foreign association)',
    hiking: 'IML via NLAIML',
    organization: 'NLAIML'
  },
  {
    country: 'Belgium',
    technical: 'IFMGA (via foreign association)',
    hiking: 'IML',
    organization: 'Belgian UIMLA member'
  },
  {
    country: 'United Kingdom',
    technical: 'MIC/WMCI',
    hiking: 'IML (summer), WML (winter), IMLB',
    organization: 'BMG, Mountain Training, AMI'
  },
  {
    country: 'France',
    technical: 'Guide de Haute Montagne',
    hiking: 'AMM (Accompagnateur)',
    organization: 'SNGM, ENSA'
  },
  {
    country: 'Switzerland',
    technical: 'Bergführer',
    hiking: 'UIMLA Mountain Leader',
    organization: 'SBV-ASGM'
  },
  {
    country: 'Austria',
    technical: 'Berg- und Skiführer',
    hiking: 'Wanderführer',
    organization: 'VÖBS'
  },
  {
    country: 'Germany',
    technical: 'Staatlich geprüfter Berg- und Skiführer',
    hiking: 'UIMLA Mountain Leader',
    organization: 'VDBS'
  },
  {
    country: 'Italy',
    technical: 'Guida Alpina',
    hiking: 'Guida di Media Montagna',
    organization: 'CONAGAI'
  },
  {
    country: 'Spain',
    technical: 'Guía de Alta Montaña',
    hiking: 'Guía de Montaña (UIMLA)',
    organization: 'AEGM'
  },
  {
    country: 'USA',
    technical: 'AMGA Alpine/Rock/Ski Guide',
    hiking: '—',
    organization: 'AMGA'
  },
  {
    country: 'Canada',
    technical: 'Alpine/Rock/Ski Guide',
    hiking: '—',
    organization: 'ACMG'
  },
  {
    country: 'New Zealand',
    technical: 'Alpine/Rock/Ski Guide',
    hiking: '—',
    organization: 'NZMGA'
  }
];

const firstAidCertifications: FirstAidCertification[] = [
  {
    name: 'Wilderness First Responder (WFR)',
    duration: '80+ hours (8-10 days)',
    renewal: 'Every 3 years',
    bestFor: 'Professional guides, expedition leaders',
    recognition: 'International gold standard'
  },
  {
    name: 'Wilderness First Aid (WFA)',
    duration: '16-20 hours (2-3 days)',
    renewal: 'Every 2-3 years',
    bestFor: 'Day hikes, short trips',
    recognition: 'Standard for recreational leaders'
  },
  {
    name: 'Wilderness Advanced First Aid (WAFA)',
    duration: '40-50 hours (5-6 days)',
    renewal: 'Every 3 years',
    bestFor: 'Multi-day trips, assistant guides',
    recognition: 'Mid-level professional'
  },
  {
    name: 'Wilderness EMT (WEMT)',
    duration: '200+ hours',
    renewal: 'State-dependent',
    bestFor: 'Remote expeditions, rescue teams',
    recognition: 'Highest medical qualification'
  },
  {
    name: 'First Aid at Work (UK)',
    duration: '18 hours (3 days)',
    renewal: 'Every 3 years',
    bestFor: 'UK-based guides',
    recognition: 'UK legal requirement'
  },
  {
    name: 'Outdoor Emergency Care (OEC)',
    duration: '70+ hours',
    renewal: 'Annual refresh',
    bestFor: 'Ski patrol, mountain rescue',
    recognition: 'Specialized for outdoor environments'
  }
];

export function CertificationsContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Clock className="w-3 h-3 mr-1" />
              Read time: 3 minutes
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Mountain Guide Certifications: A Quick Reference Guide
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Why Certifications Matter */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Why Certifications Matter
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-4">
                In most countries, anyone can call themselves a "mountain guide." Certifications prove that a guide has:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Completed 3-5 years of rigorous training</li>
                <li>Passed demanding practical and theoretical exams</li>
                <li>Demonstrated competence in navigation, first aid, and risk assessment</li>
                <li>Committed to ongoing professional development</li>
              </ul>
              <p className="text-muted-foreground mt-4 italic">
                Think of it as the difference between a licensed doctor and someone who read medical articles online.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* The Two International Standards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">The Two International Standards</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* IFMGA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  1. IFMGA (International Mountain Guide)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">For technical mountaineering:</p>
                  <p className="text-sm text-muted-foreground">
                    High-altitude climbing, rock climbing, ice climbing, ski touring, glacier travel, and roped terrain.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Training:</span> 3-5 years, costs €11,000-$24,000</p>
                  <p><span className="font-semibold">Proof:</span> Physical carnet (ID card) with annual validity sticker</p>
                  <p><span className="font-semibold">Recognition:</span> 20+ countries worldwide</p>
                </div>
              </CardContent>
            </Card>

            {/* UIMLA/IML */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  2. UIMLA/IML (International Mountain Leader)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">For non-technical terrain:</p>
                  <p className="text-sm text-muted-foreground">
                    Hiking, trekking, multi-day backpacking, and scrambling (easy rock sections without ropes).
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Training:</span> 3 years, ~900 contact hours</p>
                  <p><span className="font-semibold">Proof:</span> Credit card-format carnet with holographic sticker</p>
                  <p><span className="font-semibold">Recognition:</span> 27+ countries including Netherlands, UK, France, Germany, Switzerland</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Country-by-Country Quick Reference */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Country-by-Country Quick Reference</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Country</TableHead>
                      <TableHead className="font-bold">Technical Mountaineering</TableHead>
                      <TableHead className="font-bold">Hiking/Trekking</TableHead>
                      <TableHead className="font-bold">Organization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryCertifications.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cert.country}</TableCell>
                        <TableCell>{cert.technical}</TableCell>
                        <TableCell>{cert.hiking}</TableCell>
                        <TableCell>{cert.organization}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Outdoor First Aid Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Outdoor First Aid Certifications</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Certification</TableHead>
                      <TableHead className="font-bold">Duration</TableHead>
                      <TableHead className="font-bold">Renewal</TableHead>
                      <TableHead className="font-bold">Best For</TableHead>
                      <TableHead className="font-bold">Recognition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firstAidCertifications.map((cert, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cert.name}</TableCell>
                        <TableCell>{cert.duration}</TableCell>
                        <TableCell>{cert.renewal}</TableCell>
                        <TableCell>{cert.bestFor}</TableCell>
                        <TableCell>{cert.recognition}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-6 pt-4">
                <p className="text-sm text-muted-foreground italic">
                  Note: IFMGA and UIMLA require current wilderness first aid as part of certification maintenance.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Your 5-Minute Verification Checklist */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Your 5-Minute Verification Checklist</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Must-Haves */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Must-Haves
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Proper certification for your activity (IFMGA for technical, UIMLA/IML for hiking)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Physical proof (carnet with current annual sticker)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Professional liability insurance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Current first aid certification (WFR or WFA minimum)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Transparent about experience in your destination</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Green Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Green Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Member of professional association (NLAIML, AMI, SNGM, BMG)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Ongoing professional development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Clear communication and realistic expectations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Positive reviews mentioning safety and knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Professional web presence with displayed certifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Red Flags */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">🚩</span>
                    <span>Won't show credentials or makes excuses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">🚩</span>
                    <span>Vague about qualifications ("lots of experience")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">🚩</span>
                    <span>Significantly cheaper than competitors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">🚩</span>
                    <span>No written agreement or contract</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">🚩</span>
                    <span>Pushes beyond your comfort level</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Member Organizations: What They Mean */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Member Organizations: What They Mean</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Professional Associations (Certification Required)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-semibold">NLAIML</span> (Netherlands) - Dutch IML professionals only</li>
                  <li><span className="font-semibold">AMI</span> (UK) - MCI/WMCI holders only</li>
                  <li><span className="font-semibold">SNGM</span> (France) - French IFMGA guides only</li>
                  <li><span className="font-semibold">BMG</span> (British Mountain Guides) - UK professionals</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  Alpine Clubs (Open to Everyone)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  <span className="font-semibold">NKBV</span> (Netherlands), <span className="font-semibold">BMC</span> (UK), 
                  <span className="font-semibold"> SAC</span> (Switzerland), <span className="font-semibold">DAV</span> (Germany), 
                  <span className="font-semibold"> CAI</span> (Italy)
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold">Benefits:</span> Insurance, hut discounts, training access, community
                </p>
                <p className="text-sm text-muted-foreground italic">
                  <span className="font-semibold">Note:</span> Membership doesn't prove professional qualification
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Verify Certifications Online */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Verify Certifications Online</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">IFMGA:</span>
                  <a href="https://ifmga.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://ifmga.net
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">UIMLA:</span>
                  <a href="https://uimla.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://uimla.org
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">Netherlands:</span>
                  <a href="https://nlaiml.org/iml/zoek-een-iml/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://nlaiml.org/iml/zoek-een-iml/
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">UK:</span>
                  <span className="text-muted-foreground">Mountain Training UK + AMI member directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">France:</span>
                  <span className="text-muted-foreground">SNGM member directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">Other countries:</span>
                  <span className="text-muted-foreground">Check national association websites</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* The Bottom Line */}
        <section className="mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>The Bottom Line</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold mb-3">Match the certification to your activity:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span><span className="font-semibold">Technical terrain</span> (glaciers, ropes, climbing) → IFMGA only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span><span className="font-semibold">Hiking/trekking</span> (non-technical mountain trails) → UIMLA/IML/equivalent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span><span className="font-semibold">Winter conditions</span> → Check for winter-specific qualifications</span>
                </li>
              </ul>
              <p className="font-semibold">Always verify credentials, ask for proof, and trust your instincts.</p>
            </CardContent>
          </Card>
        </section>

        {/* About MadeToHike */}
        <section className="mb-12">
          <Card className="border-primary">
            <CardContent className="pt-6 text-center">
              <p className="text-lg mb-4">
                <span className="font-bold">About MadeToHike:</span> Europe's premier marketplace for certified mountain guides. 
                Every guide verified, every certification checked.
              </p>
              <Button size="lg" className="gap-2">
                Find your perfect adventure at madetohike.com 🥾⛰️
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}