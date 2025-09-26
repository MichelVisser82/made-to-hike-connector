import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Monitor, Smartphone, Image as ImageIcon, Zap } from 'lucide-react';

export function ImageSizeGuide() {
  const recommendations = [
    {
      category: 'Hero Images',
      dimensions: '1920 x 1080px',
      maxSize: '2MB',
      usage: 'Full-screen backgrounds, main landing sections',
      icon: <Monitor className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      category: 'Gallery/Card Images', 
      dimensions: '800 x 600px',
      maxSize: '500KB',
      usage: 'Tour cards, image galleries, featured content',
      icon: <ImageIcon className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      category: 'Thumbnails',
      dimensions: '400 x 300px', 
      maxSize: '200KB',
      usage: 'Small previews, list items, quick loading',
      icon: <Smartphone className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      category: 'Profile Pictures',
      dimensions: '200 x 200px',
      maxSize: '100KB', 
      usage: 'User avatars, guide portraits, circular crops',
      icon: <ImageIcon className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Image Size Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Optimize your images for better performance and lower costs. Our auto-optimization follows these guidelines:
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div key={rec.category} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                {rec.icon}
                <h4 className="font-semibold text-sm">{rec.category}</h4>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Size:</span>
                  <Badge variant="outline" className="text-xs">
                    {rec.dimensions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Max:</span>
                  <Badge className={`text-xs ${rec.color}`}>
                    {rec.maxSize}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {rec.usage}
              </p>
            </div>
          ))}
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <div className="text-sm">
            <p className="font-medium text-green-900 mb-1">Auto-optimization benefits:</p>
            <ul className="text-green-700 space-y-1 text-xs">
              <li>• Reduces storage costs by 60-90%</li>
              <li>• Improves page load times significantly</li>
              <li>• Maintains visual quality for web display</li>
              <li>• Automatically handles aspect ratio preservation</li>
              <li>• Converts to optimal JPEG format</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}