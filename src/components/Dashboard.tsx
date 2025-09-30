import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Plus, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  Check
} from 'lucide-react';
import { Room } from '../types';
import { mockRooms, mockUsers } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Load rooms from localStorage or use mock data
    const savedRooms = localStorage.getItem('videomeet_rooms');
    if (savedRooms) {
      try {
        const parsedRooms = JSON.parse(savedRooms).map((room: any) => ({
          ...room,
          createdAt: new Date(room.createdAt)
        }));
        setRooms(parsedRooms);
      } catch (error) {
        setRooms(mockRooms);
      }
    } else {
      setRooms(mockRooms);
    }
  }, []);

  const saveRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    localStorage.setItem('videomeet_rooms', JSON.stringify(updatedRooms));
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !user) return;

    const newRoom: Room = {
      id: uuidv4().substring(0, 8),
      name: newRoomName.trim(),
      description: newRoomDescription.trim(),
      createdBy: user.id,
      createdAt: new Date(),
      isActive: true,
      participants: [user.id],
      maxParticipants: 50
    };

    const updatedRooms = [...rooms, newRoom];
    saveRooms(updatedRooms);
    
    setNewRoomName('');
    setNewRoomDescription('');
    setShowCreateModal(false);
  };

  const handleJoinRoom = (roomId: string, isModerator: boolean = false) => {
    if (!user) return;
    
    const params = new URLSearchParams({
      name: user.name,
      ...(isModerator && { moderator: 'true' })
    });
    navigate(`/room/${roomId}?${params.toString()}`);
  };

  const handleToggleRoomStatus = (roomId: string) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? { ...room, isActive: !room.isActive } : room
    );
    saveRooms(updatedRooms);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const updatedRooms = rooms.filter(room => room.id !== roomId);
      saveRooms(updatedRooms);
    }
  };

  const handleCopyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(roomId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  const getUserName = (userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const myRooms = rooms.filter(room => room.createdBy === user?.id);
  const joinedRooms = rooms.filter(room => 
    room.createdBy !== user?.id && room.participants.includes(user?.id || '')
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">VideoMeet</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">Manage your video conference rooms and join meetings.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors group"
          >
            <Plus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Create New Room</h3>
            <p className="text-blue-100 text-sm">Start a new meeting room</p>
          </button>
          
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <Users className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-1 text-gray-900">My Rooms</h3>
            <p className="text-gray-600 text-sm">{myRooms.length} rooms created</p>
          </div>
          
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-1 text-gray-900">Joined Rooms</h3>
            <p className="text-gray-600 text-sm">{joinedRooms.length} rooms joined</p>
          </div>
        </div>

        {/* My Rooms */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Rooms</h3>
          {myRooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">You haven't created any rooms yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{room.name}</h4>
                      {room.description && (
                        <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>ID: {room.id}</span>
                        <button
                          onClick={() => handleCopyRoomId(room.id)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          {copiedRoomId === room.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copiedRoomId === room.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {room.participants.length} participants
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRoomStatus(room.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={room.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {room.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleJoinRoom(room.id, true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join as Moderator
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Joined Rooms */}
        {joinedRooms.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Joined Rooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{room.name}</h4>
                    {room.description && (
                      <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {getUserName(room.createdBy)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {room.participants.length} participants
                    </div>
                    
                    <button
                      onClick={() => handleJoinRoom(room.id, false)}
                      disabled={!room.isActive}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Room</h3>
            
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name *
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="roomDescription"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room description"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;