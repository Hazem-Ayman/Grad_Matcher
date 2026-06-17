# GradMatch ⚡

A Tinder-style web application for university students to find graduation project teammates.

## 🚀 Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend & DB**: Supabase (Auth, PostgreSQL Database, Realtime, Storage)
- **Icons**: Lucide React

---

## 🛠️ Supabase Database Schema

To set up the database, execute the SQL queries from `gradmatch-spec.md` in the Supabase SQL editor. This creates the following tables:
- `profiles`: User information, onboarding flags, roles, skills, and contact handles.
- `swipes`: Records of left/right student swiping interactions.
- `matches`: Mutual connections establishing a team link.
- `messages`: Real-time chat messages between teammates.
- `notifications`: Notifications for likes, new matches, and contact reveals.

---

## ⚙️ Project Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hazem-Ayman/Grad_Matcher.git
   cd Grad_Matcher
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Storage Buckets Setup**:
   Create a **public bucket** named `avatars` in your Supabase storage to store profile images.

5. **Start Local Development Server**:
   ```bash
   npm run dev
   ```

---

## 📱 Features Walkthrough
1. **Landing Page**: Public dashboard showing CTAs and product value propositions.
2. **Onboarding Wizard**: 5-step form onboarding containing basic information, role tags, project description, privacy modes, and avatar uploads.
3. **Swipe Feed**: Stacked cards deck with pointer-swipe drag and arrow-keys controls, overlays, and direct open contact modals.
4. **Mutual Matches**: Teammates list displaying contact triggers and redirection to chat room.
5. **Real-time Chat**: Messaging thread utilizing Supabase Realtime subscriptions.
6. **Activity Notifications**: Inbox notifying of likes, new matches, and reveals.
