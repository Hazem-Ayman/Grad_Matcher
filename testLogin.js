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
  console.log("Testing login for alice@university.edu...");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'alice@university.edu',
      password: 'password123'
    });

    if (error) {
      console.error("Login failed!");
      console.error("Error Object:", JSON.stringify(error, null, 2));
      console.error("Error Message:", error.message);
      console.error("Error Status:", error.status);
    } else {
      console.log("Login SUCCESS!");
      console.log("User data:", data.user.email);
      console.log("Session:", !!data.session);
    }
  } catch (err) {
    console.error("Exception occurred:", err);
  }
}

test();
