import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    // 1. Find the code in the DB
    const codeResult = await query(
      'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 ORDER BY expires_at DESC LIMIT 1',
      [email, code]
    );

    if (!codeResult || !codeResult.rows || codeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const verificationRecord = codeResult.rows[0];

    // 2. Check if expired
    if (new Date() > new Date(verificationRecord.expires_at)) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // 3. Mark user as verified
    const userUpdate = await query(
      'UPDATE users SET is_verified = TRUE WHERE email = $1 RETURNING id, name, email, role',
      [email]
    );

    if (!userUpdate || !userUpdate.rows || userUpdate.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userUpdate.rows[0];

    // 4. Delete the code to prevent reuse
    await query('DELETE FROM verification_codes WHERE email = $1', [email]);

    // 5. Generate JWT token to immediately log them in
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return NextResponse.json(
      { message: 'Email verified successfully', token, user },
      { status: 200 }
    );

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
