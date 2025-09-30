import { GuideSignupFlow } from '@/components/guide-signup/GuideSignupFlow';
import { useEffect } from 'react';

export default function GuideSignupPage() {
  useEffect(() => {
    document.title = 'Become a Guide | MadeToHike';
  }, []);

  return <GuideSignupFlow />;
}
