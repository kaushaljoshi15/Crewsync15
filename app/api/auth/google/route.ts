import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Note: Replace with actual client ID from environment
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';
const client = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
    }

    // 1. Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email || !payload.sub) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { email, name, sub: google_id } = payload;

    // 2. Check if user exists
    let result = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];

    if (!user) {
      // 3. If no user, silently register them
      // Since it's from Google, we automatically consider email verified
      const insertResult = await query(
        `INSERT INTO users (name, email, google_id, role, is_verified) 
         VALUES ($1, $2, $3, 'volunteer', TRUE) RETURNING id, name, email, role, is_verified`,
        [name, email, google_id]
      );
      user = insertResult.rows[0];

      // Send the Welcome Email to demonstrate Nodemailer works perfectly with Google Auth too
      const { sendGoogleWelcomeEmail } = await import('@/lib/email');
      await sendGoogleWelcomeEmail(email, name || 'User');
      
    } else {
      // If user exists but didn't have google_id linked, link it now
      if (!user.google_id) {
        await query('UPDATE users SET google_id = $1, is_verified = TRUE WHERE email = $2', [google_id, email]);
      }
    }

    // 4. Generate local JWT session
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json(
      { message: 'Google Sign In successful', token, user },
      { status: 200 }
    );

  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
