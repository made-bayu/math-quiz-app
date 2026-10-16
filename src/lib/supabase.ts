import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
);

// Fallback in-memory storage for local dev / demo before Supabase keys are added
export interface StoredSubmission {
  id: string;
  session_id: string;
  participant_name: string | null;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  created_at: string;
}

export interface StoredAnswerLog {
  id: string;
  submission_id: string;
  session_id: string;
  question_id: string;
  question_title: string;
  question_type: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  distractor_id: string | null;
  distractor_type: string | null;
  created_at: string;
}

// Global in-memory cache for serverless invocation lifetime / local testing
declare global {
  // eslint-disable-next-line no-var
  var __inMemorySubmissions: StoredSubmission[] | undefined;
  // eslint-disable-next-line no-var
  var __inMemoryAnswerLogs: StoredAnswerLog[] | undefined;
}

if (!global.__inMemorySubmissions) {
  global.__inMemorySubmissions = [];
}
if (!global.__inMemoryAnswerLogs) {
  global.__inMemoryAnswerLogs = [];
}

export const inMemoryDB = {
  submissions: global.__inMemorySubmissions,
  answerLogs: global.__inMemoryAnswerLogs,
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
