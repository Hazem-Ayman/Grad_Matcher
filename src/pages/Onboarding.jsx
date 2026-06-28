import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Upload, User, Sparkles, Phone, Camera, Send, Briefcase } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'ML', 'AI', 'TensorFlow', 'PyTorch', 
  'FastAPI', 'Figma', 'SQL', 'MongoDB', 'Docker', 'Flutter', 'Swift', 
  'Kotlin', 'Django', 'TailwindCSS', 'TypeScript', 'Next.js'
];

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form States
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [year, setYear] = useState(profile?.year || '1st');

  const [role, setRole] = useState(profile?.role || 'frontend');
  const [skills, setSkills] = useState(profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const [projectIdea, setProjectIdea] = useState(profile?.project_idea || '');
  const [searchingFor, setSearchingFor] = useState(profile?.searching_for || '');
  const [lookingFor, setLookingFor] = useState(profile?.looking_for || 'match');

  const [contactMode, setContactMode] = useState(profile?.contact_mode || 'match');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [telegram, setTelegram] = useState(profile?.telegram || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || !university.trim()) {
        toast.error("Please fill in your name and university.");
        return;
      }
    }
    if (step === 2) {
      if (!role) {
        toast.error("Please select a role.");
        return;
      }
    }
    if (step === 3) {
      if (!projectIdea.trim()) {
        toast.error("Please add a brief description of what you want to achieve with this project.");
        return;
      }
    }
    if (step === 4) {
      if (!phone.trim() && !instagram.trim() && !telegram.trim() && !linkedin.trim()) {
        toast.error("Please provide at least one contact method.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Skill Chip Add
  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  // File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Submit profile details to DB
  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let avatarUrl = avatarPreview;

      // 1. Upload Avatar if new file selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
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

      // 2. Insert or update profile object
      const profileData = {
        user_id: user.id,
        name: name.trim(),
        bio: bio.trim() || null,
        university: university.trim(),
        year,
        role,
        skills,
        project_idea: projectIdea.trim(),
        searching_for: searchingFor.trim() || null,
        looking_for: lookingFor,
        contact_mode: contactMode,
        phone: phone.trim() || null,
        instagram: instagram.trim() || null,
        telegram: telegram.trim() || null,
        linkedin: linkedin.trim() || null,
        avatar_url: avatarUrl || null,
        onboarding_complete: true,
        is_active: true,
      };

      const { data: upsertedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Auto-create a solo team if they don't have one
      if (upsertedProfile && !upsertedProfile.team_id) {
        // Double check if a team already exists where this user is leader (just in case)
        const { data: existingTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('leader_id', upsertedProfile.id)
          .maybeSingle();

        let teamId;
        if (existingTeam) {
          teamId = existingTeam.id;
        } else {
          const { data: newTeam, error: teamError } = await supabase
            .from('teams')
            .insert({ leader_id: upsertedProfile.id })
            .select()
            .single();
          if (teamError) throw teamError;
          teamId = newTeam.id;
        }

        // Update profile with team_id
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ team_id: teamId })
          .eq('id', upsertedProfile.id);
        if (updateProfileError) throw updateProfileError;
      }

      toast.success("Profile onboarding complete!");
      await refreshProfile();
      navigate('/swipe');
    } catch (err) {
      console.error("Onboarding submit error:", err);
      toast.error(err.message || "Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Saving your profile..." />
      </div>
    );
  }

  const stepPercentage = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold tracking-wider uppercase">
            <span>Progress Setup</span>
            <span>Step {step} of 5</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${stepPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Card Body Panel */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
                <p className="text-xs text-gray-400">Let potential teammates know who you are.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Stanford University"
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">About Me (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other students about yourself, your interests, and what kind of projects you like to work on..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">University Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="5th">5th Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Role & Skills */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Your Role & Skills</h2>
                <p className="text-xs text-gray-400">Select your preferred role and list your core skills.</p>
              </div>

              {/* Role Grid (cards) */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Primary Developer Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'frontend', name: 'Frontend' },
                    { id: 'backend', name: 'Backend' },
                    { id: 'fullstack', name: 'Fullstack' },
                    { id: 'ml', name: 'ML / AI' },
                    { id: 'mobile', name: 'Mobile' },
                    { id: 'designer', name: 'UI/UX' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`px-3 py-3 border text-xs font-bold rounded-2xl cursor-pointer text-center transition-all ${
                        role === r.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-650/20'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-750'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag/Skill input */}
              <div className="space-y-2 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Skills / Technologies</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type and press Enter (e.g. React)"
                      className="flex-1 px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(skillInput)}
                      className="px-4 py-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 text-sm font-semibold rounded-2xl cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Display Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 bg-gray-950/40 border border-gray-850 p-3 rounded-2xl">
                    {skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-850 text-gray-200 border border-gray-800 text-xs font-semibold rounded-lg"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="hover:text-red-500 font-bold focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Chips */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Suggestions:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSkill(s)}
                        className="text-[10px] font-semibold px-2 py-1 bg-gray-950 border border-gray-850 text-gray-400 hover:text-gray-200 hover:border-gray-700 rounded-lg cursor-pointer transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Project Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Your Project Goals</h2>
                <p className="text-xs text-gray-400">Describe what you want to achieve with this project and specify your team requirement.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    What do you want to achieve with this project? (Max 200 chars)
                  </label>
                  <textarea
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value.slice(0, 200))}
                    placeholder="e.g. Build an AI-driven student platform connecting graduation project members based on skills..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
                  />
                  <div className="text-right text-[10px] text-gray-500 font-semibold uppercase">
                    {projectIdea.length}/200 characters
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    What are you searching for in your teammates? (Max 200 chars)
                  </label>
                  <textarea
                    value={searchingFor}
                    onChange={(e) => setSearchingFor(e.target.value.slice(0, 200))}
                    placeholder="e.g. Someone with strong backend skills (Node.js/Python) and experience with databases..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
                  />
                  <div className="text-right text-[10px] text-gray-500 font-semibold uppercase">
                    {searchingFor.length}/200 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    What are you looking for?
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'full_team',
                        title: 'A full team',
                        desc: 'I have an idea, but I need everyone.',
                        icon: '🔍',
                      },
                      {
                        id: 'one_member',
                        title: '1–2 members',
                        desc: 'I have some teammates, but need more.',
                        icon: '👤',
                      },
                      {
                        id: 'browsing',
                        title: 'Just exploring',
                        desc: 'I just want to see who is out there.',
                        icon: '👀',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setLookingFor(opt.id)}
                        className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
                          lookingFor === opt.id
                            ? 'bg-indigo-650/10 border-indigo-500 text-white'
                            : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-750'
                        }`}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <div className="space-y-0.5 text-left">
                          <p className="font-semibold text-sm text-white">{opt.title}</p>
                          <p className="text-xs text-gray-400">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Contact Mode */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">How do you want to connect?</h2>
                <p className="text-xs text-gray-400">Select your profile privacy mode and supply your contact tags.</p>
              </div>

              {/* Privacy mode options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label
                  onClick={() => setContactMode('open')}
                  className={`p-4 border rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between h-32 ${
                    contactMode === 'open'
                      ? 'bg-indigo-655/10 border-indigo-500 text-white'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-750'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>⚡</span> Direct Contact
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      Anyone who likes my profile can see my contact handles and phone number immediately. Choosing this means your details will be shown to anyone who swipes right on you, even before you like them back.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setContactMode('match')}
                  className={`p-4 border rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between h-32 ${
                    contactMode === 'match'
                      ? 'bg-indigo-655/10 border-indigo-500 text-white'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-750'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>🔒</span> Match First
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      I get notified when someone likes me. I choose who to reveal my info to.
                    </p>
                  </div>
                </label>
              </div>

              {/* Contact fields inputs */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Provide Contact Info (At least one required)</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                    />
                  </div>

                  <div className="relative">
                    <Camera className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="Instagram Handle"
                      className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                    />
                  </div>

                  <div className="relative">
                    <Send className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder="Telegram Username"
                      className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                    />
                  </div>

                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="LinkedIn Profile URL"
                      className="w-full pl-11 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Photo upload */}
          {step === 5 && (
            <div className="space-y-4 text-center flex flex-col items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Add a profile photo</h2>
                <p className="text-xs text-gray-400">Put a face to your project blueprint (Optional).</p>
              </div>

              <div className="py-6 flex flex-col items-center space-y-4">
                {/* Avatar Display */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-900 border-4 border-gray-800 flex items-center justify-center relative shadow-inner group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-700" />
                  )}
                </div>

                {/* Upload Button */}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 text-sm font-semibold rounded-2xl cursor-pointer transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Form Actions Footer buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800/60 mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Skip Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish Setup</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
