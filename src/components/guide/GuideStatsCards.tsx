import { Backpack, Star, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import type { GuideStats } from '@/types/guide';

interface GuideStatsCardsProps {
  stats: GuideStats;
}

export function GuideStatsCards({ stats }: GuideStatsCardsProps) {
  const statCards = [
    {
      icon: Backpack,
      value: `${stats.tours_completed}+`,
      label: 'Tours Completed',
      color: 'text-primary',
    },
    {
      icon: Star,
      value: stats.average_rating.toFixed(1),
      label: 'Average Rating',
      color: 'text-yellow-500',
    },
    {
      icon: Users,
      value: `${stats.total_hikers}+`,
      label: 'Happy Hikers',
      color: 'text-green-600',
    },
  ];

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:shadow-elegant transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
