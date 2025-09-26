import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Tag, Trash2 } from 'lucide-react';

export function ImageManager() {
  const { images, loading, uploadImage, getImageUrl, fetchImages } = useWebsiteImages();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMetadata, setUploadMetadata] = useState({
    category: '',
    tags: '',
    alt_text: '',
    description: '',
    usage_context: '',
    priority: '0',
  });

  const categories = [
    'hero', 'landscape', 'hiking', 'portrait', 'detail', 
    'equipment', 'nature', 'mountains', 'trails', 'adventure'
  ];

  const usageContexts = [
    'landing', 'tours', 'about', 'contact', 'search', 
    'booking', 'testimonials', 'gallery', 'background'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadMetadata.category) {
      toast.error('Please select files and category');
      return;
    }

    setUploading(true);
    try {
      const metadata = {
        category: uploadMetadata.category,
        tags: uploadMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        alt_text: uploadMetadata.alt_text,
        description: uploadMetadata.description,
        usage_context: uploadMetadata.usage_context.split(',').map(ctx => ctx.trim()).filter(Boolean),
        priority: parseInt(uploadMetadata.priority) || 0,
      };

      for (const file of selectedFiles) {
        await uploadImage(file, metadata);
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} image(s)`);
      setSelectedFiles([]);
      setUploadMetadata({
        category: '',
        tags: '',
        alt_text: '',
        description: '',
        usage_context: '',
        priority: '0',
      });
    } catch (error) {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="files">Select Images</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={uploadMetadata.category}
                onValueChange={(value) => 
                  setUploadMetadata(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority (0-10)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="10"
                value={uploadMetadata.priority}
                onChange={(e) => 
                  setUploadMetadata(prev => ({ ...prev, priority: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={uploadMetadata.tags}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, tags: e.target.value }))
              }
              placeholder="mountain, sunset, hiking, adventure"
            />
          </div>

          <div>
            <Label htmlFor="usage_context">Usage Context (comma-separated)</Label>
            <Input
              id="usage_context"
              value={uploadMetadata.usage_context}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, usage_context: e.target.value }))
              }
              placeholder="landing, tours, about"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {usageContexts.join(', ')}
            </p>
          </div>

          <div>
            <Label htmlFor="alt_text">Alt Text</Label>
            <Input
              id="alt_text"
              value={uploadMetadata.alt_text}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, alt_text: e.target.value }))
              }
              placeholder="Descriptive text for accessibility"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={uploadMetadata.description}
              onChange={(e) => 
                setUploadMetadata(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detailed description of the image"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || selectedFiles.length === 0 || !uploadMetadata.category}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Library ({images.length} images)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading images...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-3 space-y-2">
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt_text || image.file_name}
                    className="w-full h-40 object-cover rounded"
                  />
                  <div className="space-y-1">
                    <p className="font-medium text-sm truncate">{image.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Category: {image.category} | Priority: {image.priority}
                    </p>
                    {image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {image.usage_context.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.usage_context.slice(0, 2).map((context) => (
                          <Badge key={context} variant="outline" className="text-xs">
                            {context}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}