# GradMatch — Full Application Documentation

GradMatch is a Tinder-style web application built for university students to find graduation project teammates. It helps students showcase their developer role, highlight technical skills, present project ideas, outline what they search for in teammates, and interact via swiping to establish mutual matches or directly reveal contact credentials. It also supports constructing multi-member graduation project teams.

---

## 📱 User Workflows & Features

### 1. Landing & Authentication (`/` and `/auth`)
*   **Landing Page**: A conversion-focused home screen introducing the platform value proposition: swipe through profiles, match with peers, and connect instantly. Includes call-to-actions (CTAs) directing users to Sign Up or Log In.
*   **Authentication**: Users can register or log in using an email and password or proceed via Google OAuth. 
*   **Guard Routing**: Logged-out users are restricted from app features and redirected to `/auth`. Authenticated users who have not completed profile setup are automatically redirected to `/onboarding`.

### 2. Multi-Step Onboarding Wizard (`/onboarding`)
A 5-step wizard with a visual progress bar that guides new users in creating their profile:
1.  **Personal Info**: Full Name, University, Bio (General introduction), and University Year (1st to 5th).
2.  **Role & Skills**: Primary role (Frontend, Backend, Fullstack, ML/AI, Mobile, UI/UX, or Other) and key skills/technologies added as dynamic tag chips (with suggested quick-tags like React, TensorFlow, Figma, etc.).
3.  **Project Goals**: 
    *   *Project Idea*: "What do you want to achieve with this project?" (Max 200 characters).
    *   *Teammate Search Preference*: "What are you searching for in your teammates?" (Max 200 characters).
    *   *Team Status Need*: Radio selection of "A full team", "1–2 members", or "Just exploring".
4.  **Contact Mode Privacy & Info**:
    *   *Direct Contact Mode (Open)* ⚡: Anyone who likes the user's card sees their contact info right away without needing a mutual match.
    *   *Match First Mode (Locked)* 🔒: Contact details remain hidden until both users like each other.
    *   *Contact Details*: Input fields for Phone Number, Instagram handle, Telegram username, and LinkedIn profile URL (at least one is required).
5.  **Profile Avatar**: Option to upload a profile photo (uploaded to Supabase Storage). If skipped, an avatar is automatically generated using initials and a deterministic color based on their name.

> [!NOTE]
> **Solo Team Auto-Creation**: Upon successful completion of onboarding, the system automatically creates a team in the database with the user designated as the leader, ensuring every onboarded user is part of a team.

### 3. Swipe Feed (`/swipe`)
The core screen of the application, featuring a touch-friendly stacked card interface:
*   **Interaction Controls**: Left Swipe (Pass) / Right Swipe (Like) supported via mobile touch-drag gestures, desktop keyboard arrow keys, or card action buttons.
*   **Swipe Indicators**: Top card displays visual overlays ("LIKE" green tint / "PASS" red tint) corresponding to drag direction.
*   **Profile Card Details**: Displays profile avatar, name, school/year, primary role badge, team need badge, project idea quote block, technical skills chips, and linked GitHub profile. It also showcases the teammate preference details so swipers can inspect alignment.
*   **Teammate Avatar Row**: Renders small circular avatars of the profile's team members near the bottom of the card. Clicking a teammate's picture fetches their full profile on-demand and displays it. Solo users show a subtle `Solo — no team yet` label.
*   **View Full Profile**: A button that opens a popup modal showing their bio, project idea, teammate preference, skills, and repository links, while keeping private contact handles hidden.
*   **Intelligent Filtering**: Only active, fully onboarded profiles appear. Users who select "Just exploring" (browsing mode) are hidden from the feed deck. The system automatically excludes profiles the user has already swiped on, plus the user's own profile.
*   **Optimistic Preloading**: Preloads next 10 profiles in the background when 2 cards are left.

### 4. Liking & Matching Engine (`src/utils/swipeLogic.js`)
When User A swipes right on User B:
*   **Mutual Match** (User B already swiped right on User A):
    *   Creates a match record in the database.
    *   Triggers a `new_match` notification for User B.
    *   Returns `type: 'match'`, opening the **"It's a Match!" Celebration Modal** in `Swipe.jsx` featuring both avatars, contact info, and keep swiping options.
*   **One-Sided Open-Contact Match** (User B did not swipe right yet, but has `contact_mode = 'open'`):
    *   Creates a match record in the database so User B immediately appears in User A's Matches directory.
    *   Triggers a `contact_revealed` notification for User B.
    *   Returns `type: 'open'`, opening the **"Direct Contact Available" Modal** immediately (with no misleading "You both liked each other" text).
*   **One-Sided Standard Like** (User B did not swipe right and has `contact_mode = 'match'`):
    *   Records the swipe in the database (direction: 'right').
    *   Triggers a `liked_you` notification for User B.
    *   Returns `type: 'pending'` (no modals shown, just a success toast).

### 5. Matches List & Team Invitations (`/matches`)
Displays all established match cards in a responsive grid:
*   Displays matched user's name, role badge, first 3 technical skill chips, and contact options.
*   **Team Invite controls**:
    *   If they are already on your team, displays a green `✓ Teammate` badge.
    *   If an invite is pending, displays `Invite Sent`.
    *   If they sent you an invite, displays an active `Accept Team Invitation` button.
    *   Otherwise, displays an `Invite to my Team` button.
*   **Invitation Logic**: Sending an invite records a pending team invite and issues a notification. Accepting checks if you are solo. If solo, it deletes your solo team, associates your profile with their team, accepts the invite, and marks notifications read.

### 6. Notification Inbox & Inline Invite Actions (`/notifications`)
Centralized log of social interactions with real-time updates and highlight markers for unread items:
*   `liked_you`: "[Name] is interested in your profile." Tap to view their card in a modal, allowing the user to swipe back or dismiss.
*   `new_match`: "You matched with [Name]! 🎉" Tap to jump directly to the matches page.
*   `contact_revealed`: "[Name] viewed your contact info ⚡." Info notification marked as read upon review.
*   `team_invite`: "[Name] invited you to join their project team." Renders inline **Accept** and **Decline** buttons (for pending status). Declining declines the invite and marks notification read. Accepting executes the solo checks and joins their team.

### 7. My Project Team Page (`/team`)
A centralized directory representing the user's active team:
*   **Project Proposal**: Prominently displays the team's project goals (proposed by the team leader).
*   **Status Indicators**: Shows whether the team is `'🔒 Team Full'` or `'⚡ Recruiting Teammates'`.
*   **Members Directory**: Lists all members of the team. Leaders get a special crown indicator. Tapping on any colleague card navigates to their detailed profile view.
*   **Pending Invitations Tracker**: Lists invitations sent by this team that are currently awaiting a response from matched candidates. Includes an active button to **Cancel** the invitation.
*   **Solo Assistant**: Guides solo users with call-to-actions to start swiping and match with new partners.

### 8. Profile Settings & Display (`/profile` & `/view-profile/:profileId`)
*   **Edit Profile settings**: Allows users to manage all profile details and handles, pause their profile, and toggle their team status: `"Team is full (No longer recruiting teammates)"` (available to team leaders, saving and persisting to `teams` table).
*   **Profile details view**: matched teammates see the detailed biography, technical skills, socials (if revealed), and a list of all team members (with leader indicators and links to view other members).

---

## 🗄️ Database Architecture

The application communicates with a Supabase PostgreSQL backend using the following table structures:

### 1. `profiles` Table
Stores onboarding specifications, credentials, and preferences:
*   `id` (uuid, primary key)
*   `user_id` (uuid, unique): Link to the authenticated `auth.users` row.
*   `name` (text, not null)
*   `bio` (text)
*   `year` (text)
*   `university` (text)
*   `role` (text)
*   `skills` (text[])
*   `github_url` (text)
*   `project_idea` (text)
*   `searching_for` (text) — teammate search preferences.
*   `looking_for` (text) — `'full_team'`, `'one_member'`, `'browsing'`.
*   `contact_mode` (text) — `'open'` or `'match'`.
*   `phone`, `instagram`, `telegram`, `linkedin` (text)
*   `avatar_url` (text)
*   `is_active` (boolean, default true)
*   `onboarding_complete` (boolean, default false)
*   `team_id` (uuid, foreign key referencing `teams.id`)

### 2. `teams` Table
Stores team groupings:
*   `id` (uuid, primary key)
*   `leader_id` (uuid, foreign key referencing `profiles.id`)
*   `is_full` (boolean, default false)
*   `created_at` (timestamptz)

### 3. `team_invites` Table
Tracks invites between matched users:
*   `id` (uuid, primary key)
*   `team_id` (uuid, foreign key referencing `teams.id`)
*   `inviter_id` (uuid, foreign key referencing `profiles.id`)
*   `invitee_id` (uuid, foreign key referencing `profiles.id`)
*   `status` (text, default `'pending'`) — check in `('pending', 'accepted', 'declined')`.
*   *Constraint*: Unique combination of `team_id` and `invitee_id`.

### 4. `swipes` Table
Logs swiping operations:
*   `id` (uuid, primary key)
*   `swiper_id` (uuid, foreign key referencing `profiles.id`)
*   `swiped_id` (uuid, foreign key referencing `profiles.id`)
*   `direction` (text) — `'left'` or `'right'`.
*   *Constraint*: Unique combination of `swiper_id` and `swiped_id`.

### 5. `matches` Table
Maintains team connection states:
*   `id` (uuid, primary key)
*   `user1_id` (uuid, foreign key referencing `profiles.id`)
*   `user2_id` (uuid, foreign key referencing `profiles.id`)
*   *Constraint*: Unique combination of `user1_id` and `user2_id`.

### 6. `notifications` Table
Logs feed alerts for matching interactions:
*   `id` (uuid, primary key)
*   `user_id` (uuid, recipient foreign key referencing `profiles.id`)
*   `type` (text) — `'liked_you'`, `'new_match'`, `'contact_revealed'`, or `'team_invite'`.
*   `from_user_id` (uuid, sender foreign key referencing `profiles.id`)
*   `team_invite_id` (uuid, foreign key referencing `team_invites.id` on delete cascade)
*   `read` (boolean, default false)
*   `created_at` (timestamptz)

### 7. `reports` Table
Logs student profile reports for safety:
*   `id` (uuid, primary key)
*   `reporter_id` (uuid, foreign key referencing `profiles.id`)
*   `reported_id` (uuid, foreign key referencing `profiles.id`)
*   `reason` (text)
*   `notes` (text)
*   `created_at` (timestamptz)

### 🔓 Row-Level Security (RLS) policies
All tables have strict Row-Level Security active:
*   `profiles`: Read access is public; updates/inserts are constrained to `auth.uid() = user_id`.
*   `teams`: Anyone can read; leaders can insert, update, or delete.
*   `team_invites`: Selected and managed only by participating inviter/invitee.
*   `swipes`: Only the swiping profile owner can read, update, or create swipe rows.
*   `matches`: Matches can only be queried by users whose profile ID equals either `user1_id` or `user2_id`.
*   `notifications`: Read and write queries are limited strictly to the recipient profile ID.
*   `reports`: Users can only read or insert reports where their own profile ID matches the reporter ID.
