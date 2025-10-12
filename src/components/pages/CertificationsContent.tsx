import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Award, Clock, CheckCircle2, AlertTriangle, Users, ExternalLink } from 'lucide-react';
import { MainLayout } from '../layout/MainLayout';
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
import { SmartImage } from '@/components/SmartImage';
import { CertificationBadge } from '@/components/ui/certification-badge';
import type { GuideCertification } from '@/types/guide';

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
    <MainLayout>
      <Helmet>
        <title>Mountain Guide Certifications: A Quick Reference Guide | MadeToHike</title>
        <meta 
          name="description" 
          content="Complete guide to mountain guide certifications. Learn the difference between IFMGA and UIMLA certifications, verify credentials, and choose the right certified guide for your adventure." 
        />
        <meta 
          name="keywords" 
          content="mountain guide certifications, IFMGA, UIMLA, IML, guide qualifications, mountain safety, certified guides, alpine certifications, wilderness first aid" 
        />
        <link rel="canonical" href="https://madetohike.com/certifications" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Hero Section with Background Image */}
        <section className="relative h-[400px] md:h-[500px] overflow-hidden">
          <SmartImage 
            category="hero"
            usageContext="certifications"
            tags={['mountains', 'guides', 'adventure']}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Mountain guide in alpine terrain"
            priority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          
          <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
            <div className="max-w-4xl text-center">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Clock className="w-3 h-3 mr-1" />
                3 min read
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                Mountain Guide Certifications: A Quick Reference Guide
              </h1>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Why Certifications Matter */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Why Certifications Matter
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              In most countries, anyone can call themselves a "mountain guide." Certifications prove that a guide has:
            </p>
            <ul className="space-y-3 text-muted-foreground text-lg mb-6">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1.5">•</span>
                <span>Completed 3-5 years of rigorous training</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1.5">•</span>
                <span>Passed demanding practical and theoretical exams</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1.5">•</span>
                <span>Demonstrated competence in navigation, first aid, and risk assessment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1.5">•</span>
                <span>Committed to ongoing professional development</span>
              </li>
            </ul>
            <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-6 py-2">
              Think of it as the difference between a licensed doctor and someone who read medical articles online.
            </p>
          </div>
        </section>

        {/* The Two International Standards */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">The Two International Standards</h2>
          
          {/* Example Certification Badges */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
              <CertificationBadge
                certification={{
                  certificationType: 'standard',
                  certificationId: 'ifmga-mountain-guide',
                  title: 'IFMGA Mountain Guide',
                  certifyingBody: 'International Federation of Mountain Guides Associations',
                  certificateNumber: 'IFMGA-12345',
                  isPrimary: true
                }}
                displayMode="detailed"
                showTooltip={true}
                isGuideVerified={true}
              />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
              <CertificationBadge
                certification={{
                  certificationType: 'standard',
                  certificationId: 'international-mountain-leader',
                  title: 'International Mountain Leader',
                  certifyingBody: 'Union of International Mountain Leader Associations',
                  certificateNumber: 'IML-67890',
                  isPrimary: true
                }}
                displayMode="detailed"
                showTooltip={true}
                isGuideVerified={true}
              />
            </div>
          </div>
          
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
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Country-by-Country Quick Reference</h2>
          
          {/* Example Regional Certifications */}
          <div className="flex flex-wrap gap-3 mb-8">
            <CertificationBadge 
              certification={{
                certificationType: 'custom',
                title: 'Mountain Leader',
                certifyingBody: 'Mountain Training UK',
                expiryDate: undefined
              }}
              size="mini"
              showTooltip={true}
            />
            <CertificationBadge 
              certification={{
                certificationType: 'custom',
                title: 'Guida di Media Montagna',
                certifyingBody: 'Collegio Nazionale Guide Alpine Italiane',
                expiryDate: undefined
              }}
              size="mini"
              showTooltip={true}
            />
            <CertificationBadge 
              certification={{
                certificationType: 'custom',
                title: 'Accompagnateur en Moyenne Montagne',
                certifyingBody: 'SNAM France',
                expiryDate: undefined
              }}
              size="mini"
              showTooltip={true}
            />
            <CertificationBadge 
              certification={{
                certificationType: 'custom',
                title: 'Wanderleiter',
                certifyingBody: 'Schweizer Bergführerverband',
                expiryDate: undefined
              }}
              size="mini"
              showTooltip={true}
            />
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-base py-4">Country</TableHead>
                      <TableHead className="font-bold text-base py-4">Technical Mountaineering</TableHead>
                      <TableHead className="font-bold text-base py-4">Hiking/Trekking</TableHead>
                      <TableHead className="font-bold text-base py-4">Organization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countryCertifications.map((cert, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <TableCell className="font-semibold py-4">{cert.country}</TableCell>
                        <TableCell className="py-4">{cert.technical}</TableCell>
                        <TableCell className="py-4">{cert.hiking}</TableCell>
                        <TableCell className="py-4 text-muted-foreground">{cert.organization}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Outdoor First Aid Certifications */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Outdoor First Aid Certifications</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent/20">
                      <TableHead className="font-bold text-base py-4">Certification</TableHead>
                      <TableHead className="font-bold text-base py-4">Duration</TableHead>
                      <TableHead className="font-bold text-base py-4">Renewal</TableHead>
                      <TableHead className="font-bold text-base py-4">Best For</TableHead>
                      <TableHead className="font-bold text-base py-4">Recognition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firstAidCertifications.map((cert, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-accent/10'}>
                        <TableCell className="font-semibold py-4">{cert.name}</TableCell>
                        <TableCell className="py-4">{cert.duration}</TableCell>
                        <TableCell className="py-4">{cert.renewal}</TableCell>
                        <TableCell className="py-4">{cert.bestFor}</TableCell>
                        <TableCell className="py-4 text-muted-foreground">{cert.recognition}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 bg-muted/20 border-t">
                <p className="text-sm text-muted-foreground italic">
                  Note: IFMGA and UIMLA require current wilderness first aid as part of certification maintenance.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Your 5-Minute Verification Checklist */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Your 5-Minute Verification Checklist</h2>
          
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
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Member Organizations: What They Mean</h2>
          
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
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Verify Certifications Online</h2>
          <Card className="bg-muted/30">
            <CardContent className="pt-8 pb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-base">IFMGA:</span>{' '}
                    <a href="https://ifmga.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      https://ifmga.net
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-base">UIMLA:</span>{' '}
                    <a href="https://uimla.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      https://uimla.org
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-base">Netherlands:</span>{' '}
                    <a href="https://nlaiml.org/iml/zoek-een-iml/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      https://nlaiml.org/iml/zoek-een-iml/
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-base">UK:</span>{' '}
                    <span className="text-muted-foreground">Mountain Training UK + AMI member directory</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-base">France:</span>{' '}
                    <span className="text-muted-foreground">SNGM member directory</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-base">Other countries:</span>{' '}
                    <span className="text-muted-foreground">Check national association websites</span>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* The Bottom Line */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-12 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The Bottom Line</h2>
            <p className="text-lg font-semibold mb-6">Match the certification to your activity:</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-1">→</span>
                <span className="text-lg"><span className="font-semibold">Technical terrain</span> (glaciers, ropes, climbing) → IFMGA only</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-1">→</span>
                <span className="text-lg"><span className="font-semibold">Hiking/trekking</span> (non-technical mountain trails) → UIMLA/IML/equivalent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-1">→</span>
                <span className="text-lg"><span className="font-semibold">Winter conditions</span> → Check for winter-specific qualifications</span>
              </li>
            </ul>
            <p className="text-lg font-semibold text-primary">Always verify credentials, ask for proof, and trust your instincts.</p>
          </div>
        </section>

        {/* About MadeToHike */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">About MadeToHike</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Europe's premier marketplace for certified mountain guides. 
              Every guide verified, every certification checked.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="gap-2 bg-white text-primary hover:bg-white/90 font-semibold"
            >
              Find your perfect adventure at madetohike.com 🥾⛰️
            </Button>
          </div>
        </section>
        </div>
      </div>
    </MainLayout>
  );
}