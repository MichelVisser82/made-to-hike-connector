import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useWebsiteImages } from '@/hooks/useWebsiteImages';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Eye, Edit2, Trash2, User, Calendar, CheckSquare, Square } from 'lucide-react';
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
  image_width?: number;
  image_height?: number;
  file_size?: number;
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
  const [imageDetails, setImageDetails] = useState<{width: number, height: number, size: number} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSections, setEditingSections] = useState<{
    altText: boolean;
    description: boolean;
    tags: boolean;
    category: boolean;
    usageContext: boolean;
    priority: boolean;
    status: boolean;
  }>({
    altText: false,
    description: false,
    tags: false,
    category: false,
    usageContext: false,
    priority: false,
    status: false,
  });
  const [savingSections, setSavingSections] = useState<Set<string>>(new Set());
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
    setImageDetails(null); // Reset details
    setEditForm({
      alt_text: image.alt_text || '',
      description: image.description || '',
      tags: image.tags.join(', '),
      category: image.category,
      usage_context: image.usage_context?.join(', ') || '',
      priority: image.priority || 5,
      is_active: image.is_active ?? true
    });

    // Get image dimensions and file size
    const img = new Image();
    img.onload = () => {
      setImageDetails({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: 0 // We'll estimate this from the image URL response
      });
      
      // Try to get file size from response headers
      fetch(getImageUrl(image), { method: 'HEAD' })
        .then(response => {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            setImageDetails(prev => prev ? {...prev, size: parseInt(contentLength)} : null);
          }
        })
        .catch(() => {
          // Ignore errors, just won't show file size
        });
    };
    img.src = getImageUrl(image);
  };

  // Section-specific save functions
  const saveSectionData = async (section: string, data: any) => {
    if (!selectedImage) return;

    setSavingSections(prev => new Set([...prev, section]));
    
    try {
      const { error } = await supabase
        .from('website_images')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', selectedImage.id);

      if (error) throw error;

      toast.success(`${section} updated successfully`);
      setEditingSections(prev => ({ ...prev, [section]: false }));
      fetchImages();
      
      // Update the selected image to reflect changes
      setSelectedImage(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      toast.error(`Failed to update ${section}`);
    } finally {
      setSavingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(section);
        return newSet;
      });
    }
  };

  const handleSaveAltText = () => {
    saveSectionData('altText', { alt_text: editForm.alt_text });
  };

  const handleSaveDescription = () => {
    saveSectionData('description', { description: editForm.description });
  };

  const handleSaveTags = () => {
    const tags = editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    saveSectionData('tags', { tags });
  };

  const handleSaveCategory = () => {
    saveSectionData('category', { category: editForm.category });
  };

  const handleSaveUsageContext = () => {
    const usage_context = editForm.usage_context.split(',').map(ctx => ctx.trim()).filter(Boolean);
    saveSectionData('usageContext', { usage_context });
  };

  const handleSavePriority = () => {
    saveSectionData('priority', { priority: editForm.priority });
  };

  const handleSaveStatus = () => {
    saveSectionData('status', { is_active: editForm.is_active });
  };

  const toggleSectionEdit = (section: keyof typeof editingSections) => {
    setEditingSections(prev => ({ ...prev, [section]: !prev[section] }));
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Bulk selection functions
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllImages = () => {
    if (selectedImages.size === filteredImages.length) {
      // If all are selected, deselect all
      setSelectedImages(new Set());
    } else {
      // Select all visible images
      setSelectedImages(new Set(filteredImages.map(img => img.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) {
      toast.error('No images selected');
      return;
    }

    const selectedCount = selectedImages.size;
    if (!confirm(`Are you sure you want to delete ${selectedCount} selected image(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    let deletedCount = 0;
    let errorCount = 0;

    try {
      for (const imageId of selectedImages) {
        const image = extendedImages.find(img => img.id === imageId);
        if (!image) continue;

        try {
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from(image.bucket_id)
            .remove([image.file_path]);

          if (storageError) {
            console.error('Storage deletion error:', storageError);
            errorCount++;
            continue;
          }

          // Delete from database
          const { error: dbError } = await supabase
            .from('website_images')
            .delete()
            .eq('id', imageId);

          if (dbError) {
            console.error('Database deletion error:', dbError);
            errorCount++;
            continue;
          }

          deletedCount++;
        } catch (error) {
          console.error('Error deleting image:', error);
          errorCount++;
        }
      }

      if (deletedCount > 0) {
        toast.success(`Successfully deleted ${deletedCount} image(s)`);
        
        // Clear selections and refresh images
        setSelectedImages(new Set());
        await fetchImages();
      }

      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} image(s)`);
      }

    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete images');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading images...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Image Overview ({filteredImages.length} images)
            </div>
            {selectedImages.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedImages.size} selected
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? 'Deleting...' : `Delete ${selectedImages.size}`}
                </Button>
              </div>
            )}
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

          {/* Bulk Actions */}
          {filteredImages.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedImages.size === filteredImages.length && filteredImages.length > 0}
                  onCheckedChange={selectAllImages}
                />
                <Label className="text-sm font-medium">
                  {selectedImages.size === filteredImages.length && filteredImages.length > 0
                    ? 'Deselect All'
                    : 'Select All'
                  } ({filteredImages.length} images)
                </Label>
              </div>
              {selectedImages.size > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedImages.size} image{selectedImages.size === 1 ? '' : 's'} selected
                </div>
              )}
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={selectedImages.has(image.id)}
                    onCheckedChange={() => toggleImageSelection(image.id)}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </div>
                
                <Dialog>
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
                      {/* Category Section */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Category</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSectionEdit('category')}
                            disabled={savingSections.has('category')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {!editingSections.category ? (
                          <Badge>{image.category}</Badge>
                        ) : (
                          <div className="space-y-2">
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
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveCategory} disabled={savingSections.has('category')}>
                                {savingSections.has('category') ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('category')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Alt Text Section */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Alt Text</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSectionEdit('altText')}
                            disabled={savingSections.has('altText')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {!editingSections.altText ? (
                          <p className="text-sm text-muted-foreground">
                            {image.alt_text || 'No alt text'}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={editForm.alt_text}
                              onChange={(e) => setEditForm({...editForm, alt_text: e.target.value})}
                              placeholder="Descriptive alt text for accessibility"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveAltText} disabled={savingSections.has('altText')}>
                                {savingSections.has('altText') ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('altText')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description Section */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Description</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSectionEdit('description')}
                            disabled={savingSections.has('description')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {!editingSections.description ? (
                          <p className="text-sm text-muted-foreground">
                            {image.description || 'No description'}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              placeholder="Detailed description"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveDescription} disabled={savingSections.has('description')}>
                                {savingSections.has('description') ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('description')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tags Section */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Tags</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSectionEdit('tags')}
                            disabled={savingSections.has('tags')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {!editingSections.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {image.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={editForm.tags}
                              onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                              placeholder="hiking, mountains, adventure"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveTags} disabled={savingSections.has('tags')}>
                                {savingSections.has('tags') ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('tags')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Usage Context Section */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Usage Context</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleSectionEdit('usageContext')}
                            disabled={savingSections.has('usageContext')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {!editingSections.usageContext ? (
                          <div className="flex flex-wrap gap-1">
                            {image.usage_context?.map(ctx => (
                              <Badge key={ctx} variant="secondary" className="text-xs">
                                {ctx}
                              </Badge>
                            )) || <span className="text-sm text-muted-foreground">None</span>}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={editForm.usage_context}
                              onChange={(e) => setEditForm({...editForm, usage_context: e.target.value})}
                              placeholder="landing, tours, gallery"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveUsageContext} disabled={savingSections.has('usageContext')}>
                                {savingSections.has('usageContext') ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('usageContext')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Priority and Status Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Priority</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleSectionEdit('priority')}
                              disabled={savingSections.has('priority')}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {!editingSections.priority ? (
                            <p className="text-sm text-muted-foreground">{image.priority || 0}/10</p>
                          ) : (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={editForm.priority}
                                onChange={(e) => setEditForm({...editForm, priority: parseInt(e.target.value)})}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSavePriority} disabled={savingSections.has('priority')}>
                                  {savingSections.has('priority') ? 'Saving...' : 'Save'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('priority')}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Status</Label>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleSectionEdit('status')}
                              disabled={savingSections.has('status')}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {!editingSections.status ? (
                            <Badge variant={image.is_active ? "default" : "destructive"}>
                              {image.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          ) : (
                            <div className="space-y-2">
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
                                <Button size="sm" onClick={handleSaveStatus} disabled={savingSections.has('status')}>
                                  {savingSections.has('status') ? 'Saving...' : 'Save'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => toggleSectionEdit('status')}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
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