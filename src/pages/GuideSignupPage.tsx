import { GuideSignupFlow } from '@/components/guide-signup/GuideSignupFlow';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEffect } from 'react';

export default function GuideSignupPage() {
  useEffect(() => {
    document.title = 'Become a Guide | MadeToHike';
  }, []);

  return (
    <MainLayout>
      <GuideSignupFlow />
    </MainLayout>
  );
}
