import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Eye, Edit2, Trash2, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ExtendedWebsiteImage {
  id: string;
  file_name: string;
  file_path: string;
  bucket_id: string;
  category: string;
  tags: string[];
  alt_text: string | null;
  description: string | null;
  usage_context: string[] | null;
  priority: number | null;
  is_active: boolean | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  uploader_name: string;
  uploader_role: string;
}

export const ImageOverview = () => {
  const { images, loading, fetchImages } = useWebsiteImages();
  const [extendedImages, setExtendedImages] = useState<ExtendedWebsiteImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<ExtendedWebsiteImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<ExtendedWebsiteImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    alt_text: '',
    description: '',
    tags: '',
    category: '',
    usage_context: '',
    priority: 5,
    is_active: true
  });

  // Fetch extended image data with uploader info
  useEffect(() => {
    const fetchExtendedImages = async () => {
      try {
        const { data: imageData, error } = await supabase
          .from('website_images')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch uploader info separately for images that have uploaded_by
        const uploaderIds = [...new Set(imageData?.filter(img => img.uploaded_by).map(img => img.uploaded_by))];
        
        let uploaderInfo: Record<string, { name?: string; role?: string }> = {};
        if (uploaderIds.length > 0) {
          const [profilesData, rolesData] = await Promise.all([
            supabase.from('profiles').select('id, name').in('id', uploaderIds),
            supabase.from('user_roles').select('user_id, role').in('user_id', uploaderIds)
          ]);

          if (profilesData.data) {
            profilesData.data.forEach(profile => {
              uploaderInfo[profile.id] = { name: profile.name };
            });
          }

          if (rolesData.data) {
            rolesData.data.forEach(role => {
              if (uploaderInfo[role.user_id]) {
                uploaderInfo[role.user_id].role = role.role;
              }
            });
          }
        }

        const extended = imageData?.map(img => ({
          ...img,
          uploader_name: img.uploaded_by ? uploaderInfo[img.uploaded_by]?.name || 'Unknown' : 'System',
          uploader_role: img.uploaded_by ? uploaderInfo[img.uploaded_by]?.role || 'unknown' : 'admin'
        } as ExtendedWebsiteImage)) || [];

        setExtendedImages(extended);
        setFilteredImages(extended);
      } catch (error) {
        console.error('Error fetching extended images:', error);
        const fallbackImages = images.map(img => ({ 
          ...img, 
          uploader_name: 'Unknown', 
          uploader_role: 'unknown' 
        } as ExtendedWebsiteImage));
        setExtendedImages(fallbackImages);
        setFilteredImages(fallbackImages);
      }
    };

    if (images.length > 0) {
      fetchExtendedImages();
    } else {
      setExtendedImages([]);
      setFilteredImages([]);
    }
  }, [images]);

  // Filter images based on search and filters
  useEffect(() => {
    let filtered = [...extendedImages];

    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(img => img.category === categoryFilter);
    }

    if (uploaderFilter !== 'all') {
      filtered = filtered.filter(img => img.uploaded_by === uploaderFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(img => img.uploader_role === roleFilter);
    }

    setFilteredImages(filtered);
  }, [searchTerm, categoryFilter, uploaderFilter, roleFilter, extendedImages]);

  const handleImageClick = (image: ExtendedWebsiteImage) => {
    setSelectedImage(image);
    setEditForm({
      alt_text: image.alt_text || '',
      description: image.description || '',
      tags: image.tags.join(', '),
      category: image.category,
      usage_context: image.usage_context?.join(', ') || '',
      priority: image.priority || 5,
      is_active: image.is_active ?? true
    });
  };

  const handleUpdateImage = async () => {
    if (!selectedImage) return;

    try {
      const updates = {
        alt_text: editForm.alt_text,
        description: editForm.description,
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category: editForm.category,
        usage_context: editForm.usage_context.split(',').map(ctx => ctx.trim()).filter(Boolean),
        priority: editForm.priority,
        is_active: editForm.is_active,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('website_images')
        .update(updates)
        .eq('id', selectedImage.id);

      if (error) throw error;

      toast.success('Image updated successfully');
      setIsEditing(false);
      fetchImages();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('website_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image deleted successfully');
      setSelectedImage(null);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const getUniqueCategories = () => {
    return [...new Set(extendedImages.map(img => img.category).filter(Boolean))];
  };

  const getUniqueRoles = () => {
    return [...new Set(extendedImages.map(img => img.uploader_role).filter(Boolean))];
  };

  const getUniqueUploaders = () => {
    return [...new Set(extendedImages.map(img => img.uploader_name).filter(Boolean))];
  };

  const getImageUrl = (image: ExtendedWebsiteImage) => {
    return supabase.storage.from(image.bucket_id).getPublicUrl(image.file_path).data.publicUrl;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading images...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Image Overview ({filteredImages.length} images)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {getUniqueRoles().map(role => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={uploaderFilter} onValueChange={setUploaderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Uploader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {getUniqueUploaders().map(name => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setUploaderFilter('all');
              setRoleFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div
                    className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors"
                    onClick={() => handleImageClick(image)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={image.alt_text || image.file_name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.file_name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {image.category}
                        </Badge>
                        {!image.is_active && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>{image.file_name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={getImageUrl(image)}
                        alt={image.alt_text || image.file_name}
                        className="w-full rounded-lg"
                      />
                    </div>

                    <div className="space-y-4">
                      {!isEditing ? (
                        <>
                          <div>
                            <Label className="text-sm font-medium">Category</Label>
                            <Badge className="ml-2">{image.category}</Badge>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Alt Text</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {image.alt_text || 'No alt text'}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {image.description || 'No description'}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Tags</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {image.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Usage Context</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {image.usage_context?.map(ctx => (
                                <Badge key={ctx} variant="secondary" className="text-xs">
                                  {ctx}
                                </Badge>
                              )) || <span className="text-sm text-muted-foreground">None</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <Label className="text-sm font-medium">Priority</Label>
                              <p className="text-sm text-muted-foreground">{image.priority || 0}/10</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <Badge variant={image.is_active ? "default" : "destructive"} className="ml-2">
                                {image.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{image.uploader_name} ({image.uploader_role})</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-4 w-4" />
                              <span>Uploaded {new Date(image.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="alt_text">Alt Text</Label>
                            <Input
                              id="alt_text"
                              value={editForm.alt_text}
                              onChange={(e) => setEditForm({...editForm, alt_text: e.target.value})}
                              placeholder="Descriptive alt text for accessibility"
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              placeholder="Detailed description"
                            />
                          </div>

                          <div>
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input
                              id="tags"
                              value={editForm.tags}
                              onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                              placeholder="hiking, mountains, adventure"
                            />
                          </div>

                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hero">Hero</SelectItem>
                                <SelectItem value="landscape">Landscape</SelectItem>
                                <SelectItem value="hiking">Hiking</SelectItem>
                                <SelectItem value="portrait">Portrait</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="nature">Nature</SelectItem>
                                <SelectItem value="mountains">Mountains</SelectItem>
                                <SelectItem value="trails">Trails</SelectItem>
                                <SelectItem value="adventure">Adventure</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="usage_context">Usage Context (comma-separated)</Label>
                            <Input
                              id="usage_context"
                              value={editForm.usage_context}
                              onChange={(e) => setEditForm({...editForm, usage_context: e.target.value})}
                              placeholder="landing, tours, gallery"
                            />
                          </div>

                          <div>
                            <Label htmlFor="priority">Priority (1-10)</Label>
                            <Input
                              id="priority"
                              type="number"
                              min="1"
                              max="10"
                              value={editForm.priority}
                              onChange={(e) => setEditForm({...editForm, priority: parseInt(e.target.value)})}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="is_active"
                              checked={editForm.is_active}
                              onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                            />
                            <Label htmlFor="is_active">Active</Label>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleUpdateImage}>Save Changes</Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No images found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};