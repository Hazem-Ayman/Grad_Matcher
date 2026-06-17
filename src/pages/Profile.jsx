import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { 
  Save, EyeOff, User, Phone, Camera, Send, Briefcase, Code, 
  BookOpen, Sparkles, Shield, Upload, Info
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'ML', 'AI', 'TensorFlow', 'PyTorch', 
  'FastAPI', 'Figma', 'SQL', 'MongoDB', 'Docker', 'Flutter', 'Swift', 
  'Kotlin', 'Django', 'TailwindCSS', 'TypeScript', 'Next.js'
];

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  // Form States
  const [name, setName] = useState(profile?.name || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [year, setYear] = useState(profile?.year || '1st');
  const [bio, setBio] = useState(profile?.bio || '');

  const [role, setRole] = useState(profile?.role || 'frontend');
  const [skills, setSkills] = useState(profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const [projectIdea, setProjectIdea] = useState(profile?.project_idea || '');
  const [lookingFor, setLookingFor] = useState(profile?.looking_for || 'match');

  const [contactMode, setContactMode] = useState(profile?.contact_mode || 'match');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [telegram, setTelegram] = useState(profile?.telegram || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');

  const [isActive, setIsActive] = useState(profile?.is_active ?? true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !university.trim()) {
      toast.error("Name and University fields are required.");
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
          university: university.trim(),
          year,
          bio: bio.trim() || null,
          role,
          skills,
          project_idea: projectIdea.trim() || null,
          looking_for: lookingFor,
          contact_mode: contactMode,
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

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
                <option value="5th">5th Year</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="frontend">Frontend Developer</option>
                <option value="backend">Backend Developer</option>
                <option value="fullstack">Fullstack Developer</option>
                <option value="ml">ML / AI Engineer</option>
                <option value="mobile">Mobile Developer</option>
                <option value="designer">UI/UX Designer</option>
                <option value="other">Other</option>
              </select>
            </div>
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

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Type skill and press Enter (e.g. PyTorch)"
              className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650"
            />
            <button
              type="button"
              onClick={() => addSkill(skillInput)}
              className="px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-250 text-xs font-semibold rounded-2xl cursor-pointer"
            >
              Add
            </button>
          </div>

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

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500">Suggested:</span>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="text-[10px] font-semibold px-2 py-0.5 bg-gray-955 border border-gray-850 text-gray-400 hover:text-gray-200 hover:border-gray-700 rounded-md cursor-pointer transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card: Project idea */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-805 pb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Project blueprint
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Project Idea Pitch</label>
            <textarea
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="What do you want to build? Summarize your pitch in under 200 characters."
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-650 resize-none"
            />
            <div className="text-right text-[9px] text-gray-550 font-semibold uppercase">{projectIdea.length}/200 characters</div>
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
        </div>

        {/* Card: Contact and Socials */}
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-850 pb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" /> Privacy & Social tags
          </h3>

          {/* Contact mode selector */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Contact Mode Privacy</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-2xl border border-gray-850">
              <button
                type="button"
                onClick={() => setContactMode('open')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  contactMode === 'open' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'
                }`}
              >
                ⚡ Open Mode
              </button>
              <button
                type="button"
                onClick={() => setContactMode('match')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  contactMode === 'match' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'
                }`}
              >
                🔒 Match First
              </button>
            </div>
            <div className="text-[10px] text-gray-500 leading-normal flex items-start gap-1 p-2 bg-gray-950/40 rounded-xl mt-1 border border-gray-850">
              <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>
                {contactMode === 'open' 
                  ? 'Open Mode allows anyone who likes your card to view contact details instantly.' 
                  : 'Match First keeps contact credentials hidden until you both swipe right.'}
              </span>
            </div>
          </div>

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
