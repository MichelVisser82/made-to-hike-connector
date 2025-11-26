import { format } from 'date-fns';
import jsPDF from 'jspdf';

/**
 * Download data as CSV file
 */
export function downloadCSV(data: string[][], filename: string) {
  const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const symbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CHF': 'CHF',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Format date in consistent format
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatStr);
}

/**
 * Create a branded PDF with MadeToHike styling
 */
export function createBrandedPDF(title: string): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Brand colors (burgundy: #7C2D3A)
  const burgundy: [number, number, number] = [124, 45, 58];
  
  // Header with MadeToHike branding
  doc.setFillColor(...burgundy);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MadeToHike', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, pageWidth / 2, 25, { align: 'center' });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  
  return doc;
}

/**
 * Add footer to PDF
 */
export function addPDFFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing MadeToHike!', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('support@madetohike.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
}

/**
 * Add section header to PDF
 */
export function addPDFSection(doc: jsPDF, title: string, y: number): number {
  const burgundy: [number, number, number] = [124, 45, 58];
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...burgundy);
  doc.text(title, 20, y);
  
  // Reset to normal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  return y + 7; // Return new Y position
}
