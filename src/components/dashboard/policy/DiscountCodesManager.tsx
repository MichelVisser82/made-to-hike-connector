import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DiscountCodesManagerProps {
  guideId?: string;
  isAdmin?: boolean;
}

export function DiscountCodesManager({ guideId, isAdmin = false }: DiscountCodesManagerProps) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [scope, setScope] = useState<'platform' | 'guide'>(isAdmin ? 'platform' : 'guide');

  // Fetch discount codes
  const { data: discountCodes, isLoading } = useQuery({
    queryKey: ['discount-codes', guideId, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin && guideId) {
        query = query.eq('guide_id', guideId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create discount code mutation
  const createCode = useMutation({
    mutationFn: async (newCode: any) => {
      // Check for duplicate
      const { data: existing } = await supabase
        .from('discount_codes')
        .select('code')
        .eq('code', newCode.code.toUpperCase())
        .single();

      if (existing) {
        throw new Error('This discount code already exists');
      }

      const { data, error } = await supabase
        .from('discount_codes')
        .insert([newCode])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast.success('Discount code created successfully');
      // Reset form
      setCode('');
      setDiscountValue('');
      setValidFrom('');
      setValidUntil('');
      setMaxUses('');
      setMinPurchase('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create discount code');
    },
  });

  // Toggle active status mutation
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast.success('Discount code updated');
    },
    onError: () => {
      toast.error('Failed to update discount code');
    },
  });

  // Delete discount code mutation
  const deleteCode = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      toast.success('Discount code deleted');
    },
    onError: () => {
      toast.error('Failed to delete discount code');
    },
  });

  const handleCreateCode = () => {
    if (!code || !discountValue) {
      toast.error('Please fill in required fields');
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    const newCode = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: value,
      scope: scope,
      guide_id: scope === 'guide' ? guideId : null,
      valid_from: validFrom || new Date().toISOString(),
      valid_until: validUntil || null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      min_purchase_amount: minPurchase ? parseFloat(minPurchase) : null,
      is_active: true,
    };

    createCode.mutate(newCode);
  };

  const activeCodes = discountCodes?.filter(
    (c) => c.is_active && (!c.valid_until || new Date(c.valid_until) >= new Date())
  ) || [];

  const inactiveCodes = discountCodes?.filter(
    (c) => !c.is_active || (c.valid_until && new Date(c.valid_until) < new Date())
  ) || [];

  const formatDate = (date: string | null) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Create Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Discount Code
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Create platform-wide or guide-specific discount codes'
              : 'Create discount codes for your tours'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="SUMMER2024"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={20}
              />
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="scope">Scope *</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as 'platform' | 'guide')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">Platform-wide</SelectItem>
                    <SelectItem value="guide">Guide-specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type *</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value * {discountType === 'percentage' ? '(%)' : '(€)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                placeholder={discountType === 'percentage' ? '10' : '50'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (Optional)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Unlimited"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPurchase">Min Purchase Amount (€)</Label>
              <Input
                id="minPurchase"
                type="number"
                placeholder="No minimum"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <Button 
            onClick={handleCreateCode} 
            disabled={createCode.isPending}
            className="mt-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Discount Code
          </Button>
        </CardContent>
      </Card>

      {/* Active and Inactive Codes */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Codes ({activeCodes.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive Codes ({inactiveCodes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Discount Codes</CardTitle>
              <CardDescription>
                Currently active codes that can be used by hikers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeCodes.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No active discount codes. Create one to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCodes.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-mono font-semibold">
                          {discount.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {discount.scope === 'platform' ? 'Platform' : 'Guide'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%` 
                            : `€${discount.discount_value}`}
                        </TableCell>
                        <TableCell>{formatDate(discount.valid_until)}</TableCell>
                        <TableCell>
                          {discount.times_used}
                          {discount.max_uses ? ` / ${discount.max_uses}` : ''}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={discount.is_active}
                            onCheckedChange={(checked) =>
                              toggleActive.mutate({ id: discount.id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCode.mutate(discount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Discount Codes</CardTitle>
              <CardDescription>
                Expired or deactivated discount codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inactiveCodes.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No inactive discount codes.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveCodes.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell className="font-mono font-semibold text-muted-foreground">
                          {discount.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {discount.scope === 'platform' ? 'Platform' : 'Guide'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%` 
                            : `€${discount.discount_value}`}
                        </TableCell>
                        <TableCell>{formatDate(discount.valid_until)}</TableCell>
                        <TableCell>
                          {discount.times_used}
                          {discount.max_uses ? ` / ${discount.max_uses}` : ''}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={discount.is_active}
                            onCheckedChange={(checked) =>
                              toggleActive.mutate({ id: discount.id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCode.mutate(discount.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
