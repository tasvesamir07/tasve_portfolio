require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client initialized successfully.');
} else {
  console.warn('Supabase credentials missing in .env. Running in offline mode.');
}

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    supabaseConnected: !!supabase
  });
});

// Fetch Profile Data Proxy Route (Example)
app.get('/api/profile', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client is not configured' });
  }
  
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
