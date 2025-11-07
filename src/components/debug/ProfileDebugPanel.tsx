import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMyGuideProfile, useRefreshMyGuideProfile, type ProfileError } from '@/hooks/useGuideProfile';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Bug, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileDebugPanel() {
  const { user } = useAuth();
  const { data: guideProfile, isLoading, error } = useMyGuideProfile();
  const refreshProfile = useRefreshMyGuideProfile();
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const profileError = error as ProfileError | null;

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Check auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      results.tests.auth = {
        passed: !!authUser && !authError,
        userId: authUser?.id,
        email: authUser?.email,
        error: authError?.message
      };

      // Test 2: Check role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id || '')
        .maybeSingle();
      
      results.tests.role = {
        passed: !!roleData && !roleError,
        role: roleData?.role,
        error: roleError?.message
      };

      // Test 3: Check guide profile (direct query)
      const { data: profileData, error: profileError, status, statusText } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', user?.id || '')
        .maybeSingle();
      
      results.tests.profile = {
        passed: !!profileData && !profileError,
        hasData: !!profileData,
        status: status,
        statusText: statusText,
        error: profileError?.message,
        errorCode: profileError?.code,
        errorDetails: profileError?.details
      };

      setTestResults(results);
      toast.success('Diagnostics complete');
    } catch (error: any) {
      results.error = error.message;
      setTestResults(results);
      toast.error('Diagnostics failed');
    } finally {
      setTesting(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-blue-500 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-blue-600" />
          Profile Debug Panel
          <Badge variant="outline" className="ml-auto">DEV ONLY</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Current State</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>User ID:</div>
            <div className="font-mono text-xs">{user?.id || 'N/A'}</div>
            
            <div>User Email:</div>
            <div>{user?.email || 'N/A'}</div>
            
            <div>Loading:</div>
            <div>{isLoading ? 'Yes' : 'No'}</div>
            
            <div>Has Profile:</div>
            <div>{guideProfile ? 'Yes' : 'No'}</div>
            
            <div>Error Type:</div>
            <div>{profileError?.type || 'None'}</div>
            
            {guideProfile && (
              <>
                <div>Display Name:</div>
                <div>{guideProfile.display_name}</div>
                
                <div>Verified:</div>
                <div>{guideProfile.verified ? 'Yes' : 'No'}</div>
                
                <div>Profile Complete:</div>
                <div>{guideProfile.profile_completed ? 'Yes' : 'No'}</div>
                
                <div>Stripe Connected:</div>
                <div>{(guideProfile as any).stripe_account_id ? 'Yes' : 'No'}</div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={refreshProfile} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh Profile
          </Button>
          <Button onClick={runDiagnostics} variant="outline" size="sm" disabled={testing}>
            {testing ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Testing...
              </>
            ) : (
              <>Run Diagnostics</>
            )}
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold">Diagnostic Results</h3>
            <div className="space-y-2">
              {Object.entries(testResults.tests).map(([key, result]: [string, any]) => (
                <div key={key} className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium capitalize">{key}:</span>
                  <span>{result.passed ? 'Passed' : 'Failed'}</span>
                  {result.error && (
                    <span className="text-red-600 text-xs">({result.error})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Details */}
        {profileError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div><strong>Type:</strong> {profileError.type}</div>
                <div><strong>Message:</strong> {profileError.message}</div>
                {profileError.originalError && (
                  <div className="text-xs font-mono mt-2">
                    {JSON.stringify(profileError.originalError, null, 2)}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
