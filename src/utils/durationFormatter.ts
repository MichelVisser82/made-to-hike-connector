/**
 * Duration formatting utilities for tour creation
 * Converts numeric day values to user-friendly text and vice versa
 */

/**
 * Convert numeric days to formatted display text
 * @param days - Number of days (supports half-day increments: 0.5, 1, 1.5, etc.)
 * @returns Formatted string like "Half day", "1 Day", "1½ Days", "1 Week", etc.
 */
export function formatDurationFromDays(days: number): string {
  // Special cases for common durations
  if (days === 0.5) return "Half day";
  if (days === 1) return "1 Day";
  if (days === 7) return "1 Week";
  if (days === 14) return "2 Weeks";
  if (days === 21) return "3 Weeks";
  if (days === 28) return "4 Weeks";
  
  // Check if value has a half-day component
  const hasHalf = days % 1 !== 0;
  const wholeDays = Math.floor(days);
  
  if (hasHalf) {
    return `${wholeDays}½ Days`;
  }
  
  // Whole number of days
  return `${wholeDays} Days`;
}

/**
 * Parse existing string duration format to numeric days
 * Handles backward compatibility with existing tour data
 * @param durationStr - String like "1 day", "2 days", "1 Week", "2 Weeks", etc.
 * @returns Number of days (1, 2, 7, 14, etc.)
 */
export function parseDurationStringToDays(durationStr: string): number {
  if (!durationStr || typeof durationStr !== 'string') {
    return 1; // Default to 1 day
  }

  const normalized = durationStr.toLowerCase().trim();
  
  // Handle "X day(s)" format
  if (normalized.includes('day')) {
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*days?/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  // Handle "X week(s)" format
  if (normalized.includes('week')) {
    const match = normalized.match(/(\d+(?:\.\d+)?)\s*weeks?/);
    if (match) {
      return parseFloat(match[1]) * 7;
    }
  }
  
  // Handle half-day format
  if (normalized.includes('half')) {
    return 0.5;
  }
  
  // Try to extract any number
  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }
  
  // Default to 1 day if parsing fails
  return 1;
}

/**
 * Get preset duration values for quick selection buttons
 * @returns Array of preset objects with value (in days) and label
 */
export function getDurationPresets() {
  return [
    { value: 0.5, label: "Half Day" },
    { value: 1, label: "1 Day" },
    { value: 3, label: "3 Days" },
    { value: 7, label: "1 Week" },
    { value: 14, label: "2 Weeks" },
  ];
}
