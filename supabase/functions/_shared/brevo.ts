// Brevo Newsletter List ID
export const BREVO_NEWSLETTER_LIST_ID = 5;

interface BrevoContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType: 'HIKER' | 'GUIDE';
  source: string;
  attributes?: Record<string, string | boolean | number>;
}

/**
 * Sync contact to Brevo Newsletter list with USER_TYPE tag
 * Handles duplicates gracefully with updateEnabled: true
 */
export async function syncToBrevo(data: BrevoContactData): Promise<void> {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    console.warn('BREVO_API_KEY not configured, skipping Brevo sync');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        email: data.email.toLowerCase().trim(),
        listIds: [BREVO_NEWSLETTER_LIST_ID],
        updateEnabled: true, // Update if contact exists (handles duplicates)
        attributes: {
          FIRSTNAME: data.firstName || '',
          LASTNAME: data.lastName || '',
          USER_TYPE: data.userType,
          SOURCE: data.source,
          SIGNUP_DATE: new Date().toISOString().split('T')[0],
          ...data.attributes,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Don't throw for duplicate contacts - updateEnabled should handle it
      if (errorData.code === 'duplicate_parameter') {
        console.log('Brevo: Contact already exists, attributes updated:', data.email);
        return;
      }
      console.error('Brevo API error:', errorData);
    } else {
      console.log('Brevo: Successfully synced contact:', data.email, 'as', data.userType);
    }
  } catch (error) {
    // Don't fail the signup if Brevo sync fails
    console.error('Brevo: Failed to sync contact:', error);
  }
}
