import { useState } from 'react';
import { createPortal } from 'react-dom';
import Avatar from './Avatar';
import RoleBadge from './RoleBadge';
import LookingForBadge from './LookingForBadge';
import SkillChip from './SkillChip';
import { X, Code, ExternalLink, BookOpen, User, Sparkles, Briefcase, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { toast } from 'react-hot-toast';

export default function FullProfilePopup({ profile, isOpen, onClose }) {
  const { profile: currentProfile } = useAuth();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('fake');
  const [reportNotes, setReportNotes] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  if (!isOpen || !profile) return null;

  const {
    name,
    university,
    year,
    role,
    skills,
    github_url,
    project_idea,
    searching_for,
    looking_for,
    avatar_url,
    bio,
    framework,
  } = profile;

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!currentProfile) {
      toast.error("You must be logged in to report a profile.");
      return;
    }
    setSubmittingReport(true);
    try {
      const { error: reportErr } = await supabase
        .from('reports')
        .insert({
          reporter_id: currentProfile.id,
          reported_id: profile.id,
          reason: reportReason,
          notes: reportNotes.trim() || null
        });

      if (reportErr) throw reportErr;

      toast.success("Thank you. Report submitted successfully.");
      // Reset form
      setShowReportForm(false);
      setReportReason('fake');
      setReportNotes('');
    } catch (err) {
      console.error("Error submitting report:", err);
      toast.error("Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (showReportForm) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => {
            if (!submittingReport) setShowReportForm(false);
          }}
        />

        {/* Form Container */}
        <form
          onSubmit={handleSubmitReport}
          className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 md:p-8 space-y-5 transform transition-all animate-in fade-in zoom-in-95 duration-200 text-left"
        >
          <div className="space-y-1.5 pb-2 border-b border-gray-850">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Report Profile</span>
            </h3>
            <p className="text-xs text-gray-455 leading-relaxed">
              Help us keep the community safe. Tell us why you are reporting <strong>{name}</strong>:
            </p>
          </div>

          {/* Reason Radio buttons */}
          <div className="space-y-2">
            {[
              { id: 'fake', label: 'Fake Profile / Spam' },
              { id: 'inappropriate', label: 'Inappropriate Content / Behavior' },
              { id: 'harassment', label: 'Harassment or Abuse' },
              { id: 'other', label: 'Other Reason' }
            ].map(opt => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  reportReason === opt.id
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                    : 'bg-gray-950/50 border-gray-850 text-gray-400 hover:border-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  checked={reportReason === opt.id}
                  onChange={() => setReportReason(opt.id)}
                  className="accent-indigo-500"
                />
                <span className="text-xs font-semibold">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">Optional Details</label>
            <textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Provide any additional details or context here..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-850 focus:border-indigo-500 text-xs rounded-2xl text-white focus:outline-none transition-all placeholder-gray-650 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={submittingReport}
              onClick={() => setShowReportForm(false)}
              className="py-3 bg-gray-950 border border-gray-850 hover:border-gray-800 text-gray-400 hover:text-white text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReport}
              className="py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/15 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {submittingReport && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl p-6 md:p-8 space-y-6 transform transition-all animate-in fade-in zoom-in-95 duration-200 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-gray-800 p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 pt-2">
          <Avatar src={avatar_url} name={name} size="xl" className="border-4 border-indigo-500/20 shadow-xl" />
          <div className="space-y-2 flex-1 min-w-0">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide truncate">{name}</h2>
              <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">
                {university} • {year} Year
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-0.5">
              <RoleBadge role={role} framework={framework} />
              <LookingForBadge lookingFor={looking_for} />
            </div>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Bio Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" /> About Me
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed bg-gray-950/40 border border-gray-850 p-4 rounded-2xl italic">
            {bio || "No biography provided."}
          </p>
        </div>

        {/* Project Goals Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> What do you want to achieve?
            </h3>
            <p className="text-sm text-indigo-200 leading-relaxed font-medium bg-indigo-950/20 border border-indigo-950/40 rounded-2xl p-4">
              {project_idea || "No specific project goals entered yet."}
            </p>
          </div>

          {searching_for && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> What are you searching for in teammates?
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed bg-gray-950/40 border border-gray-850 p-4 rounded-2xl">
                {searching_for}
              </p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Technical Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill) => (
                <SkillChip key={skill} skill={skill} />
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 space-y-2">
          {github_url && (
            <a
              href={github_url.startsWith('http') ? github_url : `https://${github_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-950 hover:bg-gray-850 px-4 py-3 rounded-2xl border border-gray-850 hover:border-gray-700 transition-all shadow-inner w-full justify-center group"
            >
              <Code className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>View GitHub Profile</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )}
          
          {currentProfile?.id !== profile.id && (
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center justify-center gap-1.5 w-full py-3 bg-red-950/15 hover:bg-red-950/25 text-red-400 hover:text-red-300 rounded-2xl text-xs font-bold transition-all border border-red-500/10 hover:border-red-500/20 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Report Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
