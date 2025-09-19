import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Upload } from 'lucide-react';
import { type User } from '../../types';

interface VerificationFlowProps {
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export function VerificationFlow({ user, onComplete, onCancel }: VerificationFlowProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Guide Verification</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Professional Guiding Certificate</p>
                <p className="text-sm text-muted-foreground">Valid certification from recognized authority</p>
              </div>
              <Button size="sm" variant="outline">Upload</Button>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Insurance Documentation</p>
                <p className="text-sm text-muted-foreground">Professional liability and public liability insurance</p>
              </div>
              <Button size="sm" variant="outline">Upload</Button>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">First Aid Certificate</p>
                <p className="text-sm text-muted-foreground">Current wilderness first aid certification</p>
              </div>
              <Button size="sm" variant="outline">Upload</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={onComplete} className="flex-1">
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}