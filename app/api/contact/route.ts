import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    // Basic server-side validation
    if (!firstName?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'First name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Log to console for now — wire up Resend/Nodemailer in Sprint 6
    console.log('[Contact Form Submission]', {
      from: `${firstName} ${lastName}`,
      email,
      message,
      receivedAt: new Date().toISOString(),
    });

    // TODO Sprint 6: Send email via Resend / Nodemailer
    // await sendEmail({ to: 'support@foodiee.com', subject: `Contact from ${firstName}`, body: message });

    return NextResponse.json(
      { success: true, message: 'Your message has been received. We will get back to you shortly!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
