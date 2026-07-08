# Implementation Plan — Pre-Launch Bugs & UX Fixes

This document details the step-by-step design and execution plan to resolve the remaining pre-launch bugs and UX gaps.

---

## 🔒 1. UX 3 — Contact Info Privacy Guard
**Target File:** [`ProfileView.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/ProfileView.jsx)

### Problem
Any logged-in user can access `/view-profile/:profileId` and view all direct contact handles (phone, telegram, etc.) of any student, bypassing the matching system.

### Proposed Solution
We will add a mutual match check before displaying contact handles:
1. When loading the profile details, we will query the `matches` table to check if there is an existing match between the viewer (`currentProfile.id`) and the target profile (`profileId`):
   ```js
   const { data: match } = await supabase
     .from('matches')
     .select('id')
     .or(`and(user1_id.eq.${currentProfile.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${currentProfile.id})`)
     .maybeSingle();
   ```
2. Check if the viewer and target are in the same team:
   ```js
   const isTeammate = currentProfile.team_id && currentProfile.team_id === profile.team_id;
   ```
3. If `!match && !isTeammate`, hide the contact fields (phone, telegram, instagram, linkedin) in the UI and show a locked banner:
   > 🔒 **Contact info locked**
   > You must match with this user or be in the same project team to view their contact handles.

---

## 🟡 2. UX 8 — "Like Back" Button Loading State
**Target File:** [`Notifications.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/Notifications.jsx)

### Problem
Clicking "Like Back" on a user's notification card starts a swipe request but does not disable the button, leading to double-click risk.

### Proposed Solution
1. Introduce a `liking` state at the top of `Notifications.jsx`:
   ```js
   const [likingBack, setLikingBack] = useState(false);
   ```
2. Wrap `handleLikeBack` execution:
   ```js
   const handleLikeBack = async () => {
     if (likingBack) return;
     setLikingBack(true);
     try {
       // swipe logic...
     } finally {
       setLikingBack(false);
     }
   };
   ```
3. Update the button to show a spinner and disable interaction:
   ```jsx
   <button
     onClick={handleLikeBack}
     disabled={likingBack}
     className="..."
   >
     {likingBack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 fill-white" />}
     <span>{likingBack ? 'Liking back...' : 'Like Back'}</span>
   </button>
   ```

---

## 🟡 3. Bug 4 — Clear notification on successful "Like Back"
**Target File:** [`Notifications.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/Notifications.jsx)

### Problem
After matching via "Like Back", the old `liked_you` notification remains in the user's notification list.

### Proposed Solution
When `handleRightSwipe` resolves with `result.type === 'match'`, we should filter out or mark that notification as updated/matched locally:
1. In the `handleLikeBack` success block:
   ```js
   if (result.type === 'match') {
     // Mark read or remove locally from state to sync the feed immediately
     markAsRead(selectedNotification.id);
   }
   ```
2. Change local notification display or hide the item:
   Since the notification context handles reading state, marking it as read is standard, or we can filter it out if we want to remove it.

---

## 🟡 4. UX 2 — Match Modal "Reveal Contact" Reset
**Target File:** [`MatchModal.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/components/matches/MatchModal.jsx)

### Problem
Clicking "Reveal Contact Info" sets `showContact` to true. If you close the modal and match with a different student, `showContact` remains true, showing the new contact info automatically.

### Proposed Solution
Reset `showContact` whenever the modal opens, closes, or matches a different person:
```js
useEffect(() => {
  if (!isOpen) {
    setShowContact(false);
  }
}, [isOpen, matchedProfile?.id]);
```

---

## 🟢 5. Bug 7 — GitHub URL in Onboarding
**Target File:** [`Onboarding.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/Onboarding.jsx)

### Problem
Onboarding collects phone, Instagram, Telegram, and LinkedIn, but omits GitHub.

### Proposed Solution
1. Add `githubUrl` state to onboarding:
   ```js
   const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
   ```
2. Add input field to onboarding Step 3 contact inputs section:
   ```jsx
   <div className="space-y-1">
     <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">GitHub Link</label>
     <input
       type="text"
       value={githubUrl}
       onChange={(e) => setGithubUrl(e.target.value)}
       placeholder="github.com/yourusername"
       className="..."
     />
   </div>
   ```
3. Include `github_url: githubUrl.trim() || null` in the onboarding submit payload.

---

## 🟢 6. UX 6 — Toast Duration Correction
**Target File:** [`App.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/App.jsx)

### Problem
Toasts dissolve in 1.5 seconds, which is too quick for users to read error details.

### Proposed Solution
Increase the default toast duration to 3.5 seconds:
```js
<Toaster
  position="top-center"
  toastOptions={{
    duration: 3500, // Changed from 1500
    style: { ... }
  }}
/>
```

---

## 🟢 7. Code — ProfileCard github_url Link Prefix
**Target File:** [`ProfileCard.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/components/cards/ProfileCard.jsx)

### Problem
If the user inputs just `github.com/username` without `https://`, clicking the card's GitHub button loads `localhost:3000/github.com/...` instead of the external site.

### Proposed Solution
Adjust `href` attribute in `ProfileCard.jsx` at line 203:
```jsx
href={github_url.startsWith('http') ? github_url : `https://${github_url}`}
```

---

## 🟢 8. Code — CopyButton DRY Component
**Target Files:** [`Team.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/Team.jsx), [`Matches.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/Matches.jsx), [`ProfileView.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/pages/ProfileView.jsx)

### Problem
`CopyButton` is copy-pasted in three different files.

### Proposed Solution
1. Create a reusable copy component [`src/components/ui/CopyButton.jsx`](file:///d:/Having%20Fun%20with%20Projects/GradMatch/src/components/ui/CopyButton.jsx):
   ```jsx
   import React, { useState } from 'react';
   import { Copy, Check } from 'lucide-react';

   export default function CopyButton({ text, className = '' }) {
     const [copied, setCopied] = useState(false);
     const handleCopy = (e) => {
       e.stopPropagation();
       navigator.clipboard.writeText(text);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
     };
     return (
       <button
         type="button"
         onClick={handleCopy}
         className={`p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer ml-1.5 flex-shrink-0 ${className}`}
         title="Copy to clipboard"
       >
         {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
       </button>
     );
   }
   ```
2. Replace local definitions in all 3 pages with the imported `<CopyButton />` component.
