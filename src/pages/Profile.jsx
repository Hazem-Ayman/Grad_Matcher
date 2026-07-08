import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { 
  Save, EyeOff, User, Phone, Camera, Send, Briefcase, Code, 
  BookOpen, Sparkles, Shield, Upload, Search, MessageSquare
} from 'lucide-react';
import { CS_FIELDS, MASTER_SKILLS, getSuggestedSkills } from '../utils/csFields';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  // Form States
  const [name, setName] = useState(profile?.name || '');
  const [uniOption, setUniOption] = useState(() => {
    const val = profile?.university || '';
    if (val === 'Assuit University' || val === 'Assuit National University') {
      return val;
    }
    return val ? 'other' : 'Assuit University';
  });
  const [customUni, setCustomUni] = useState(() => {
    const val = profile?.university || '';
    if (val === 'Assuit University' || val === 'Assuit National University') {
      return '';
    }
    return val;
  });
  const [year, setYear] = useState(profile?.year || '4th');
  const [bio, setBio] = useState(profile?.bio || '');

  const [roles, setRoles] = useState(() => {
    if (!profile?.role) return [];
    return profile.role.split(',').map(r => r.trim()).filter(Boolean);
  });
  const [frameworks, setFrameworks] = useState(() => {
    if (!profile?.framework) return [];
    return profile.framework.split(',').map(f => f.trim()).filter(Boolean);
  });

  const handleToggleRole = (roleId) => {
    setRoles(prev => {
      let next;
      if (prev.includes(roleId)) {
        next = prev.filter(r => r !== roleId);
      } else {
        if (prev.length >= 3) {
          toast.error("You can select up to 3 CS fields.");
          return prev;
        }
        next = [...prev, roleId];
      }

      const nextFwSet = new Set();
      next.forEach(rId => {
        const field = CS_FIELDS.find(f => f.id === rId);
        if (field) {
          field.frameworks.forEach(fw => nextFwSet.add(fw));
        }
      });
      setFrameworks(prevFws => prevFws.filter(fw => nextFwSet.has(fw)));

      return next;
    });
  };

  const handleToggleFramework = (fw) => {
    setFrameworks(prev => {
      if (prev.includes(fw)) {
        return prev.filter(f => f !== fw);
      } else {
        if (prev.length >= 3) {
          toast.error("You can select up to 3 frameworks.");
          return prev;
        }
        return [...prev, fw];
      }
    });
  };
  const [skills, setSkills] = useState(profile?.skills || []);
  const [skillSearch, setSkillSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [projectIdea, setProjectIdea] = useState(profile?.project_idea || '');
  const [searchingFor, setSearchingFor] = useState(profile?.searching_for || '');
  const [lookingFor, setLookingFor] = useState(profile?.looking_for || 'match');


  const [phone, setPhone] = useState(profile?.phone || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [telegram, setTelegram] = useState(profile?.telegram || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');

  const [isActive, setIsActive] = useState(profile?.is_active ?? true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');

  const [isLeader, setIsLeader] = useState(false);
  const [teamFull, setTeamFull] = useState(false);
  const [teamLoading, setTeamLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      if (!profile?.team_id || !profile?.id) {
        setTeamLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', profile.team_id)
          .single();

        if (error) throw error;
        if (data.leader_id === profile.id) {
          setIsLeader(true);
          setTeamFull(data.is_full);
        }
      } catch (err) {
        console.error("Error loading team in Profile:", err);
      } finally {
        setTeamLoading(false);
      }
    }
    loadTeam();
  }, [profile]);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillSearch('');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillSearch('');
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRequestSkill = async (skillName) => {
    const cleanName = skillName.trim();
    if (!cleanName) return;
    try {
      await supabase.from('skills_feedback').insert({
        user_id: profile?.user_id || null,
        requested_skill: cleanName
      });
      toast.success(`Requested "${cleanName}"! We'll review and add it soon.`, { duration: 3000 });
      setSkillSearch('');
    } catch (err) {
      console.error("Error submitting skill feedback:", err);
      toast.success(`Requested "${cleanName}"! (Feedback logged)`);
      setSkillSearch('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalUniversity = uniOption === 'other' ? customUni.trim() : uniOption;
    if (!name.trim() || !finalUniversity) {
      toast.error("Name and University fields are required.");
      return;
    }
    if (roles.length === 0) {
      toast.error("Please select at least one CS field.");
      return;
    }
    if (frameworks.length === 0) {
      toast.error("Please select at least one framework/primary tech.");
      return;
    }
    if (skills.length === 0) {
      toast.error("Please select at least one skill.");
      return;
    }
    if (!phone.trim() && !instagram.trim() && !telegram.trim() && !linkedin.trim()) {
      toast.error("Please provide at least one contact method.");
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = avatarPreview;

      // Upload avatar file if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${profile.user_id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Update Database profile record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          university: finalUniversity,
          year,
          bio: bio.trim() || null,
          role: roles.join(','),
          framework: frameworks.join(',') || null,
          skills,
          project_idea: projectIdea.trim() || null,
          searching_for: searchingFor.trim() || null,
          looking_for: lookingFor,
          contact_mode: 'match',
          phone: phone.trim() || null,
          instagram: instagram.trim() || null,
          telegram: telegram.trim() || null,
          linkedin: linkedin.trim() || null,
          github_url: githubUrl.trim() || null,
          avatar_url: avatarUrl || null,
          is_active: isActive,
        })
        .eq('user_id', profile.user_id);

      if (updateError) throw updateError;

      // Update team is_full if leader
      if (isLeader && profile?.team_id) {
        const { error: teamUpdateError } = await supabase
          .from('teams')
          .update({ is_full: teamFull })
          .eq('id', profile.team_id);
        if (teamUpdateError) throw teamUpdateError;
      }

      toast.success("Profile saved successfully!");
      await refreshProfile();
    } catch (err) {
      console.error("Profile saving error:", err);
      toast.error(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="md" message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full py-2 space-y-6">
      {/* Page Title */}
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Edit Profile</h1>
        <p className="text-xs text-gray-400">Configure your showcase information, details, and matches settings.</p>
      </div>

      {/* Paused profile banner */}
      {!isActive && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed animate-pulse">
          <EyeOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="font-bold block uppercase tracking-wider mb-0.5">Your profile is paused</span>
            <span>You will not appear on the student swipe feed card deck. Unpause your profile below to resume finding graduation teammate matches.</span>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card: Avatar and status */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar src={avatarPreview} name={name} size="xxl" className="border-4 border-gray-800 shadow-xl" />
            <label className="absolute bottom-1.5 right-1.5 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-indigo-500">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Showcase Image</h3>
              <p className="text-xs text-gray-400">Upload a nice photo. Max size 5MB.</p>
            </div>

            {/* Toggle Switch: Pause/Resume profile */}
            <div className="flex items-center gap-3 justify-center md:justify-start pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                <span className="ml-3 text-xs font-semibold text-gray-300">
                  {isActive ? 'Profile is active (shown to feed)' : 'Profile is paused (hidden from feed)'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Card: Personal details */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-400" /> Personal Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">University</label>
                <select
                  value={uniOption}
                  onChange={(e) => setUniOption(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Assuit University">Assuit University</option>
                  <option value="Assuit National University">Assuit National University</option>
                  <option value="other">Others (please specify)</option>
                </select>
              </div>

              {uniOption === 'other' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Specify University Name</label>
                  <input
                    type="text"
                    value={customUni}
                    onChange={(e) => setCustomUni(e.target.value)}
                    placeholder="Write your university name..."
                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="4th">4th Year</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-1 sm:col-span-2 pt-2 border-t border-gray-855">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">CS Fields (Select up to 3)</label>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">{roles.length}/3 selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CS_FIELDS.map((field) => {
                  const isSelected = roles.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => handleToggleRole(field.id)}
                      className={`px-3 py-2 border text-xs font-bold rounded-2xl cursor-pointer text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-650/20'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-750'
                      }`}
                    >
                      {field.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {roles.length > 0 && (
              <div className="space-y-2 col-span-1 sm:col-span-2 pt-2 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Frameworks / Primary Tech (Select up to 3)</label>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">{frameworks.length}/3 selected</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(() => {
                    const fwSet = new Set();
                    roles.forEach(roleId => {
                      const field = CS_FIELDS.find(f => f.id === roleId);
                      if (field) {
                        field.frameworks.forEach(fw => fwSet.add(fw));
                      }
                    });
                    const availableFrameworks = Array.from(fwSet);
                    if (availableFrameworks.length === 0) return null;
                    return availableFrameworks.map((fw) => {
                      const isSelected = frameworks.includes(fw);
                      return (
                        <button
                          key={fw}
                          type="button"
                          onClick={() => handleToggleFramework(fw)}
                          className={`px-2 py-2 border text-xs font-semibold rounded-xl cursor-pointer text-center transition-all ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md'
                              : 'bg-gray-950 border-gray-855 text-gray-400 hover:border-gray-800'
                          }`}
                        >
                          {fw}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Bio (About you)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Passionate web dev student interested in clean code architecture and cloud integrations..."
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
            />
          </div>
        </div>

        {/* Card: Skills */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Skills & Technologies
          </h3>

          <div className="relative space-y-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => {
                  setSkillSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search and select skills (e.g. Git, RESTful APIs...)"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
              />
            </div>

            {/* Dropdown list of matching skills */}
            {showDropdown && skillSearch.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-850 rounded-2xl max-h-52 overflow-y-auto z-50 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in duration-100">
                {(() => {
                  const matches = MASTER_SKILLS.filter(s =>
                    s.toLowerCase().includes(skillSearch.toLowerCase()) &&
                    !skills.includes(s)
                  );
                  if (matches.length > 0) {
                    return matches.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          addSkill(s);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-855 rounded-xl transition-all cursor-pointer"
                      >
                        {s}
                      </button>
                    ));
                  } else {
                    return (
                      <div className="p-3 text-center space-y-2">
                        <p className="text-xs text-gray-400">No matching skills found for "{skillSearch}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            handleRequestSkill(skillSearch);
                            setShowDropdown(false);
                          }}
                          className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 mx-auto shadow-md"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Request "{skillSearch}"</span>
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Clicking background closes search dropdown */}
            {showDropdown && (
              <div
                className="fixed inset-0 z-45 cursor-default"
                onClick={() => setShowDropdown(false)}
              />
            )}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 bg-gray-950/40 border border-gray-850 p-3 rounded-2xl relative z-10">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-850 text-gray-200 border border-gray-800 text-xs font-semibold rounded-lg"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="hover:text-red-500 font-bold focus:outline-none cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="space-y-1 relative z-10 animate-in fade-in duration-200">
            <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Suggested:</span>
            <div className="flex flex-wrap gap-1">
              {(() => {
                const suggestions = getSuggestedSkills(roles, frameworks).filter(s => !skills.includes(s));
                if (suggestions.length > 0) {
                  return suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-gray-955 border border-gray-855 text-gray-400 hover:text-gray-200 hover:border-gray-700 rounded-md cursor-pointer transition-colors"
                    >
                      + {s}
                    </button>
                  ));
                } else {
                  return <span className="text-[10px] text-gray-500 italic">Select role and framework for suggestions.</span>;
                }
              })()}
            </div>
          </div>
        </div>

        {/* Card: Project idea */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Project Goals
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">What do you want to achieve with this project?</label>
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="What do you want to achieve with this project? Summarize your goal in under 200 characters."
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
            />
            <div className="text-right text-[9px] text-gray-550 font-semibold uppercase">{projectIdea.length}/200 characters</div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">What are you searching for in your teammates?</label>
            <textarea
              value={searchingFor}
              onChange={(e) => setSearchingFor(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="What are you searching for in your teammates? Summarize your preference in under 200 characters."
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
            />
            <div className="text-right text-[9px] text-gray-550 font-semibold uppercase">{searchingFor.length}/200 characters</div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Team Status Need</label>
            <select
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="full_team">🔍 A full team (I have idea, need everyone)</option>
              <option value="one_member">👤 1–2 members (I have partners, need more)</option>
              <option value="browsing">👀 Just exploring (I want to see profiles)</option>
            </select>
          </div>

          {isLeader && (
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={teamFull} 
                  onChange={(e) => setTeamFull(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                <span className="ml-3 text-xs font-semibold text-gray-305 text-gray-400">
                  Team is full (No longer recruiting teammates)
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Card: Contact and Socials */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-850 pb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" /> Privacy & Social tags
          </h3>

          {/* Handles inputs */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                />
              </div>

              <div className="relative">
                <Camera className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram Handle"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                />
              </div>

              <div className="relative">
                <Send className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="Telegram Username"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                />
              </div>
            </div>

            <div className="relative">
              <Code className="absolute left-4 top-3.5 w-4 h-4 text-gray-505" />
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="GitHub Profile URL (e.g. github.com/username)"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
              />
            </div>
          </div>
        </div>

        {/* Save button floating/sticky */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650 text-white rounded-2xl text-sm font-semibold tracking-wide shadow-xl shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:cursor-wait"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
