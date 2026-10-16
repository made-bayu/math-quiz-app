import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured, inMemoryDB, StoredSubmission, StoredAnswerLog } from '@/lib/supabase';
import { QUIZ_QUESTIONS } from '@/data/questions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      participantName,
      answers,
      timeSpentSeconds,
    } = body;

    if (!sessionId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let score = 0;
    const answerLogs: Omit<StoredAnswerLog, 'id' | 'submission_id'>[] = [];

    // Evaluate answers
    QUIZ_QUESTIONS.forEach((q) => {
      const userAnswer = (answers[q.id] || '').trim();
      let isCorrect = false;
      let distractorId: string | null = null;
      let distractorType: string | null = null;

      if (q.type === 'integer-input') {
        const parsed = parseInt(userAnswer, 10);
        isCorrect = !isNaN(parsed) && parsed === q.correctInteger;
        if (!isCorrect && userAnswer) {
          distractorType = `wrong_integer_${userAnswer}`;
        }
      } else {
        const matchedOption = q.options?.find((opt) => opt.text.trim() === userAnswer.trim());
        if (matchedOption) {
          isCorrect = matchedOption.isCorrect;
          if (!isCorrect) {
            distractorId = matchedOption.id;
            distractorType = matchedOption.distractorType || 'unspecified_distractor';
          }
        }
      }

      if (isCorrect) score += 1;

      answerLogs.push({
        session_id: sessionId,
        question_id: q.id,
        question_title: q.title,
        question_type: q.type,
        user_answer: userAnswer || '(unanswered)',
        correct_answer: q.correctAnswerText,
        is_correct: isCorrect,
        distractor_id: distractorId,
        distractor_type: distractorType,
        created_at: new Date().toISOString(),
      });
    });

    const totalQuestions = QUIZ_QUESTIONS.length;
    const percentage = Number(((score / totalQuestions) * 100).toFixed(2));
    const now = new Date().toISOString();
    const submissionId = crypto.randomUUID();

    let supabaseError: string | null = null;

    // 1. If Supabase is configured, insert to PostgreSQL
    if (isSupabaseConfigured && supabase) {
      const { error: subError } = await supabase
        .from('quiz_submissions')
        .insert({
          id: submissionId,
          session_id: sessionId,
          participant_name: participantName || null,
          score,
          total_questions: totalQuestions,
          percentage,
          time_spent_seconds: timeSpentSeconds || 0,
        });

      if (subError) {
        console.error('Supabase submission insert error:', subError);
        supabaseError = subError.message;
      } else {
        const logsToInsert = answerLogs.map((log) => ({
          id: crypto.randomUUID(),
          ...log,
          submission_id: submissionId,
        }));

        const { error: logsError } = await supabase
          .from('quiz_answer_logs')
          .insert(logsToInsert);

        if (logsError) {
          console.error('Supabase answer logs insert error:', logsError);
          if (!supabaseError) supabaseError = logsError.message;
        }
      }
    }

    // Always mirror to In-Memory fallback store
    const submissionRecord: StoredSubmission = {
      id: submissionId,
      session_id: sessionId,
      participant_name: participantName || null,
      score,
      total_questions: totalQuestions,
      percentage,
      time_spent_seconds: timeSpentSeconds || 0,
      created_at: now,
    };
    inMemoryDB.submissions.push(submissionRecord);

    answerLogs.forEach((log) => {
      inMemoryDB.answerLogs.push({
        id: crypto.randomUUID(),
        submission_id: submissionId,
        ...log,
      });
    });

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      timeSpentSeconds,
      supabaseError,
    });
  } catch (error: any) {
    console.error('Submit API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
