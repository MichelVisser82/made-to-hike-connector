import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadButtonProps {
  conversationId: string;
  onUploadComplete?: () => void;
}

export function ImageUploadButton({ conversationId, onUploadComplete }: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${conversationId}/${fileName}`;

      // Upload to chat-attachments bucket
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      // Create message with attachment
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          sender_type: 'hiker',
          message_type: 'image',
          content: '[Image]',
          attachment_url: publicUrl,
          attachment_type: file.type,
          moderation_status: 'approved'
        });

      if (msgError) throw msgError;

      toast({
        title: 'Image uploaded',
        description: 'Your image has been sent'
      });

      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
        disabled={uploading}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          asChild
        >
          <span className="cursor-pointer">
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Attach Image'}
          </span>
        </Button>
      </label>
    </>
  );
}
