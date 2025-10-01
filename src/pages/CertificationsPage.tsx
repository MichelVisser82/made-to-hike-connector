import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { CertificationsContent } from '@/components/pages/CertificationsContent';

export default function CertificationsPage() {
  return (
    <>
      <Helmet>
        <title>Mountain Guide Certifications Reference Guide | MadeToHike</title>
        <meta 
          name="description" 
          content="Comprehensive guide to mountain guide certifications across Europe. Compare IFMGA, UIAGM, and national certifications to understand guide qualifications and safety standards." 
        />
        <meta 
          name="keywords" 
          content="mountain guide certifications, IFMGA, UIAGM, guide qualifications, mountain safety, certified guides, alpine certifications" 
        />
        <link rel="canonical" href="https://madetohike.com/certifications" />
      </Helmet>
      <MainLayout>
        <CertificationsContent />
      </MainLayout>
    </>
  );
}
