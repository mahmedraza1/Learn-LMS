import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/reduxHooks';
import { FaPaperPlane, FaTrash, FaUsers, FaTimes } from 'react-icons/fa';

const LiveChat = ({ lectureId, isLive, onClose }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Determine API URL based on hostname
  const getSocketUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname === 'lms.learn.pk') {
      return 'https://lms.learn.pk';
    }
    return 'http://localhost:3001';
  };

  useEffect(() => {
    // Only connect if we have required props and are not already connected to this lecture
    if (!lectureId || !isLive || !user) {
      console.log('LiveChat: Missing required props', { lectureId, isLive, user: !!user });
      return;
    }

    // Prevent reconnecting to the same lecture
    if (socket && socket.connected && socket.lectureId === lectureId) {
      console.log('LiveChat: Already connected to lecture', lectureId);
      return;
    }

    console.log('LiveChat: Initializing connection for lecture', lectureId);

    // Clean up existing connection if any
    if (socket) {
      socket.disconnect();
    }

    // Initialize socket connection
    const socketInstance = io(getSocketUrl(), {
      transports: ['websocket'],
      forceNew: true // Ensure fresh connection
    });

    // Store lecture ID on socket for tracking
    socketInstance.lectureId = lectureId;

    // Determine user role from roles array
    const getUserRole = () => {
      if (!user || !user.roles) return 'student';
      if (user.roles.includes('administrator')) return 'admin';
      if (user.roles.includes('instructor')) return 'instructor';
      return 'student';
    };

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to chat server for lecture:', lectureId);
      setIsConnected(true);
      
      // Join the lecture chat room
      socketInstance.emit('join-lecture-chat', {
        lectureId: lectureId,
        userName: user.name || 'Anonymous',
        userRole: getUserRole()
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from chat server for lecture:', lectureId);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Chat connection error:', error);
    });

    // Chat event handlers
    socketInstance.on('chat-history', (history) => {
      console.log('Received chat history:', history.length, 'messages');
      setMessages(history || []);
    });

    socketInstance.on('new-message', (message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    socketInstance.on('user-joined', (notification) => {
      console.log('User joined notification:', notification);
      setMessages(prev => [...prev, notification]);
    });

    socketInstance.on('user-left', (notification) => {
      console.log('User left notification:', notification);
      // Don't show user left messages
      // setMessages(prev => [...prev, notification]);
    });

    socketInstance.on('chat-cleared', (notification) => {
      console.log('Chat cleared:', notification);
      setMessages([notification]);
    });

    socketInstance.on('chat-started', (notification) => {
      console.log('Chat session started:', notification);
      setMessages([notification]);
    });

    socketInstance.on('lecture-ended', (notification) => {
      console.log('Lecture ended notification:', notification);
      setMessages(prev => [...prev, notification]);
      // Auto close chat after 5 seconds
      setTimeout(() => {
        console.log('Auto-closing chat after lecture end');
        onClose && onClose();
      }, 5000);
    });

    socketInstance.on('message-error', (error) => {
      console.error('Message error:', error);
    });

    socketInstance.on('permission-denied', (error) => {
      console.error('Permission denied:', error);
    });

    socketInstance.on('user-count-update', (data) => {
      console.log('User count updated:', data.count);
      setUserCount(data.count);
    });

    setSocket(socketInstance);

    // Cleanup on unmount or lectureId change
    return () => {
      console.log('LiveChat: Cleaning up connection for lecture', lectureId);
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [lectureId]); // Only depend on lectureId to prevent unnecessary reconnections

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!socket || !newMessage.trim() || !isConnected) return;

    socket.emit('send-message', {
      message: newMessage,
      lectureId: lectureId
    });

    setNewMessage('');
  };

  const clearChat = () => {
    if (!socket || !isConnected) return;
    
    if (window.confirm('Are you sure you want to clear the chat? This action cannot be undone.')) {
      socket.emit('clear-chat', { lectureId: lectureId });
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-red-600';
      case 'instructor':
        return 'text-blue-600';
      default:
        return 'text-gray-800';
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            👑 Admin
          </span>
        );
      case 'instructor':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            🎓 Instructor
          </span>
        );
      default:
        return null;
    }
  };

  const getMessageBackgroundColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'instructor':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  if (!isLive) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm font-semibold">💬 Live Chat</span>
          </div>
          {/* Only show user count to admins and instructors */}
          {userCount > 0 && (user?.roles?.includes('administrator') || user?.roles?.includes('admin') || user?.roles?.includes('instructor')) && (
            <div className="flex items-center space-x-1.5 bg-white/20 px-2.5 py-1 rounded-full">
              <FaUsers className="w-3 h-3" />
              <span className="text-xs font-medium">{userCount}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {(user?.roles?.includes('administrator') || user?.roles?.includes('admin') || user?.roles?.includes('instructor')) && (
            <button
              onClick={clearChat}
              disabled={!isConnected}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear Chat"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-gray-600 font-medium mb-1">Welcome to the live chat!</p>
            <p className="text-sm text-gray-500">Messages will appear here during the lecture.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Debug logging for roles
            if (message.type !== 'system') {
              console.log('Message role:', message.userRole, 'for user:', message.userName);
            }
            
            return (
              <div
                key={message.id || index}
                className={`${
                  message.type === 'system' 
                    ? 'text-center' 
                    : ''
                }`}
              >
                {message.type === 'system' ? (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-xs text-gray-600 italic bg-green-100 px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1.5">
                      <span className="text-green-600">👋</span>
                      {message.message}
                    </span>
                  </div>
                ) : (
                  <div className={`rounded-lg p-3 shadow-sm border transition-all ${getMessageBackgroundColor(message.userRole)}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-sm ${getRoleColor(message.userRole)}`}>
                          {message.userName}
                        </span>
                        {getRoleBadge(message.userRole)}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 break-words leading-relaxed">
                      {message.message}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at Bottom */}
      <div className="border-t border-gray-200 bg-white p-4 shadow-lg">
        {!isConnected && (
          <div className="mb-3 flex items-center justify-center">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span>Connecting to chat server...</span>
            </div>
          </div>
        )}
        
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all placeholder:text-gray-400"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="flex-shrink-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            title="Send message"
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </form>
        
        {isConnected && newMessage.length > 450 && (
          <p className="text-xs text-gray-500 mt-2 text-right">
            {500 - newMessage.length} characters remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveChat;