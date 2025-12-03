import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { guideUserId } = await req.json();

    if (!guideUserId) {
      return new Response(
        JSON.stringify({ error: 'Guide user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`GDPR deletion initiated for guide: ${guideUserId} by admin: ${user.id}`);

    // 1. Get guide profile for storage paths
    const { data: guideProfile } = await supabase
      .from('guide_profiles')
      .select('*')
      .eq('user_id', guideUserId)
      .single();

    // 2. Get all tours for this guide
    const { data: tours } = await supabase
      .from('tours')
      .select('id, images, gpx_file_path')
      .eq('guide_id', guideUserId);

    // 3. Delete storage files
    const storageFilesToDelete: { bucket: string; paths: string[] }[] = [];

    // Guide profile images
    if (guideProfile?.profile_image_url) {
      const path = extractStoragePath(guideProfile.profile_image_url);
      if (path) storageFilesToDelete.push({ bucket: 'hero-images', paths: [path] });
    }
    if (guideProfile?.hero_background_url) {
      const path = extractStoragePath(guideProfile.hero_background_url);
      if (path) storageFilesToDelete.push({ bucket: 'hero-images', paths: [path] });
    }

    // Portfolio images
    if (guideProfile?.portfolio_images?.length) {
      const paths = guideProfile.portfolio_images
        .map((url: string) => extractStoragePath(url))
        .filter(Boolean);
      if (paths.length) storageFilesToDelete.push({ bucket: 'tour-images', paths });
    }

    // Guide videos
    if (guideProfile?.intro_video_file_path) {
      storageFilesToDelete.push({ bucket: 'guide-videos', paths: [guideProfile.intro_video_file_path] });
    }

    // Certification documents
    if (guideProfile?.certifications?.length) {
      const certPaths = guideProfile.certifications
        .map((cert: any) => cert.certificateDocument)
        .filter(Boolean);
      if (certPaths.length) storageFilesToDelete.push({ bucket: 'guide-documents', paths: certPaths });
    }

    // Tour images and GPX files
    if (tours?.length) {
      const tourImagePaths: string[] = [];
      const gpxPaths: string[] = [];

      for (const tour of tours) {
        if (tour.images?.length) {
          tour.images.forEach((url: string) => {
            const path = extractStoragePath(url);
            if (path) tourImagePaths.push(path);
          });
        }
        if (tour.gpx_file_path) {
          gpxPaths.push(tour.gpx_file_path);
        }
      }

      if (tourImagePaths.length) storageFilesToDelete.push({ bucket: 'tour-images', paths: tourImagePaths });
      if (gpxPaths.length) storageFilesToDelete.push({ bucket: 'tour-images', paths: gpxPaths }); // GPX stored in tour-images
    }

    // Delete storage files
    for (const { bucket, paths } of storageFilesToDelete) {
      if (paths.length) {
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove(paths);
        
        if (storageError) {
          console.warn(`Warning: Failed to delete from ${bucket}:`, storageError);
        } else {
          console.log(`Deleted ${paths.length} files from ${bucket}`);
        }
      }
    }

    // 4. Delete database records (order matters due to foreign keys)
    const tourIds = tours?.map(t => t.id) || [];

    // Delete tour date slots
    if (tourIds.length) {
      await supabase.from('tour_date_slots').delete().in('tour_id', tourIds);
      console.log('Deleted tour date slots');
    }

    // Delete bookings related data
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .in('tour_id', tourIds);
    
    const bookingIds = bookings?.map(b => b.id) || [];
    if (bookingIds.length) {
      await supabase.from('participant_documents').delete().in('booking_id', bookingIds);
      await supabase.from('participant_tokens').delete().in('booking_id', bookingIds);
      await supabase.from('reviews').delete().in('booking_id', bookingIds);
      await supabase.from('email_logs').delete().in('booking_id', bookingIds);
      await supabase.from('discount_code_usage').delete().in('booking_id', bookingIds);
      await supabase.from('bookings').delete().in('id', bookingIds);
      console.log('Deleted bookings and related records');
    }

    // Delete tours
    if (tourIds.length) {
      await supabase.from('tours').delete().in('id', tourIds);
      console.log('Deleted tours');
    }

    // Delete conversations and messages
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('guide_id', guideUserId);
    
    const conversationIds = conversations?.map(c => c.id) || [];
    if (conversationIds.length) {
      await supabase.from('messages').delete().in('conversation_id', conversationIds);
      await supabase.from('chat_attachments').delete().in('conversation_id', conversationIds);
      await supabase.from('conversations').delete().in('id', conversationIds);
      console.log('Deleted conversations');
    }

    // Delete guide-specific records
    await supabase.from('email_templates').delete().eq('guide_id', guideUserId);
    await supabase.from('automated_messages').delete().eq('guide_id', guideUserId);
    await supabase.from('chat_message_templates').delete().eq('guide_id', guideUserId);
    await supabase.from('discount_codes').delete().eq('guide_id', guideUserId);
    await supabase.from('followed_guides').delete().eq('guide_id', guideUserId);
    console.log('Deleted guide-specific records');

    // Delete user verification
    await supabase.from('user_verifications').delete().eq('user_id', guideUserId);
    console.log('Deleted user verification');

    // Delete guide profile
    await supabase.from('guide_profiles').delete().eq('user_id', guideUserId);
    console.log('Deleted guide profile');

    // Delete user roles
    await supabase.from('user_roles').delete().eq('user_id', guideUserId);
    console.log('Deleted user roles');

    // Delete user profile
    await supabase.from('profiles').delete().eq('id', guideUserId);
    console.log('Deleted user profile');

    // 5. Delete auth user (this must be last)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(guideUserId);
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      // Don't fail the whole operation if auth deletion fails
    } else {
      console.log('Deleted auth user');
    }

    console.log(`GDPR deletion completed for guide: ${guideUserId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Guide data permanently deleted',
        deletedUserId: guideUserId,
        deletedBy: user.id,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('GDPR deletion error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper to extract storage path from full URL
function extractStoragePath(url: string): string | null {
  if (!url) return null;
  
  // Handle Supabase storage URLs
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
  if (match) return match[1];
  
  // Handle signed URLs
  const signedMatch = url.match(/\/storage\/v1\/object\/sign\/[^/]+\/([^?]+)/);
  if (signedMatch) return signedMatch[1];
  
  // If it doesn't look like a full URL, assume it's already a path
  if (!url.startsWith('http')) return url;
  
  return null;
}
