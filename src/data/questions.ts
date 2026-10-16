export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  distractorType?: string; // e.g. "boundary_error", "sign_error", "intercept_error"
  explanation?: string;
}

export interface Question {
  id: string;
  title: string;
  topic: string;
  type: 'multiple-choice' | 'integer-input';
  prompt: string;
  latex?: string;
  image?: string;
  correctAnswerText: string;
  correctInteger?: number;
  options?: QuestionOption[];
  explanation?: string;
}

export const QUIZ_QUESTIONS: Question[] = [
  // Question 1
  {
    id: 'q1',
    title: 'Question 1: Pertidaksamaan Nilai Mutlak',
    topic: 'Absolute Value Inequalities',
    type: 'multiple-choice',
    prompt: 'Cocokkanlah ketiga pertidaksamaan nilai mutlak berikut dengan himpunan penyelesaiannya yang tepat:\n\n' +
      '(I) $|4x + 3| < 9$\n\n' +
      '(II) $|2x + 7| \\ge 5$\n\n' +
      '(III) $2 \\le |2x - 6| \\le 4$',
    correctAnswerText: '(I) (-3, 1.5), (II) (-inf, -6] U [-1, inf), (III) [1, 2] U [4, 5]',
    options: [
      {
        id: 'q1_opt_a',
        text: '(I) $(-3, 1.5)$\n(II) $(-\\infty, -6] \\cup [-1, \\infty)$\n(III) $[1, 2] \\cup [4, 5]$',
        isCorrect: true,
        explanation: 'Benar! (I) -9 < 4x+3 < 9 => -3 < x < 1.5. (II) 2x+7 >= 5 => x >= -1 atau 2x+7 <= -5 => x <= -6. (III) 2 <= |2x-6| <= 4 => [1,2] U [4,5].'
      },
      {
        id: 'q1_opt_b',
        text: '(I) $(-\\infty, -3) \\cup (1.5, \\infty)$\n(II) $[-6, -1]$\n(III) $[1, 5]$',
        isCorrect: false,
        distractorType: 'inverted_intervals',
        explanation: 'Salah: Interval dibalik antara himpunan dalam dan himpunan luar.'
      },
      {
        id: 'q1_opt_c',
        text: '(I) $(-1.5, 3)$\n(II) $(-\\infty, -5] \\cup [1, \\infty)$\n(III) $[2, 4] \\cup [5, 6]$',
        isCorrect: false,
        distractorType: 'sign_endpoint_slip',
        explanation: 'Salah: Kesalahan tanda pada batas (I) dan pergeseran titik tengah pada (II) dan (III).'
      },
      {
        id: 'q1_opt_d',
        text: '(I) $(-3, 3)$\n(II) $(-\\infty, -7] \\cup [0, \\infty)$\n(III) $[0, 2] \\cup [3, 5]$',
        isCorrect: false,
        distractorType: 'center_shift_error',
        explanation: 'Salah: Mengasumsikan batas simetris (-3,3) pada (I) tanpa membagi koefisien 4.'
      }
    ]
  },

  // Question 2
  {
    id: 'q2',
    title: 'Question 2: Fungsi Sepotong-sepotong (Piecewise Function)',
    topic: 'Piecewise Functions from Graphs',
    type: 'multiple-choice',
    prompt: 'Berdasarkan grafik fungsi di bawah ini, tentukan rumus fungsi sepotong-sepotong $f(x)$ yang sesuai:',
    image: '/images/q2-piecewise.png',
    correctAnswerText: 'f(x) = {-x+2 (x <= -2), 2 (-2 < x <= 2), 3x-6 (x > 2)}',
    options: [
      {
        id: 'q2_opt_a',
        text: 'f(x) = \\begin{cases} -x + 2, & x \\le -2 \\\\ 2, & -2 < x \\le 2 \\\\ 3x - 6, & x > 2 \\end{cases}',
        isCorrect: true,
        explanation: 'Benar! Bagian kiri memiliki titik penuh di x=-2 (<=), bagian tengah -2 < x <= 2, dan garis hijau x > 2 dengan gradien 3.'
      },
      {
        id: 'q2_opt_b',
        text: 'f(x) = \\begin{cases} -x + 2, & x < -2 \\\\ 2, & -2 \\le x < 2 \\\\ 3x - 6, & x \\ge 2 \\end{cases}',
        isCorrect: false,
        distractorType: 'endpoint_strictness_inverted',
        explanation: 'Salah: Kebalikan dalam membaca lingkaran terbuka (open dot) dan lingkaran tertutup (solid dot).'
      },
      {
        id: 'q2_opt_c',
        text: 'f(x) = \\begin{cases} x + 4, & x \\le -2 \\\\ 2, & -2 < x \\le 2 \\\\ 3x - 2, & x > 2 \\end{cases}',
        isCorrect: false,
        distractorType: 'slope_intercept_distribution_error',
        explanation: 'Salah: Kesalahan tanda gradien pada ray kiri dan lupa mendistribusikan faktor 3 pada 3(x-2).'
      },
      {
        id: 'q2_opt_d',
        text: 'f(x) = \\begin{cases} -x + 2, & x \\le -2 \\\\ 2x, & -2 \\le x \\le 2 \\\\ 3x - 6, & x > 2 \\end{cases}',
        isCorrect: false,
        distractorType: 'constant_function_confusion',
        explanation: 'Salah: Menganggap garis horizontal konstan y=2 sebagai 2x dan tumpang tindih pada batas.'
      }
    ]
  },

  // Question 3
  {
    id: 'q3',
    title: 'Question 3: Fungsi Setengah Lingkaran Atas',
    topic: 'Circle Equation & Semicircle Function',
    type: 'multiple-choice',
    prompt: 'Diberikan persamaan lingkaran $x^2 + y^2 - 6x + 4y = 12$. Manakah fungsi lingkaran atasnya beserta gambarannya yang tepat pada grafik di bawah ini?',
    correctAnswerText: 'y = -2 + sqrt(25 - (x-3)^2) dengan Image 2',
    options: [
      {
        id: 'q3_opt_c',
        text: 'y = -2 + \\sqrt{25 - (x-3)^2} \\quad \\text{[Grafik Hijau: Pusat di } x=3 \\text{]}',
        isCorrect: true,
        explanation: 'Benar! (x-3)^2 + (y+2)^2 = 25 => y = -2 + sqrt(25-(x-3)^2), puncak di (3, 3) pada Gambar 2.'
      },
      {
        id: 'q3_opt_a',
        text: 'y = -2 + \\sqrt{15 - (x+7)^2} \\quad \\text{[Grafik Hitam: Pusat di } x=-7 \\text{]}',
        isCorrect: false,
        distractorType: 'wrong_radius_and_center_img1',
        explanation: 'Salah: Radius dan pusat lingkaran salah, menggunakan grafik Image 1.'
      },
      {
        id: 'q3_opt_b',
        text: 'y = -2 + \\sqrt{25 - (x+3)^2} \\quad \\text{[Grafik Hitam: Pusat di } x=-7 \\text{]}',
        isCorrect: false,
        distractorType: 'sign_error_center_img1',
        explanation: 'Salah: Tanda pusat salah (x+3 bukan x-3) dan dipasangkan dengan Image 1.'
      },
      {
        id: 'q3_opt_d',
        text: 'y = -2 + \\sqrt{25 - (x+3)^2} \\quad \\text{[Grafik Hijau: Pusat di } x=3 \\text{]}',
        isCorrect: false,
        distractorType: 'sign_error_center_img2',
        explanation: 'Salah: Formula menggunakan (x+3)^2 padahal pusat lingkaran berada di x = +3.'
      }
    ]
  },

  // Question 4
  {
    id: 'q4',
    title: 'Question 4: Limit Fungsi Aljabar',
    topic: 'Limits with Rationalization',
    type: 'integer-input',
    prompt: 'Hitunglah nilai limit berikut dan masukkan jawaban berupa bilangan bulat (integer):',
    latex: '\\lim_{x \\to 2} \\frac{4 - x^2}{3 - \\sqrt{x^2 + 5}}',
    correctAnswerText: '6',
    correctInteger: 6,
    explanation: 'Kalikan dengan sekawan (3 + sqrt(x^2+5)). Penyebut menjadi 9 - (x^2+5) = 4 - x^2. Maka limit menjadi 3 + sqrt(2^2+5) = 3 + 3 = 6.'
  },

  // Question 5
  {
    id: 'q5',
    title: 'Question 5: Kontinuitas Fungsi',
    topic: 'Continuity & Parameter Value',
    type: 'integer-input',
    prompt: 'Berapakah nilai konstanta $c$ (berupa bilangan bulat) agar fungsi $f(x)$ berikut kontinu di seluruh bilangan real?',
    latex: 'f(x) = \\begin{cases} cx + 3, & \\text{jika } x \\le 2 \\\\ cx^2 + 1, & \\text{jika } x > 2 \\end{cases}',
    correctAnswerText: '1',
    correctInteger: 1,
    explanation: 'Agar kontinu di x = 2, limit kiri harus sama dengan limit kanan: c(2) + 3 = c(2)^2 + 1 => 2c + 3 = 4c + 1 => 2c = 2 => c = 1.'
  },

  // Question 6
  {
    id: 'q6',
    title: 'Question 6: Aturan Perkalian & Rantai',
    topic: 'Product & Chain Rule Derivatives',
    type: 'multiple-choice',
    prompt: 'Tentukan turunan pertama $h\'(x)$ dari fungsi berikut:\n\n$$h(x) = x^2 \\sqrt{x^3 + 1}$$',
    correctAnswerText: '(7x^4 + 4x) / (2*sqrt(x^3 + 1))',
    options: [
      {
        id: 'q6_opt_a',
        text: 'h\'(x) = \\frac{7x^4 + 4x}{2\\sqrt{x^3 + 1}}',
        isCorrect: true,
        explanation: 'Benar! h\'(x) = 2x*sqrt(x^3+1) + x^2*(3x^2 / (2*sqrt(x^3+1))) = (4x(x^3+1) + 3x^4)/(2*sqrt(x^3+1)) = (7x^4+4x)/(2*sqrt(x^3+1)).'
      },
      {
        id: 'q6_opt_b',
        text: 'h\'(x) = \\frac{3x^3}{\\sqrt{x^3 + 1}}',
        isCorrect: false,
        distractorType: 'skipped_product_rule',
        explanation: 'Salah: Mengalikan turunan langsung (d/dx[x^2] * d/dx[akar]) tanpa menggunakan aturan perkalian u\'v + uv\'.'
      },
      {
        id: 'q6_opt_c',
        text: 'h\'(x) = \\frac{4x^4 + x^2 + 4x}{2\\sqrt{x^3 + 1}}',
        isCorrect: false,
        distractorType: 'missing_inner_chain_derivative',
        explanation: 'Salah: Lupa turunan fungsi dalam (3x^2) saat menerapkan aturan rantai pada akar.'
      },
      {
        id: 'q6_opt_d',
        text: 'h\'(x) = \\frac{7x^4 + 4x}{\\sqrt{x^3 + 1}}',
        isCorrect: false,
        distractorType: 'missing_denominator_factor_2',
        explanation: 'Salah: Lupa faktor 2 pada penyebut turunan akar 1/(2*sqrt(u)).'
      }
    ]
  },

  // Question 7
  {
    id: 'q7',
    title: 'Question 7: Turunan Implisit',
    topic: 'Implicit Differentiation',
    type: 'multiple-choice',
    prompt: 'Gunakan aturan turunan implisit untuk menentukan nilai $\\frac{dy}{dx}$ dari kurva berikut pada titik $(1, 1)$:\n\n$$x^2 + y^2 = (2x - y)^2 + 5$$',
    correctAnswerText: '1/2',
    options: [
      {
        id: 'q7_opt_a',
        text: '\\frac{dy}{dx} = \\frac{1}{2}',
        isCorrect: true,
        explanation: 'Benar! 2x + 2y*y\' = 2(2x-y)(2 - y\'). Pada (1,1): 2 + 2y\' = 2(1)(2 - y\') = 4 - 2y\' => 4y\' = 2 => y\' = 1/2.'
      },
      {
        id: 'q7_opt_b',
        text: '\\frac{dy}{dx} = -\\frac{1}{2}',
        isCorrect: false,
        distractorType: 'sign_error_implicit',
        explanation: 'Salah: Kesalahan tanda negatif saat memindahkan suku -2y\' ke ruas kiri.'
      },
      {
        id: 'q7_opt_c',
        text: '\\frac{dy}{dx} = 2',
        isCorrect: false,
        distractorType: 'inverted_derivative_dx_dy',
        explanation: 'Salah: Terbalik membagi koefisien sehingga menghitung dx/dy = 4/2 = 2.'
      },
      {
        id: 'q7_opt_d',
        text: '\\frac{dy}{dx} = 0',
        isCorrect: false,
        distractorType: 'missed_inner_derivative_sign',
        explanation: 'Salah: Menganggap d/dx[-y] = +y\' sehingga mendapatkan 2 + 2y\' = 4 + 2y\' (tereliminasi).'
      }
    ]
  }
];
