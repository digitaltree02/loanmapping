require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const BASE_URL = 'https://www.loanmapping.com';

// Load template once at startup; placeholders are replaced per request.
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const NAV_LINKS = [
  { href: '/loan-calculator',              label: 'Loan Calculator' },
  { href: '/mortgage-calculator',          label: 'Mortgage Calculator' },
  { href: '/compound-interest-calculator', label: 'Compound Interest Calculator' },
  { href: '/budget-planner',               label: 'Budget Planner' },
  { href: '/debt-snowball-calculator',     label: 'Debt Snowball Calculator' },
];

function buildSSR(h1, intro, faqs, isHome) {
  const faqHTML = faqs.map(({ q, a }) => `
      <div style="background:#f8f9ff;border:1px solid #e0e4ef;border-radius:10px;padding:14px 16px;margin-bottom:10px">
        <p style="font-size:14px;font-weight:600;color:#1a3a5c;margin-bottom:6px">${escapeHtml(q)}</p>
        <p style="font-size:13px;color:#555;line-height:1.7">${escapeHtml(a)}</p>
      </div>`).join('');

  const allCalcLinks = NAV_LINKS
    .map(l => `<a href="${l.href}" style="color:#1a3a5c;font-size:12px;text-decoration:none">${l.label}</a>`)
    .join(' · ');

  const calcNav = isHome
    ? `<nav style="margin:16px 0">
        <p style="font-size:13px;color:#888;margin-bottom:8px">Choose a calculator:</p>
        <ul style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px">
          ${NAV_LINKS.map(l => `<li><a href="${l.href}" style="color:#1a3a5c;font-size:13px;text-decoration:none;border:1px solid #d0d5e0;border-radius:6px;padding:5px 12px;display:inline-block">${l.label}</a></li>`).join('')}
        </ul>
      </nav>`
    : `<nav style="margin-top:20px;padding-top:14px;border-top:1px solid #e0e4ef">
        <p style="font-size:12px;color:#aaa">More free calculators: ${allCalcLinks}</p>
      </nav>`;

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:760px;margin:0 auto;padding:16px">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e0e4ef;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <a href="/" style="font-size:20px;font-weight:600;color:#1a3a5c;text-decoration:none">LoanMapping</a>
    <nav style="display:flex;gap:4px;flex-wrap:wrap">
      ${NAV_LINKS.map(l => `<a href="${l.href}" style="color:#888;text-decoration:none;font-size:12px;padding:5px 10px;border:1px solid #e0e4ef;border-radius:8px">${l.label}</a>`).join('')}
    </nav>
  </div>
  <h1 style="font-size:22px;font-weight:600;color:#1a3a5c;margin-bottom:12px">${escapeHtml(h1)}</h1>
  <p style="font-size:14px;color:#555;line-height:1.8;margin-bottom:20px">${escapeHtml(intro)}</p>
  ${isHome ? calcNav : ''}
  <section style="margin-top:24px">
    <h2 style="font-size:18px;font-weight:500;color:#1a3a5c;margin-bottom:12px">Frequently Asked Questions</h2>
    ${faqHTML}
  </section>
  ${!isHome ? calcNav : ''}
</div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PAGE_DATA = {
  '/': {
    title: 'Free Loan & Mortgage Calculator | LoanMapping',
    desc: 'Free loan, mortgage, compound interest, and budget calculators. No signup, no login — instant results. Map your financial journey with LoanMapping.',
    canonical: BASE_URL + '/',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'LoanMapping',
      url: BASE_URL,
      description: 'Free loan, mortgage and financial calculators',
      potentialAction: {
        '@type': 'SearchAction',
        target: BASE_URL + '/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }),
    ssr: buildSSR(
      'Free Financial Calculators — Loan, Mortgage, Budget & More',
      'LoanMapping offers free, instant financial calculators for loans, mortgages, compound interest, budgeting, and debt payoff. No account required — enter your numbers and get results immediately.',
      [
        { q: 'Are all calculators free to use?', a: 'Yes. Every calculator on LoanMapping is completely free. No signup, no login, and no subscription — ever.' },
        { q: 'Is my financial data stored or shared?', a: 'No. All calculations run entirely in your browser. No data you enter is ever sent to or stored on our servers.' },
        { q: 'Which calculator should I start with?', a: 'For a loan or mortgage, start with the Loan Payoff or Mortgage Calculator. To see how savings grow, try Compound Interest. For budgeting, the 50/30/20 Budget Planner is the easiest starting point.' },
      ],
      true
    ),
  },

  '/loan-calculator': {
    title: 'Loan Payoff Calculator — Free Monthly Payment Estimator | LoanMapping',
    desc: 'Calculate your monthly loan payment, total interest, and payoff date instantly. Free loan payoff calculator — no login required.',
    canonical: BASE_URL + '/loan-calculator',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'How is my monthly loan payment calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Your monthly payment uses the standard amortization formula: P × r(1+r)^n / ((1+r)^n − 1), where P is the loan principal, r is the monthly interest rate (annual rate ÷ 12), and n is the number of monthly payments.' } },
        { '@type': 'Question', name: 'What is a good interest rate for a personal loan?', acceptedAnswer: { '@type': 'Answer', text: 'Excellent credit (720+) typically qualifies for 6–12% APR. Average credit (640–720) usually sees 13–20%. Rates above 20% are considered high — improving your credit score first can save you thousands.' } },
        { '@type': 'Question', name: 'How can I pay off my loan faster?', acceptedAnswer: { '@type': 'Answer', text: 'Make extra payments toward principal, switch to bi-weekly payments (which adds one full payment per year), or refinance at a lower rate. Even $50 extra per month can cut months off a typical loan.' } },
        { '@type': 'Question', name: 'Does paying off a loan early save money?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every extra payment reduces your principal balance, which reduces future interest charges. Check for prepayment penalties first — most modern personal and auto loans do not have them.' } },
      ],
    }),
    ssr: buildSSR(
      'Free Loan Payoff Calculator',
      'Use our free loan calculator to find your exact monthly payment, total interest paid, and true cost of any personal or auto loan. Enter your loan amount, interest rate, and term — results update instantly. Download an amortization schedule or export to PDF at no charge.',
      [
        { q: 'How is my monthly loan payment calculated?', a: 'Your monthly payment uses the standard amortization formula: P × r(1+r)^n / ((1+r)^n − 1), where P is the loan principal, r is the monthly interest rate (annual rate ÷ 12), and n is the number of monthly payments.' },
        { q: 'What is a good interest rate for a personal loan?', a: 'Excellent credit (720+) typically qualifies for 6–12% APR. Average credit (640–720) usually sees 13–20%. Rates above 20% are considered high — improving your credit score first can save you thousands of dollars over the life of the loan.' },
        { q: 'How can I pay off my loan faster?', a: 'Make extra payments toward your principal, switch to bi-weekly payments instead of monthly (which results in one extra full payment per year), or refinance at a lower interest rate. Even $50 extra per month can shave several months off a typical 4-year loan.' },
        { q: 'Does paying off a loan early save money?', a: 'Yes. Every extra payment reduces your principal balance, which reduces the interest charged in future months. Check your loan agreement for prepayment penalties — most modern personal and auto loans do not have them.' },
      ],
      false
    ),
  },

  '/compound-interest-calculator': {
    title: 'Compound Interest Calculator — Free Savings Growth Tool | LoanMapping',
    desc: 'See how your savings grow with compound interest. Calculate future value with monthly contributions. Free compound interest calculator — instant results.',
    canonical: BASE_URL + '/compound-interest-calculator',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is compound interest?', acceptedAnswer: { '@type': 'Answer', text: 'Compound interest is interest calculated on both your initial principal and the accumulated interest from previous periods. Unlike simple interest, it grows exponentially — your interest earns interest.' } },
        { '@type': 'Question', name: 'What is the Rule of 72?', acceptedAnswer: { '@type': 'Answer', text: 'Divide 72 by your annual interest rate to estimate how many years it takes to double your money. At a 7% annual return, your money doubles in roughly 72 ÷ 7 ≈ 10.3 years.' } },
        { '@type': 'Question', name: 'How often is interest compounded in this calculator?', acceptedAnswer: { '@type': 'Answer', text: 'This calculator uses monthly compounding, which is the most common method for savings accounts and investment accounts.' } },
        { '@type': 'Question', name: 'How much should I save each month to retire comfortably?', acceptedAnswer: { '@type': 'Answer', text: 'A common guideline is to save 10–15% of your gross income for retirement. The 50/30/20 rule suggests 20% of after-tax income toward savings and debt repayment combined.' } },
      ],
    }),
    ssr: buildSSR(
      'Free Compound Interest Calculator',
      'Our compound interest calculator shows exactly how much your savings or investments will grow over time with regular monthly contributions. See the power of compounding — the earlier you start, the more your money multiplies. Enter your initial deposit, annual rate, number of years, and optional monthly additions.',
      [
        { q: 'What is compound interest?', a: 'Compound interest is interest calculated on both your initial principal and the accumulated interest from previous periods. Unlike simple interest (which only earns on the original principal), compound interest grows exponentially — your interest earns interest.' },
        { q: 'What is the Rule of 72?', a: 'The Rule of 72 is a quick mental shortcut to estimate how long it takes to double your money. Divide 72 by your annual interest rate. At a 7% annual return, your money doubles in roughly 72 ÷ 7 ≈ 10.3 years.' },
        { q: 'How often is interest compounded in this calculator?', a: 'This calculator uses monthly compounding, which is the most common method for savings accounts and investment accounts. More frequent compounding (daily vs. monthly) produces slightly higher returns over long periods.' },
        { q: 'How much should I save each month to retire comfortably?', a: 'A common guideline is to save 10–15% of your gross income specifically for retirement. The 50/30/20 rule suggests allocating at least 20% of your after-tax income toward savings and debt repayment combined. Use our Budget Planner to find a realistic savings target for your situation.' },
      ],
      false
    ),
  },

  '/mortgage-calculator': {
    title: 'Mortgage Calculator — Free Monthly Payment Estimator | LoanMapping',
    desc: 'Calculate your monthly mortgage payment, total interest, and amortization schedule instantly. Free mortgage calculator — no login required.',
    canonical: BASE_URL + '/mortgage-calculator',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'How much house can I afford?', acceptedAnswer: { '@type': 'Answer', text: 'A widely used rule is to keep your monthly mortgage payment below 28% of your gross monthly income, and total debt payments below 36%. On a $7,000/month income, that is a maximum mortgage payment of about $1,960.' } },
        { '@type': 'Question', name: 'What is a good mortgage interest rate?', acceptedAnswer: { '@type': 'Answer', text: 'As of 2025, a 30-year fixed rate at or below 7% is competitive for buyers with a credit score above 700. Rates vary by lender and loan type — always compare at least 3 lenders.' } },
        { '@type': 'Question', name: 'How much should my down payment be?', acceptedAnswer: { '@type': 'Answer', text: 'The traditional standard is 20%, which eliminates the requirement for private mortgage insurance (PMI). Many loan programs accept 3–10% down, but a larger down payment reduces your monthly payment and total interest.' } },
        { '@type': 'Question', name: 'What is an amortization schedule?', acceptedAnswer: { '@type': 'Answer', text: 'An amortization schedule shows every monthly payment split into principal and interest. Early payments are mostly interest; over time the balance shifts toward principal as your balance decreases.' } },
      ],
    }),
    ssr: buildSSR(
      'Free Mortgage Calculator',
      'Our free mortgage calculator estimates your monthly payment based on home price, down payment, interest rate, and loan term. Instantly see the full amortization schedule — how much of each payment goes to principal versus interest — so you understand the true cost of your home loan before signing.',
      [
        { q: 'How much house can I afford?', a: "A widely used rule is to keep your monthly mortgage payment (principal, interest, taxes, and insurance) below 28% of your gross monthly income, with total debt payments below 36%. On a $7,000/month gross income, that's roughly a $1,960 maximum mortgage payment." },
        { q: 'What is a good mortgage interest rate?', a: "As of 2025, a 30-year fixed rate at or below 7% is competitive for buyers with a credit score above 700. Rates change constantly with the market and vary by lender, loan type (fixed vs. adjustable), and your credit profile. Always compare quotes from at least 3 lenders." },
        { q: 'How much should my down payment be?', a: 'The traditional standard is 20%, which eliminates the requirement for private mortgage insurance (PMI). Many programs — FHA, VA, USDA, and conventional — allow 3–10% down. A larger down payment reduces your loan amount, monthly payment, and total interest paid over the life of the loan.' },
        { q: 'What is an amortization schedule?', a: "An amortization schedule is a table showing every monthly mortgage payment broken down into principal and interest. In the early years, most of each payment goes to interest. Over time the balance shifts toward principal. Click 'Schedule' in the calculator above to see your full breakdown." },
      ],
      false
    ),
  },

  '/budget-planner': {
    title: 'Budget Planner — Free 50/30/20 Budget Calculator | LoanMapping',
    desc: 'Plan your monthly budget using the 50/30/20 rule. Split income into needs, wants, and savings automatically. Free budget planner — instant results.',
    canonical: BASE_URL + '/budget-planner',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the 50/30/20 budget rule?', acceptedAnswer: { '@type': 'Answer', text: 'The 50/30/20 rule allocates 50% of after-tax income to needs (housing, utilities, groceries, minimum debt payments), 30% to wants (dining out, entertainment, subscriptions), and 20% to savings and extra debt repayment.' } },
        { '@type': 'Question', name: 'What counts as a need vs a want?', acceptedAnswer: { '@type': 'Answer', text: 'Needs are expenses required for basic living: housing, utilities, groceries, health insurance, essential transportation, and minimum debt payments. Wants are everything beyond survival — restaurants, streaming, gym memberships, travel, and clothing beyond basics.' } },
        { '@type': 'Question', name: 'What if my needs exceed 50%?', acceptedAnswer: { '@type': 'Answer', text: "Many people in high-cost cities or on lower incomes find needs exceed 50%. That's okay — adjust the framework to fit your reality. The key principle is to save something every month, even if it's only 5–10%." } },
        { '@type': 'Question', name: 'How much should I keep in an emergency fund?', acceptedAnswer: { '@type': 'Answer', text: 'Most financial experts recommend 3–6 months of living expenses in a liquid, easily accessible savings account. Start with a $1,000 starter emergency fund, then build toward the full 3–6 month target.' } },
      ],
    }),
    ssr: buildSSR(
      'Free 50/30/20 Budget Planner',
      'Our budget planner uses the proven 50/30/20 budgeting rule to automatically split your monthly income into needs (50%), wants (30%), and savings or debt repayment (20%). Enter your monthly take-home income and see your personalized budget breakdown instantly — no spreadsheet required.',
      [
        { q: 'What is the 50/30/20 budget rule?', a: 'The 50/30/20 rule is a simple budgeting framework: allocate 50% of your after-tax income to needs (housing, utilities, groceries, insurance, minimum debt payments), 30% to wants (dining out, entertainment, subscriptions, travel), and 20% to savings and extra debt repayment.' },
        { q: "What counts as a 'need' vs a 'want'?", a: "Needs are expenses essential for basic living and working: rent or mortgage, electricity, water, groceries, health insurance, essential transportation, and minimum debt payments. Wants are everything beyond survival — restaurants, streaming services, gym memberships, clothing beyond basics, and vacations." },
        { q: 'What if my needs exceed 50%?', a: "Many people in high-cost cities or on lower incomes find needs exceed 50%. That's okay — the 50/30/20 rule is a guideline, not a law. Adjust the framework to fit your reality. The key principle is to save something every month, even if it's only 5–10%." },
        { q: 'How much should I keep in an emergency fund?', a: 'Most financial experts recommend keeping 3–6 months of living expenses in a liquid, easily accessible savings account. Start with a $1,000 starter emergency fund first, then build toward the full 3–6 month target before aggressively investing or paying down low-interest debt.' },
      ],
      false
    ),
  },

  '/debt-snowball-calculator': {
    title: 'Debt Snowball Calculator — Free Debt Payoff Planner | LoanMapping',
    desc: 'Calculate exactly when you will be debt-free using the debt snowball method. Track multiple debts and see your payoff timeline. Free — no login required.',
    canonical: BASE_URL + '/debt-snowball-calculator',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the debt snowball method?', acceptedAnswer: { '@type': 'Answer', text: 'With the debt snowball, you make minimum payments on all debts except the smallest balance, which you attack with every extra dollar. Once paid off, roll that freed-up payment into the next smallest debt — creating a growing snowball of cash accelerating your payoff.' } },
        { '@type': 'Question', name: 'Debt snowball vs debt avalanche — which saves more money?', acceptedAnswer: { '@type': 'Answer', text: 'The debt avalanche (targeting highest-interest debt first) saves the most money mathematically. The debt snowball (targeting smallest balance first) delivers psychological wins faster, which helps many people stay motivated. Consistency matters more than optimization.' } },
        { '@type': 'Question', name: 'How much extra should I put toward debt each month?', acceptedAnswer: { '@type': 'Answer', text: 'Any amount above your minimum payments helps significantly. Even $50–$100 extra per month can cut years off your payoff timeline. Use the Monthly Budget slider to see how different payment levels affect your debt-free date.' } },
        { '@type': 'Question', name: 'Should I invest or pay off debt first?', acceptedAnswer: { '@type': 'Answer', text: 'Always capture any employer 401(k) match first — it is an instant 100% return. For high-interest debt (above 7–8%), prioritize payoff before additional investing. For low-interest debt (below 5%), many people invest and pay minimums simultaneously.' } },
      ],
    }),
    ssr: buildSSR(
      'Free Debt Snowball Calculator',
      'The debt snowball method accelerates debt payoff by focusing all extra payments on your smallest balance first, then rolling that freed-up payment into the next debt — creating a growing "snowball" of cash attacking each balance in turn. Our calculator shows your exact debt-free date and total interest saved.',
      [
        { q: 'What is the debt snowball method?', a: 'With the debt snowball, you make minimum payments on all debts except the smallest balance, which you attack aggressively with every extra dollar. Once the smallest debt is paid off, you roll its entire payment into the next smallest debt — creating momentum that accelerates your payoff over time.' },
        { q: 'Debt snowball vs. debt avalanche — which saves more money?', a: 'The debt avalanche (targeting highest-interest debt first) saves the most money mathematically. The debt snowball (targeting smallest balance first) may cost slightly more in interest but delivers psychological wins faster — fully paid-off accounts — which helps many people stay motivated and on track. Research shows that consistency matters more than optimization.' },
        { q: 'How much extra should I put toward debt each month?', a: 'Any amount above your minimum payments helps significantly. Even $50–$100 extra per month can cut years off your debt payoff timeline. Use the Monthly Budget slider in the calculator above to see the dramatic impact different payment levels have on your debt-free date.' },
        { q: 'Should I invest or pay off debt first?', a: "Always capture any employer 401(k) match first — it's an instant 100% return that beats any debt interest rate. For high-interest debt (above 7–8%), prioritize payoff before additional investing. For low-interest debt (below 5%), many financial advisors suggest investing and paying minimums simultaneously." },
      ],
      false
    ),
  },
};

function renderPage(route) {
  const data = PAGE_DATA[route] || PAGE_DATA['/'];
  return TEMPLATE
    .replace(/%%TITLE%%/g,       data.title)
    .replace(/%%META_DESC%%/g,   data.desc)
    .replace(/%%OG_TITLE%%/g,    data.title)
    .replace(/%%OG_DESC%%/g,     data.desc)
    .replace(/%%CANONICAL%%/g,   data.canonical)
    .replace('%%PAGE_SCHEMA%%',  `<script type="application/ld+json">${data.schema}</script>`)
    .replace('%%SSR_HTML%%',     data.ssr);
}

app.use(express.json({ limit: '1mb' }));

// Explicitly serve only the static files that should be public.
// This avoids exposing server.js, package.json, leads.json, etc.
['robots.txt', 'ads.txt', 'sitemap.xml'].forEach(file => {
  const contentType = file.endsWith('.xml') ? 'application/xml' : 'text/plain';
  app.get('/' + file, (_req, res) => {
    res.type(contentType).sendFile(path.join(__dirname, file));
  });
});

// HTML routes — each serves a server-rendered page.
app.get('/', (_req, res) => res.send(renderPage('/')));

[
  '/loan-calculator',
  '/compound-interest-calculator',
  '/mortgage-calculator',
  '/budget-planner',
  '/debt-snowball-calculator',
].forEach(route => {
  app.get(route, (_req, res) => res.send(renderPage(route)));
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid name' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    if (typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'Invalid message' });
    }

    const apiKey = process.env.WEB3FORMS_KEY || 'bf64248e-5198-4b4f-b937-807f5746615d';

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: apiKey,
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        subject: `New message from ${name.trim()} via LoanMapping`,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.error('Web3Forms returned non-JSON response, status:', response.status);
      return res.status(502).json({ success: false, message: 'Mail service unavailable' });
    }

    const data = await response.json();

    if (data.success) {
      res.json({ success: true });
    } else {
      console.error('Web3Forms error:', data);
      res.status(400).json({ success: false, message: data.message || 'Failed to send' });
    }
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/email-capture', (req, res) => {
  try {
    const { email, calcName } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      return res.status(400).json({ success: false });
    }
    const leadsFile = path.join(__dirname, 'leads.json');
    let leads = [];
    try {
      if (fs.existsSync(leadsFile)) {
        leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
      }
    } catch(e) {}
    const entry = { email: email.trim(), calcName: calcName || 'unknown', date: new Date().toISOString() };
    leads.push(entry);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
    console.log(`New lead: ${entry.email} via ${entry.calcName}`);
    res.json({ success: true });
  } catch(e) {
    console.error('Email capture error:', e);
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`LoanMapping running on port ${port}`);
});
