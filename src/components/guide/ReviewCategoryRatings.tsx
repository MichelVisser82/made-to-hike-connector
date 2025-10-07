import { Progress } from '../ui/progress';
import { Star } from 'lucide-react';

interface ReviewCategoryRatingsProps {
  ratings: {
    safety: number;
    knowledge: number;
    communication: number;
    value: number;
    overall: number;
  };
  recommendPercentage?: number;
  aboveBeyondPercentage?: number;
}

export function ReviewCategoryRatings({ ratings, recommendPercentage = 98, aboveBeyondPercentage = 95 }: ReviewCategoryRatingsProps) {
  const categories = [
    { label: 'Safety', value: ratings.safety },
    { label: 'Knowledge', value: ratings.knowledge },
    { label: 'Communication', value: ratings.communication },
    { label: 'Value', value: ratings.value },
    { label: 'Overall', value: ratings.overall },
  ];

  return (
    <div className="space-y-6">
      {/* Rating bars */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-4">
            <span className="text-charcoal/70 font-medium w-32">{cat.label}</span>
            <div className="flex-1">
              <Progress 
                value={(cat.value / 5) * 100} 
                className="h-3"
              />
            </div>
            <div className="flex items-center gap-1 w-16 justify-end">
              <span className="text-charcoal font-semibold">{cat.value.toFixed(1)}</span>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-green-700 mb-2">{recommendPercentage}%</div>
          <div className="text-green-800 font-medium">Would Recommend</div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-rose-700 mb-2">{aboveBeyondPercentage}%</div>
          <div className="text-rose-800 font-medium">Went Above & Beyond</div>
        </div>
      </div>
    </div>
  );
}
