import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { supabase } from '../supabaseClient';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Chat() {
  const { matchId } = useParams();
  const { profile: currentProfile } = useAuth();
  const { messages, loading, error, sendMessage } = useMessages(matchId, currentProfile);
  const [otherProfile, setOtherProfile] = useState(null);
  const [matchLoading, setMatchLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom on mount and on message additions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Load the match details and the other profile
  useEffect(() => {
    async function loadMatchDetails() {
      if (!matchId || !currentProfile) return;
      try {
        setMatchLoading(true);
        const { data, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            user1:user1_id (*),
            user2:user2_id (*)
          `)
          .eq('id', matchId)
          .single();

        if (matchError) throw matchError;

        const other = data.user1.id === currentProfile.id ? data.user2 : data.user1;
        setOtherProfile(other);
      } catch (err) {
        console.error("Error loading chat partner:", err);
        toast.error("Could not fetch chat room details.");
        navigate('/matches');
      } finally {
        setMatchLoading(false);
      }
    }

    loadMatchDetails();
  }, [matchId, currentProfile, navigate]);

  const handleSend = async (content) => {
    try {
      await sendMessage(content);
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  if (loading || matchLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" message="Opening chat room..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] shadow-2xl">
      {/* Header Profile bar */}
      <div className="bg-gray-950 border-b border-gray-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/matches')}
            className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {otherProfile && (
            <div className="flex items-center space-x-2.5">
              <Avatar src={otherProfile.avatar_url} name={otherProfile.name} size="sm" className="border border-gray-800" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-[200px]">
                  {otherProfile.name}
                </h4>
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-widest leading-none">
                  {otherProfile.role || 'Teammate'}
                </span>
              </div>
            </div>
          )}
        </div>

        {otherProfile && (
          <button
            onClick={() => navigate('/matches')}
            className="text-indigo-400 hover:text-indigo-300 p-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 font-semibold"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contact info</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentProfile.id}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 text-gray-500">
            <span className="text-3xl">💬</span>
            <p className="text-xs font-semibold uppercase tracking-wider">Start the conversation</p>
            <p className="text-[11px] text-gray-600 max-w-xs">Send a friendly message to introduce yourself and pitch project timelines.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Message Input Area */}
      <div className="p-3 border-t border-gray-800 bg-gray-950/60 backdrop-blur-sm">
        <ChatInput onSendMessage={handleSend} placeholder={`Message ${otherProfile?.name || 'teammate'}...`} />
      </div>
    </div>
  );
}
