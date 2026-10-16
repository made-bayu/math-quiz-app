'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, Database, CheckCircle, XCircle, Lock, KeyRound } from 'lucide-react';

interface QuestionStat {
  id: string;
  title: string;
  topic: string;
  type: string;
  totalAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  wrongBreakdown: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [data, setData] = useState<{
    isSupabaseConnected: boolean;
    supabaseError?: string | null;
    totalSubmissions: number;
    avgScore: string;
    avgTime: number;
    questionStats: QuestionStat[];
    recentSubmissions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'kalkulus2026';

    if (pinInput.trim() === targetPin) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      setPinError(false);
      fetchStats();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setData(null);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Protected Analytics Portal</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Restricted to authorized instructors. Please enter the passcode to access student results and error data.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter passcode"
                autoFocus
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-center text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-medium">
                Incorrect passcode. Access denied.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Unlock Dashboard
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition">
              &larr; Return to Quiz Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Quiz
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Wrong Answers & Quiz Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time diagnostic metrics on student misconceptions and wrong answer distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm rounded-xl font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium transition cursor-pointer"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Database Connection Status Banner */}
      {data && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm ${
            data.supabaseError
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : data.isSupabaseConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 shrink-0" />
            <span>
              {data.supabaseError ? (
                <>
                  <strong className="font-semibold">Supabase Connected, but Table Error:</strong> {data.supabaseError}. Did you run the SQL script in Supabase SQL Editor?
                </>
              ) : data.isSupabaseConnected ? (
                <>
                  <strong className="font-semibold">Supabase Connected:</strong> Submissions and error logs are persisting directly to PostgreSQL.
                </>
              ) : (
                <>
                  <strong className="font-semibold">In-Memory Mode (Demo):</strong> Storing data locally. Add <code className="px-1 py-0.5 bg-slate-900/60 rounded">NEXT_PUBLIC_SUPABASE_URL</code> to connect persistent PostgreSQL on Vercel.
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Macro Metrics Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</div>
            <div className="text-3xl font-extrabold text-white mt-2">{data.totalSubmissions}</div>
            <div className="text-xs text-slate-500 mt-1">Quiz attempts submitted</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Score</div>
            <div className="text-3xl font-extrabold text-indigo-400 mt-2">
              {data.avgScore} <span className="text-sm font-normal text-slate-400">/ 7</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Mean across all participants</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Time Spent</div>
            <div className="text-3xl font-extrabold text-white mt-2">
              {Math.floor(data.avgTime / 60)}m {data.avgTime % 60}s
            </div>
            <div className="text-xs text-slate-500 mt-1">Out of 6:00 minutes allowed</div>
          </div>
        </div>
      )}

      {/* Question by Question Detailed Error Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-indigo-400" />
          Per-Question Wrong Answer Breakdown
        </h2>

        {data?.questionStats?.map((q, idx) => {
          const breakdownEntries = Object.entries(q.wrongBreakdown).sort((a, b) => b[1] - a[1]);

          return (
            <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Question {idx + 1} &bull; {q.type === 'integer-input' ? 'Integer Input' : 'Multiple Choice'}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{q.title}</h3>
                  <p className="text-xs text-slate-400">{q.topic}</p>
                </div>

                {/* Accuracy Pill */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Accuracy</div>
                    <div
                      className={`text-lg font-bold ${
                        q.accuracy >= 70
                          ? 'text-emerald-400'
                          : q.accuracy >= 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {q.accuracy}%
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{q.correctAnswers}</span>
                    <span className="text-slate-600">/</span>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>{q.wrongAnswers}</span>
                  </div>
                </div>
              </div>

              {/* Wrong Answers Frequency List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Most Frequent Wrong Answers & Distractors Chosen:
                </div>

                {breakdownEntries.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No wrong answers recorded yet for this question.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {breakdownEntries.map(([distractorKey, count]) => {
                      const percentageOfWrong =
                        q.wrongAnswers > 0 ? Math.round((count / q.wrongAnswers) * 100) : 0;

                      return (
                        <div key={distractorKey} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                            <span className="font-mono text-rose-300 font-medium truncate max-w-md">
                              {distractorKey}
                            </span>
                            <span className="font-semibold text-slate-400 shrink-0">
                              {count} picks ({percentageOfWrong}% of errors)
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percentageOfWrong}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
