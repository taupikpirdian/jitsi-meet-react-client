import { User, Room } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@videomeet.com',
    name: 'Administrator',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '2',
    username: 'john',
    email: 'john@videomeet.com',
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '3',
    username: 'sarah',
    email: 'sarah@videomeet.com',
    name: 'Sarah Wilson',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '4',
    username: 'mike',
    email: 'mike@videomeet.com',
    name: 'Mike Johnson',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  }
];

export const mockRooms: Room[] = [
  {
    id: 'room-001',
    name: 'Team Daily Standup',
    description: 'Daily team meeting for project updates',
    createdBy: '1',
    createdAt: new Date('2024-01-15T09:00:00'),
    isActive: true,
    participants: ['1', '2', '3'],
    maxParticipants: 10
  },
  {
    id: 'room-002',
    name: 'Client Presentation',
    description: 'Quarterly business review with clients',
    createdBy: '2',
    createdAt: new Date('2024-01-15T14:00:00'),
    isActive: false,
    participants: ['2', '4'],
    maxParticipants: 20
  },
  {
    id: 'room-003',
    name: 'Design Review',
    description: 'UI/UX design review session',
    createdBy: '3',
    createdAt: new Date('2024-01-16T10:30:00'),
    isActive: true,
    participants: ['3', '1'],
    maxParticipants: 8
  }
];

// Mock credentials (username: password)
export const mockCredentials = {
  'admin': 'admin123',
  'john': 'john123',
  'sarah': 'sarah123',
  'mike': 'mike123'
};