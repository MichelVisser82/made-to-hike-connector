import { useState } from 'react';
import { format } from 'date-fns';
import {
  Download,
  Euro,
  BarChart3,
  FileText,
  Percent,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CancellationDiscountsTab } from './policy/CancellationDiscountsTab';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import type { 
  Transaction, 
  Balances, 
  TopEarningTour, 
  Payout, 
  TaxDocument 
} from '@/types';

interface MoneySectionProps {
  balances: Balances;
  transactions: Transaction[];
  topTours: TopEarningTour[];
  nextPayout?: Payout;
  taxDocuments: TaxDocument[];
  loading: boolean;
  guideId?: string;
  onExport: () => void;
  onRequestPayout: () => void;
  onDownloadDocument: (docId: string) => void;
}

const getTransactionStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gold/10 text-gold border-gold/20 text-xs px-2 py-1 rounded border';
    case 'completed':
      return 'bg-sage/10 text-sage border-sage/20 text-xs px-2 py-1 rounded border';
    case 'refunded':
      return 'bg-destructive/10 text-destructive border-destructive/20 text-xs px-2 py-1 rounded border';
    default:
      return 'bg-charcoal/10 text-charcoal border-charcoal/20 text-xs px-2 py-1 rounded border';
  }
};

export function MoneySection({
  balances,
  transactions,
  topTours,
  nextPayout,
  taxDocuments,
  loading,
  guideId,
  onExport,
  onRequestPayout,
  onDownloadDocument,
}: MoneySectionProps) {
  const [activeTab, setActiveTab] = useState('earnings');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-charcoal/60">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair text-charcoal mb-2">Money</h1>
            <p className="text-charcoal/60">
              Track your earnings, transactions, and payouts
            </p>
          </div>
          <Button variant="outline" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-cream p-1 rounded-lg mb-6">
          <TabsTrigger 
            value="earnings" 
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Earnings
          </TabsTrigger>
          <TabsTrigger 
            value="transactions"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger 
            value="payouts"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Payouts & Tax
          </TabsTrigger>
          <TabsTrigger 
            value="cancellation-discounts"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Cancellation & Discounts
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* EARNINGS TAB */}
        <TabsContent value="earnings" className="space-y-8">
          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 - Pending */}
            <Card className="border-l-4 border-l-gold">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-charcoal/60 font-normal">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-playfair text-charcoal mb-1">
                  €{balances.pending.toLocaleString('en-EU', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-charcoal/50">Processing...</p>
              </CardContent>
            </Card>

            {/* Card 2 - Available */}
            <Card className="border-l-4 border-l-sage">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-charcoal/60 font-normal">
                  Available for Payout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-playfair text-charcoal mb-1">
                  €{balances.available.toLocaleString('en-EU', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-charcoal/50">Ready to transfer</p>
              </CardContent>
            </Card>

            {/* Card 3 - Lifetime */}
            <Card className="border-l-4 border-l-burgundy">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-charcoal/60 font-normal">
                  Lifetime Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-playfair text-charcoal mb-1">
                  €{balances.lifetime.toLocaleString('en-EU', { minimumFractionDigits: 0 })}
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
                <CardTitle className="text-lg font-medium text-charcoal">
                  Monthly Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-16 h-16 text-burgundy/20 mb-4" />
                <p className="text-sm text-charcoal/60 text-center">
                  Chart visualization
                </p>
                <p className="text-xs text-charcoal/40 text-center mt-1">
                  Integrate Recharts for production
                </p>
              </CardContent>
            </Card>

            {/* Top Earning Tours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-charcoal">
                  Top Earning Tours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTours.slice(0, 5).map((tour) => {
                  const maxEarnings = Math.max(...topTours.map(t => t.total_earnings));
                  const percentage = (tour.total_earnings / maxEarnings) * 100;
                  
                  return (
                    <div key={tour.tour_id} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-charcoal/80">
                          {tour.tour_title}
                        </span>
                        <span className="font-medium text-charcoal">
                          €{tour.total_earnings.toLocaleString('en-EU')}
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
          </div>
        </TabsContent>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions">
          <Card className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-cream/70 border-b border-burgundy/10">
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    ID
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Tour
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Guest
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Gross
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Fee
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Net
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs uppercase tracking-wider text-charcoal/60">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-burgundy/5">
                {transactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    className="hover:bg-cream/30 transition-colors"
                  >
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-xs text-charcoal/60">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {transaction.tour_title}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {transaction.guest_name}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-charcoal">
                      €{transaction.gross_amount}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-destructive">
                      -€{transaction.platform_fee}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-sage">
                      €{transaction.net_amount}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={getTransactionStatusBadgeClass(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {transactions.length === 0 && (
              <div className="py-12 text-center">
                <Euro className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  No transactions yet
                </h3>
                <p className="text-sm text-charcoal/60">
                  Transactions will appear here once you receive bookings
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* PAYOUTS & TAX TAB */}
        <TabsContent value="payouts" className="space-y-6">
          {/* Payout Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-playfair text-charcoal">
                Payout Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextPayout ? (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-charcoal/60 mb-1">Next Payout</p>
                      <p className="text-sm text-charcoal">
                        {format(new Date(nextPayout.scheduled_date), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl text-burgundy font-playfair">
                        €{nextPayout.amount.toLocaleString('en-EU')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-burgundy hover:bg-burgundy-dark text-white"
                    onClick={onRequestPayout}
                  >
                    Request Instant Payout
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-charcoal/60 mb-1">No payout scheduled</p>
                  <p className="text-sm text-charcoal/40">
                    Minimum €100 required for payout
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Documents Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-playfair text-charcoal">
                Tax Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {taxDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-cream/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-burgundy/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-burgundy" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{doc.name}</p>
                      <p className="text-xs text-charcoal/60">{doc.type} Document</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDownloadDocument(doc.id)}
                  >
                    <Download className="w-4 h-4 text-burgundy" />
                  </Button>
                </div>
              ))}
              
              {taxDocuments.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                  <p className="text-sm text-charcoal/60">No tax documents available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CANCELLATION & DISCOUNTS TAB */}
        <TabsContent value="cancellation-discounts" className="space-y-6">
          <CancellationDiscountsTab />
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics">
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-xl font-playfair text-charcoal mb-2">
                  Coming Soon: Detailed Analytics
                </h3>
                <p className="text-sm text-charcoal/60 max-w-md mx-auto">
                  Track performance metrics, booking trends, and revenue insights to optimize your guiding business
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
