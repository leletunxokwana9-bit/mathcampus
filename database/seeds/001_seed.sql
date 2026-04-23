-- ============================================================
-- MathCampus — Seed Data
-- All 10 CAPS Grade 12 Mathematics Campuses
-- ============================================================

BEGIN;

-- ── Campuses ─────────────────────────────────────────────────
INSERT INTO campuses (id, title, slug, icon, color, tag, tag_color, description, difficulty, estimated_hours, rating, student_count, sort_order, is_published) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Functions & Graphs',          'functions',    '📈', '#00D4FF', 'Core',       '#00D4FF', 'Master parabolas, hyperbolas, exponential & logarithmic functions. Understand domain, range, transformations and inverses.',                              'Medium', 28, 4.8, 3842, 1,  true),
  ('11111111-0002-0002-0002-000000000002', 'Sequences & Series',          'sequences',    '🔢', '#FFB800', 'Core',       '#FFB800', 'Arithmetic and geometric sequences, sigma notation, and the formula derivations for finite and infinite series.',                                     'Medium', 22, 4.7, 3210, 2,  true),
  ('11111111-0003-0003-0003-000000000003', 'Differential Calculus',       'calculus',     '∂',  '#A855F7', 'Advanced',   '#A855F7', 'Limits, derivatives using first principles and rules, sketching cubic graphs, optimization and rate of change problems.',                            'Hard',   35, 4.9, 2987, 3,  true),
  ('11111111-0004-0004-0004-000000000004', 'Finance, Growth & Decay',     'finance',      '💰', '#00E5A0', 'Core',       '#00E5A0', 'Simple and compound interest, effective vs nominal rates, annuities, present value, future value, and loan calculations.',                          'Medium', 20, 4.6, 2654, 4,  true),
  ('11111111-0005-0005-0005-000000000005', 'Algebra & Equations',         'algebra',      '✕',  '#FF4D6D', 'Foundation', '#FF4D6D', 'Quadratic equations, inequalities, simultaneous equations, nature of roots (discriminant), and completing the square.',                             'Medium', 24, 4.5, 4102, 5,  true),
  ('11111111-0006-0006-0006-000000000006', 'Probability',                 'probability',  '🎲', '#F97316', 'Core',       '#F97316', 'Venn diagrams, tree diagrams, counting principles, permutations, combinations, and conditional probability.',                                       'Medium', 18, 4.4, 2341, 6,  true),
  ('11111111-0007-0007-0007-000000000007', 'Euclidean Geometry',          'geometry',     '△',  '#06B6D4', 'Core',       '#06B6D4', 'Circle theorems, proofs, proportionality theorem, mid-point theorem, and similarity of triangles.',                                                 'Hard',   30, 4.6, 2876, 7,  true),
  ('11111111-0008-0008-0008-000000000008', 'Trigonometry',                'trigonometry', 'sin','#EC4899', 'Core',       '#EC4899', 'Compound angles, double angles, trigonometric equations, general solutions, and 2D/3D applications.',                                               'Hard',   32, 4.7, 3564, 8,  true),
  ('11111111-0009-0009-0009-000000000009', 'Analytical Geometry',         'analytical',   '⊕',  '#84CC16', 'Core',       '#84CC16', 'Distance, midpoint, gradient, equation of a line, equation of a circle, and tangent to a circle.',                                                 'Medium', 20, 4.5, 2190, 9,  true),
  ('11111111-0010-0010-0010-000000000010', 'Statistics',                  'statistics',   '📊', '#F59E0B', 'Core',       '#F59E0B', 'Regression analysis, correlation, standard deviation, ogives, histograms, and data interpretation.',                                                'Easy',   16, 4.3, 1987, 10, true);

-- ── Campus Topics ─────────────────────────────────────────────
INSERT INTO campus_topics (campus_id, name, sort_order) VALUES
  -- Functions
  ('11111111-0001-0001-0001-000000000001', 'Parabola (quadratic)',      1),
  ('11111111-0001-0001-0001-000000000001', 'Hyperbola',                 2),
  ('11111111-0001-0001-0001-000000000001', 'Exponential Functions',     3),
  ('11111111-0001-0001-0001-000000000001', 'Logarithms',                4),
  ('11111111-0001-0001-0001-000000000001', 'Trigonometric Functions',   5),
  ('11111111-0001-0001-0001-000000000001', 'Inverses',                  6),
  -- Sequences
  ('11111111-0002-0002-0002-000000000002', 'Arithmetic Sequences',      1),
  ('11111111-0002-0002-0002-000000000002', 'Geometric Sequences',       2),
  ('11111111-0002-0002-0002-000000000002', 'Arithmetic Series',         3),
  ('11111111-0002-0002-0002-000000000002', 'Geometric Series',          4),
  ('11111111-0002-0002-0002-000000000002', 'Sigma Notation',            5),
  ('11111111-0002-0002-0002-000000000002', 'Infinite Series',           6),
  -- Calculus
  ('11111111-0003-0003-0003-000000000003', 'Limits & First Principles', 1),
  ('11111111-0003-0003-0003-000000000003', 'Power Rule',                2),
  ('11111111-0003-0003-0003-000000000003', 'Chain/Product/Quotient Rule',3),
  ('11111111-0003-0003-0003-000000000003', 'Cubic Graph Sketching',     4),
  ('11111111-0003-0003-0003-000000000003', 'Optimization',              5),
  ('11111111-0003-0003-0003-000000000003', 'Rate of Change',            6);

-- ── Lessons for Functions & Graphs ───────────────────────────
INSERT INTO lessons (campus_id, title, type, duration_minutes, sort_order, is_premium, is_published) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Introduction to Parabolas',                    'video', 18,  1, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Transformations: Shifts & Reflections',        'video', 24,  2, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Finding the Equation from a Graph',            'video', 21,  3, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Practice: Parabola Equations',                 'quiz',  15,  4, false, true),
  ('11111111-0001-0001-0001-000000000001', 'The Hyperbola — Domain & Range',               'video', 19,  5, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Asymptotes & Sketching Hyperbolas',            'video', 22,  6, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Exponential Functions & Their Inverses',       'video', 26,  7, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Logarithms: Definition & Laws',               'video', 20,  8, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Practice: Exponential & Log Equations',       'quiz',  20,  9, false, true),
  ('11111111-0001-0001-0001-000000000001', 'Trig Functions: sin, cos, tan',               'video', 28, 10, true,  true),
  ('11111111-0001-0001-0001-000000000001', 'Amplitude, Period & Phase Shift',             'video', 24, 11, true,  true),
  ('11111111-0001-0001-0001-000000000001', 'Inverses of Functions',                       'video', 22, 12, true,  true),
  ('11111111-0001-0001-0001-000000000001', 'Comprehensive Revision Notes',                'notes', 35, 13, true,  true),
  ('11111111-0001-0001-0001-000000000001', 'Final Assessment: Functions & Graphs',        'quiz',  45, 14, true,  true);

-- ── Quiz for Functions & Graphs ───────────────────────────────
INSERT INTO quizzes (id, campus_id, title, pass_mark, is_published) VALUES
  ('22222222-0001-0001-0001-000000000001',
   '11111111-0001-0001-0001-000000000001',
   'Functions & Graphs — Practice Quiz', 60, true);

INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation, difficulty, sort_order) VALUES
  ('22222222-0001-0001-0001-000000000001',
   'The graph of f(x) = a(x + p)² + q has a turning point at (3, −5). What are the values of p and q?',
   '["p = −3, q = 5", "p = 3, q = −5", "p = −3, q = −5", "p = 3, q = 5"]',
   2, 'The turning point is (−p, q). If turning point is (3, −5), then −p = 3 → p = −3, and q = −5.', 'Medium', 1),

  ('22222222-0001-0001-0001-000000000001',
   'Which transformation maps y = x² onto y = (x − 4)² + 2?',
   '["Shift 4 units left and 2 units up", "Shift 4 units right and 2 units up", "Shift 4 units right and 2 units down", "Shift 4 units left and 2 units down"]',
   1, 'In y = (x − h)² + k, h shifts the graph h units right and k shifts it k units up. So h = 4 (right), k = 2 (up).', 'Easy', 2),

  ('22222222-0001-0001-0001-000000000001',
   'If f(x) = log₂(x), what is f⁻¹(x)?',
   '["f⁻¹(x) = 2^x", "f⁻¹(x) = 2/x", "f⁻¹(x) = x²", "f⁻¹(x) = x/2"]',
   0, 'The inverse of a logarithm is an exponential. If y = log₂(x), then x = 2^y, so f⁻¹(x) = 2^x.', 'Medium', 3),

  ('22222222-0001-0001-0001-000000000001',
   'The hyperbola g(x) = 3/(x − 1) + 2 has vertical and horizontal asymptotes. What are they?',
   '["x = 1 and y = 2", "x = −1 and y = −2", "x = 3 and y = 2", "x = 1 and y = −2"]',
   0, 'For g(x) = a/(x − p) + q: vertical asymptote at x = p = 1, horizontal asymptote at y = q = 2.', 'Easy', 4),

  ('22222222-0001-0001-0001-000000000001',
   'A function has equation f(x) = 2 · 3^(x+1) − 6. What is the y-intercept?',
   '["y = 0", "y = −6", "y = 6", "y = −3"]',
   0, 'Set x = 0: f(0) = 2 · 3^(0+1) − 6 = 2 · 3 − 6 = 6 − 6 = 0. The y-intercept is (0, 0).', 'Hard', 5);

-- ── Resources ─────────────────────────────────────────────────
INSERT INTO resources (campus_id, title, type, file_size, download_count, is_premium, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Functions & Graphs — Comprehensive Notes', 'PDF', '2.4 MB', 1847, false, 1),
  ('11111111-0001-0001-0001-000000000001', '2023 NSC Exam Paper 1 (Functions Focus)',  'PDF', '1.1 MB', 3210, false, 2),
  ('11111111-0001-0001-0001-000000000001', 'Transformation Cheat Sheet',               'PDF', '0.8 MB', 2654, false, 3),
  ('11111111-0001-0001-0001-000000000001', 'Video Worksheet: Parabola Sketching',      'DOCX','0.5 MB', 1230, true,  4),
  ('11111111-0001-0001-0001-000000000001', 'Exam-Ready Practice Set (50 Questions)',   'PDF', '3.2 MB', 4521, true,  5),
  ('11111111-0001-0001-0001-000000000001', 'Mindmap: All Function Types',              'PDF', '1.6 MB', 1987, false, 6);

COMMIT;
