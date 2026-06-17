# GradMatch — Full Project Specification

> A Tinder-style web app for university students to find graduation project teammates.
> Target: ~300 users. Must be fully responsive across all screen sizes (mobile, tablet, desktop).

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React + Vite + Tailwind CSS | Fast setup, utility-first responsive design |
| Backend / DB | Supabase | Auth, database, realtime, storage — zero backend code |
| Hosting | Vercel (frontend) | Free tier, instant deploys from GitHub |
| Auth | Supabase Auth (email + Google OAuth) | Built-in, easy |

---

## Responsive Design — CRITICAL REQUIREMENT

**The app must look and work perfectly on every screen size.**

- Mobile first: design for 375px width upward
- Tablet: 768px breakpoint
- Desktop: 1024px+ breakpoint
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:` throughout
- The swipe card UI must be touch-friendly on mobile (swipe gestures) and click/keyboard-friendly on desktop
- Navigation: bottom tab bar on mobile, side nav or top nav on desktop
- All modals/dialogs must be scrollable and not overflow on small screens
- Minimum tap target size: 44x44px for all interactive elements
- Font sizes must scale: use `text-sm md:text-base` patterns
- No horizontal scrolling at any breakpoint
- Test every screen at: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1280px (laptop), 1440px (desktop)

---

## Database Schema

Run all of this in the Supabase SQL editor.

```sql
-- PROFILES
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text not null,
  bio text,
  year text, -- "1st", "2nd", "3rd", "4th", "5th"
  university text,
  role text, -- "frontend" | "backend" | "fullstack" | "ml" | "mobile" | "designer" | "other"
  skills text[] default '{}', -- ["React", "Python", "ML"]
  github_url text,
  project_idea text, -- one-liner of what they want to build
  looking_for text not null default 'match', -- "full_team" | "one_member" | "browsing"
  contact_mode text not null default 'match', -- "open" | "match"
  phone text,
  instagram text,
  linkedin text,
  telegram text,
  avatar_url text,
  is_active boolean default true, -- "pause my profile" toggle
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- SWIPES
create table swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references profiles(id) on delete cascade not null,
  swiped_id uuid references profiles(id) on delete cascade not null,
  direction text not null, -- "left" | "right"
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

-- MATCHES
create table matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references profiles(id) on delete cascade not null,
  user2_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

-- MESSAGES
create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null, -- "liked_you" | "new_match" | "contact_revealed"
  from_user_id uuid references profiles(id) on delete cascade,
  read boolean default false,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table swipes enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "Public profiles readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = user_id);

-- Swipes: only owner can read/write their own swipes
create policy "Users manage own swipes" on swipes for all using (
  swiper_id = (select id from profiles where user_id = auth.uid())
);

-- Matches: only involved users can see
create policy "Match participants can see matches" on matches for select using (
  user1_id = (select id from profiles where user_id = auth.uid()) or
  user2_id = (select id from profiles where user_id = auth.uid())
);
create policy "Match insert allowed" on matches for insert with check (true);

-- Messages: only match participants
create policy "Match participants can see messages" on messages for select using (
  match_id in (
    select id from matches where
      user1_id = (select id from profiles where user_id = auth.uid()) or
      user2_id = (select id from profiles where user_id = auth.uid())
  )
);
create policy "Match participants can send messages" on messages for insert with check (
  sender_id = (select id from profiles where user_id = auth.uid())
);

-- Notifications: only the recipient
create policy "Users see own notifications" on notifications for all using (
  user_id = (select id from profiles where user_id = auth.uid())
);

-- Enable Realtime on messages and notifications
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
```

---

## Project Structure

```
src/
├── main.jsx
├── App.jsx
├── supabaseClient.js          -- single Supabase client instance
├── hooks/
│   ├── useAuth.js             -- current user + profile
│   ├── useProfiles.js         -- fetch swipe feed
│   ├── useMatches.js          -- fetch matches list
│   ├── useNotifications.js    -- fetch + subscribe to notifications
│   └── useMessages.js         -- fetch + subscribe to chat messages
├── pages/
│   ├── Landing.jsx            -- public landing page
│   ├── Auth.jsx               -- login / signup page
│   ├── Onboarding.jsx         -- profile setup wizard (multi-step)
│   ├── Swipe.jsx              -- main swipe feed
│   ├── Matches.jsx            -- list of matches
│   ├── Chat.jsx               -- chat view for a single match
│   ├── Notifications.jsx      -- notification inbox
│   └── Profile.jsx            -- view/edit own profile
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx       -- wraps all authenticated pages
│   │   ├── BottomNav.jsx      -- mobile bottom tab bar
│   │   └── TopNav.jsx         -- desktop top/side navigation
│   ├── cards/
│   │   ├── ProfileCard.jsx    -- the swipeable student card
│   │   └── CardStack.jsx      -- stacked card effect
│   ├── swipe/
│   │   ├── SwipeButtons.jsx   -- left/right action buttons
│   │   └── SwipeEmpty.jsx     -- no more profiles state
│   ├── matches/
│   │   ├── MatchCard.jsx      -- match list item
│   │   └── MatchModal.jsx     -- "It's a Match!" celebration modal
│   ├── chat/
│   │   ├── MessageBubble.jsx
│   │   └── ChatInput.jsx
│   ├── notifications/
│   │   └── NotificationItem.jsx
│   └── ui/
│       ├── SkillChip.jsx      -- pill badge for skills
│       ├── RoleBadge.jsx      -- role tag with color
│       ├── LookingForBadge.jsx-- "Full Team" / "1 Member" / "Browsing" tag
│       ├── Avatar.jsx         -- avatar with fallback initials
│       ├── LoadingSpinner.jsx
│       └── EmptyState.jsx
└── utils/
    ├── swipeLogic.js          -- match detection, notification creation
    └── avatarColor.js         -- deterministic color from name
```

---

## Page-by-Page Specification

### 1. Landing Page (`/`)

Public page, shown to logged-out users.

- Full-screen hero: app name "GradMatch", tagline "Find your graduation project team"
- Brief 3-point value prop: "Swipe through student profiles", "Match with teammates", "Connect instantly"
- Two CTA buttons: "Get Started" → `/auth` and "Log in" → `/auth?mode=login`
- Clean, minimal design — dark background, accent color (pick: indigo or violet)
- Fully responsive hero layout (stacked on mobile, side-by-side on desktop)

---

### 2. Auth Page (`/auth`)

- Toggle between Sign Up and Log In
- Email + password fields
- Google OAuth button ("Continue with Google")
- On sign up success → redirect to `/onboarding`
- On log in success → if `onboarding_complete = true` → `/swipe`, else → `/onboarding`

---

### 3. Onboarding Wizard (`/onboarding`)

Multi-step form, one step per screen. Show a progress bar at the top (e.g., Step 2 of 5).

**Step 1 — Basic Info**
- Full name (text input)
- University (text input)
- Year (dropdown: 1st / 2nd / 3rd / 4th / 5th)

**Step 2 — Your Role & Skills**
- Role (single select grid of cards, not a dropdown):
  - Frontend Developer
  - Backend Developer
  - Fullstack Developer
  - ML / AI Engineer
  - Mobile Developer
  - UI/UX Designer
  - Other
- Skills (tag input): user types a skill name and presses Enter or comma to add as a chip. Show suggestions: React, Vue, Angular, Node.js, Python, Django, FastAPI, Flutter, Swift, Kotlin, TensorFlow, PyTorch, Figma, SQL, MongoDB, Docker, etc.

**Step 3 — Your Project Idea**
- "What do you want to build?" (textarea, max 200 chars)
- "What are you looking for?" (radio buttons — large tap targets):
  - 🔍 A full team (I have an idea, need everyone)
  - 👤 1–2 members (I have some teammates, need more)
  - 👀 Just exploring (I want to see who's out there)

**Step 4 — Contact Mode**
Title: "How do you want to connect?"

Two large option cards (full width, tap to select):

**Option A — Direct Contact** ⚡
> "Anyone who likes my profile can see my contact info right away. No match needed."

**Option B — Match First** 🔒
> "I get notified when someone likes me. I choose who to connect with."

Then below (always shown, fields optional but at least one required):
- Phone number
- Instagram handle
- Telegram username
- LinkedIn URL

**Step 5 — Photo (Optional)**
- Upload avatar image (Supabase Storage)
- Skip button available
- If skipped: use a generated avatar based on initials + a deterministic color

On final step: save all profile data, set `onboarding_complete = true`, redirect to `/swipe`.

---

### 4. Swipe Feed (`/swipe`) — CORE SCREEN

This is the main screen. Keep it focused.

**Layout:**
- Mobile: full screen card stack centered, action buttons below
- Desktop: card centered in a max-width container (~420px), centered on page

**Card stack visual:**
- Show 1 active card + 2 cards peeking behind it (CSS transform scale + translateY)
- Active card takes 80–90% of viewport height on mobile
- Smooth CSS transition when swiping away

**Profile Card content (in order):**
1. Avatar (top, circular, large)
2. Name + University
3. `LookingForBadge` — very prominent: "Needs Full Team" / "Needs 1–2 Members" / "Browsing"
4. `RoleBadge` — e.g., "ML Engineer"
5. Skills as `SkillChip` row (wraps on overflow)
6. Project idea: italic quote style, max 2 lines
7. GitHub link (icon + "View GitHub" — opens in new tab)

**Swipe actions:**
- ❌ Left button (red, large) — Pass
- ✅ Right button (green, large) — Interested
- Mobile: also support touch drag left/right (use `react-swipeable`)
- Desktop: also support keyboard ← → arrow keys
- Show visual overlay on drag: red tint + "PASS" text on left drag, green tint + "LIKE" text on right drag

**Data loading:**
- Fetch profiles where:
  - `is_active = true`
  - `onboarding_complete = true`
  - `looking_for != 'browsing'` (browsing users are hidden from feed)
  - Not the current user
  - Not already swiped by current user (exclude profile IDs that exist in swipes table for this user)
- Preload next 10 profiles at a time

**On Right Swipe — Two paths based on swiped user's `contact_mode`:**

**Path A: `contact_mode = 'open'`**
- Show a modal immediately:
  - Title: "They're open to direct contact! ⚡"
  - Show their contact info: phone, Instagram, Telegram, LinkedIn (whichever they filled)
  - Button: "Got it" to dismiss
- Insert swipe row (direction: "right")
- Insert notification for them (type: "contact_revealed")

**Path B: `contact_mode = 'match'`**
- Insert swipe row (direction: "right")
- Check if they previously swiped right on current user
  - If YES → it's a mutual match:
    - Create row in `matches` table
    - Show "It's a Match!" modal with both avatars + "View their contact" button
    - Insert notification for them (type: "new_match")
    - On "View contact": show their contact info in the modal
  - If NO → insert notification for them (type: "liked_you")

**On Left Swipe:**
- Insert swipe row (direction: "left")
- No notification

**Empty state:**
- Centered illustration + text: "You've seen everyone for now 👀"
- Sub-text: "Check back later or update your profile to appear to more people"

---

### 5. Matches Page (`/matches`)

List of all mutual matches.

**Layout:**
- Mobile: full-width list
- Desktop: 2-column grid

**Each match card shows:**
- Avatar + Name + Role
- Skills (first 3 chips)
- "View Contact Info" button → opens modal with their phone/social handles
- "Message" button → goes to `/chat/:matchId`

---

### 6. Chat Page (`/chat/:matchId`)

Simple real-time chat between two matched users.

**Layout:**
- Mobile: full screen, message input pinned to bottom above keyboard
- Desktop: centered, max-width 600px

**Features:**
- Message bubbles: own messages right-aligned (accent color), theirs left-aligned (gray)
- Timestamp shown under each message (HH:MM format)
- Input: text field + send button
- Real-time: subscribe to Supabase Realtime on `messages` table filtered by `match_id`
- On mount: scroll to bottom of messages
- On new message received: auto-scroll to bottom

**NO:** typing indicators, read receipts, image/file uploads — text only.

---

### 7. Notifications Page (`/notifications`)

**Each notification item:**

| Type | Text | Action |
|------|------|--------|
| `liked_you` | "**[Name]** is interested in your profile" | Tap → view their full card in a modal. From modal: swipe right (creates match + reveals contact) or dismiss |
| `new_match` | "You matched with **[Name]**! 🎉" | Tap → go to matches page |
| `contact_revealed` | "**[Name]** viewed your contact info ⚡" | Tap → no action, mark as read |

- Unread notifications have a subtle highlight background
- "Mark all as read" button at top
- Show notification timestamp (e.g., "2h ago")

---

### 8. Profile Page (`/profile`)

View and edit own profile.

**Sections:**
- Avatar (tap to change)
- Name, University, Year
- Role + Skills (editable)
- Bio + Project Idea
- Looking For (editable)
- Contact Mode (editable — can switch between Open/Match)
- Contact Info (phone, Instagram, Telegram, LinkedIn)
- GitHub URL
- **Pause Profile toggle** — when ON: `is_active = false`, profile hidden from feed. Show clear status banner: "Your profile is paused — you won't appear to others"
- "Save Changes" button

---

## Navigation

### Mobile (bottom tab bar — always visible)
```
[🔥 Swipe] [💞 Matches] [🔔 Notifs] [👤 Profile]
```
- Show red badge on Notifs tab when there are unread notifications
- Active tab highlighted with accent color

### Desktop (top navigation bar)
```
[GradMatch logo]    [Swipe] [Matches] [Notifications 🔴] [Profile]    [Log out]
```

---

## Supabase Setup Instructions

1. Create project at supabase.com
2. Run the SQL schema above in the SQL Editor
3. Enable Google OAuth in Authentication → Providers
4. Create a storage bucket named `avatars` (public)
5. Add Storage policy: allow authenticated users to upload to `avatars/`
6. Copy Project URL and anon key to `.env`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Key Libraries to Install

```bash
npm install @supabase/supabase-js
npm install react-swipeable        # touch swipe gestures
npm install react-router-dom       # routing
npm install @dicebear/core @dicebear/collection  # avatar generation fallback
npm install date-fns               # timestamp formatting ("2h ago")
npm install react-hot-toast        # toast notifications
```

---

## Swipe Logic Utility (`src/utils/swipeLogic.js`)

```javascript
// Call this after every right swipe
export async function handleRightSwipe(supabase, currentProfile, targetProfile) {
  // 1. Record the swipe
  await supabase.from('swipes').insert({
    swiper_id: currentProfile.id,
    swiped_id: targetProfile.id,
    direction: 'right'
  });

  // 2. Branch on target's contact_mode
  if (targetProfile.contact_mode === 'open') {
    // Notify them that contact was revealed
    await supabase.from('notifications').insert({
      user_id: targetProfile.id,
      type: 'contact_revealed',
      from_user_id: currentProfile.id
    });
    return { type: 'open', contactInfo: getContactInfo(targetProfile) };
  }

  // contact_mode === 'match': check for mutual swipe
  const { data: theirSwipe } = await supabase
    .from('swipes')
    .select('id')
    .eq('swiper_id', targetProfile.id)
    .eq('swiped_id', currentProfile.id)
    .eq('direction', 'right')
    .single();

  if (theirSwipe) {
    // Mutual match!
    const { data: match } = await supabase
      .from('matches')
      .insert({ user1_id: currentProfile.id, user2_id: targetProfile.id })
      .select()
      .single();

    await supabase.from('notifications').insert({
      user_id: targetProfile.id,
      type: 'new_match',
      from_user_id: currentProfile.id
    });

    return { type: 'match', match, contactInfo: getContactInfo(targetProfile) };
  }

  // No mutual match yet — notify them
  await supabase.from('notifications').insert({
    user_id: targetProfile.id,
    type: 'liked_you',
    from_user_id: currentProfile.id
  });

  return { type: 'pending' };
}

function getContactInfo(profile) {
  return {
    phone: profile.phone,
    instagram: profile.instagram,
    linkedin: profile.linkedin,
    telegram: profile.telegram,
  };
}
```

---

## UI Design Tokens

Use these consistently across all components:

```
Primary accent:  indigo-600  (#4F46E5)
Success/Like:    green-500   (#22C55E)
Reject/Pass:     red-500     (#EF4444)
Background:      gray-950    (#030712)  -- dark theme
Card bg:         gray-900    (#111827)
Surface:         gray-800    (#1F2937)
Border:          gray-700    (#374151)
Text primary:    white
Text secondary:  gray-400    (#9CA3AF)
Text muted:      gray-500    (#6B7280)
```

Use a **dark theme** throughout. It looks better for a student-facing social app and is easier on the eyes at night.

---

## Role Color Map

Each role gets a distinct color badge:

```javascript
const roleColors = {
  frontend:   'bg-blue-500/20 text-blue-300',
  backend:    'bg-green-500/20 text-green-300',
  fullstack:  'bg-purple-500/20 text-purple-300',
  ml:         'bg-orange-500/20 text-orange-300',
  mobile:     'bg-cyan-500/20 text-cyan-300',
  designer:   'bg-pink-500/20 text-pink-300',
  other:      'bg-gray-500/20 text-gray-300',
};
```

---

## Avatar Fallback

If no avatar uploaded, generate initials avatar with a deterministic background color based on the user's name:

```javascript
const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-rose-500', 
                'bg-orange-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'];

export function getAvatarColor(name) {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
```

---

## What NOT to Build (Cut Scope)

Do not implement:
- Push notifications (browser or mobile)
- Image sharing in chat
- Typing indicators or read receipts
- Admin dashboard
- GitHub API integration (just collect GitHub URL as text)
- Email notifications
- Report / block users (add later)
- Complex search/filter (only the "looking for" filter on swipe feed)

---

## Routes Summary

```
/                   → Landing (public)
/auth               → Login / Signup
/onboarding         → Profile setup wizard (protected, only if !onboarding_complete)
/swipe              → Main swipe feed (protected)
/matches            → Matches list (protected)
/chat/:matchId      → Chat view (protected)
/notifications      → Notification inbox (protected)
/profile            → Own profile view/edit (protected)
```

All protected routes: if not logged in → redirect to `/auth`. If logged in but `onboarding_complete = false` → redirect to `/onboarding`.

---

## Performance Notes

- Lazy load all page components with `React.lazy` + `Suspense`
- Preload next batch of profiles before current stack runs out (when 2 cards left, fetch next 10)
- Optimistic UI: update card stack immediately on swipe, don't wait for DB write
- Cache profile data in React state, don't re-fetch on every swipe
- Use `select()` with specific columns only — don't fetch full rows when you need only id + name + avatar

---

## Final Checklist Before Launch

- [ ] Test full flow: signup → onboarding → swipe → match → chat
- [ ] Test contact_mode = "open" flow: right swipe → contact shown immediately
- [ ] Test contact_mode = "match" flow: mutual swipe → match modal → contact shown
- [ ] Test notification badge updates in real time
- [ ] Test on iPhone Safari (375px) — most users will be on this
- [ ] Test on Android Chrome (390px)
- [ ] Test on iPad (768px)
- [ ] Test on desktop (1280px)
- [ ] Verify RLS: a user cannot read another user's private swipes or notifications
- [ ] Supabase Storage bucket for avatars is public-readable
- [ ] Add meta tags for mobile: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] Add PWA manifest so users can "Add to Home Screen" on mobile
- [ ] Set Vercel domain, share invite link with friends
