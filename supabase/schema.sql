-- Supabase Schema for Math Quiz Analytics
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    participant_name TEXT,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_answer_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES quiz_submissions(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_title TEXT NOT NULL,
    question_type TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    distractor_id TEXT,
    distractor_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answer_logs_question ON quiz_answer_logs(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_logs_correct ON quiz_answer_logs(is_correct);
CREATE INDEX IF NOT EXISTS idx_answer_logs_distractor ON quiz_answer_logs(distractor_type);

ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert on quiz_submissions"
    ON quiz_submissions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on quiz_answer_logs"
    ON quiz_answer_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous read on quiz_submissions"
    ON quiz_submissions FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous read on quiz_answer_logs"
    ON quiz_answer_logs FOR SELECT TO anon USING (true);
