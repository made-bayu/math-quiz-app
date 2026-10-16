import os
import json

base_dir = r"c:\Coding\Antigravity\Data Science\math-quiz-app"

tsconfig_content = """{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"""
with open(os.path.join(base_dir, "tsconfig.json"), "w", encoding="utf-8") as f:
    f.write(tsconfig_content)

next_config = """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
"""
with open(os.path.join(base_dir, "next.config.mjs"), "w", encoding="utf-8") as f:
    f.write(next_config)

postcss_config = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"""
with open(os.path.join(base_dir, "postcss.config.js"), "w", encoding="utf-8") as f:
    f.write(postcss_config)

tailwind_config = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      }
    },
  },
  plugins: [],
};
"""
with open(os.path.join(base_dir, "tailwind.config.js"), "w", encoding="utf-8") as f:
    f.write(tailwind_config)

gitignore = """node_modules/
.next/
out/
.env*.local
.env
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
"""
with open(os.path.join(base_dir, ".gitignore"), "w", encoding="utf-8") as f:
    f.write(gitignore)

env_example = """# Supabase configuration (optional - app falls back gracefully to in-memory/demo mode if not set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-for-admin
"""
with open(os.path.join(base_dir, ".env.example"), "w", encoding="utf-8") as f:
    f.write(env_example)

schema_sql = """-- Supabase Schema for Math Quiz Analytics
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
"""
os.makedirs(os.path.join(base_dir, "supabase"), exist_ok=True)
with open(os.path.join(base_dir, "supabase", "schema.sql"), "w", encoding="utf-8") as f:
    f.write(schema_sql)

print("Configs and schema created successfully.")
