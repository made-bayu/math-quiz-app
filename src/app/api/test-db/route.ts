import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = (
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      ''
    ).trim();

    const key = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      ''
    ).trim();

    const diagnostics = {
      isSupabaseConfigured,
      hasClient: Boolean(supabase),
      urlPrefix: url ? url.substring(0, 20) + '...' : '(empty)',
      keyLength: key ? key.length : 0,
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    };

    if (!supabase) {
      return NextResponse.json({ ...diagnostics, status: 'client_null' });
    }

    // Try selecting from quiz_submissions
    const { data: selectData, error: selectError, count } = await supabase
      .from('quiz_submissions')
      .select('*', { count: 'exact' });

    // Try a test insert
    const testId = crypto.randomUUID();
    const { data: insertData, error: insertError } = await supabase
      .from('quiz_submissions')
      .insert({
        id: testId,
        session_id: 'diag_test_session',
        participant_name: 'Diagnostic Test',
        score: 7,
        total_questions: 7,
        percentage: 100,
        time_spent_seconds: 30,
      })
      .select();

    return NextResponse.json({
      diagnostics,
      select: {
        count,
        rowCount: selectData ? selectData.length : null,
        error: selectError ? selectError.message : null,
        details: selectError,
      },
      insert: {
        error: insertError ? insertError.message : null,
        details: insertError,
        insertedRow: insertData,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
