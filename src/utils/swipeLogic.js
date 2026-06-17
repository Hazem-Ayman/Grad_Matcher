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
    .maybeSingle(); // Use maybeSingle to prevent 406/PGRST116 errors if not found

  if (theirSwipe) {
    // Mutual match! Make sure user1_id and user2_id are unique/ordered if desired,
    // but the spec specifies: { user1_id: currentProfile.id, user2_id: targetProfile.id }
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({ user1_id: currentProfile.id, user2_id: targetProfile.id })
      .select()
      .single();

    if (matchError) {
      console.error("Error creating match:", matchError);
      throw matchError;
    }

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

export function getContactInfo(profile) {
  return {
    phone: profile.phone,
    instagram: profile.instagram,
    linkedin: profile.linkedin,
    telegram: profile.telegram,
  };
}
