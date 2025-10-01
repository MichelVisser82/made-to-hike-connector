import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function CertificationsPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home with certifications page state for consistent layout
    navigate('/?page=certifications', { replace: true });
  }, [navigate]);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </>
  );
}
