require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('.'));
app.use(express.json({ limit: '1mb' }));

const calcRoutes = [
  '/loan-calculator',
  '/compound-interest-calculator',
  '/mortgage-calculator',
  '/budget-planner',
  '/debt-snowball-calculator',
];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

calcRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
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
