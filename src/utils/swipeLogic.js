// Call this after every right swipe
export async function handleRightSwipe(supabase, currentProfile, targetProfile) {
  // 1. Record the swipe (using upsert in case the user has swiped them left/right previously)
  const { error: swipeError } = await supabase.from('swipes').upsert({
    swiper_id: currentProfile.id,
    swiped_id: targetProfile.id,
    direction: 'right'
  }, { onConflict: 'swiper_id,swiped_id' });

  if (swipeError) {
    console.error("Error inserting/updating swipe:", swipeError);
    throw swipeError;
  }

  // 2. Check for mutual swipe first
  const { data: theirSwipe } = await supabase
    .from('swipes')
    .select('id')
    .eq('swiper_id', targetProfile.id)
    .eq('swiped_id', currentProfile.id)
    .eq('direction', 'right')
    .maybeSingle(); // Use maybeSingle to prevent 406/PGRST116 errors if not found

  // Check if match already exists in either direction (simplified to avoid complex PostgREST logical operator failures)
  const { data: matchesList } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`);

  const existingMatch = (matchesList || []).find(m => 
    (m.user1_id === currentProfile.id && m.user2_id === targetProfile.id) ||
    (m.user1_id === targetProfile.id && m.user2_id === currentProfile.id)
  );

  if (theirSwipe) {
    // Mutual match!
    let match = existingMatch;
    if (!match) {
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({ user1_id: currentProfile.id, user2_id: targetProfile.id })
        .select()
        .single();

      if (matchError) {
        console.error("Error creating match:", matchError);
      } else {
        match = newMatch;
      }
    }

    // Only send notification if match didn't exist before to prevent double notifications
    if (!existingMatch) {
      await supabase.from('notifications').insert({
        user_id: targetProfile.id,
        type: 'new_match',
        from_user_id: currentProfile.id
      });
      // Also notify the current user that they matched
      await supabase.from('notifications').insert({
        user_id: currentProfile.id,
        type: 'new_match',
        from_user_id: targetProfile.id
      });
    }

    return { type: 'match', match, contactInfo: getContactInfo(targetProfile) };
  }

  // No mutual swipe yet — notify them that someone liked them
  await supabase.from('notifications').insert({
    user_id: targetProfile.id,
    type: 'liked_you',
    from_user_id: currentProfile.id
  });

  return { type: 'pending' };
}

export function getContactInfo(profile) {
  return {
    phone: profile.phone,
    instagram: profile.instagram,
    linkedin: profile.linkedin,
    telegram: profile.telegram,
  };
}
