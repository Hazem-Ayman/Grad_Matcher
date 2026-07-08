import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import RoleBadge from '../ui/RoleBadge';
import SkillChip from '../ui/SkillChip';
import { PhoneCall, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function MatchCard({ match, currentProfile, onViewContact }) {
  const { refreshProfile } = useAuth();
  const { profile } = match;
  const navigate = useNavigate();

  const [inviteStatus, setInviteStatus] = useState(null); // null, 'sent', 'received', 'teammate'
  const [inviteId, setInviteId] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!profile) return null;

  const { name, university, role, framework, skills, avatar_url } = profile;

  const fetchInviteStatus = async () => {
    if (!currentProfile || !profile) return;
    setLoadingInvite(true);
    try {
      if (currentProfile.team_id && currentProfile.team_id === profile.team_id) {
        setInviteStatus('teammate');
        setLoadingInvite(false);
        return;
      }

      // Check if we sent an invite
      if (currentProfile.team_id) {
        const { data: sent } = await supabase
          .from('team_invites')
          .select('id, status')
          .eq('team_id', currentProfile.team_id)
          .eq('invitee_id', profile.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (sent) {
          setInviteStatus('sent');
          setInviteId(sent.id);
          setLoadingInvite(false);
          return;
        }
      }

      // Check if we received an invite
      if (profile.team_id) {
        const { data: received } = await supabase
          .from('team_invites')
          .select('id, status')
          .eq('team_id', profile.team_id)
          .eq('invitee_id', currentProfile.id)
          .eq('status', 'pending')
          .maybeSingle();

        if (received) {
          setInviteStatus('received');
          setInviteId(received.id);
          setLoadingInvite(false);
          return;
        }
      }

      setInviteStatus(null);
      setInviteId(null);
    } catch (err) {
      console.error("Error checking invite status in MatchCard:", err);
    } finally {
      setLoadingInvite(false);
    }
  };

  useEffect(() => {
    fetchInviteStatus();
  }, [currentProfile, profile]);

  const handleSendInvite = async () => {
    if (!currentProfile || !profile) return;
    setActionLoading(true);
    try {
      let teamId = currentProfile.team_id;

      // If the current user has no team (e.g. left their solo team), auto-create one first
      if (!teamId) {
        const { data: newTeam, error: newTeamError } = await supabase
          .from('teams')
          .insert({ leader_id: currentProfile.id })
          .select()
          .single();
        
        if (newTeamError) throw newTeamError;
        teamId = newTeam.id;

        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ team_id: teamId })
          .eq('id', currentProfile.id);

        if (profileErr) throw profileErr;
        
        // Refresh local auth session so the client updates
        await refreshProfile();
      }

      const { data: invite, error: inviteErr } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          inviter_id: currentProfile.id,
          invitee_id: profile.id,
          status: 'pending'
        })
        .select()
        .single();

      if (inviteErr) throw inviteErr;

      const { error: notifErr } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.id,
          type: 'team_invite',
          from_user_id: currentProfile.id,
          team_invite_id: invite.id
        });

      if (notifErr) throw notifErr;

      toast.success("Team invitation sent! ✉️");
      setInviteStatus('sent');
      setInviteId(invite.id);
    } catch (err) {
      console.error("Error sending team invite:", err);
      toast.error("Failed to send team invitation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!currentProfile || !profile || !inviteId) return;
    setActionLoading(true);
    try {
      const { data: teamMembers, error: membersErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('team_id', currentProfile.team_id);

      if (membersErr) throw membersErr;

      if (teamMembers && teamMembers.length > 1) {
        toast.error("You cannot accept this invite because you are currently in a team with other members.");
        setActionLoading(false);
        return;
      }

      const oldTeamId = currentProfile.team_id;
      const newTeamId = profile.team_id;

      const { error: updateProfileErr } = await supabase
        .from('profiles')
        .update({ team_id: newTeamId })
        .eq('id', currentProfile.id);

      if (updateProfileErr) throw updateProfileErr;

      if (oldTeamId) {
        await supabase
          .from('teams')
          .delete()
          .eq('id', oldTeamId);
      }

      await supabase
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('team_invite_id', inviteId)
        .eq('user_id', currentProfile.id);

      toast.success("Joined their project team! 🎉");
      setInviteStatus('teammate');
      window.location.reload();
    } catch (err) {
      console.error("Error accepting team invite:", err);
      toast.error("Failed to join team.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="glass-panel border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group text-left">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Avatar src={avatar_url} name={name} size="lg" className="border border-gray-800" onClick={() => navigate(`/view-profile/${profile.id}`)} />

        {/* Profile Info */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-white text-base truncate tracking-wide cursor-pointer hover:text-indigo-400" onClick={() => navigate(`/view-profile/${profile.id}`)}>{name}</h3>
          </div>
          <p className="text-xs text-indigo-400 font-medium truncate">{university}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <RoleBadge role={role} framework={framework} />
          </div>
        </div>
      </div>

      {/* Skills (first 3 chips) */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill) => (
            <SkillChip key={skill} skill={skill} />
          ))}
          {skills.length > 3 && (
            <span className="text-[10px] text-gray-500 font-semibold px-2 py-1 bg-gray-800/40 rounded border border-transparent">
              +{skills.length - 3} more
            </span>
          )}
        </div>
      )}
      {/* Team Invite / Teammate Row */}
      {match.isMutual && (
        <div className="pt-1">
          {loadingInvite ? (
            <div className="flex items-center justify-center py-2 text-xs text-gray-500 font-semibold gap-1.5 bg-gray-950/20 border border-gray-855 rounded-xl">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Checking team status...
            </div>
          ) : inviteStatus === 'teammate' ? (
            <div className="flex items-center justify-center py-2.5 text-xs text-green-400 font-bold gap-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
              <UserCheck className="w-3.5 h-3.5 text-green-400" /> Teammate (On your Team)
            </div>
          ) : inviteStatus === 'sent' ? (
            <div className="flex items-center justify-center py-2.5 text-xs text-indigo-400 font-semibold gap-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl opacity-80">
              Invite Sent (Pending)
            </div>
          ) : inviteStatus === 'received' ? (
            <button
              onClick={handleAcceptInvite}
              disabled={actionLoading}
              className="w-full flex items-center justify-center py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold gap-1.5 transition-all active:scale-98 cursor-pointer border border-indigo-500/30"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Accept Team Invitation
            </button>
          ) : (
            <button
              onClick={handleSendInvite}
              disabled={actionLoading}
              className="w-full flex items-center justify-center py-2.5 bg-indigo-550/10 hover:bg-indigo-550/15 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-bold gap-1.5 transition-all active:scale-98 cursor-pointer border border-indigo-500/20"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Invite to my Team
            </button>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="pt-2 border-t border-gray-800/60">
        {match.isMutual ? (
          <button
            onClick={() => onViewContact(profile)}
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Contact Info</span>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gray-950/40 border border-gray-855 text-gray-500 rounded-xl text-[10px] sm:text-xs font-semibold select-none cursor-not-allowed">
            <span>🔒 Match Pending (Contact details locked)</span>
          </div>
        )}
      </div>
    </div>
  );
}
