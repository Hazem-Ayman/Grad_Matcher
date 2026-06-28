# GradMatch — Teams Feature Addition

This document describes new functionality to add on top of the existing GradMatch app (the swipe, match, chat, and notification system already documented). Read this fully before making changes. Implement everything described here.

---

## The Core Idea

Right now, matching is one-to-one: two people match, they chat, that's it. But graduation projects need real teams of multiple people, not just pairs. This update introduces the concept of a **Team** as its own entity that profiles belong to, with one person acting as the **leader**.

Every user is always part of exactly one team. If they haven't joined anyone, they are the leader of their own solo team (a team of one). This should happen automatically the moment a user finishes onboarding — never leave a user without a team, because every other feature depends on a user always having one.

---

## What a Team Is

A team has:
- A leader (the person who created it, or who is currently "in charge" of it)
- A list of members (including the leader)
- A project idea (use the leader's project idea as the team's project idea)
- A status of whether it's full or still recruiting

When a solo user joins someone else's team, their own solo team is dissolved and removed, and they become a regular member of the team they joined.

---

## How Someone Joins a Team

Joining a team is invite-only, and only happens after a mutual match. Here is the exact flow:

1. Two users swipe right on each other and get a mutual match, exactly like the current matching system already does.
2. Once matched, either person can invite the other to their team. Add an "Invite to my team" button wherever matches are shown — on the match card in the Matches list, and inside the chat screen.
3. When User A invites User B, send User B a notification saying they've been invited to join User A's team.
4. User B can accept or decline directly from the notification.
5. If User B accepts, and User B is currently a solo leader (the normal case), their solo team is deleted and they become a member of User A's team.
6. If User B accepts and User B already leads a team with other members in it, do not attempt to merge the two teams automatically. For this version, only allow the invite to be accepted if the invitee is currently solo. If they are not solo, show a message explaining they need to be on their own before joining another team. Merging two full teams together is out of scope for now — explicitly do not build this. It can be added later.

A team leader should be able to mark their team as "full" or "no longer recruiting." When a team is marked full, it should not change anything about how it appears to others yet — this is just a status field the leader can toggle for their own reference, no enforcement needed at this stage.

---

## What Changes on the Swipe Card

This is the most important visual change. Every profile card in the swipe feed needs two new things added to it:

**1. A row of small teammate avatars near the bottom of the card.**
This shows tiny circular profile pictures of everyone else who is on this person's team (not including the person on the card themselves, since their own photo is already shown at the top of the card). If the team is just the one person (solo), show nothing in this row, or show a subtle "Solo — no team yet" label instead.

If a person taps on one of these small teammate avatars, open that teammate's full profile in a popup, so the swiper can check out who else is on the team before deciding whether this is a group worth teaming up with, or whose team they might want to merge into via a future invite.

**2. A "View Full Profile" button on the card itself.**
Right now the swipe card only shows a summary of the person. Add a clearly visible button (something like "View Full Profile") that, when tapped, opens a bigger popup showing everything about that person — their full bio, complete skill list, project idea, what they're looking for in teammates, and their GitHub link. Do not show their phone number or social handles in this profile popup — contact details should still only be revealed through the existing match or open-contact logic, never through this profile view.

Use the same full-profile popup component for both situations — viewing the main card person, and viewing a teammate from the avatar row. It's the same kind of information either way, so it should be the same reusable popup.

---

## Visual Layout Adjustment

On the swipe card, after the existing content (avatar, name, role badge, skills, project idea, GitHub link), add:

- A thin divider line
- The row of small teammate avatars (or the "Solo" label if there are none)
- Another thin divider line
- The "View Full Profile" button, sitting above the existing left/right swipe action buttons

Keep this responsive exactly like the rest of the card — the teammate avatar row should wrap or scroll horizontally on narrow screens rather than overflowing, and the avatars themselves should be small enough (think 32 to 40 pixels) that even a team of four or five fits comfortably on a phone screen.

---

## Notifications — New Type

Add one new notification type to the existing notification system: a team invite notification. When someone is invited to a team, they should see it in their notification inbox alongside their existing "liked you," "new match," and "contact revealed" notifications. The text should clearly state who is inviting them and to which team. From this notification, the recipient should be able to accept or decline right there, without needing to navigate elsewhere first.

---

## Data Visibility Rules

Team membership and team details should be visible to everyone, the same way profiles are public to anyone browsing the swipe feed. There's no privacy concern here — knowing who's on someone's team is meant to be public information so people can make informed decisions about whether to connect.

Team invites themselves, however, are private — only the person sending the invite and the person receiving it should be able to see that a particular invite exists.

---

## What to Explicitly Skip for This Version

Do not build any of the following right now. These are intentionally out of scope so the app can be finished and deployed quickly:

- Merging two teams that both already have multiple members
- Leadership transfer (changing who the leader of a team is)
- Removing or kicking a member out of a team
- Group chat for teams (keep the existing one-to-one chat only; teammates can coordinate outside the app for now)
- Any enforcement around the "team is full" status — it's just a label for now, it shouldn't block anything

---

## Summary of New Screens / Components Needed

- A small horizontal avatar row component for showing teammates on a card
- A reusable full-profile popup component (used both for the main swipe card person and for any teammate tapped from the avatar row)
- An "Invite to my team" action, available from the Matches list and from the chat screen
- A new notification type for team invites, with accept/decline actions available directly inside the notification
- A way for a team leader to toggle their team's "full / still recruiting" status somewhere in their own profile settings

---

## Priority Order

Build and test in this order, since later pieces depend on earlier ones working correctly:

1. Every user automatically gets a solo team the moment they finish onboarding — confirm this works before anything else, since every other feature assumes a user always has a team.
2. The teammate avatar row and full-profile popup on the swipe card — this is a display-only feature and the easiest to verify visually.
3. The invite-to-team button and flow, including the new notification type and the accept/decline action.
4. The team-full toggle in profile settings — this is the least urgent and can be done last.
