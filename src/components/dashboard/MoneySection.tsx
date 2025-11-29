import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Download, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  FileText,
  Loader2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { CancellationDiscountsTab } from './policy/CancellationDiscountsTab';
import { GuideReferralDashboard } from '@/components/referral/GuideReferralDashboard';

interface MoneySectionProps {
  balances: {
    pending: number;
    available: number;
    lifetime: number;
  };
  transactions: Array<{
    id: string;
    date: string;
    tour_title: string;
    tour_id?: string;
    guest_name: string;
    booking_id?: string;
    gross_amount: number;
    platform_fee: number;
    net_amount: number;
    status: 'pending' | 'completed' | 'refunded';
  }>;
  payouts: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    arrival_date?: string;
    failure_reason?: string;
  }>;
  topTours: Array<{
    tour_id: string;
    tour_title: string;
    total_earnings: number;
    booking_count: number;
  }>;
  taxDocuments: Array<{
    id: string;
    name: string;
    year: number;
    created_at: string;
    file_path: string;
    gross_income: number;
    net_income: number;
    total_bookings: number;
  }>;
  stripeData: any;
  tours: Array<{ id: string; title: string }>;
  lastUpdated: Date;
  loading: boolean;
  feePercentage: number;
  onExportReport: () => void;
  onRequestPayout: () => void;
  onDownloadDocument: (docId: string) => void;
  onGenerateTaxDoc: (year: number) => Promise<void>;
  onRefresh: () => void;
  onUpdatePayoutSchedule: (schedule: string) => Promise<void>;
  userId: string;
}

export function MoneySection({
  balances,
  transactions,
  payouts,
  topTours,
  taxDocuments,
  stripeData,
  tours,
  lastUpdated,
  loading,
  feePercentage,
  onExportReport,
  onRequestPayout,
  onDownloadDocument,
  onGenerateTaxDoc,
  onRefresh,
  onUpdatePayoutSchedule,
  userId,
}: MoneySectionProps) {
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tourFilter, setTourFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI states
  const [payoutScheduleModalOpen, setPayoutScheduleModalOpen] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState(stripeData?.payout_schedule || 'weekly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [generatingTaxDoc, setGeneratingTaxDoc] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (dateRange?.from && new Date(t.date) < dateRange.from) return false;
      if (dateRange?.to && new Date(t.date) > dateRange.to) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (tourFilter !== 'all' && t.tour_id !== tourFilter) return false;
      if (searchQuery && 
          !t.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !t.booking_id?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [transactions, dateRange, statusFilter, tourFilter, searchQuery]);

  // Monthly earnings data for chart
  const monthlyData = useMemo(() => {
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { month: format(d, 'MMM yyyy'), earnings: 0 };
    }).reverse();
    
    transactions.forEach(t => {
      if (t.status === 'completed') {
        const month = format(new Date(t.date), 'MMM yyyy');
        const monthData = last6Months.find(m => m.month === month);
        if (monthData) monthData.earnings += t.net_amount;
      }
    });
    
    return last6Months;
  }, [transactions]);

  // Fee breakdown data
  const feeBreakdown = useMemo(() => {
    const guideFeeRate = feePercentage / 100;
    const guideEarnings = Math.max(0, balances.lifetime * (1 - guideFeeRate));
    const platformFees = Math.max(0, balances.lifetime * guideFeeRate);
    return [
      { name: 'Your Earnings', value: guideEarnings, fill: '#059669' },
      { name: 'Platform Fees', value: platformFees, fill: '#f59e0b' },
    ];
  }, [balances.lifetime, feePercentage]);

  const handleUpdatePayoutSchedule = async () => {
    await onUpdatePayoutSchedule(payoutSchedule);
    setPayoutScheduleModalOpen(false);
  };

  const handleGenerateTaxDoc = async () => {
    setGeneratingTaxDoc(true);
    try {
      await onGenerateTaxDoc(parseInt(selectedYear));
    } finally {
      setGeneratingTaxDoc(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-playfair text-charcoal mb-2">Money Dashboard</h2>
          <div className="flex items-center gap-2 text-sm text-charcoal/60">
            <span>Last updated: {format(lastUpdated, 'h:mm a')}</span>
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          {stripeData?.stripe_account_id && (
            <Button variant="outline" asChild>
              <a 
                href={`https://dashboard.stripe.com/connect/accounts/${stripeData.stripe_account_id}`} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Stripe
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={() => setPayoutScheduleModalOpen(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Payout Schedule
          </Button>
          <Button variant="outline" onClick={onExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Account Status Warning */}
      {stripeData?.stripe_kyc_status === 'restricted' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Your Stripe account is restricted. Please complete verification to receive payments.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList className="bg-cream p-1 rounded-lg">
          <TabsTrigger value="earnings" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Earnings
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Payouts & Tax
          </TabsTrigger>
          <TabsTrigger value="cancellation-discounts" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Cancellation & Discounts
          </TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Referrals
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* EARNINGS TAB */}
        <TabsContent value="earnings" className="space-y-8">
          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-gold">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-charcoal/60 font-normal">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-playfair text-charcoal mb-1">
                  €{balances.pending.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-charcoal/50">Processing...</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-sage">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-charcoal/60 font-normal">Available for Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-playfair text-charcoal mb-1">
                  €{balances.available.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-charcoal/50">Ready to transfer</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-burgundy">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-charcoal/60 font-normal">Lifetime Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-playfair text-charcoal mb-1">
                  €{balances.lifetime.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-charcoal/50">Total income</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Earnings Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-charcoal">Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number) => `€${value.toFixed(2)}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar dataKey="earnings" fill="#8b2332" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fee Breakdown Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-charcoal">Fee Breakdown (Lifetime)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {feeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `€${value.toFixed(2)}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Earning Tours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-charcoal">Top Earning Tours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTours.slice(0, 5).map((tour) => {
                const maxEarnings = Math.max(...topTours.map(t => t.total_earnings));
                const percentage = maxEarnings > 0 ? (tour.total_earnings / maxEarnings) * 100 : 0;
                
                return (
                  <div key={tour.tour_id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-charcoal/80">{tour.tour_title}</span>
                      <span className="font-medium text-charcoal">
                        €{tour.total_earnings.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-cream h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-burgundy to-burgundy-dark h-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {topTours.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-charcoal/60">No earnings data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                      </>
                    ) : format(dateRange.from, 'MMM d, yyyy')
                  ) : (
                    'Select date range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tourFilter} onValueChange={setTourFilter}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="All tours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tours</SelectItem>
                {tours.map(tour => (
                  <SelectItem key={tour.id} value={tour.id}>
                    {tour.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search by guest name or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
          </div>

          {/* Transactions Table */}
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-cream/70 border-b border-burgundy/10">
                  <TableHead className="px-6 py-4">Date</TableHead>
                  <TableHead className="px-6 py-4">ID</TableHead>
                  <TableHead className="px-6 py-4">Tour</TableHead>
                  <TableHead className="px-6 py-4">Guest</TableHead>
                  <TableHead className="px-6 py-4">Gross</TableHead>
                  <TableHead className="px-6 py-4">Fee ({feePercentage}%)</TableHead>
                  <TableHead className="px-6 py-4">Net</TableHead>
                  <TableHead className="px-6 py-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-burgundy/5">
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-cream/30 transition-colors">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-xs text-charcoal/60">
                      {transaction.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="px-6 py-4">{transaction.tour_title}</TableCell>
                    <TableCell className="px-6 py-4">{transaction.guest_name}</TableCell>
                    <TableCell className="px-6 py-4 font-medium text-charcoal">
                      €{transaction.gross_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-destructive">
                      -€{transaction.platform_fee.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-sage">
                      €{transaction.net_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant={
                        transaction.status === 'completed' ? 'default' : 
                        transaction.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-charcoal/60">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* PAYOUTS & TAX TAB */}
        <TabsContent value="payouts" className="space-y-6">
          {/* Payouts */}
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Track your payouts from Stripe to your bank account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payouts.length === 0 ? (
                  <p className="text-sm text-charcoal/60 text-center py-8">No payouts yet</p>
                ) : (
                  payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">€{payout.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payout.date), 'MMM dd, yyyy')}
                          {payout.arrival_date && ` • Arrives ${format(new Date(payout.arrival_date), 'MMM dd')}`}
                        </p>
                        {payout.failure_reason && (
                          <p className="text-sm text-destructive mt-1">{payout.failure_reason}</p>
                        )}
                      </div>
                      <Badge variant={
                        payout.status === 'paid' ? 'default' : 
                        payout.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }>
                        {payout.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              {balances.available >= 100 && (
                <Button className="w-full mt-4" onClick={onRequestPayout}>
                  Request Instant Payout (€{balances.available.toFixed(2)})
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tax Documents */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tax Documents</CardTitle>
                  <CardDescription>Generate annual income summaries for tax purposes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGenerateTaxDoc} disabled={generatingTaxDoc}>
                    {generatingTaxDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    <span className="ml-2">Generate</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {taxDocuments.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{doc.year} Income Summary</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.total_bookings} bookings • €{doc.net_income.toFixed(2)} net income
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Generated {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onDownloadDocument(doc.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
                
                {taxDocuments.length === 0 && (
                  <p className="text-sm text-charcoal/60 text-center py-8">
                    No tax documents generated yet. Select a year and click Generate.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellation-discounts">
          <CancellationDiscountsTab />
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <GuideReferralDashboard userId={userId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Financial Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Average Transaction Value</h4>
                  <p className="text-3xl font-playfair">
                    €{transactions.length > 0 
                      ? (transactions.reduce((sum, t) => sum + t.gross_amount, 0) / transactions.length).toFixed(2)
                      : '0.00'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Total Bookings</h4>
                  <p className="text-3xl font-playfair">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Schedule Modal */}
      <Dialog open={payoutScheduleModalOpen} onOpenChange={setPayoutScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payout Schedule</DialogTitle>
            <DialogDescription>
              Choose how often you want to receive payouts to your bank account
            </DialogDescription>
          </DialogHeader>
          
          <RadioGroup value={payoutSchedule} onValueChange={setPayoutSchedule}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily">Daily (Business days only)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly">Weekly (Every Monday)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly (1st of each month)</Label>
            </div>
          </RadioGroup>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePayoutSchedule}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
