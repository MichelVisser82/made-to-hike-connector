import { Progress } from '../ui/progress';

interface ReviewCategoryRatingsProps {
  ratings: {
    safety: number;
    knowledge: number;
    communication: number;
    value: number;
  };
}

export function ReviewCategoryRatings({ ratings }: ReviewCategoryRatingsProps) {
  const categories = [
    { label: 'Safety', value: ratings.safety },
    { label: 'Knowledge', value: ratings.knowledge },
    { label: 'Communication', value: ratings.communication },
    { label: 'Value', value: ratings.value },
  ];

  return (
    <div className="mb-8 p-6 bg-burgundy/5 rounded-lg border border-burgundy/10">
      <h3 className="text-lg font-semibold mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
        Rating Breakdown
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-charcoal">{cat.label}</span>
              <span className="text-sm font-bold text-burgundy">{cat.value.toFixed(1)}/5.0</span>
            </div>
            <Progress 
              value={(cat.value / 5) * 100} 
              className="h-2 bg-burgundy/10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
