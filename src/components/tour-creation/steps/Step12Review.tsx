import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormContext } from 'react-hook-form';
import { TourFormData } from '@/hooks/useTourCreation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Edit } from 'lucide-react';

interface Step12ReviewProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  editMode?: boolean;
}

export default function Step12Review({ onSubmit, isSubmitting, editMode = false }: Step12ReviewProps) {
  const form = useFormContext<TourFormData>();
  const data = form.getValues();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="font-semibold">{data.title}</div>
            <div className="space-y-2 mt-2">
              <div>
                <div className="text-sm text-muted-foreground">Short Description</div>
                <p className="text-sm">{data.short_description}</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Full Description</div>
                <p className="text-sm text-muted-foreground">{data.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Location & Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Region</div>
              <div className="font-medium capitalize">{data.region}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{data.duration}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
              <div className="font-medium capitalize">{data.difficulty}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Group Size</div>
              <div className="font-medium">{data.group_size} people</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Meeting Point</div>
            <div className="font-medium">{data.meeting_point}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pricing</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(11)}>
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.currency === 'EUR' ? '€' : '£'}{(data.price + (data.service_fee || 0)).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">per person</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Highlights</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(8)}>
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {data.highlights?.map((highlight, index) => (
              <li key={index} className="text-sm">• {highlight}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Dates</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(6)}>
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.available_dates?.map((date, index) => (
              <Badge key={index} variant="secondary">
                {format(date, 'PP P')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inclusions</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEdit(10)}>
            <Edit className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold mb-2 text-green-600">Included</div>
              <ul className="space-y-1">
                {data.includes?.map((item, index) => (
                  <li key={index} className="text-sm">✓ {item}</li>
                ))}
              </ul>
            </div>
            {data.excluded_items && data.excluded_items.length > 0 && (
              <div>
                <div className="text-sm font-semibold mb-2 text-red-600">Excluded</div>
                <ul className="space-y-1">
                  {data.excluded_items.map((item, index) => (
                    <li key={index} className="text-sm">✗ {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-8"
        >
          {isSubmitting ? (editMode ? 'Updating...' : 'Publishing...') : (editMode ? 'Update Tour' : 'Publish Tour')}
        </Button>
      </div>
    </div>
  );
}
