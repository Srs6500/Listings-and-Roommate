import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    
    // For demo purposes, we'll just log the email
    // In production, integrate with SendGrid, AWS SES, or similar
    console.log(`📧 VERIFICATION EMAIL SENT:`);
    console.log(`To: ${email}`);
    console.log(`Code: ${code}`);
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log(`---`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would:
    // 1. Use SendGrid, AWS SES, or similar service
    // 2. Send actual email with verification code
    // 3. Handle email delivery status
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      code: code // For demo purposes
    });
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
