import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import RoleBadge, { roleNames } from '../components/ui/RoleBadge';
import SkillChip from '../components/ui/SkillChip';
import { Users, Crown, Sparkles, BookOpen, Compass, Mail, X, Loader2, Check, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CopyButton = ({ text }) => {
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
      className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer ml-1.5 flex-shrink-0"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export default function Team() {
  const { profile: currentProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [leaving, setLeaving] = useState(false);
  
  // Solo view states
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!currentProfile?.team_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch team, its leader, and members
        const { data: teamData, error: teamErr } = await supabase
          .from('teams')
          .select(`
            *,
            leader:leader_id (*),
            members:profiles!team_id (*)
          `)
          .eq('id', currentProfile.team_id)
          .single();

        if (teamErr) throw teamErr;
        setTeam(teamData);
        setMembers(teamData?.members || []);

        // 2. Fetch pending invites sent by this team
        const { data: invitesData, error: invitesErr } = await supabase
          .from('team_invites')
          .select(`
            *,
            invitee:invitee_id (*)
          `)
          .eq('team_id', currentProfile.team_id)
          .eq('status', 'pending');

        if (invitesErr) throw invitesErr;
        setInvites(invitesData || []);
      } catch (err) {
        console.error("Error fetching team data:", err);
        toast.error("Failed to load team information.");
      } finally {
        setLoading(false);
      }
    };

    if (currentProfile) {
      fetchTeamData();
    }
  }, [currentProfile]);

  const handleCancelInvite = async (inviteId) => {
    setCancellingId(inviteId);
    try {
      // 1. Delete associated notification first (due to foreign key constraint cascades or to prevent orphan rows)
      await supabase
        .from('notifications')
        .delete()
        .eq('team_invite_id', inviteId);

      // 2. Delete team_invite
      const { error: inviteError } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId);

      if (inviteError) throw inviteError;

      toast.success("Invitation cancelled.");
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (err) {
      console.error("Error cancelling invite:", err);
      toast.error("Failed to cancel invitation.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this project team?")) return;
    setLeaving(true);
    try {
      const oldTeamId = currentProfile.team_id;
      
      // If the team has only 1 member (the current user), we just delete it and set team_id to null
      if (isSolo) {
        // Update user profile to point to null team
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ team_id: null })
          .eq('id', currentProfile.id);

        if (profileErr) throw profileErr;

        // Delete the empty team
        const { error: deleteErr } = await supabase
          .from('teams')
          .delete()
          .eq('id', oldTeamId);

        if (deleteErr) throw deleteErr;

        toast.success("You have left the team and are now solo.");
        await refreshProfile();
        window.location.reload();
        return;
      }
      
      // 1. Create a new solo team for the current user
      const { data: newTeam, error: newTeamError } = await supabase
        .from('teams')
        .insert({ leader_id: currentProfile.id })
        .select()
        .single();
      
      if (newTeamError) throw newTeamError;

      // 2. If the user is the leader of the old team, we must reassign leadership
      const isUserLeader = team.leader_id === currentProfile.id;
      if (isUserLeader) {
        const nextLeader = members.find(m => m.id !== currentProfile.id);
        if (nextLeader) {
          const { error: leaderErr } = await supabase
            .from('teams')
            .update({ leader_id: nextLeader.id })
            .eq('id', oldTeamId);
          
          if (leaderErr) throw leaderErr;
        }
      }

      // 3. Update the user's profile to point to the new solo team
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ team_id: newTeam.id })
        .eq('id', currentProfile.id);

      if (profileErr) throw profileErr;

      toast.success("You have left the team and are now solo.");
      await refreshProfile();
      window.location.reload();
    } catch (err) {
      console.error("Error leaving team:", err);
      toast.error("Failed to leave team.");
    } finally {
      setLeaving(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const cleanCode = joinCode.trim();
    if (!cleanCode) {
      toast.error("Please enter a team code.");
      return;
    }
    
    // Simple UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanCode)) {
      toast.error("Invalid team code format. Team codes are UUIDs.");
      return;
    }

    if (cleanCode === currentProfile.team_id) {
      toast.error("You cannot join your own team.");
      return;
    }

    setJoining(true);
    try {
      // 1. Verify target team exists
      const { data: targetTeam, error: teamErr } = await supabase
        .from('teams')
        .select('*')
        .eq('id', cleanCode)
        .maybeSingle();

      if (teamErr) throw teamErr;
      if (!targetTeam) {
        toast.error("Team not found. Please check the code.");
        setJoining(false);
        return;
      }

      if (targetTeam.is_full) {
        toast.error("This team is already full.");
        setJoining(false);
        return;
      }

      const oldTeamId = currentProfile.team_id;

      // 2. Update user profile to point to new team
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ team_id: targetTeam.id })
        .eq('id', currentProfile.id);

      if (profileErr) throw profileErr;

      // 3. Delete old team if it was a solo team
      if (oldTeamId) {
        await supabase
          .from('teams')
          .delete()
          .eq('id', oldTeamId);
      }

      toast.success("Joined team successfully! 🎉");
      await refreshProfile();
      window.location.reload();
    } catch (err) {
      console.error("Error joining team by code:", err);
      toast.error("Failed to join team.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" message="Loading your team details..." />
      </div>
    );
  }

  const isSolo = members.length === 1;
  const isLeader = team?.leader_id === currentProfile?.id;

  if (!currentProfile?.team_id || !team) {
    return (
      <div className="flex-1 max-w-xl mx-auto w-full py-4 space-y-6 text-left">
        {/* Header */}
        <div className="space-y-1 text-center md:text-left border-b border-gray-900 pb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-2.5 justify-center md:justify-start">
            <Users className="w-7 h-7 text-indigo-500" />
            <span>My Project Team</span>
          </h1>
          <p className="text-xs text-gray-400">
            Collaborate with others to build your graduation project.
          </p>
        </div>

        {/* Option cards */}
        <div className="space-y-4">
          {/* Make a Team Card */}
          <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 border-b border-gray-850 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Create & Share Team</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Form your project team, reveal your invite code, and send it to friends to let them join directly.
            </p>

            <button
              onClick={async () => {
                setJoining(true);
                try {
                  const { data: newTeam, error: newTeamError } = await supabase
                    .from('teams')
                    .insert({ leader_id: currentProfile.id })
                    .select()
                    .single();
                  
                  if (newTeamError) throw newTeamError;

                  const { error: profileErr } = await supabase
                    .from('profiles')
                    .update({ team_id: newTeam.id })
                    .eq('id', currentProfile.id);

                  if (profileErr) throw profileErr;

                  toast.success("Team created successfully! 🎉");
                  await refreshProfile();
                  window.location.reload();
                } catch (err) {
                  console.error("Error creating team:", err);
                  toast.error("Failed to create team.");
                } finally {
                  setJoining(false);
                }
              }}
              disabled={joining}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold tracking-wide shadow-lg shadow-indigo-650/15 transition-all active:scale-98 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {joining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Make a Team</span>
            </button>
          </div>

          {/* Join a Team Card */}
          <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 border-b border-gray-850 pb-3">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Join via Code</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Have a teammate's project code? Enter it below to merge with their graduation team immediately.
            </p>

            <form onSubmit={handleJoinTeam} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Paste team code here (e.g. 1234abcd-...)"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-indigo-500 text-xs rounded-2xl text-white focus:outline-none transition-all placeholder-gray-650"
              />
              <button
                type="submit"
                disabled={joining}
                className="w-full py-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 hover:text-white rounded-2xl text-xs font-semibold tracking-wide transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {joining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Join Team</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full py-2 space-y-6 text-left">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-900 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-500" />
            <span>My Project Team</span>
          </h1>
          <p className="text-xs text-gray-400">
            {isSolo 
              ? "You are currently working solo. Match with others to recruit them to your team!"
              : `Collaborating in a team of ${members.length} members.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            team.is_full 
              ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
              : 'bg-green-500/10 border border-green-500/20 text-green-400'
          }`}>
            {team.is_full ? '🔒 Team Full' : '⚡ Recruiting Teammates'}
          </span>
          {isLeader && (
            <button
              onClick={() => navigate('/profile')}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              Change status
            </button>
          )}
          <button
            onClick={handleLeaveTeam}
            disabled={leaving}
            className="px-3 py-1.5 bg-red-650/10 border border-red-500/20 hover:bg-red-650/20 text-red-400 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {leaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Leave Team
          </button>
        </div>
      </div>

      {/* Team Code Display (Always visible) */}
      <div className="bg-gray-950/40 border border-gray-850 rounded-2xl p-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Team Code:</span>
          <span className="font-mono text-xs text-white select-all break-all">{currentProfile.team_id}</span>
        </div>
        <CopyButton text={currentProfile.team_id} />
      </div>

      {/* Project details card */}
      <div className="glass-panel border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 border-b border-gray-850 pb-3">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Team Project Proposal</h3>
        </div>
        <div className="space-y-2">
          <p className="text-base text-indigo-200 leading-relaxed font-semibold italic bg-indigo-950/10 border border-indigo-950/30 rounded-2xl p-4">
            "{team.leader?.project_idea || "No specific project goals entered yet."}"
          </p>
          <p className="text-xs text-gray-500 text-right">
            Proposed by team leader: <strong className="text-gray-400">{team.leader?.name}</strong>
          </p>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Crown className="w-4 h-4 text-indigo-400" /> Team Members ({members.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const memberIsLeader = member.id === team.leader_id;
            return (
              <div
                key={member.id}
                onClick={() => navigate(`/view-profile/${member.id}`)}
                className="glass-panel border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 hover:bg-gray-900/40 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <Avatar src={member.avatar_url} name={member.name} size="md" className="border border-gray-800" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <h4 className="text-sm font-bold text-white truncate max-w-[140px]">{member.name}</h4>
                      {memberIsLeader && (
                        <span className="flex items-center gap-0.5 text-[9px] text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                          <Crown className="w-2.5 h-2.5" /> Leader
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-400 truncate">{member.university}</p>
                    <div className="flex flex-wrap pt-0.5">
                      <RoleBadge role={member.role} framework={member.framework} />
                    </div>
                  </div>
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 border-t border-gray-850 pt-3">
                    {member.skills.slice(0, 3).map((skill) => (
                      <SkillChip key={skill} skill={skill} />
                    ))}
                    {member.skills.length > 3 && (
                      <span className="text-[9px] text-gray-500 font-semibold px-2 py-0.5 bg-gray-800/40 rounded border border-transparent self-center">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invitations Section */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-400" /> Pending Invitations Sent ({invites.length})
        </h3>

        {invites.length > 0 ? (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="glass-panel border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Avatar src={invite.invitee?.avatar_url} name={invite.invitee?.name || '?'} size="sm" className="border border-gray-800" />
                  <div className="text-left min-w-0">
                    <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{invite.invitee?.name}</h4>
                    <p className="text-[10px] text-indigo-400 truncate uppercase tracking-wider font-semibold">
                      {invite.invitee?.role 
                        ? `${roleNames[invite.invitee.role.toLowerCase()] || invite.invitee.role}${invite.invitee.framework ? ` • ${invite.invitee.framework}` : ''}`
                        : 'Teammate'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-semibold bg-gray-950 border border-gray-850 px-2.5 py-1 rounded-xl">
                    Sent
                  </span>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    disabled={cancellingId === invite.id}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer border border-red-500/20 disabled:opacity-50"
                    title="Cancel Invitation"
                  >
                    {cancellingId === invite.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel border border-gray-800 rounded-2xl p-6 text-center text-gray-500 text-xs italic">
            No pending sent invites.
          </div>
        )}
      </div>

      {/* Solo Actions (Join via Code & Find Teammates) */}
      {isSolo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Join via Code */}
          <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 border-b border-gray-850 pb-3">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Join via Code</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Have a teammate's project code? Enter it below to merge with their graduation team immediately.
            </p>

            <form onSubmit={handleJoinTeam} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Paste team code here (e.g. 1234abcd-...)"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 focus:border-indigo-500 text-xs rounded-2xl text-white focus:outline-none transition-all placeholder-gray-650"
              />
              <button
                type="submit"
                disabled={joining}
                className="w-full py-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 hover:text-white rounded-2xl text-xs font-semibold tracking-wide transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {joining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Join Team</span>
              </button>
            </form>
          </div>

          {/* Go Find Team */}
          <div className="bg-indigo-950/20 border border-indigo-500/15 rounded-3xl p-6 flex flex-col justify-between gap-4 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Build your dream team!
              </h4>
              <p className="text-xs text-gray-400 leading-normal">
                Graduation projects thrive on team collaboration. Browse student card stacks and match with specialists to send them join requests.
              </p>
            </div>
            <button
              onClick={() => navigate('/swipe')}
              className="flex items-center justify-center gap-1.5 w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              <span>Find Teammates</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
