/**
 * Template variable replacement utility
 * Shared between send-message and process-automated-emails
 */

export interface VariableData {
  guestFirstName?: string;
  guestLastName?: string;
  guestFullName?: string;
  tourName?: string;
  tourDate?: string;
  guestCount?: number;
  guideName?: string;
  meetingPoint?: string;
  startTime?: string;
}

/**
 * Extract first name from full name
 */
export const extractFirstName = (fullName: string | null | undefined): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || '';
};

/**
 * Extract last name from full name
 */
export const extractLastName = (fullName: string | null | undefined): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

/**
 * Format date for messages
 */
export const formatMessageDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return '';
  }
};

/**
 * Replace template variables with actual data
 */
export const replaceTemplateVariables = (
  template: string,
  data: VariableData
): string => {
  let result = template;

  const replacements: Record<string, string> = {
    '{guest-firstname}': data.guestFirstName || 'there',
    '{guest-name}': data.guestFirstName || 'there', // Alias for guest-firstname
    '{guest-lastname}': data.guestLastName || '',
    '{guest-fullname}': data.guestFullName || 'Guest',
    '{tour-name}': data.tourName || 'the tour',
    '{tour-date}': data.tourDate || 'your tour date',
    '{guest-count}': data.guestCount?.toString() || '1',
    '{guide-name}': data.guideName || 'your guide',
    '{meeting-point}': data.meetingPoint || 'the meeting point',
    '{start-time}': data.startTime || '09:00',
  };

  Object.entries(replacements).forEach(([variable, value]) => {
    result = result.replace(new RegExp(variable, 'g'), value);
  });

  return result;
};
