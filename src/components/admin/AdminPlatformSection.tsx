import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GuideVerificationManager } from './GuideVerificationManager';
import { DiscountCodesManager } from '../dashboard/policy/DiscountCodesManager';
import { PlatformFeeSettings } from './PlatformFeeSettings';
import { ProcessingPaymentsPanel } from './ProcessingPaymentsPanel';
import { VerificationSettings } from './VerificationSettings';

export function AdminPlatformSection() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('verifications');
  
  // Auto-switch tabs based on URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-charcoal mb-2">Platform Management</h1>
        <p className="text-charcoal/60">Manage guide verifications and platform-wide discount codes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="verifications"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Guide Verifications
          </TabsTrigger>
          <TabsTrigger 
            value="processing-payments"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Processing Payments
          </TabsTrigger>
          <TabsTrigger 
            value="discount-codes"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Discount Codes
          </TabsTrigger>
          <TabsTrigger 
            value="platform-fees"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Platform Fees
          </TabsTrigger>
          <TabsTrigger 
            value="verification-settings"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-cream-light"
          >
            Verification Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verifications">
          <GuideVerificationManager />
        </TabsContent>

        <TabsContent value="processing-payments">
          <ProcessingPaymentsPanel />
        </TabsContent>

        <TabsContent value="discount-codes">
          <DiscountCodesManager isAdmin={true} />
        </TabsContent>

        <TabsContent value="platform-fees">
          <PlatformFeeSettings />
        </TabsContent>

        <TabsContent value="verification-settings">
          <VerificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
