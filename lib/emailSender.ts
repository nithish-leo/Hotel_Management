import nodemailer from "nodemailer";

export interface BookingEmailData {
  bookingId: number;
  customerName: string;
  customerEmail: string;
  roomNumber: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `Grand Escape Hotel <noreply@grandescape.com>`;

  const subject = `Reservation Confirmed — Booking #HB-${data.bookingId} | Grand Escape Resort`;
  
  // HTML Template with gorgeous styling matching the elite Grand Escape design
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Confirmed</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 20px;
            box-sizing: border-box;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background-color: #0a1f44;
            padding: 30px 40px;
            text-align: center;
            border-bottom: 4px solid #c9a84c;
          }
          .header h1 {
            color: #ffffff;
            font-size: 20px;
            letter-spacing: 3px;
            margin: 0;
            font-weight: 700;
            text-transform: uppercase;
          }
          .header p {
            color: #c9a84c;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 5px 0 0 0;
            font-weight: 600;
          }
          .content {
            padding: 40px 40px 30px 40px;
            line-height: 1.6;
          }
          .content h2 {
            color: #0a1f44;
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: 700;
          }
          .content p {
            font-size: 14px;
            color: #475569;
            margin: 0 0 20px 0;
          }
          .specs-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 25px;
          }
          .specs-card h3 {
            color: #c9a84c;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 15px 0;
            font-weight: 700;
          }
          .gold-value {
            color: #c9a84c;
          }
          .instruction-box {
            background-color: #fcf9f2;
            border-left: 4px solid #c9a84c;
            padding: 15px;
            border-radius: 4px 8px 8px 4px;
            margin-bottom: 25px;
          }
          .instruction-box p {
            font-size: 12.5px;
            color: #78350f;
            margin: 0;
            font-weight: 500;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 25px;
          }
          .btn {
            display: inline-block;
            background-color: #0a1f44;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            font-size: 11px;
            color: #64748b;
            margin: 0 0 8px 0;
            line-height: 1.5;
          }
          .footer a {
            color: #c9a84c;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <!-- Brand header -->
            <div class="header">
              <h1>GRAND ESCAPE RESORT</h1>
              <p>EXECUTIVE CLUB & LUXURY RESIDENCY</p>
            </div>
            
            <!-- Body content -->
            <div class="content">
              <h2>Reservation Stay Placed Successfully</h2>
              <p>Dear ${data.customerName},</p>
              <p>It is with absolute grandeur and exquisite anticipation that we confirm the successful placement of your luxury stay with us. Our premier hospitality artisans, executive chefs, and concierge hosts are already prepped to curate your supreme escape.</p>
              
              <!-- Features Grid Card -->
              <div class="specs-card">
                <h3>Reservation stay specifics</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Stay Reference ID</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #0f172a; font-weight: bold; text-align: right; font-family: monospace;">#HB-${data.bookingId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Appointed Accommodation</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #0f172a; font-weight: bold; text-align: right;">Suite ${data.roomNumber} (${data.roomTypeName})</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Period of Stay</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #0f172a; font-weight: normal; text-align: right;">${data.checkIn} to ${data.checkOut}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Financial Stay Charge</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #c9a84c; font-weight: bold; text-align: right;">INR ${data.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 13px; color: #64748b; font-weight: 500;">Approval Status</td>
                    <td style="padding: 10px 0; font-size: 13px; color: #c9a84c; font-weight: bold; text-align: right; text-transform: uppercase;">${data.status}</td>
                  </tr>
                </table>
              </div>

              <!-- Fast Pass Info -->
              <div class="instruction-box">
                <p>
                  <strong>🔑 Fast-Track Keyless Access:</strong> Your Arrival Direct Pass has been generated. Scan your unique QR code terminal pass directly at our desk lobby kiosk on arrival for immediate key dispensing.
                </p>
              </div>

              <!-- Action button -->
              <div class="btn-container">
                <a href="${process.env.APP_URL || 'https://grandescape.com'}" class="btn" style="color: #ffffff;" target="_blank">Access Guest Dashboard</a>
              </div>

              <p style="margin-top: 30px; font-size: 13px; color: #64748b;">Should you require any bespoke micro-details arranged prior to landing, please do not hesitate to reach our head butler desk.</p>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">With maximum esteem and flawless service,</p>
              <p style="font-size: 14px; color: #0a1f44; font-weight: bold; margin-top: 5px;">The Grand Escape Executive Concierge Team</p>
            </div>
            
            <!-- Standard Footer -->
            <div class="footer">
              <p><strong>Grand Escape Resort & Spa Ltd</strong><br>350 Luxury Boulevard, Metro Heights, MH 400101</p>
              <p>For urgent help, contact concierge on <a href="tel:+18005550190">+1 (800) 555-0190</a> or email <a href="mailto:concierge@grandescape.com">concierge@grandescape.com</a></p>
              <p style="font-size: 9px; color: #94a3b8; margin-top: 15px;">&copy; ${new Date().getFullYear()} Grand Escape Resort & Spa. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Try sending through SMTP transporter if configured
  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    
    await transporter.sendMail({
      from,
      to: data.customerEmail,
      subject,
      html: htmlBody,
    });
    console.log(`[NODEMAILER] Email successfully sent over SMTP to ${data.customerEmail} for stay #HB-${data.bookingId}`);
    return { success: true, simulated: false };
  } else {
    // If no credentials are found, attempt creating Ethereal test account so it is a REAL test send
    try {
      console.log(`[NODEMAILER] SMTP not configured. Attempting Ethereal Test Account fallback...`);
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `"Grand Escape Hotel" <noreply@grandescape.com>`,
        to: data.customerEmail,
        subject,
        html: htmlBody,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[NODEMAILER REGISTRY] Ethereal test email dispatched cleanly!`);
      console.log(`[NODEMAILER REGISTRY] Target: ${data.customerEmail}`);
      console.log(`[NODEMAILER REGISTRY] Ethereal Msg ID: ${info.messageId}`);
      console.log(`[NODEMAILER REGISTRY] Preview URL: ${previewUrl}`);

      return { 
        success: true, 
        simulated: true, 
        message: "Email dispatch simulated via Ethereal successfully!",
        previewUrl,
        messageId: info.messageId
      };
    } catch (testErr: any) {
      console.log(`[NODEMAILER FALLBACK] Ethereal online account generation failed (perhaps no network). Logging local fallback simulation for ${data.customerEmail}. Error was: ${testErr.message || testErr}`);
      return { 
        success: true, 
        simulated: true, 
        message: "Logged local simulation safely due to offline status" 
      };
    }
  }
}
