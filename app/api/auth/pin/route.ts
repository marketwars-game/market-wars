// app/api/auth/pin/route.ts
// =============================================
// PIN Verification — ตรวจสอบ Master PIN ฝั่ง server
// MC_PIN อยู่ใน env variable (ไม่เปิดเผยให้ browser)
// =============================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    // อ่าน PIN จาก environment variable
    const masterPin = process.env.MC_PIN;

    if (!masterPin) {
      console.error('MC_PIN not set in environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (pin === masterPin) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'รหัสไม่ถูกต้อง' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}