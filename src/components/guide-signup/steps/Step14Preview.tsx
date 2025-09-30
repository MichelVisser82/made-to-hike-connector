import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GuideSignupData } from '@/types/guide';

interface Step14PreviewProps {
  data: Partial<GuideSignupData>;
  onNext: () => void;
  onBack: () => void;
}

export function Step14Preview({ data, onNext, onBack }: Step14PreviewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Preview Your Profile
          </CardTitle>
          <p className="text-muted-foreground">Review your information before submitting</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Basic Information</h3>
            <p><strong>Name:</strong> {data.display_name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Location:</strong> {data.location}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {data.specialties?.map((s, i) => (
                <Badge key={i} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Certifications</h3>
            {data.certifications?.map((cert, i) => (
              <div key={i} className="mb-2">
                <p className="font-medium">{cert.title}</p>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Group Size</h3>
            <p>{data.min_group_size} - {data.max_group_size} people</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Daily Rate</h3>
            <p>{data.daily_rate_currency === 'EUR' ? '€' : '£'}{data.daily_rate}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-sm">{data.bio}</p>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>Back to Edit</Button>
            <Button onClick={onNext}>Looks Good!</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
