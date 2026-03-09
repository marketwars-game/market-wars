import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    return NextResponse.json({
      status: "ok",
      supabase: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      supabase: false,
      message: String(err),
    });
  }
}