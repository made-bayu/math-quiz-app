import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, inMemoryDB, StoredSubmission, StoredAnswerLog } from '@/lib/supabase';
import { QUIZ_QUESTIONS } from '@/data/questions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      participantName,
      answers, // Record<string, string> (questionId -> chosen option text / input value)
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
        // multiple-choice
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

    // 1. If Supabase is configured, insert to PostgreSQL
    if (isSupabaseConfigured && supabase) {
      const { data: submissionData, error: subError } = await supabase
        .from('quiz_submissions')
        .insert({
          session_id: sessionId,
          participant_name: participantName || null,
          score,
          total_questions: totalQuestions,
          percentage,
          time_spent_seconds: timeSpentSeconds || 0,
        })
        .select()
        .single();

      if (subError) {
        console.error('Supabase submission insert error:', subError);
      } else if (submissionData) {
        const logsToInsert = answerLogs.map((log) => ({
          ...log,
          submission_id: submissionData.id,
        }));
        const { error: logsError } = await supabase
          .from('quiz_answer_logs')
          .insert(logsToInsert);

        if (logsError) {
          console.error('Supabase answer logs insert error:', logsError);
        }
      }
    } else {
      // 2. Save to In-Memory fallback store
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          submission_id: submissionId,
          ...log,
        });
      });
    }

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      percentage,
      timeSpentSeconds,
    });
  } catch (error: any) {
    console.error('Submit API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
