import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  ArrowRight, 
  MoreVertical, 
  ShieldAlert, 
  Trash2, 
  Phone, 
  Check, 
  Clock, 
  UserX, 
  Sprout,
  AlertTriangle,
  X
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useSeeds } from '../context/SeedContext';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { AudioMessagePlayer } from '../components/AudioMessagePlayer';
import { ChatMessage } from '../types';

export const MessagesView: React.FC = () => {
  const { 
    conversations, 
    activeConversation, 
    activeMessages, 
    setActiveConversationId, 
    sendMessage, 
    deleteMessage 
  } = useChat();

  const { userProfile, currentUser, blockUser } = useAuth();
  const { reportItem } = useSeeds();

  const currentUserId = currentUser?.uid || userProfile?.id || 'guest-user';

  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('نازیبا یا دھوکہ دہی پر مبنی پیغامات');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendMessage('text', textToSend);
  };

  const handleSendVoice = async (audioBase64: string, durationSeconds: number) => {
    setIsRecordingVoice(false);
    await sendMessage('voice', undefined, audioBase64, durationSeconds);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        sendMessage('image', undefined, compressed);
      };
    };
    reader.readAsDataURL(file);
  };

  // Get recipient info from active conversation
  const recipientId = activeConversation?.participantIds.find((id) => id !== currentUserId) || '';
  const recipientName = activeConversation ? (activeConversation.participantNames[recipientId] || 'کسان بھائی') : '';
  const recipientPhone = activeConversation?.participantPhones ? activeConversation.participantPhones[recipientId] : '';

  const handleBlockRecipient = () => {
    if (!recipientId) return;
    if (confirm(`کیا آپ واقعی ${recipientName} کو بلاک کرنا چاہتے ہیں؟ اس کے پیغامات آپ کو نظر نہیں آئیں گے۔`)) {
      blockUser(recipientId);
      setActiveConversationId(null);
      setShowOptionsDropdown(false);
    }
  };

  const handleReportUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId) return;
    await reportItem('user', recipientId, recipientName, reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setShowOptionsDropdown(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[550px] flex flex-col md:flex-row animate-fade-in text-stone-900">
      {/* Right Column: Conversations List (hidden on mobile if active conversation is selected) */}
      <div className={`w-full md:w-80 lg:w-96 border-l border-stone-200 flex flex-col ${
        activeConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* List Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-stone-900 text-lg font-urdu">پیغامات (In-App Chat)</h2>
            <p className="text-xs text-stone-500">کسانوں سے براہ راست گفتگو</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full">
            {conversations.length}
          </span>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-stone-400 space-y-2">
              <Sprout className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-600">کوئی گفتگو موجود نہیں ہے</p>
              <p className="text-[11px]">کسی بھی اشتہار پر "چیٹ کریں" دبا کر بات چیت شروع کریں۔</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherId = conv.participantIds.find((id) => id !== currentUserId) || '';
              const otherName = conv.participantNames[otherId] || 'کسان بھائی';
              const isSelected = activeConversation?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                    isSelected ? 'bg-emerald-50/90 border-r-4 border-emerald-700' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    {otherName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-bold text-stone-900 text-sm truncate">{otherName}</h4>
                      <span className="text-[10px] text-stone-400 shrink-0 font-sans">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {conv.seedTitle && (
                      <span className="inline-block text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm font-semibold truncate max-w-full mb-1">
                        بیج: {conv.seedTitle}
                      </span>
                    )}

                    <p className="text-xs text-stone-500 truncate leading-relaxed">
                      {conv.lastMessageText || 'نیا پیغام'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Left Column: Active Chat Thread (or empty state) */}
      <div className={`flex-1 flex flex-col bg-stone-50/50 ${
        activeConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 sm:p-4 bg-white border-b border-stone-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl"
                  title="پیغامات کی فہرست"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {recipientName[0]}
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-tight">
                    {recipientName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    {recipientPhone && <span className="font-mono">{recipientPhone}</span>}
                    {activeConversation.seedTitle && (
                      <span className="text-emerald-700 font-medium truncate max-w-[160px] sm:max-w-xs">
                        • {activeConversation.seedTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Tools */}
              <div className="flex items-center gap-1.5 relative">
                {recipientPhone && (
                  <a
                    href={`tel:${recipientPhone}`}
                    className="p-2 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition"
                    title="فون کال"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                  className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition"
                  title="اختیارات"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showOptionsDropdown && (
                  <div className="absolute left-0 top-11 z-30 bg-white border border-stone-200 rounded-2xl shadow-xl py-1.5 w-48 text-xs font-bold text-stone-700">
                    <button
                      onClick={() => {
                        setShowOptionsDropdown(false);
                        setShowReportModal(true);
                      }}
                      className="w-full px-3.5 py-2 text-right hover:bg-stone-50 flex items-center gap-2 text-amber-700"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>صارف کی رپورٹ کریں</span>
                    </button>
                    <button
                      onClick={handleBlockRecipient}
                      className="w-full px-3.5 py-2 text-right hover:bg-stone-50 flex items-center gap-2 text-red-600"
                    >
                      <UserX className="w-4 h-4" />
                      <span>صارف کو بلاک کریں</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Safety notice in chat */}
              <div className="text-center">
                <span className="inline-block bg-amber-100/80 border border-amber-300/60 text-amber-900 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
                  تنبیہ: بیج دیکھنے سے پہلے کسی کو پیشگی رقم (ایزی پیسہ / جاز کیش) نہ بھیجیں۔
                </span>
              </div>

              {activeMessages.map((msg) => {
                const isSender = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSender ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 shadow-xs relative text-sm ${
                        isSender
                          ? 'bg-emerald-800 text-white rounded-br-none'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
                      }`}
                    >
                      {/* Text */}
                      {msg.type === 'text' && (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* Image Message */}
                      {msg.type === 'image' && msg.mediaUrl && (
                        <div className="rounded-xl overflow-hidden my-1 max-w-xs">
                          <img
                            src={msg.mediaUrl}
                            alt="Received"
                            className="w-full h-auto object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {/* Voice Note */}
                      {msg.type === 'voice' && msg.mediaUrl && (
                        <AudioMessagePlayer
                          audioUrl={msg.mediaUrl}
                          durationSeconds={msg.durationSeconds}
                          isSender={isSender}
                        />
                      )}

                      {/* Footer time */}
                      <div
                        className={`text-[10px] mt-1 flex items-center gap-1 font-mono justify-end ${
                          isSender ? 'text-emerald-200' : 'text-stone-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isSender && <Check className="w-3 h-3 inline" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Recorder Overlay or Footer Input */}
            <div className="p-3 bg-white border-t border-stone-200">
              {isRecordingVoice ? (
                <VoiceRecorder
                  onSendVoice={handleSendVoice}
                  onCancel={() => setIsRecordingVoice(false)}
                />
              ) : (
                <form onSubmit={handleSendText} className="flex items-center gap-2">
                  {/* Photo upload */}
                  <label
                    className="p-2.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl cursor-pointer transition"
                    title="تصویر بھیجیں"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Voice Record Button */}
                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    className="p-2.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition"
                    title="آواز ریکارڈ کریں (Voice Message)"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="پیغام لکھیں یا آواز ریکارڈ کریں..."
                    className="flex-1 text-sm p-3 rounded-2xl border border-stone-200 bg-stone-50 outline-hidden focus:border-emerald-600"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-3 rounded-2xl font-bold transition flex items-center justify-center ${
                      inputText.trim()
                        ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-800 text-base">کوئی چیٹ منتخب نہیں کی گئی</h3>
            <p className="text-xs text-stone-500 max-w-xs">
              دائیں جانب سے کسی کسان کی گفتگو پر کلک کریں یا کسی بیج کے اشتہار سے چیٹ شروع کریں۔
            </p>
          </div>
        )}
      </div>

      {/* Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 text-stone-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-red-600 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>صارف {recipientName} کی رپورٹ کریں</span>
              </h3>
              <button onClick={() => setShowReportModal(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center text-emerald-700 font-bold">
                رپورٹ کامیابی کے ساتھ جمع ہو گئی ہے۔ شکریہ!
              </div>
            ) : (
              <form onSubmit={handleReportUserSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    رپورٹ کی وجہ:
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                  >
                    <option value="نازیبا یا دھوکہ دہی پر مبنی پیغامات">نازیبا یا دھوکہ دہی پر مبنی پیغامات</option>
                    <option value="مشکوک ایڈوانس رقم کا مطالبہ">مشکوک ایڈوانس رقم کا مطالبہ</option>
                    <option value="جعلی بیج کا دعویٰ">جعلی بیج کا دعویٰ</option>
                    <option value="دیگر">دیگر مسائل</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold"
                  >
                    منسوخ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                  >
                    رپورٹ جمع کروائیں
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
