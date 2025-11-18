'use client';

import React, { useState } from 'react';
import { Mail, Inbox, Send, Archive, Star, Trash2, Search, RefreshCw, MoreVertical, Paperclip, MessageCircle, Phone, Video, MoreHorizontal, Smile, Image as ImageIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import FeedsView from './FeedsView';
import AdvertsPanel from '@/components/AdvertsPanel';

type Tab = 'mail' | 'feeds';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  photoUrl?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

// Mock conversations
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Theatre Team Group',
    avatar: 'TT',
    lastMessage: 'Dr. Smith: Ready for morning rounds',
    time: '2m ago',
    unread: 3,
    online: true
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    avatar: 'SJ',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=faces',
    lastMessage: 'Thanks for updating the schedule',
    time: '15m ago',
    unread: 0,
    online: true
  },
  {
    id: '3',
    name: 'Equipment Team',
    avatar: 'ET',
    lastMessage: 'Maintenance complete ✓',
    time: '1h ago',
    unread: 0,
    online: false
  },
  {
    id: '4',
    name: 'Night Shift Handover',
    avatar: 'NS',
    lastMessage: 'All cases completed successfully',
    time: 'Yesterday',
    unread: 0,
    online: false
  }
];

type Tab = 'mail' | 'feeds';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
}

// Mock email data
const mockEmails: Email[] = [
  {
    id: '1',
    from: 'Dr. Sarah Johnson',
    subject: 'Theatre Schedule Update - Tomorrow',
    preview: 'Please note the following changes to tomorrow\'s theatre schedule. Theatre 3 will now start at 08:30 instead of 09:00...',
    time: '10:24 AM',
    read: false,
    starred: true,
    hasAttachment: false
  },
  {
    id: '2',
    from: 'NHS Theatre Manager',
    subject: 'Weekly Staff Roster - Week 47',
    preview: 'The weekly staff roster for Week 47 has been finalized. Please review your assigned shifts and confirm availability...',
    time: '09:15 AM',
    read: false,
    starred: false,
    hasAttachment: true
  },
  {
    id: '3',
    from: 'Equipment Team',
    subject: 'Maintenance Notice - Theatre 2',
    preview: 'Scheduled maintenance for Theatre 2 imaging equipment on Friday, 24th November. Expected downtime: 2-3 hours...',
    time: 'Yesterday',
    read: true,
    starred: false,
    hasAttachment: false
  },
  {
    id: '4',
    from: 'Clinical Director',
    subject: 'New Procedure Protocols',
    preview: 'Updated protocols for laparoscopic procedures are now available on the intranet. All theatre staff must review by end of week...',
    time: 'Yesterday',
    read: true,
    starred: true,
    hasAttachment: true
  },
  {
    id: '5',
    from: 'HR Department',
    subject: 'Annual Leave Reminder',
    preview: 'Reminder to submit your annual leave requests for December by Friday 17th November...',
    time: 'Nov 15',
    read: true,
    starred: false,
    hasAttachment: false
  }
];

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState<Tab>('mail');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(mockEmails[0]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [mobileView, setMobileView] = useState<'messenger' | 'feeds'>('messenger'); // For Feeds tab on mobile
  const [isAdvertsCollapsed, setIsAdvertsCollapsed] = useState(false); // Collapse state for adverts panel
  const [isInCall, setIsInCall] = useState(false); // Track if user is in a call
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null); // Track call type

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Tab Bar */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
        <div className="flex">
          <button
            onClick={() => setActiveTab('mail')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'mail'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>NHS Mail</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
              2
            </span>
          </button>

          <button
            onClick={() => setActiveTab('feeds')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === 'feeds'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Feeds</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'mail' ? (
          // Mail View - Split Screen
          <div className="h-full flex">
            {/* Email List - Left Side */}
            <div className="w-full md:w-96 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
              {/* Mail Toolbar */}
              <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mail..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg">
                    <Inbox className="w-3.5 h-3.5" />
                    Inbox
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Star className="w-3.5 h-3.5" />
                    Starred
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Send className="w-3.5 h-3.5" />
                    Sent
                  </button>
                </div>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto">
                {mockEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full p-4 border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${email.read ? 'bg-transparent' : 'bg-blue-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${email.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {email.from}
                          </span>
                          <div className="flex items-center gap-1">
                            {email.starred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                            {email.hasAttachment && <Paperclip className="w-3.5 h-3.5 text-gray-400" />}
                          </div>
                        </div>
                        <div className={`text-sm mb-1 ${email.read ? 'text-gray-600 dark:text-gray-500' : 'text-gray-900 dark:text-white font-medium'}`}>
                          {email.subject}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-600 line-clamp-2">
                          {email.preview}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                          {email.time}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Content - Middle */}
            <div className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-1 min-w-0">
              {selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedEmail.subject}
                      </h2>
                      <div className="flex gap-1">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {selectedEmail.from.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{selectedEmail.from}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          to me • {selectedEmail.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedEmail.preview}
                        {'\n\n'}
                        This is a full email body that would contain the complete message content.
                        You can add more paragraphs, formatting, and details here.
                        {'\n\n'}
                        Best regards,{'\n'}
                        {selectedEmail.from}
                      </p>
                    </div>
                  </div>

                  {/* Reply Actions */}
                  <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Reply
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        Forward
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <div className="text-center">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Select an email to read</p>
                  </div>
                </div>
              )}
            </div>

            {/* Adverts Panel - Right Side (Desktop) - Collapsible */}
            <div className={`hidden md:flex flex-shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 relative ${
              isAdvertsCollapsed ? 'w-16' : 'w-80'
            }`}>
              {/* Collapse/Expand Button */}
              <button
                onClick={() => setIsAdvertsCollapsed(!isAdvertsCollapsed)}
                className="absolute -left-3 top-6 w-6 h-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors z-50"
                title={isAdvertsCollapsed ? 'Expand Adverts' : 'Collapse Adverts'}
              >
                {isAdvertsCollapsed ? (
                  <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {!isAdvertsCollapsed && <AdvertsPanel />}
            </div>
          </div>
        ) : (
          // Messenger + Feeds View - Split Screen
          <div className="h-full flex flex-col md:flex-row">
            {/* Mobile Sub-Tabs - Only visible on mobile */}
            <div className="md:hidden flex-shrink-0 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
              <div className="flex">
                <button
                  onClick={() => setMobileView('messenger')}
                  className={`flex-1 py-3 text-sm font-medium transition-all ${
                    mobileView === 'messenger'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  💬 Messenger
                </button>
                <button
                  onClick={() => setMobileView('feeds')}
                  className={`flex-1 py-3 text-sm font-medium transition-all ${
                    mobileView === 'feeds'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  📰 Posts
                </button>
              </div>
            </div>

            {/* Messenger - Left Side (Desktop always, Mobile conditional) */}
            <div className={`${mobileView === 'messenger' ? 'flex' : 'hidden'} md:flex w-full md:w-96 border-r border-gray-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900`}>
              {!selectedConversation ? (
                <>
                  {/* Messenger Header - List View */}
                  <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h3>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto">
                    {mockConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className="w-full p-4 border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {conv.photoUrl ? (
                              <img
                                src={conv.photoUrl}
                                alt={conv.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {conv.avatar}
                              </div>
                            )}
                            {conv.online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {conv.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {conv.time}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {conv.lastMessage}
                              </span>
                              {conv.unread > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full font-medium">
                                  {conv.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Back to messages"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="relative">
                          {selectedConversation.photoUrl ? (
                            <img
                              src={selectedConversation.photoUrl}
                              alt={selectedConversation.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {selectedConversation.avatar}
                            </div>
                          )}
                          {selectedConversation.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {selectedConversation.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedConversation.online ? 'Active now' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setIsInCall(true); setCallType('voice'); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                          title="Voice call"
                        >
                          <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => { setIsInCall(true); setCallType('video'); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                          title="Video call"
                        >
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages - Full height on mobile */}
                  <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-slate-900">
                    {/* Mock messages */}
                    <div className="flex gap-2">
                      {selectedConversation.photoUrl ? (
                        <img
                          src={selectedConversation.photoUrl}
                          alt={selectedConversation.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {selectedConversation.avatar}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {selectedConversation.lastMessage}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                          {selectedConversation.time}
                        </span>
                      </div>
                    </div>

                    {/* Your message (right-aligned) */}
                    <div className="flex justify-end">
                      <div className="flex flex-col items-end max-w-[70%]">
                        <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm">
                          <p className="text-sm text-white">
                            Thanks for the update! I'll review the changes shortly.
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2">
                          Just now
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message Input - Better mobile layout */}
                  <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-end gap-2 max-w-full mx-auto">
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-2">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Feeds Content - Middle/Right (Desktop always, Mobile conditional) */}
            <div className={`${mobileView === 'feeds' ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-hidden`}>
              <FeedsView />
            </div>

            {/* Adverts Panel - Right Side (Desktop) - Collapsible */}
            <div className={`hidden md:flex flex-shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 relative ${
              isAdvertsCollapsed ? 'w-16' : 'w-80'
            }`}>
              {/* Collapse/Expand Button */}
              <button
                onClick={() => setIsAdvertsCollapsed(!isAdvertsCollapsed)}
                className="absolute -left-3 top-6 w-6 h-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors z-50"
                title={isAdvertsCollapsed ? 'Expand Adverts' : 'Collapse Adverts'}
              >
                {isAdvertsCollapsed ? (
                  <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {!isAdvertsCollapsed && <AdvertsPanel />}
            </div>
          </div>
        )}
      </div>

      {/* Call/Video Call UI Overlay */}
      {isInCall && selectedConversation && (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
          {/* Call Header */}
          <div className="flex-shrink-0 p-6 text-center text-white">
            <p className="text-sm opacity-75 mb-2">
              {callType === 'video' ? 'Video Call' : 'Voice Call'}
            </p>
            <h2 className="text-2xl font-bold mb-1">{selectedConversation.name}</h2>
            <p className="text-sm opacity-75">Calling...</p>
          </div>

          {/* Call Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            {callType === 'video' ? (
              // Video Call - Show participant(s) video
              <div className="w-full h-full max-w-4xl max-h-[600px] relative">
                {/* Main Video (other person) */}
                <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
                  {selectedConversation.photoUrl ? (
                    <img
                      src={selectedConversation.photoUrl}
                      alt={selectedConversation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
                        {selectedConversation.avatar}
                      </div>
                    </div>
                  )}
                  {/* Connecting overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white mx-auto mb-4 animate-spin" />
                      <p className="text-lg">Connecting...</p>
                    </div>
                  </div>
                </div>

                {/* Picture-in-Picture (your video) */}
                <div className="absolute top-4 right-4 w-32 h-40 bg-gray-700 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      AM
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Voice Call - Show profile picture
              <div className="text-center">
                {selectedConversation.photoUrl ? (
                  <img
                    src={selectedConversation.photoUrl}
                    alt={selectedConversation.name}
                    className="w-48 h-48 rounded-full object-cover mx-auto mb-8 shadow-2xl border-4 border-white/10"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-6xl mx-auto mb-8 shadow-2xl border-4 border-white/10">
                    {selectedConversation.avatar}
                  </div>
                )}
                {/* Call status animation */}
                <div className="flex items-center justify-center gap-2 text-white/60">
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex-shrink-0 pb-safe">
            <div className="max-w-md mx-auto px-8 py-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                {/* Mute/Unmute */}
                <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Video Toggle (only for video calls) */}
                {callType === 'video' && (
                  <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all">
                    <Video className="w-6 h-6 text-white" />
                  </button>
                )}

                {/* End Call */}
                <button
                  onClick={() => { setIsInCall(false); setCallType(null); }}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg"
                >
                  <Phone className="w-7 h-7 text-white rotate-[135deg]" />
                </button>

                {/* Speaker/Audio Output */}
                <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>

                {/* More Options */}
                <button className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all">
                  <MoreVertical className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Call Timer */}
              <div className="text-center text-white/60 text-sm">
                00:00
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
