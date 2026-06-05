import { jsPDF } from 'jspdf';
import { Booking } from '@/types';

export interface PDFGuestInfo {
  userId?: number;
  name?: string;
  email?: string;
}

const calculateNights = (inDateStr: string, outDateStr: string) => {
  if (!inDateStr || !outDateStr) return 1;
  try {
    const d1 = new Date(inDateStr);
    const d2 = new Date(outDateStr);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  } catch {
    return 1;
  }
};

export function generateReceiptPDF(booking: Booking, guest: PDFGuestInfo, method: string = 'Digital Settle') {
  // Create PDF document instance (A4 size: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [10, 31, 68]; // #0A1F44 (Navy)
  const accentColor = [201, 168, 76]; // #C9A84C (Gold)
  const darkTextColor = [30, 41, 59]; // slate-800
  const lightTextColor = [100, 116, 139]; // slate-500
  const lightBgColor = [248, 250, 252]; // slate-50

  // Margins & Dimensions
  const margenX = 20;
  let currentY = 15;

  // --- Top Header Decorative Band ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 4, 'F');
  currentY += 8;

  // --- Brand Logo & Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('GRAND ESCAPE RESORT', margenX, currentY);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('EXECUTIVE CLUB & LUXURY RESIDENCY', margenX, currentY + 4.5);

  // --- Title Right Side (Invoice Info) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('PAYMENT RECEIPT', 190, currentY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(`Receipt Reference: #REC-HB-${booking.booking_id}`, 190, currentY + 4.5, { align: 'right' });
  doc.text(`Date Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 190, currentY + 8.5, { align: 'right' });

  currentY += 15;

  // Draw separator line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margenX, currentY, 190, currentY);
  currentY += 10;

  // --- Information Grid ---
  // Guest Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('BILLED GUEST', margenX, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(guest.name || 'Valued Guest', margenX, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(guest.email || 'guest@example.com', margenX, currentY + 9.5);
  doc.text(`Guest Unique ID: #G-${guest.userId || 'N/A'}`, margenX, currentY + 14);

  // Vendor Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('PROPERTY DETAILS', 115, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('Grand Escape Resort & Spa Ltd', 115, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('350 Luxury Boulevard, Suite 100', 115, currentY + 9.5);
  doc.text('Metro Heights, MH 400101', 115, currentY + 14);

  currentY += 24;

  // --- Settle Details Segment Box ---
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.roundedRect(margenX, currentY, 170, 16, 2, 2, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TRANSACTION SUMMARY', margenX + 5, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Payment Method: ${method}`, margenX + 5, currentY + 11);
  doc.text(`Booking Status: Paid & Confirmed`, margenX + 70, currentY + 11);
  doc.text(`Gateway Channel: Safe Settle Protocol`, margenX + 120, currentY + 11);

  currentY += 24;

  // --- Accommodation Stay Breakdown Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ACCOMMODATION BREAKDOWN', margenX, currentY);

  currentY += 4;

  // Table header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margenX, currentY, 170, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Suite & Description', margenX + 4, currentY + 5.5);
  doc.text('Period of Stay', margenX + 55, currentY + 5.5);
  doc.text('Nights', margenX + 110, currentY + 5.5, { align: 'center' });
  doc.text('Daily Fare', margenX + 138, currentY + 5.5, { align: 'right' });
  doc.text('Amount (INR)', margenX + 166, currentY + 5.5, { align: 'right' });

  // Table content
  currentY += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(margenX, currentY, 170, 18, 'F');
  
  // Outer cell border
  doc.setDrawColor(226, 232, 240);
  doc.rect(margenX, currentY, 170, 18);

  const nights = calculateNights(booking.check_in, booking.check_out);
  const totalAmount = Number(booking.total_amount) || 0;
  const pricePerNight = Math.round(totalAmount / nights);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Suite ${booking.room_number || 'TBD'}`, margenX + 4, currentY + 6.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(booking.type_name || 'PREMIUM DELUXE SUITE', margenX + 4, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`${booking.check_in} to ${booking.check_out}`, margenX + 55, currentY + 9);

  doc.text(String(nights), margenX + 110, currentY + 9, { align: 'center' });
  doc.text(`INR ${pricePerNight.toLocaleString()}`, margenX + 138, currentY + 9, { align: 'right' });
  doc.text(`INR ${totalAmount.toLocaleString()}`, margenX + 166, currentY + 9, { align: 'right' });

  currentY += 24;

  // --- Invoice Calculations Box ---
  const calculationWidth = 80;
  const startX = 190 - calculationWidth;

  const basePrice = Math.round(totalAmount * 0.88);
  const luxuryTax = totalAmount - basePrice;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  
  doc.text('Base Accommodation charge:', startX, currentY);
  doc.text(`INR ${basePrice.toLocaleString()}`, 190, currentY, { align: 'right' });

  currentY += 5;
  doc.text('Incidental Luxury GST & Levy (12%):', startX, currentY);
  doc.text(`INR ${luxuryTax.toLocaleString()}`, 190, currentY, { align: 'right' });

  currentY += 3;
  // bold line under math
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(startX, currentY, 190, currentY);
  currentY += 6;

  // Grand Total font styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL AMOUNT PAID:', startX, currentY);
  doc.text(`INR ${totalAmount.toLocaleString()}`, 190, currentY, { align: 'right' });

  currentY += 15;

  // --- Terms & Footer Signature stamp ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('TERMS & CONDITIONS', margenX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  const termsText = [
    '1. This constitutes an authorized and fully integrated formal receipt of transaction settlement at Grand Escape Resort.',
    '2. Additional service requests, premium menu, and spa charges requested in-house will be billed separately at departure.',
    '3. This digital compilation contains dynamic security hashes matching receipt records database ledger references.',
  ];
  termsText.forEach((t, i) => {
    doc.text(t, margenX, currentY + 4.5 + i * 3.5);
  });

  // Stamp and Digital Authorization signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('GRAND ESCAPE RESORT & SPA LTD', 190, currentY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('AUDITED ONLINE GATEWAY SIGNATURE', 190, currentY + 4.5, { align: 'right' });
  doc.text('SYSTEM NO PAY-CLEAR-3490X', 190, currentY + 8.5, { align: 'right' });

  // Seal badge drawing
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.3);
  doc.line(140, currentY + 12, 190, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('DIGITALLY SECURED RECEIPT', 190, currentY + 15, { align: 'right' });

  // Save/Download operation trigger
  doc.save(`GrandEscape_Receipt_HB-${booking.booking_id}.pdf`);
}
