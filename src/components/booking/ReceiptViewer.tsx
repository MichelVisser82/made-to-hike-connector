import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Printer, X } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

interface ReceiptViewerProps {
  bookingId: string;
  onClose?: () => void;
}

export function ReceiptViewer({ bookingId, onClose }: ReceiptViewerProps) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (
            title,
            duration,
            meeting_point,
            guide_profiles:guide_profiles!tours_guide_id_fkey (
              display_name,
              phone,
              profile_image_url
            )
          ),
          profiles:hiker_id (
            name,
            email,
            phone
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MadeToHike', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text('RECEIPT', pageWidth / 2, 30, { align: 'center' });
    
    // Receipt details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${booking.booking_reference}`, 20, 45);
    doc.text(`Date: ${format(new Date(booking.created_at), 'MMMM d, yyyy')}`, 20, 52);
    doc.text(`Payment Status: ${booking.payment_status.toUpperCase()}`, 20, 59);
    
    // Customer details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(booking.profiles?.name || 'Customer', 20, 82);
    doc.text(booking.profiles?.email || '', 20, 89);
    if (booking.profiles?.phone) {
      doc.text(booking.profiles.phone, 20, 96);
    }
    
    // Tour details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tour Details:', 20, 115);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(booking.tours?.title || 'Tour', 20, 122);
    doc.text(`Date: ${format(new Date(booking.booking_date), 'MMMM d, yyyy')}`, 20, 129);
    doc.text(`Duration: ${booking.tours?.duration || 'N/A'}`, 20, 136);
    doc.text(`Participants: ${booking.participants}`, 20, 143);
    doc.text(`Guide: ${booking.tours?.guide_profiles?.display_name || 'N/A'}`, 20, 150);
    
    // Line items
    doc.line(20, 165, pageWidth - 20, 165);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, 172);
    doc.text('Amount', pageWidth - 60, 172);
    doc.line(20, 175, pageWidth - 20, 175);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${booking.tours?.title || 'Tour'} (${booking.participants} ${booking.participants === 1 ? 'person' : 'people'})`, 20, 182);
    
    const subtotal = booking.subtotal || booking.total_price;
    const serviceFee = booking.service_fee_amount || 0;
    const discount = booking.discount_amount || 0;
    
    doc.text(`${booking.currency} ${subtotal.toFixed(2)}`, pageWidth - 60, 182);
    
    // Subtotal and fees
    let yPos = 195;
    doc.text('Subtotal:', 20, yPos);
    doc.text(`${booking.currency} ${subtotal.toFixed(2)}`, pageWidth - 60, yPos);
    
    if (serviceFee > 0) {
      yPos += 7;
      doc.text('Service Fee:', 20, yPos);
      doc.text(`${booking.currency} ${serviceFee.toFixed(2)}`, pageWidth - 60, yPos);
    }
    
    if (discount > 0) {
      yPos += 7;
      doc.text('Discount:', 20, yPos);
      doc.text(`-${booking.currency} ${discount.toFixed(2)}`, pageWidth - 60, yPos);
    }
    
    // Total
    yPos += 10;
    doc.line(20, yPos - 3, pageWidth - 20, yPos - 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 20, yPos);
    doc.text(`${booking.currency} ${booking.total_price.toFixed(2)}`, pageWidth - 60, yPos);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for booking with MadeToHike!', pageWidth / 2, 270, { align: 'center' });
    doc.text('For questions, contact us at support@madetohike.com', pageWidth / 2, 275, { align: 'center' });
    
    doc.save(`Receipt-${booking.booking_reference}.pdf`);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Receipt not found</p>
      </div>
    );
  }

  const subtotal = booking.subtotal || booking.total_price;
  const serviceFee = booking.service_fee_amount || 0;
  const discount = booking.discount_amount || 0;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Action buttons - hide when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">Receipt</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Receipt content */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">MadeToHike</h2>
            <p className="text-xl font-semibold text-primary">RECEIPT</p>
          </div>

          {/* Receipt info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receipt Number</p>
              <p className="font-semibold">{booking.booking_reference}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <p className="font-semibold">{format(new Date(booking.created_at), 'MMMM d, yyyy')}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Bill to */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</p>
            <p className="font-semibold">{booking.profiles?.name || 'Customer'}</p>
            <p className="text-sm">{booking.profiles?.email}</p>
            {booking.profiles?.phone && <p className="text-sm">{booking.profiles.phone}</p>}
          </div>

          {/* Tour details */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-muted-foreground mb-2">TOUR DETAILS</p>
            <p className="font-semibold text-lg">{booking.tours?.title}</p>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p>{format(new Date(booking.booking_date), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p>{booking.tours?.duration || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Participants</p>
                <p>{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Guide</p>
                <p>{booking.tours?.guide_profiles?.display_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Line items */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Description</span>
              <span className="font-medium">Amount</span>
            </div>
            <div className="flex justify-between">
              <span>{booking.tours?.title} ({booking.participants} {booking.participants === 1 ? 'person' : 'people'})</span>
              <span>{getCurrencySymbol(booking.currency)}{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{getCurrencySymbol(booking.currency)}{subtotal.toFixed(2)}</span>
            </div>
            {serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>{getCurrencySymbol(booking.currency)}{serviceFee.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{getCurrencySymbol(booking.currency)}{discount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{getCurrencySymbol(booking.currency)}{booking.total_price.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment status */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-center font-semibold text-green-800">
              Payment Status: {booking.payment_status.toUpperCase()}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for booking with MadeToHike!</p>
            <p className="mt-1">For questions, contact us at support@madetohike.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
