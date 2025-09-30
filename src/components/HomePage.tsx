import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, ArrowRight, Plus, UserCheck } from 'lucide-react';

const HomePage: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = (e: React.FormEvent, isModerator = false) => {
    e.preventDefault();
    if (roomId.trim() && userName.trim()) {
      const params = new URLSearchParams({
        name: userName.trim(),
        ...(isModerator && { moderator: 'true' })
      });
      navigate(`/room/${roomId.trim()}?${params.toString()}`);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      const newRoomId = Math.random().toString(36).substring(2, 10);
      setRoomId(newRoomId);
      const params = new URLSearchParams({
        name: userName.trim(),
        moderator: 'true'
      });
      navigate(`/room/${newRoomId}?${params.toString()}`);
    }
  };
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setRoomId(randomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Video className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">VideoMeet</h1>
          <p className="text-blue-200">Secure video conferencing for everyone</p>
        </div>

        {/* Join Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsCreatingRoom(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isCreatingRoom 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Join Meeting
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingRoom(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                isCreatingRoom 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Room
            </button>
          </div>

          <form onSubmit={isCreatingRoom ? handleCreateRoom : (e) => handleJoinRoom(e)} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-white mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            {!isCreatingRoom && <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-white mb-2">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room ID"
                  required
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 text-white font-medium transition-all duration-200"
                >
                  Generate
                </button>
              </div>
            </div>}

            <button
              type="submit"
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group ${
                isCreatingRoom 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCreatingRoom ? (
                <>
                  <UserCheck className="w-5 h-5" />
                  Create & Join as Moderator
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Join Meeting
                </>
              )}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-blue-200 text-sm">
          <p>
            {isCreatingRoom 
              ? 'You will be the moderator and can approve participants' 
              : 'Share the same Room ID with others to join the same meeting'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;