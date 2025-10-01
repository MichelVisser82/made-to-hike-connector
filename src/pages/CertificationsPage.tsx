import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { CertificationsContent } from '@/components/pages/CertificationsContent';

export default function CertificationsPage() {
  return (
    <>
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
      <MainLayout>
        <CertificationsContent />
      </MainLayout>
    </>
  );
}
