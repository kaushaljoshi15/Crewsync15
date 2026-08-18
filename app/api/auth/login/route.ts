import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 2. Find user in database
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2.5 Check if user signed up with Google (no password)
    if (!user.password_hash) {
      return NextResponse.json({ error: 'Please sign in with Google' }, { status: 401 });
    }

    // 2.6 Check verification status
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: 'Email not verified. Please check your email.',
        requiresVerification: true 
      }, { status: 403 });
    }

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Generate JWT Token (The "Session")
    const token = jwt.sign(
      { 
        user_id: user.id, 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        sub: String(user.id)
      },
      process.env.JWT_SECRET!,
      { expiresIn: '72h' }
    );

    // 5. Send success response with token
    return NextResponse.json(
      { 
        message: 'Login successful', 
        token, 
        user: { id: user.id, name: user.name, role: user.role } 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}