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
      scope: isAdmin ? 'platform' : 'guide',
      guide_id: isAdmin ? null : guideId,
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
      <Card className="border-burgundy/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair text-charcoal">
            <Plus className="h-5 w-5 text-burgundy" />
            Create Discount Code
          </CardTitle>
          <CardDescription className="text-charcoal/60">
            {isAdmin 
              ? 'Create platform-wide discount codes'
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
            className="mt-6 bg-burgundy hover:bg-burgundy-dark text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Discount Code
          </Button>
        </CardContent>
      </Card>

      {/* Active and Inactive Codes */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-cream p-1 rounded-lg">
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Active Codes ({activeCodes.length})
          </TabsTrigger>
          <TabsTrigger 
            value="inactive"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Inactive Codes ({inactiveCodes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <Card className="border-burgundy/10">
            <CardHeader>
              <CardTitle className="font-playfair text-charcoal">Active Discount Codes</CardTitle>
              <CardDescription className="text-charcoal/60">
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
                    <TableRow className="bg-cream/70 border-b border-burgundy/10">
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Code</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Type</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Discount</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Valid Until</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Uses</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-burgundy/5">
                    {activeCodes.map((discount) => (
                      <TableRow key={discount.id} className="hover:bg-cream/30 transition-colors">
                        <TableCell className="font-mono font-semibold text-charcoal">
                          {discount.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-burgundy/20 text-burgundy">
                            {discount.scope === 'platform' ? 'Platform' : 'Guide'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-charcoal">
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%` 
                            : `€${discount.discount_value}`}
                        </TableCell>
                        <TableCell className="text-charcoal/80">{formatDate(discount.valid_until)}</TableCell>
                        <TableCell className="text-charcoal/80">
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
                            className="hover:text-burgundy"
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
          <Card className="border-burgundy/10">
            <CardHeader>
              <CardTitle className="font-playfair text-charcoal">Inactive Discount Codes</CardTitle>
              <CardDescription className="text-charcoal/60">
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
                    <TableRow className="bg-cream/70 border-b border-burgundy/10">
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Code</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Type</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Discount</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Valid Until</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Uses</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider text-charcoal/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-burgundy/5">
                    {inactiveCodes.map((discount) => (
                      <TableRow key={discount.id} className="hover:bg-cream/30 transition-colors">
                        <TableCell className="font-mono font-semibold text-charcoal/40">
                          {discount.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-charcoal/20 text-charcoal/60">
                            {discount.scope === 'platform' ? 'Platform' : 'Guide'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-charcoal/60">
                          {discount.discount_type === 'percentage' 
                            ? `${discount.discount_value}%` 
                            : `€${discount.discount_value}`}
                        </TableCell>
                        <TableCell className="text-charcoal/60">{formatDate(discount.valid_until)}</TableCell>
                        <TableCell className="text-charcoal/60">
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
                            className="hover:text-burgundy"
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
