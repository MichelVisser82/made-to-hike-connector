import { AlertTriangle, Shield, Users, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface SafetyInformationCardProps {
  safetyRecord?: string;
}

export function SafetyInformationCard({ safetyRecord }: SafetyInformationCardProps) {
  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Comprehensive Insurance',
      description: 'Full coverage for all tours and activities'
    },
    {
      icon: Users,
      title: 'Small Group Sizes',
      description: 'Maximum attention and safety for every participant'
    },
    {
      icon: FileText,
      title: 'Emergency Protocols',
      description: 'Detailed safety procedures and emergency plans'
    },
    {
      icon: CheckCircle,
      title: 'Safety Track Record',
      description: safetyRecord || 'Excellent safety record across all tours'
    }
  ];

  return (
    <Card className="border-burgundy/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-5 w-5 text-burgundy" />
          <h3 className="text-xl font-semibold" style={{fontFamily: 'Playfair Display, serif'}}>
            Safety Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-burgundy" />
              </div>
              <div>
                <h4 className="font-semibold text-charcoal mb-1">{feature.title}</h4>
                <p className="text-sm text-charcoal/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
