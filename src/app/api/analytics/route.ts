import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, inMemoryDB } from '@/lib/supabase';
import { QUIZ_QUESTIONS } from '@/data/questions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let submissions: any[] = [];
    let answerLogs: any[] = [];
    let supabaseError: string | null = null;
    let subErrorMsg: string | null = null;
    let logErrorMsg: string | null = null;

    if (isSupabaseConfigured && supabase) {
      const { data: subData, error: subError } = await supabase
        .from('quiz_submissions')
        .select('*');

      if (subError) {
        console.error('Supabase fetch submissions error:', subError);
        subErrorMsg = subError.message;
        supabaseError = subError.message;
      } else {
        submissions = subData || [];
      }

      const { data: logData, error: logError } = await supabase
        .from('quiz_answer_logs')
        .select('*');

      if (logError) {
        console.error('Supabase fetch answer logs error:', logError);
        logErrorMsg = logError.message;
        if (!supabaseError) supabaseError = logError.message;
      } else {
        answerLogs = logData || [];
      }
    } else {
      submissions = [...inMemoryDB.submissions];
      answerLogs = [...inMemoryDB.answerLogs];
    }

    // Sort submissions descending by created_at in JavaScript safely
    submissions.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0
      ? (submissions.reduce((acc, s) => acc + (Number(s.score) || 0), 0) / totalSubmissions).toFixed(1)
      : '0';
    const avgTime = totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + (Number(s.time_spent_seconds) || 0), 0) / totalSubmissions)
      : 0;

    // Per question statistics
    const questionStats = QUIZ_QUESTIONS.map((q) => {
      const logs = answerLogs.filter((l) => l.question_id === q.id);
      const totalAnswers = logs.length;
      const correctAnswers = logs.filter((l) => l.is_correct).length;
      const wrongAnswers = totalAnswers - correctAnswers;
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // Group wrong answers by text or distractor type
      const wrongBreakdown: Record<string, number> = {};
      logs
        .filter((l) => !l.is_correct)
        .forEach((l) => {
          const key = l.distractor_type || l.user_answer || '(unanswered)';
          wrongBreakdown[key] = (wrongBreakdown[key] || 0) + 1;
        });

      return {
        id: q.id,
        title: q.title,
        topic: q.topic,
        type: q.type,
        totalAnswers,
        correctAnswers,
        wrongAnswers,
        accuracy,
        wrongBreakdown,
      };
    });

    return NextResponse.json({
      isSupabaseConnected: isSupabaseConfigured,
      supabaseError,
      subErrorMsg,
      logErrorMsg,
      rawSubmissionCount: submissions.length,
      rawLogCount: answerLogs.length,
      totalSubmissions,
      avgScore,
      avgTime,
      questionStats,
      recentSubmissions: submissions.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
