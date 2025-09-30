import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTemplateManagement } from '@/hooks/useTemplateManagement';
import { Plus, Trash2, Edit2, GripVertical, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STEP_OPTIONS = [
  { value: 'step10', label: 'Step 10: Inclusions & Exclusions' },
  { value: 'step8', label: 'Step 8: Highlights' },
  { value: 'step5', label: 'Step 5: Tour Details' },
];

export function TourTemplateManager() {
  const [selectedStep, setSelectedStep] = useState<string>('step10');
  const [selectedCategory, setSelectedCategory] = useState<string>('included');
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: string; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { templates, isLoading, createItem, updateItem, deleteItem, reorderItems } = useTemplateManagement(selectedStep);

  const filteredTemplates = templates?.filter(t => t.category === selectedCategory) || [];

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const maxOrder = Math.max(...(filteredTemplates.map(t => t.sort_order) || [0]), 0);
    
    await createItem.mutateAsync({
      step_name: selectedStep,
      category: selectedCategory,
      item_text: newItemText.trim(),
      is_active: true,
      sort_order: maxOrder + 1,
    });

    setNewItemText('');
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.text.trim()) return;

    await updateItem.mutateAsync({
      id: editingItem.id,
      updates: { item_text: editingItem.text.trim() },
    });

    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem.mutateAsync(id);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateItem.mutateAsync({
      id,
      updates: { is_active: !currentStatus },
    });
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === filteredTemplates.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...filteredTemplates];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedItem);

    const updates = reordered.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
    }));

    await reorderItems.mutateAsync(updates);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tour Template Manager</CardTitle>
          <CardDescription>
            Manage standard items that appear across all tour creation steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Selector */}
          <div className="space-y-2">
            <Label>Select Step</Label>
            <Select value={selectedStep} onValueChange={setSelectedStep}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="included" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Included
              </TabsTrigger>
              <TabsTrigger value="excluded" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Excluded
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4 mt-4">
              {/* Add New Item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new standard item..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                />
                <Button onClick={handleAddItem} disabled={!newItemText.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Items List */}
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items yet. Add your first standard item above.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template, index) => (
                    <div
                      key={template.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                        >
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Content */}
                      <div className="flex-1">
                        {editingItem?.id === template.id ? (
                          <Input
                            value={editingItem.text}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, text: e.target.value })
                            }
                            onKeyPress={(e) =>
                              e.key === 'Enter' && (e.preventDefault(), handleUpdateItem())
                            }
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={!template.is_active ? 'text-muted-foreground line-through' : ''}>
                              {template.item_text}
                            </span>
                            {!template.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={() => handleToggleActive(template.id, template.is_active)}
                        />
                        
                        {editingItem?.id === template.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleUpdateItem}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingItem(null)}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setEditingItem({ id: template.id, text: template.item_text })
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirm(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this standard item. Guides will no longer see it as an option.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteItem(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
