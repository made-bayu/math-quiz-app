'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MathRenderer } from '@/components/MathRenderer';
import { QUIZ_QUESTIONS, Question, QuestionOption } from '@/data/questions';
import { Clock, ShieldAlert, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const TOTAL_QUIZ_TIME_SECONDS = 360; // 6 minutes

export default function QuizPage() {
  const [quizState, setQuizState] = useState<'home' | 'active' | 'completed'>('home');
  const [participantName, setParticipantName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Time remaining in seconds
  const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Current answer state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [integerInput, setIntegerInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    timeSpent: number;
  } | null>(null);

  // Shuffled options map for this session (questionId -> shuffled QuestionOption[])
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState<Record<string, QuestionOption[]>>({});

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Start Quiz handler
  const handleStartQuiz = () => {
    // Shuffle options for all multiple-choice questions
    const shuffled: Record<string, QuestionOption[]> = {};
    QUIZ_QUESTIONS.forEach((q) => {
      if (q.options) {
        shuffled[q.id] = shuffleArray(q.options);
      }
    });
    setShuffledOptionsMap(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption('');
    setIntegerInput('');
    setTimeLeft(TOTAL_QUIZ_TIME_SECONDS);
    setQuizState('active');
  };

  // Timer countdown
  useEffect(() => {
    if (quizState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleAutoSubmitTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState]);

  // Current question
  const currentQuestion: Question = useMemo(() => QUIZ_QUESTIONS[currentIndex], [currentIndex]);

  // Options for current question (shuffled)
  const currentOptions = useMemo(() => {
    return shuffledOptionsMap[currentQuestion?.id] || currentQuestion?.options || [];
  }, [shuffledOptionsMap, currentQuestion]);

  // Check if current question has an answer ready
  const isCurrentAnswerValid = useMemo(() => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'integer-input') {
      return integerInput.trim() !== '' && !isNaN(parseInt(integerInput, 10));
    }
    return selectedOption.trim() !== '';
  }, [currentQuestion, integerInput, selectedOption]);

  // Submit quiz to API
  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    const timeSpent = TOTAL_QUIZ_TIME_SECONDS - timeLeft;

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          participantName: participantName.trim() || null,
          answers: finalAnswers,
          timeSpentSeconds: timeSpent,
        }),
      });

      const data = await res.json();
      setFinalResult({
        score: data.score ?? 0,
        total: data.totalQuestions ?? QUIZ_QUESTIONS.length,
        percentage: data.percentage ?? 0,
        timeSpent: data.timeSpentSeconds ?? timeSpent,
      });
      setQuizState('completed');
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      // Fallback calculation on client if offline
      let localScore = 0;
      QUIZ_QUESTIONS.forEach((q) => {
        const ans = finalAnswers[q.id];
        if (q.type === 'integer-input' && parseInt(ans, 10) === q.correctInteger) {
          localScore += 1;
        } else if (q.options?.find((o) => o.text.trim() === ans?.trim())?.isCorrect) {
          localScore += 1;
        }
      });
      setFinalResult({
        score: localScore,
        total: QUIZ_QUESTIONS.length,
        percentage: Number(((localScore / QUIZ_QUESTIONS.length) * 100).toFixed(2)),
        timeSpent,
      });
      setQuizState('completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle timeout auto submit
  const handleAutoSubmitTimeout = () => {
    const currentAns = currentQuestion?.type === 'integer-input' ? integerInput : selectedOption;
    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: currentAns,
    };
    submitQuiz(finalAnswers);
  };

  // Handle Next Question (strictly no review, one-way forward)
  const handleNextQuestion = () => {
    const currentAns = currentQuestion.type === 'integer-input' ? integerInput.trim() : selectedOption;
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: currentAns,
    };
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption('');
      setIntegerInput('');
    } else {
      // Last question completed!
      submitQuiz(updatedAnswers);
    }
  };

  // Format time as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // VIEW 1: HOME SCREEN
  // ==========================================
  if (quizState === 'home') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="text-center space-y-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Diagnostic Assessment
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Calculus & Precalculus Quiz
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
              Test your understanding across intervals, piecewise functions, circle geometry, rationalizing limits, and chain rule derivatives.
            </p>
          </div>

          {/* Rules & Constraints Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-sm text-slate-200">Strict 6-Minute Timer</h2>
                <p className="text-xs text-slate-400 mt-1">
                  You have exactly 6:00 minutes to complete 7 questions. The quiz auto-submits when time expires.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-sm text-slate-200">No Review / One-Way</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Once an answer is confirmed and you move to the next question, you cannot return to modify previous answers.
                </p>
              </div>
            </div>
          </div>

          {/* Participant Identifier Input */}
          <div className="space-y-4 mb-8">
            <label htmlFor="participant-name" className="block text-sm font-medium text-slate-300">
              Participant Name or Identifier <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              id="participant-name"
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="e.g. Alex or Student-101 (or leave blank for anonymous)"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Actions */}
          <div>
            <button
              onClick={handleStartQuiz}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              Start Quiz Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE QUIZ SCREEN
  // ==========================================
  if (quizState === 'active') {
    const isUrgentTime = timeLeft <= 60;
    const progressPercent = ((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Top Header Bar: Progress & Live Countdown Timer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
            </div>
            <div className="text-sm font-medium text-slate-200">
              {currentQuestion.topic}
            </div>
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg sm:text-xl transition ${
              isUrgentTime
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-slate-950 text-indigo-400 border-slate-800'
            }`}
          >
            <Clock className={`w-5 h-5 ${isUrgentTime ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 mb-6 overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Title & Prompt */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {currentQuestion.title}
              </h2>
              <div className="text-slate-300 text-base sm:text-lg leading-relaxed">
                <MathRenderer content={currentQuestion.prompt} />
              </div>

              {currentQuestion.latex && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl my-4 text-center">
                  <MathRenderer content={currentQuestion.latex} block />
                </div>
              )}
            </div>

            {/* Question 2 Piecewise Image */}
            {currentQuestion.id === 'q2' && currentQuestion.image && (
              <div className="flex justify-center my-4">
                <div className="relative border border-slate-700 rounded-xl overflow-hidden shadow-md bg-white p-2">
                  <Image
                    src={currentQuestion.image}
                    alt="Piecewise function graph"
                    width={480}
                    height={320}
                    className="max-h-72 w-auto object-contain"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Question 3 Semicircle Images (Image 1 vs Image 2) */}
            {currentQuestion.id === 'q3' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-xs font-semibold text-slate-400 mb-2">[Image 1: Grafik Hitam]</div>
                  <div className="relative border border-slate-700 rounded-lg overflow-hidden bg-white p-1">
                    <Image
                      src="/images/q3-circle-wrong.png"
                      alt="Circle graph 1"
                      width={380}
                      height={240}
                      className="max-h-48 w-auto mx-auto object-contain"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-xs font-semibold text-emerald-400 mb-2">[Image 2: Grafik Hijau]</div>
                  <div className="relative border border-slate-700 rounded-lg overflow-hidden bg-white p-1">
                    <Image
                      src="/images/q3-circle-correct.png"
                      alt="Circle graph 2"
                      width={380}
                      height={240}
                      className="max-h-48 w-auto mx-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Answer Interface: Multiple Choice vs Integer Input */}
            {currentQuestion.type === 'integer-input' ? (
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <label htmlFor="integer-answer-input" className="block text-sm font-semibold text-slate-300">
                  Masukkan Nilai Bilangan Bulat (Integer):
                </label>
                <div className="max-w-xs">
                  <input
                    id="integer-answer-input"
                    type="number"
                    step="1"
                    value={integerInput}
                    onChange={(e) => setIntegerInput(e.target.value)}
                    placeholder="Ketik angka bulat di sini..."
                    autoFocus
                    className="w-full px-5 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-2xl font-mono text-center text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Ketikkan angka bilangan bulat saja. Klik &quot;Next Question&quot; setelah mengisi.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Pilih salah satu jawaban (Urutan diacak):
                </div>
                {currentOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt.text;
                  const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOption(opt.text)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-4 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 transition ${
                          isSelected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <div className="flex-1 text-sm sm:text-base leading-relaxed overflow-x-auto">
                        <MathRenderer content={opt.text} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer (strictly one-way next, no review) */}
          <div className="pt-8 border-t border-slate-800/80 flex items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>Review tidak diizinkan. Jawaban langsung dikunci.</span>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={!isCurrentAnswerValid || isSubmitting}
              className={`py-3.5 px-7 rounded-xl font-semibold text-white flex items-center gap-2 transition cursor-pointer ${
                isCurrentAnswerValid && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : currentIndex + 1 === QUIZ_QUESTIONS.length ? (
                <>
                  Submit Final Quiz
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: COMPLETED SCREEN (NO REVIEW ALLOWED)
  // ==========================================
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-indigo-500" />

        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Quiz Completed!</h1>
          <p className="text-slate-400 text-sm">
            {participantName ? `Thank you, ${participantName}. ` : ''}Your responses and error data have been securely recorded.
          </p>
        </div>

        {/* Score Card */}
        {finalResult && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Your Score</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              {finalResult.score} / {finalResult.total}
            </div>
            <div className="text-sm font-medium text-slate-400">
              Accuracy: <span className="text-white font-bold">{finalResult.percentage}%</span> &bull; Time:{' '}
              <span className="text-white font-bold">{formatTime(finalResult.timeSpent)}</span>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">Policy Note:</span> In accordance with the quiz rules, review and modification of past answers are closed.
        </div>
      </div>
    </div>
  );
}
