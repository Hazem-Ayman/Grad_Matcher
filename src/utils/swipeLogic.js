// Call this after every right swipe
export async function handleRightSwipe(supabase, currentProfile, targetProfile) {
  // 1. Record the swipe
  const { error: swipeError } = await supabase.from('swipes').insert({
    swiper_id: currentProfile.id,
    swiped_id: targetProfile.id,
    direction: 'right'
  });

  if (swipeError) {
    console.error("Error inserting swipe:", swipeError);
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

  // Check if match already exists in either direction
  const { data: existingMatch } = await supabase
    .from('matches')
    .select('*')
    .or(`and(user1_id.eq.${currentProfile.id},user2_id.eq.${targetProfile.id}),and(user1_id.eq.${targetProfile.id},user2_id.eq.${currentProfile.id})`)
    .maybeSingle();

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
