'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Problem {
  a: number;
  b: number;
  op: '+' | '−';
  answer: number;
}

function makeProblem(): Problem {
  const plus = Math.random() < 0.5;
  let a = 1 + Math.floor(Math.random() * 9);
  let b = 1 + Math.floor(Math.random() * 9);
  if (!plus && b > a) [a, b] = [b, a];
  return { a, b, op: plus ? '+' : '−', answer: plus ? a + b : a - b };
}

export default function MathCaptcha({ onVerified }: { onVerified: (verified: boolean) => void }) {
  // The problem starts as null and is generated only on the client, after
  // hydration. Generating it with Math.random() at render time would produce
  // different numbers on the server and the client (hydration mismatch).
  const [problem, setProblem] = useState<Problem | null>(null);
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);

  const numeric = parseInt(input.trim(), 10);
  const correct =
    problem !== null &&
    input.trim() !== '' &&
    Number.isFinite(numeric) &&
    numeric === problem.answer;

  useEffect(() => {
    // Defer via a task so the effect stays synchronous-setState-free and the
    // random problem is created only after the client has hydrated.
    const id = setTimeout(() => {
      setProblem(makeProblem());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    onVerified(correct);
  }, [correct, onVerified]);

  const refresh = () => {
    setProblem(makeProblem());
    setInput('');
    setTouched(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 dark:text-dark-text mb-2">
        Security check
      </label>
      <div className="flex items-center gap-2">
        <div
          className="px-4 py-3 bg-[#F4F2FA] dark:bg-dark-bg-tertiary border border-[#E2E0F0] dark:border-dark-border rounded-md font-bold text-lg text-slate-900 dark:text-dark-text whitespace-nowrap"
          aria-label="Math security check"
        >
          {problem ? `${problem.a} ${problem.op} ${problem.b} = ?` : '··· = ?'}
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={() => setTouched(true)}
          placeholder="Answer"
          className="w-24 px-3 py-3 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#9370DB] focus:ring-1 focus:ring-[#9370DB]"
        />
        <button
          type="button"
          onClick={refresh}
          title="New problem"
          className="p-2.5 text-slate-400 hover:text-[#9370DB] hover:bg-[#9370DB]/10 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      {touched && input !== '' && !correct && (
        <p className="text-sm text-red-500 mt-1.5">That answer is incorrect — try again.</p>
      )}
    </div>
  );
}
