# GradMatch — Hardening & Edge Cases

This document covers smaller but important gaps in the existing app (core swipe/match system) and the teams feature. These are not new big features — they are fixes, safety nets, and missing states that need to exist before this app is shown to real users. Read fully and implement all of it. Treat this as a final pass after the core app and the teams feature are both working.

---

## 1. Existing Matches Are Not Affected by Joining a Team

Joining a team (through the invite flow) should have no effect on a user's existing one-to-one matches. If someone has three separate matches and then joins a team with one of those people, the other two matches stay exactly as they are — still visible, completely unaffected. Do not build any logic that removes, hides, or alters existing matches when someone joins, leaves, or switches teams. Matches and team membership are two separate systems that simply coexist.

---

## 2. Leaving a Team

Right now there's a way to join a team, but no way to leave one. Add a "Leave Team" option, visible to any user in their own profile settings, whenever they are currently part of a team that has more than one member.

When a user leaves a team:
- They are removed from that team's member list.
- They are immediately given back their own solo team, with themselves as the leader, exactly like the solo team they get automatically when they first finish onboarding.
- Nothing happens to the team they left — it keeps its other members and continues to exist normally, minus the person who left.

If the person leaving happens to be the leader of that team, and other members remain, simply pick another remaining member to become the new leader automatically (for example, whoever joined earliest). Don't build a manual leadership transfer feature — just handle this automatically and quietly behind the scenes so the team isn't left without a leader.

If the person leaving is the only member left after leaving (meaning they were already effectively solo, or everyone else already left), the team can simply be deleted since it's now empty.

---

## 3. Preventing Duplicate Invites

Before allowing someone to send a team invite, check whether a pending invite already exists between those two specific people. If one does, don't allow sending a second one — instead, show a message explaining an invite is already pending with that person. Once the existing invite is accepted or declined, a new invite can be sent again if needed.

This prevents someone from spamming the same person with repeated invite notifications.

---

## 4. What the Full Profile Popup Should and Shouldn't Show

Be explicit and careful here. The full profile popup (used both for viewing the main swipe card person and for viewing a teammate from the avatar row) should show: name, university, year, role, full bio, complete skill list, project idea, what they're looking for in teammates, what kind of team status they need (full team, one or two members, or just exploring), and their GitHub link if provided.

It should never show: phone number, Instagram handle, Telegram username, or LinkedIn profile. Those four contact details only ever get revealed through the existing match or direct-contact logic that's already part of the app, never through this profile popup, regardless of whether the two people have matched or not.

---

## 5. Empty States

Every screen that displays a list needs to handle the case where that list is empty, with a clear and friendly message rather than a blank or broken-looking screen. Specifically handle:

- The matches page when a user has zero matches yet — explain that matches will show up here once people like each other back, and maybe encourage them to keep swiping.
- The notifications page when there are zero notifications yet — a simple friendly message saying nothing to show yet.
- A profile card or full profile popup belonging to someone who has filled in zero skills — don't show a broken or empty-looking skills section, just omit that section gracefully or show a small "No skills listed yet" note instead of a blank gap.
- The teammate avatar row on a card belonging to someone who is solo, with no teammates yet — show a small "Solo — no team yet" label instead of leaving an empty gap that looks like something failed to load.

---

## 6. Report User

Add a basic "Report" option, accessible from the full profile popup. This does not need to be a moderation system — keep it extremely simple. When tapped, let the reporter pick a short reason from a small list (for example: fake profile, inappropriate behavior, harassment, other) and optionally add a short text note. Store this somewhere so it can be checked manually later — it does not need to trigger any automatic action, ban, or block. The only goal is to have some minimal safety net in place before real contact information starts being shared between real students, most of whom may not personally know each other.

---

## 7. Disclosure About Direct Contact Mode

During the onboarding step where a user chooses between Direct Contact mode and Match First mode, add a short, clear line of text near the Direct Contact option explaining what it actually means in practice: that choosing it means their phone number and social handles will be shown to anyone who likes their profile, even before that other person has been liked back. This is not a legal disclaimer, just plain language so nobody is surprised later that a stranger has their phone number after a single one-sided swipe.

---

## Priority Order

If time is tight, build these in this order, since some matter more for a safe launch than others:

1. Leaving a team — without this, anyone who joins a team by mistake has no way out, and this will definitely happen with real users.
2. The direct contact mode disclosure — this is one short sentence of text, costs almost nothing to add, and prevents real discomfort among real students.
3. Empty states — quick to do, and the app will look broken without them on a fresh account with no matches or notifications yet.
4. What the full profile popup does and doesn't show — mostly about double-checking existing logic rather than building something new.
5. Preventing duplicate invites — a small check, not a big feature.
6. Report user — simple to build, but lowest urgency if your 300 users are all people who already know each other personally (close friend group). Still worth including if there's any chance the app spreads beyond your immediate circle.
7. The note about existing matches being unaffected by team changes — this is more a "don't accidentally break this" reminder than something to actively build, so it costs nothing extra as long as the AI keeps the two systems separate from the start.
