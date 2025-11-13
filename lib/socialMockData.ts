// Mock data for NHS theatre staff social feed

export interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty?: string;
  trust: string;
  avatar?: string;
  initials: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: string[]; // Array of user IDs who liked
  reactions: { [userId: string]: string }; // Map of user IDs to their selected emoji
  comments: Comment[];
  shares: number;
  type: 'text' | 'announcement' | 'shift-swap' | 'achievement';
  imageUrl?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
}

// Mock NHS Theatre Staff Profiles
export const mockStaffProfiles: StaffProfile[] = [
  {
    id: 'user-1',
    firstName: 'Alexander',
    lastName: 'Monterubio',
    role: 'Senior Scrub Team Leader',
    specialty: 'Orthopaedics',
    trust: 'Barts Health NHS Trust',
    initials: 'AM'
  },
  {
    id: 'user-2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Consultant Surgeon',
    specialty: 'Orthopaedics',
    trust: 'Barts Health NHS Trust',
    initials: 'SJ'
  },
  {
    id: 'user-3',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'Scrub Nurse',
    specialty: 'General Surgery',
    trust: 'Barts Health NHS Trust',
    initials: 'MC'
  },
  {
    id: 'user-4',
    firstName: 'Emma',
    lastName: 'Williams',
    role: 'Theatre Manager',
    specialty: 'Operations',
    trust: 'Barts Health NHS Trust',
    initials: 'EW'
  },
  {
    id: 'user-5',
    firstName: 'David',
    lastName: 'Patel',
    role: 'Anaesthetist',
    specialty: 'Anaesthetics',
    trust: 'Barts Health NHS Trust',
    initials: 'DP'
  },
  {
    id: 'user-6',
    firstName: 'Rachel',
    lastName: 'Thompson',
    role: 'ODP',
    specialty: 'Theatre Support',
    trust: 'Barts Health NHS Trust',
    initials: 'RT'
  },
  {
    id: 'user-7',
    firstName: 'James',
    lastName: 'Kumar',
    role: 'Surgical Registrar',
    specialty: 'Cardiothoracic',
    trust: 'Barts Health NHS Trust',
    initials: 'JK'
  },
  {
    id: 'user-8',
    firstName: 'Lisa',
    lastName: 'O\'Brien',
    role: 'Lead Nurse',
    specialty: 'Recovery',
    trust: 'Barts Health NHS Trust',
    initials: 'LO'
  }
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-2',
    content: 'Fantastic teamwork in Theatre 3 today! Successfully completed a complex total knee replacement 45 minutes ahead of schedule. Huge thanks to the entire team - this is what excellent collaboration looks like! 💙',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: ['user-1', 'user-3', 'user-4', 'user-5', 'user-6'],
    reactions: { 'user-1': '❤️', 'user-3': '👍', 'user-4': '❤️', 'user-5': '😂', 'user-6': '👍' },
    comments: [
      {
        id: 'comment-1',
        authorId: 'user-1',
        content: 'It was a pleasure working with you Dr. Johnson! Great case.',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        likes: ['user-2']
      },
      {
        id: 'comment-2',
        authorId: 'user-5',
        content: 'Smooth anaesthetic management throughout. Well done team!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: ['user-1', 'user-2']
      }
    ],
    shares: 3,
    type: 'achievement'
  },
  {
    id: 'post-2',
    authorId: 'user-4',
    content: '📢 Theatre Efficiency Review Meeting - Friday 2pm, Boardroom A. All team leads please attend. Agenda: Q4 performance metrics, new staffing protocols, and equipment upgrade proposals.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: ['user-1', 'user-2', 'user-3', 'user-7', 'user-8'],
    reactions: { 'user-1': '👍', 'user-2': '👍', 'user-3': '👍', 'user-7': '👍', 'user-8': '❤️' },
    comments: [
      {
        id: 'comment-3',
        authorId: 'user-1',
        content: 'Will be there. Can we also discuss the new inventory management system?',
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        likes: ['user-4']
      }
    ],
    shares: 12,
    type: 'announcement'
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    content: '✅ New hip implant inventory has arrived and been catalogued. Smith & Nephew Anthology system now fully stocked. Please check the supply catalogue for product codes and specifications.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likes: ['user-1', 'user-2', 'user-6', 'user-7'],
    reactions: { 'user-1': '👍', 'user-2': '👍', 'user-6': '👍', 'user-7': '👍' },
    comments: [],
    shares: 5,
    type: 'announcement'
  },
  {
    id: 'post-4',
    authorId: 'user-7',
    content: 'Looking for someone to swap my night shift on Thursday 7th Nov. I can cover any day shift Fri 8th - Sun 10th Nov in return. DM if interested!',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    likes: ['user-3', 'user-6'],
    reactions: { 'user-3': '👍', 'user-6': '😮' },
    comments: [
      {
        id: 'comment-4',
        authorId: 'user-6',
        content: 'Might be able to help. Let me check my schedule and DM you!',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
        likes: ['user-7']
      }
    ],
    shares: 0,
    type: 'shift-swap'
  },
  {
    id: 'post-5',
    authorId: 'user-8',
    content: 'Recovery team handled 14 major cases today without any delays or complications. Exceptional patient care all around. Proud of this team! 🌟',
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
    likes: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
    reactions: { 'user-1': '❤️', 'user-2': '❤️', 'user-3': '❤️', 'user-4': '👍', 'user-5': '😮', 'user-6': '❤️' },
    comments: [
      {
        id: 'comment-5',
        authorId: 'user-4',
        content: 'Outstanding performance! This level of efficiency is what we strive for.',
        timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000),
        likes: ['user-8', 'user-1']
      }
    ],
    shares: 2,
    type: 'achievement'
  },
  {
    id: 'post-6',
    authorId: 'user-5',
    content: 'Reminder: New WHO surgical safety checklist training session tomorrow at 1pm. Mandatory for all theatre staff. See you there!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    likes: ['user-1', 'user-2', 'user-3', 'user-4', 'user-6', 'user-7', 'user-8'],
    reactions: { 'user-1': '👍', 'user-2': '👍', 'user-3': '👍', 'user-4': '👍', 'user-6': '👍', 'user-7': '👍', 'user-8': '👍' },
    comments: [],
    shares: 15,
    type: 'announcement'
  }
];

// Mock Conversations for Messenger
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-1', 'user-2'],
    lastMessage: {
      id: 'msg-1',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'Thanks for the great support during today\'s case!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    unreadCount: 1
  },
  {
    id: 'conv-2',
    participants: ['user-1', 'user-4'],
    lastMessage: {
      id: 'msg-2',
      senderId: 'user-1',
      receiverId: 'user-4',
      content: 'Sure, I can attend Friday\'s meeting',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    },
    unreadCount: 0
  },
  {
    id: 'conv-3',
    participants: ['user-1', 'user-7'],
    lastMessage: {
      id: 'msg-3',
      senderId: 'user-7',
      receiverId: 'user-1',
      content: 'Any chance you can help with the shift swap?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false
    },
    unreadCount: 2
  }
];

// Helper function to get staff by ID
export function getStaffById(id: string): StaffProfile | undefined {
  return mockStaffProfiles.find(staff => staff.id === id);
}

// Helper function to get formatted time ago
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
