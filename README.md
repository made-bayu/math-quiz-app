# Calculus & Precalculus Diagnostic Quiz App

An interactive mathematical quiz application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **KaTeX**, and **Supabase (PostgreSQL)** for tracking student misconceptions and analyzing wrong answer distributions.

---

## Features

- **7 High-Caliber Calculus & Precalculus Questions:**
  1. *Pertidaksamaan Nilai Mutlak* (Matching 3-statement absolute value inequalities to domains in triads).
  2. *Fungsi Sepotong-sepotong* (Piecewise function from graph with strict vs. non-strict boundary traps).
  3. *Fungsi Setengah Lingkaran Atas* (Circle $x^2 + y^2 - 6x + 4y = 12$ matched against two graphs).
  4. *Limit Aljabar Sekawan* (Direct integer input: $\lim_{x \to 2} \frac{4-x^2}{3-\sqrt{x^2+5}} = 6$).
  5. *Kontinuitas Fungsi* (Direct integer input: finding parameter $c$ for piecewise continuity $\to c = 1$).
  6. *Aturan Perkalian & Rantai* (Derivative $h(x) = x^2 \sqrt{x^3 + 1}$).
  7. *Turunan Implisit* (Implicit differentiation of $x^2 + y^2 = (2x-y)^2 + 5$ at $(1, 1) \to 1/2$).
- **Strict 6-Minute Timer:** Automatic countdown that auto-submits answers on expiration.
- **One-Way / No Review Policy:** Questions advance sequentially without back-navigation.
- **Dynamic Shuffling:** Answer options are shuffled per participant session.
- **Wrong Answers Gathering & Analytics:**
  - Dedicated `/admin` dashboard showing question accuracy and a breakdown of which specific distractors or wrong integer values students typed in.
- **Zero-Config Fallback:** Runs immediately with in-memory storage if Supabase environment variables are omitted, then seamlessly transitions to PostgreSQL once keys are added.

---

## 1. Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the quiz, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the analytics dashboard.

---

## 2. Connect Supabase (Optional for Persistent Storage)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the script in:
   ```text
   supabase/schema.sql
   ```
3. Copy your project credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 3. Upload to GitHub

```bash
git init
git add .
git commit -m "Initial commit of math quiz application"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your imported GitHub repository.
3. In **Environment Variables** (optional, if using Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**. Vercel will build and launch the site within 60 seconds!
