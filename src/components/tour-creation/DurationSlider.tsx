import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDurationFromDays, getDurationPresets } from '@/utils/durationFormatter';

interface DurationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function DurationSlider({ value, onChange }: DurationSliderProps) {
  const presets = getDurationPresets();
  const formattedDuration = formatDurationFromDays(value);

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant={value === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(preset.value)}
            className="transition-all"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={0.5}
          max={30}
          step={0.5}
          className="w-full"
        />
        
        {/* Range indicators */}
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Half day</span>
          <span>30 days</span>
        </div>
      </div>

      {/* Duration Display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-foreground animate-in fade-in duration-200">
          {formattedDuration}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          💡 Use the slider or preset buttons for precise control
        </p>
      </div>
    </div>
  );
}
