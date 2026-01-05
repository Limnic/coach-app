'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Image,
  Smile,
  ArrowLeft,
  Plus,
  MessageSquare,
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface Conversation {
  id: string;
  athlete: {
    id: string;
    name: string;
    initials: string;
    lastActive: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

// All athletes that can be messaged
const allAthletes = [
  { id: '1', name: 'Sarah Johnson', initials: 'SJ', lastActive: '2m ago', isOnline: true },
  { id: '2', name: 'Mike Chen', initials: 'MC', lastActive: '1h ago', isOnline: false },
  { id: '3', name: 'Emma Davis', initials: 'ED', lastActive: '3h ago', isOnline: false },
  { id: '4', name: 'James Wilson', initials: 'JW', lastActive: '5h ago', isOnline: false },
  { id: '5', name: 'Lisa Park', initials: 'LP', lastActive: '1d ago', isOnline: false },
  { id: '6', name: 'Tom Hardy', initials: 'TH', lastActive: '2d ago', isOnline: false },
];

const initialConversations: Conversation[] = [
  {
    id: '1',
    athlete: { id: '1', name: 'Sarah Johnson', initials: 'SJ', lastActive: '2m ago', isOnline: true },
    lastMessage: 'Thank you coach! I\'ll try that approach.',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
    messages: [
      { id: '1', senderId: 'coach', content: 'Hey Sarah! How was your workout today?', timestamp: '10:15 AM', isRead: true, type: 'text' },
      { id: '2', senderId: '1', content: 'It was great! I managed to hit a new PR on squats 🎉', timestamp: '10:20 AM', isRead: true, type: 'text' },
      { id: '3', senderId: 'coach', content: 'That\'s amazing! Keep up the great work. Try adding 5lbs next week.', timestamp: '10:25 AM', isRead: true, type: 'text' },
      { id: '4', senderId: '1', content: 'Thank you coach! I\'ll try that approach.', timestamp: '10:30 AM', isRead: false, type: 'text' },
    ],
  },
  {
    id: '2',
    athlete: { id: '2', name: 'Mike Chen', initials: 'MC', lastActive: '1h ago', isOnline: false },
    lastMessage: 'Should I increase my protein intake?',
    lastMessageTime: '9:45 AM',
    unreadCount: 1,
    messages: [
      { id: '1', senderId: '2', content: 'Hey coach, I have a question about my nutrition plan.', timestamp: '9:30 AM', isRead: true, type: 'text' },
      { id: '2', senderId: 'coach', content: 'Sure, what\'s on your mind?', timestamp: '9:35 AM', isRead: true, type: 'text' },
      { id: '3', senderId: '2', content: 'Should I increase my protein intake?', timestamp: '9:45 AM', isRead: false, type: 'text' },
    ],
  },
  {
    id: '3',
    athlete: { id: '3', name: 'Emma Davis', initials: 'ED', lastActive: '3h ago', isOnline: false },
    lastMessage: 'See you at the next check-in!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: '1', senderId: 'coach', content: 'Your check-in looks great Emma!', timestamp: 'Yesterday', isRead: true, type: 'text' },
      { id: '2', senderId: '3', content: 'Thanks! I\'ve been really consistent this week.', timestamp: 'Yesterday', isRead: true, type: 'text' },
      { id: '3', senderId: '3', content: 'See you at the next check-in!', timestamp: 'Yesterday', isRead: true, type: 'text' },
    ],
  },
  {
    id: '4',
    athlete: { id: '4', name: 'James Wilson', initials: 'JW', lastActive: '5h ago', isOnline: false },
    lastMessage: 'I\'ll send you my progress photos tomorrow.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: '1', senderId: 'coach', content: 'How are you feeling about the new program?', timestamp: 'Yesterday', isRead: true, type: 'text' },
      { id: '2', senderId: '4', content: 'Really enjoying it! The exercises feel challenging but doable.', timestamp: 'Yesterday', isRead: true, type: 'text' },
      { id: '3', senderId: '4', content: 'I\'ll send you my progress photos tomorrow.', timestamp: 'Yesterday', isRead: true, type: 'text' },
    ],
  },
  {
    id: '5',
    athlete: { id: '5', name: 'Lisa Park', initials: 'LP', lastActive: '1d ago', isOnline: false },
    lastMessage: 'Got it, thanks for the clarification!',
    lastMessageTime: 'Monday',
    unreadCount: 0,
    messages: [
      { id: '1', senderId: '5', content: 'Quick question about the food swap calculator...', timestamp: 'Monday', isRead: true, type: 'text' },
      { id: '2', senderId: 'coach', content: 'It calculates equivalent portions based on the macro you choose to match.', timestamp: 'Monday', isRead: true, type: 'text' },
      { id: '3', senderId: '5', content: 'Got it, thanks for the clarification!', timestamp: 'Monday', isRead: true, type: 'text' },
    ],
  },
];

// Helper to get current time formatted
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

function MessagesContent() {
  const searchParams = useSearchParams();
  const athleteIdFromUrl = searchParams.get('athlete');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = conversations.filter((conv) =>
    conv.athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Handle athlete URL param - open conversation or create new one
  useEffect(() => {
    if (athleteIdFromUrl) {
      // Check if conversation exists
      const existingConv = conversations.find(c => c.athlete.id === athleteIdFromUrl);
      if (existingConv) {
        setSelectedConversation(existingConv);
        // Mark messages as read
        setConversations(prev => prev.map(c => 
          c.id === existingConv.id 
            ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
            : c
        ));
      } else {
        // Create new conversation for this athlete
        const athlete = allAthletes.find(a => a.id === athleteIdFromUrl);
        if (athlete) {
          const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            athlete: athlete,
            lastMessage: '',
            lastMessageTime: 'Just now',
            unreadCount: 0,
            messages: [],
          };
          setConversations(prev => [newConv, ...prev]);
          setSelectedConversation(newConv);
        }
      }
    }
  }, [athleteIdFromUrl]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      inputRef.current?.focus();
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const currentTime = getCurrentTime();
    const messageId = `msg-${Date.now()}`;
    
    const newMsg: Message = {
      id: messageId,
      senderId: 'coach',
      content: newMessage.trim(),
      timestamp: currentTime,
      isRead: false,
      type: 'text',
    };

    // Update conversations with new message
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage.trim(),
          lastMessageTime: currentTime,
        };
      }
      return conv;
    }));

    // Update selected conversation
    setSelectedConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMsg],
        lastMessage: newMessage.trim(),
        lastMessageTime: currentTime,
      };
    });

    setNewMessage('');

    // Simulate athlete typing and response (for demo purposes)
    if (selectedConversation.messages.length < 10) {
      setTimeout(() => {
        setIsTyping(true);
      }, 1000);

      setTimeout(() => {
        setIsTyping(false);
        const responseTime = getCurrentTime();
        const responses = [
          "Got it, thanks coach! 💪",
          "That makes sense, I'll keep that in mind.",
          "Perfect, I appreciate the guidance!",
          "Sounds good! I'll try that tomorrow.",
          "Thanks for the quick response!",
          "Will do! Talk to you soon.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMsg: Message = {
          id: `msg-response-${Date.now()}`,
          senderId: selectedConversation.athlete.id,
          content: randomResponse,
          timestamp: responseTime,
          isRead: true,
          type: 'text',
        };

        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...conv.messages, responseMsg],
              lastMessage: randomResponse,
              lastMessageTime: responseTime,
            };
          }
          return conv;
        }));

        setSelectedConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, responseMsg],
            lastMessage: randomResponse,
            lastMessageTime: responseTime,
          };
        });
      }, 2500);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    // Mark messages as read
    setConversations(prev => prev.map(c => 
      c.id === conv.id 
        ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
        : c
    ));
  };

  const handleStartNewConversation = (athlete: typeof allAthletes[0]) => {
    // Check if conversation already exists
    const existingConv = conversations.find(c => c.athlete.id === athlete.id);
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        athlete: athlete,
        lastMessage: '',
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [],
      };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
    }
    setShowNewConversationModal(false);
  };

  // Get athletes without conversations for new conversation modal
  const athletesWithoutConversations = allAthletes.filter(
    athlete => !conversations.find(c => c.athlete.id === athlete.id)
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-0px)]">
        {/* Conversations List */}
        <div className={`w-96 bg-surface-900/50 border-r border-surface-800/50 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-surface-800/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-display font-bold text-surface-100">Messages</h1>
              <div className="flex items-center gap-2">
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-brand-500 text-white rounded-full">
                    {totalUnread} new
                  </span>
                )}
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="p-2 rounded-lg bg-brand-500 hover:bg-brand-400 transition-colors"
                  title="New conversation"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-surface-700 mx-auto mb-3" />
                <p className="text-surface-500">No conversations found</p>
              </div>
            )}
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-brand-500/10 border-l-2 border-brand-500'
                    : 'hover:bg-surface-800/50 border-l-2 border-transparent'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                    {conv.athlete.initials}
                  </div>
                  {conv.athlete.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime-500 border-2 border-surface-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-surface-100 truncate">{conv.athlete.name}</p>
                    <span className="text-xs text-surface-500 flex-shrink-0">{conv.lastMessageTime}</span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-surface-200 font-medium' : 'text-surface-400'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-800/50 bg-surface-950/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-surface-400" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                    {selectedConversation.athlete.initials}
                  </div>
                  {selectedConversation.athlete.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-500 border-2 border-surface-950" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-surface-100">{selectedConversation.athlete.name}</p>
                  <p className="text-xs text-surface-500">
                    {selectedConversation.athlete.isOnline ? 'Online' : `Last seen ${selectedConversation.athlete.lastActive}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
                  <Phone className="w-5 h-5 text-surface-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
                  <Video className="w-5 h-5 text-surface-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
                  <Info className="w-5 h-5 text-surface-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center py-16">
                    <MessageSquare className="w-16 h-16 text-surface-700 mx-auto mb-4" />
                    <p className="text-surface-400">No messages yet</p>
                    <p className="text-surface-500 text-sm">Start the conversation by sending a message</p>
                  </div>
                </div>
              )}
              {selectedConversation.messages.map((message, index) => {
                const isCoach = message.senderId === 'coach';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        isCoach
                          ? 'bg-brand-500 text-white rounded-br-md'
                          : 'bg-surface-800 text-surface-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isCoach ? 'text-white/70' : 'text-surface-500'}`}>
                        <span className="text-xs">{message.timestamp}</span>
                        {isCoach && (
                          message.isRead ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-start"
                  >
                    <div className="bg-surface-800 text-surface-100 rounded-2xl rounded-bl-md p-3">
                      <div className="flex items-center gap-1">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 rounded-full bg-surface-400"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 rounded-full bg-surface-400"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 rounded-full bg-surface-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-surface-800/50 bg-surface-950/50">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
                  <Paperclip className="w-5 h-5 text-surface-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-surface-800 transition-colors">
                  <Image className="w-5 h-5 text-surface-400" />
                </button>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="input-field py-3 pr-12"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-surface-700 transition-colors">
                    <Smile className="w-5 h-5 text-surface-400" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-surface-950/30">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-surface-600" />
              </div>
              <h2 className="text-xl font-display font-semibold text-surface-300 mb-2">Your Messages</h2>
              <p className="text-surface-500 mb-6">Select a conversation to start chatting</p>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversationModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewConversationModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-900 rounded-2xl border border-surface-800 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-surface-800">
                <h2 className="text-lg font-display font-bold text-surface-100">New Conversation</h2>
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-surface-400" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-surface-400 mb-4">Select an athlete to start a conversation</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allAthletes.map((athlete) => {
                    const hasConversation = conversations.find(c => c.athlete.id === athlete.id);
                    return (
                      <button
                        key={athlete.id}
                        onClick={() => handleStartNewConversation(athlete)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800 transition-colors text-left"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                            {athlete.initials}
                          </div>
                          {athlete.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-500 border-2 border-surface-900" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-surface-100">{athlete.name}</p>
                          <p className="text-xs text-surface-500">
                            {athlete.isOnline ? 'Online' : `Last active ${athlete.lastActive}`}
                          </p>
                        </div>
                        {hasConversation && (
                          <span className="text-xs text-surface-500 bg-surface-800 px-2 py-1 rounded">
                            Existing
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// Wrap in Suspense for useSearchParams
export default function MessagesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex h-[calc(100vh-0px)] items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-surface-400">Loading messages...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <MessagesContent />
    </Suspense>
  );
}

