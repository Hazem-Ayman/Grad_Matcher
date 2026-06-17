import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables manually
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const testEmail = `test-${Date.now()}@university.edu`;
  console.log(`Testing signup for ${testEmail}...`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'password123'
    });

    if (error) {
      console.error("Signup failed!");
      console.error("Error Object:", JSON.stringify(error, null, 2));
    } else {
      console.log("Signup SUCCESS!");
      console.log("User email:", data.user?.email);
      console.log("Session:", !!data.session);
    }
  } catch (err) {
    console.error("Exception occurred:", err);
  }
}

test();
