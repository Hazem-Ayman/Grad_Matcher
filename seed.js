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

const mockUsers = [
  {
    email: 'alice@university.edu',
    password: 'password123',
    profile: {
      name: 'Alice Johnson',
      bio: 'Frontend dev student interested in clean interactive dashboard UI.',
      year: '4th',
      university: 'Stanford University',
      role: 'frontend',
      skills: ['React', 'TailwindCSS', 'TypeScript'],
      project_idea: 'A gamified student scheduling and progress tracking calendar dashboard.',
      looking_for: 'full_team',
      contact_mode: 'open',
      phone: '+15550101',
      instagram: 'alice.dev',
      linkedin: 'linkedin.com/in/alice',
      telegram: 'alice_telegram',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'bob@university.edu',
    password: 'password123',
    profile: {
      name: 'Bob Smith',
      bio: 'Backend architecture researcher focusing on database query scaling.',
      year: '3rd',
      university: 'MIT',
      role: 'backend',
      skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker'],
      project_idea: 'High-performance real-time public transit routing API.',
      looking_for: 'one_member',
      contact_mode: 'match',
      phone: '+15550102',
      instagram: 'bob_back',
      linkedin: 'linkedin.com/in/bob',
      telegram: 'bob_backend',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'charlie@university.edu',
    password: 'password123',
    profile: {
      name: 'Charlie Brown',
      bio: 'Passionate illustrator and UI/UX designer focusing on mobile systems.',
      year: '4th',
      university: 'UC Berkeley',
      role: 'designer',
      skills: ['Figma', 'Adobe XD', 'Illustrating'],
      project_idea: 'A community food-sharing platform layout wireframes.',
      looking_for: 'full_team',
      contact_mode: 'open',
      phone: '+15550103',
      instagram: 'charlie_designs',
      linkedin: 'linkedin.com/in/charlie',
      telegram: 'charlie_ux',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'diana@university.edu',
    password: 'password123',
    profile: {
      name: 'Diana Prince',
      bio: 'AI researcher working on medical imaging data anomalies.',
      year: '5th',
      university: 'Harvard University',
      role: 'ml',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn'],
      project_idea: 'Medical imaging anomaly detection engine using CNN models.',
      looking_for: 'one_member',
      contact_mode: 'match',
      phone: '+15550104',
      instagram: 'diana_ml',
      linkedin: 'linkedin.com/in/diana',
      telegram: 'diana_ai',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'evan@university.edu',
    password: 'password123',
    profile: {
      name: 'Evan Wright',
      bio: 'Mobile app developer constructing microservices with Flutter.',
      year: '4th',
      university: 'Georgia Tech',
      role: 'mobile',
      skills: ['Flutter', 'Dart', 'Firebase', 'SQL'],
      project_idea: 'A micro-tutoring matching tool connecting students locally.',
      looking_for: 'one_member',
      contact_mode: 'open',
      phone: '+15550105',
      instagram: 'evan_code',
      linkedin: 'linkedin.com/in/evan',
      telegram: 'evan_mobile',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'fiona@university.edu',
    password: 'password123',
    profile: {
      name: 'Fiona Gallagher',
      bio: 'Fullstack generalist loving Next.js templates and serverless APIs.',
      year: '2nd',
      university: 'NYU',
      role: 'fullstack',
      skills: ['Next.js', 'Node.js', 'MongoDB', 'TailwindCSS'],
      project_idea: 'A local marketplace connecting students for swapping textbooks.',
      looking_for: 'full_team',
      contact_mode: 'match',
      phone: '+15550106',
      instagram: 'fiona_fs',
      linkedin: 'linkedin.com/in/fiona',
      telegram: 'fiona_dev',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'george@university.edu',
    password: 'password123',
    profile: {
      name: 'George Costanza',
      bio: 'Enthusiastic Vue developer who likes working on maps and grids.',
      year: '3rd',
      university: 'Columbia University',
      role: 'frontend',
      skills: ['Vue', 'JavaScript', 'CSS', 'HTML'],
      project_idea: 'An interactive campus map showing study room occupancy levels.',
      looking_for: 'browsing',
      contact_mode: 'open',
      phone: '+15550107',
      instagram: 'george_front',
      linkedin: 'linkedin.com/in/george',
      telegram: 'george_vue',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'hannah@university.edu',
    password: 'password123',
    profile: {
      name: 'Hannah Abbott',
      bio: 'Django and FastAPI fan specializing in auth and security.',
      year: '4th',
      university: 'Oxford University',
      role: 'backend',
      skills: ['Django', 'FastAPI', 'SQL', 'Docker'],
      project_idea: 'Decentralized anonymous file locker for student lecture logs.',
      looking_for: 'full_team',
      contact_mode: 'match',
      phone: '+15550108',
      instagram: 'hannah_sec',
      linkedin: 'linkedin.com/in/hannah',
      telegram: 'hannah_back',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'ian@university.edu',
    password: 'password123',
    profile: {
      name: 'Ian Malcolm',
      bio: 'ML scientist focusing on predictive models and chaos theory.',
      year: '5th',
      university: 'UT Austin',
      role: 'ml',
      skills: ['Python', 'Pandas', 'NumPy', 'TensorFlow'],
      project_idea: 'A predictive model calculating campus cafeteria queue times.',
      looking_for: 'one_member',
      contact_mode: 'open',
      phone: '+15550109',
      instagram: 'ian_ml',
      linkedin: 'linkedin.com/in/ian',
      telegram: 'ian_predict',
      onboarding_complete: true,
      is_active: true
    }
  },
  {
    email: 'julia@university.edu',
    password: 'password123',
    profile: {
      name: 'Julia Roberts',
      bio: 'Figma designer specializing in design systems and animations.',
      year: '3rd',
      university: 'UCLA',
      role: 'designer',
      skills: ['Figma', 'Illustrations', 'Design Systems'],
      project_idea: 'Gamified habit tracker app mockup with custom avatars.',
      looking_for: 'full_team',
      contact_mode: 'match',
      phone: '+15550110',
      instagram: 'julia_ux',
      linkedin: 'linkedin.com/in/julia',
      telegram: 'julia_figma',
      onboarding_complete: true,
      is_active: true
    }
  }
];

async function seed() {
  console.log("Starting mock data seeding via API...");

  for (const user of mockUsers) {
    try {
      console.log(`Signing up: ${user.email}`);
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.error(`Sign up failed for ${user.email}:`, error.message);
        continue;
      }

      if (data?.user) {
        console.log(`Created user ${user.email} (ID: ${data.user.id}). Inserting profile...`);
        
        // Wait a small moment to ensure auth trigger creates base profile or we write it
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            ...user.profile
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error(`Profile insert failed for ${user.email}:`, profileError.message);
        } else {
          console.log(`Successfully completed profile for ${user.email}`);
        }
      }
    } catch (err) {
      console.error(`Exception seeding ${user.email}:`, err);
    }
  }

  console.log("\nSeeding finished! IMPORTANT: Go to your Supabase SQL Editor and run:");
  console.log("UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;");
}

seed();
