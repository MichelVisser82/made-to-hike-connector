import { supabase } from '@/integrations/supabase/client';

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface CustomData {
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  contentName?: string;
  numItems?: number;
  searchString?: string;
  status?: string;
}

// Get Facebook cookies from browser
const getFacebookCookies = (): { fbc?: string; fbp?: string } => {
  if (typeof document === 'undefined') return {};
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return {
    fbc: cookies['_fbc'],
    fbp: cookies['_fbp'],
  };
};

// Generate unique event ID for deduplication
const generateEventId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Send event to server-side CAPI
const sendEvent = async (
  eventName: string,
  userData?: UserData,
  customData?: CustomData,
  eventId?: string
): Promise<void> => {
  try {
    const { fbc, fbp } = getFacebookCookies();
    
    const { error } = await supabase.functions.invoke('facebook-capi', {
      body: {
        eventName,
        eventId: eventId || generateEventId(),
        eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        userData: {
          ...userData,
          clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          fbc,
          fbp,
        },
        customData,
      },
    });

    if (error) {
      console.error(`[facebookCapi] Error sending ${eventName}:`, error);
    }
  } catch (err) {
    console.error(`[facebookCapi] Failed to send ${eventName}:`, err);
  }
};

// Track Purchase event (server-side)
export const trackPurchase = async (data: {
  value: number;
  currency: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  email?: string;
  eventId?: string;
}): Promise<void> => {
  await sendEvent(
    'Purchase',
    { email: data.email },
    {
      value: data.value,
      currency: data.currency,
      contentIds: data.contentIds,
      contentName: data.contentName,
      contentType: 'product',
      numItems: data.numItems,
    },
    data.eventId
  );
};

// Track InitiateCheckout event
export const trackInitiateCheckout = async (data: {
  value: number;
  currency: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  email?: string;
}): Promise<void> => {
  await sendEvent(
    'InitiateCheckout',
    { email: data.email },
    {
      value: data.value,
      currency: data.currency,
      contentIds: data.contentIds,
      contentName: data.contentName,
      contentType: 'product',
      numItems: data.numItems,
    }
  );
};

// Track CompleteRegistration event
export const trackCompleteRegistration = async (data: {
  contentName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  status?: string;
}): Promise<void> => {
  await sendEvent(
    'CompleteRegistration',
    {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      country: data.country,
    },
    {
      contentName: data.contentName,
      status: data.status || 'submitted',
    }
  );
};

// Track Contact event
export const trackContact = async (data: {
  email?: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> => {
  await sendEvent(
    'Contact',
    {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    }
  );
};

// Track ViewContent event
export const trackViewContent = async (data: {
  contentIds?: string[];
  contentName?: string;
  contentType?: string;
  value?: number;
  currency?: string;
}): Promise<void> => {
  await sendEvent(
    'ViewContent',
    {},
    {
      contentIds: data.contentIds,
      contentName: data.contentName,
      contentType: data.contentType || 'product',
      value: data.value,
      currency: data.currency,
    }
  );
};

// Track Search event
export const trackSearch = async (data: {
  searchString: string;
  contentIds?: string[];
}): Promise<void> => {
  await sendEvent(
    'Search',
    {},
    {
      searchString: data.searchString,
      contentIds: data.contentIds,
    }
  );
};

// Track Lead event
export const trackLead = async (data: {
  email?: string;
  firstName?: string;
  lastName?: string;
  contentName?: string;
  value?: number;
  currency?: string;
}): Promise<void> => {
  await sendEvent(
    'Lead',
    {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    {
      contentName: data.contentName,
      value: data.value,
      currency: data.currency,
    }
  );
};
