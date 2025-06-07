'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MdRefresh, MdMenu, MdSend, MdInbox, MdPeople, MdSettings, MdLogout, MdHome, MdLock, MdClose } from 'react-icons/md';
import { BsFillChatLeftTextFill } from 'react-icons/bs';
import { BASE_BACKEND_URL } from '@/config/constants';
import Cookies from 'js-cookie';

function getTimeSince(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
}

export default function Chat() {
  const [fbConnection, setFbConnection] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedChat) {
      inputRef.current?.focus();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat?.messages?.length > 0) {
      scrollToBottom();
    }
  }, [selectedChat?.messages]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('token_type');
    router.push('/login');
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Function to fetch chats
    const fetchChats = async () => {
      try {
        const chatsResponse = await fetch(`${BASE_BACKEND_URL}/api/messenger/chats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!chatsResponse.ok) {
          throw new Error('Failed to fetch chats');
        }
        const chatsData = await chatsResponse.json();
        
        setChats(prevChats => {
          // If no chat is selected and we have chats, select the first one
          if (!selectedChat && chatsData.length > 0) {
            setSelectedChat(chatsData[0]);
          } else if (selectedChat) {
            // Find and update the currently selected chat
            const updatedSelectedChat = chatsData.find(chat => chat.id === selectedChat.id);
            if (updatedSelectedChat && JSON.stringify(updatedSelectedChat) !== JSON.stringify(selectedChat)) {
              setSelectedChat(updatedSelectedChat);
            }
          }
          return chatsData;
        });
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError(error.message);
      }
    };

    // Fetch Facebook connection status
    const fetchFbConnection = async () => {
      try {
        const response = await fetch(`${BASE_BACKEND_URL}/facebook/connection`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Facebook connection status');
        }
        const data = await response.json();
        setFbConnection(data);

        // If connected, fetch chats initially and set up interval
        if (data.connected === 1) {
          await fetchChats();
          
          // Set up interval to fetch chats every second
          const intervalId = setInterval(fetchChats, 1000);
          
          // Clean up interval on unmount
          return () => clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFbConnection();
  }, [router]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const token = Cookies.get('token');
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/messenger/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageInput.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Update the chat with the new message
      setSelectedChat(prevChat => ({
        ...prevChat,
        messages: [...prevChat.messages, {
          ...newMessage,
          message_type: 'outgoing',
          timestamp: new Date().toISOString()
        }]
      }));

      // Update the message in chats list
      setChats(prevChats => prevChats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      ));

      // Clear the input
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add this function to handle profile visibility toggle
  const toggleProfile = () => {
    setIsProfileVisible(!isProfileVisible);
  };

  if (loading) {
    return null;
  }

  if (!fbConnection?.connected) {
    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Standard Chat Wireframe Background */}
        <div className="absolute inset-0 filter blur-sm">
          <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-[300px] bg-white border-r border-gray-200">
              {/* Search Bar Wireframe */}
              <div className="h-14 border-b border-gray-200 bg-gray-50"></div>
              {/* Chat List Wireframe */}
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-white flex flex-col">
              {/* Chat Header Wireframe */}
              <div className="h-14 border-b border-gray-200 bg-gray-50"></div>
              
              {/* Messages Area Wireframe */}
              <div className="flex-1 p-6 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div className="w-64 h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-start space-x-3 justify-end">
                    <div className="w-48 h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>

              {/* Input Area Wireframe */}
              <div className="h-16 border-t border-gray-200 bg-gray-50"></div>
            </div>
          </div>
        </div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 rounded-xl shadow-lg p-8 max-w-md w-full text-center backdrop-blur-sm">
            <div className="mb-6 text-[#1E4D91]">
              <MdLock size={48} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Connect Facebook Page to Chat</h1>
            <p className="text-gray-600 mb-6">You need to connect your Facebook page before you can start chatting</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-[#1E4D91] text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors cursor-pointer font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="flex h-screen">
        {/* Tall Bar */}
        <div className="w-[5%] bg-[#1E4D91] flex flex-col items-center py-6 text-white">
          <div className="flex flex-col items-center space-y-8">
            <button 
              onClick={() => router.push('/home')}
              className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer group relative"
            >
              <MdHome size={28} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Go to Home
              </span>
            </button>
            <button className="p-3 rounded-lg bg-blue-700 transition-colors cursor-pointer">
              <BsFillChatLeftTextFill size={24} />
            </button>
            <button className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <MdInbox size={24} />
            </button>
            <button className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <MdPeople size={24} />
            </button>
          </div>
          <div className="mt-auto flex flex-col items-center space-y-8">
            <button className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <MdSettings size={24} />
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 rounded-lg hover:bg-blue-700 transition-colors group relative cursor-pointer"
            >
              <MdLogout size={24} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar - Chat List */}
        <div className={`${isSidebarCollapsed ? 'w-[4%]' : 'w-[20%]'} bg-white border-r border-gray-200 transition-all duration-75`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className='flex'>
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
                <MdMenu className='text-2xl mt-1 cursor-pointer'/>
              </button>
              <h2 className={`text-xl font-semibold text-gray-900 ml-3 ${isSidebarCollapsed ? 'hidden' : ''}`}>Conversations</h2>
            </div>
            <MdRefresh className={`text-gray-600 text-2xl ${isSidebarCollapsed ? 'hidden' : ''} cursor-pointer hover:text-gray-800 active:rotate-60 transition-transform duration-100`}/>
          </div>
          <div className={`overflow-y-auto h-[calc(100vh-4rem)] ${isSidebarCollapsed ? 'hidden' : ''}`}>
            {chats.map((chat) => {
              const lastMessage = chat.messages[chat.messages.length - 1];
              const timeSince = lastMessage ? getTimeSince(new Date(lastMessage.timestamp)) : '';
              
              // Get first and last incoming messages
              const incomingMessages = chat.messages.filter(msg => msg.message_type === 'incoming');
              const firstIncomingMessage = incomingMessages[0]?.content || 'No messages yet';
              const lastIncomingMessage = incomingMessages[incomingMessages.length - 1]?.content || 'No messages yet';
              
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`py-3 px-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      className="mt-1.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900">
                          {chat.fb_user_name}
                          <span className="text-gray-500 text-xs font-normal ml-2">
                            Facebook DM
                          </span>
                        </p>
                        <span className="text-xs text-gray-500 font-medium">{timeSince}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                        {firstIncomingMessage}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-0.5 leading-snug">
                        {lastIncomingMessage}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`${isSidebarCollapsed ? (isProfileVisible ? 'w-[71%]' : 'w-[91%]') : (isProfileVisible ? 'w-[55%]' : 'w-[75%]')} flex flex-col transition-all duration-75`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      
                    </div>
                    <div>
                      <h2 
                        className="text-2xl font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors duration-75"
                        onClick={toggleProfile}
                      >
                        {selectedChat.fb_user_name}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="space-y-2">
                  {selectedChat.messages.map((message, index) => {
                    const isLastIncoming =
                      message.message_type === 'incoming' &&
                      !selectedChat.messages
                        .slice(index + 1)
                        .some((m) => m.message_type === 'incoming');

                    const isLastOutgoing =
                      message.message_type === 'outgoing' &&
                      !selectedChat.messages
                        .slice(index + 1)
                        .some((m) => m.message_type === 'outgoing');

                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.message_type === 'outgoing' ? 'justify-end' : 'justify-start'} items-end`}
                      >
                        {message.message_type === 'incoming' && (
                          <div className={`flex-shrink-0 ${!isLastIncoming ? 'invisible' : 'mb-5'} w-10 h-10 mr-2 `}>
                            <img
                              src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                              alt="Profile"
                              className="w-10 h-10 rounded-full "
                            />
                          </div>
                        )}
                        <div className={`max-w-[70%] ${message.message_type === 'outgoing' ? 'ml-12' : 'mr-12'}`}>
                          <div
                            className={`px-3 py-3 rounded-md text-sm border border-gray-100 shadow-sm ${
                              message.message_type === 'outgoing'
                                ? 'bg-white text-gray-900'
                                : 'bg-white text-gray-800'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {(isLastIncoming || isLastOutgoing) && (
                            <p
                              className={`font-medium text-xs text-gray-700 mt-1 opacity-90 ${
                                message.message_type === 'outgoing' ? 'text-right' : 'text-left'
                              }`}
                            >
                              {selectedChat.fb_user_name} &nbsp;-&nbsp;
                              {new Date(message.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </p>
                          )}
                        </div>
                        {message.message_type === 'outgoing' && (
                          <div className={`flex-shrink-0 ${!isLastOutgoing ? 'invisible' : 'mb-5'} w-10 h-10 ml-2`}>
                            <img
                              src="https://robohash.org/mail@ashallendesign.co.uk"
                              alt="Profile"
                              className="w-10 h-10 rounded-full"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>


              {/* Message Input */}
              <div className="p-4 bg-white mb-4">
                <div className="flex space-x-4 text-sm font-medium">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={selectedChat ? `Message ${selectedChat.fb_user_name}` : "Select a conversation to start chatting..."}
                      className="w-full border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500 text-gray-600 placeholder:text-gray-600 pr-10"
                    />
                    {messageInput.trim() && (
                      <button 
                        onClick={handleSendMessage}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <MdSend size={20} />
                      </button>
                    )}
                  </div>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className={`${isProfileVisible ? 'w-[20%]' : 'w-[0%] overflow-hidden'} bg-gray-50 border-l border-gray-200 transition-all duration-75`}>
          <div className="h-screen flex flex-col">
            {selectedChat && isProfileVisible ? (
              <>
                {/* Top Profile Section - 1/3 height */}
                <div className="h-7/20 bg-white p-10 border-l border-gray-200 relative">
                  <button 
                    onClick={toggleProfile}
                    className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <MdClose size={24} />
                  </button>
                  <div className="space-y-4">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-18 h-18 rounded-full bg-gray-300 flex items-center justify-center mb-3 mt-5 border-3 border-green-500">
                        <img
                          src={"https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"}
                          alt={selectedChat.fb_user_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedChat.fb_user_name}</h3>
                      <p className="text-xs text-gray-700 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-600 font-medium"></span>
                        Online
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center mt-6">
                      <button className="text-sm font-medium flex items-center gap-2 px-4 py-1 rounded-lg border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer hover:bg-green-500 hover:text-white active:bg-green-400 active:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </button>
                      <button className="text-sm font-medium flex items-center gap-2 px-4 py-1 rounded-lg border border-gray-400 bg-white text-gray-900 hover:bg-gray-50 cursor-pointer hover:bg-green-500 hover:text-white active:bg-green-400 active:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Profile Section - 2/3 height */}
                <div className="h-13/20 bg-slate-200 p-3">
                  {/* Customer Details Card */}
                  <div className="bg-white rounded-md p-3 shadow-md text-sm">
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Customer details</h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email</span>
                        <span className="text-gray-900 font-medium">{selectedChat.fb_user_name.toLowerCase().replace(' ', '')}@gmail.com</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">First Name</span>
                        <span className="text-gray-900 font-medium">{selectedChat.fb_user_name.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Name</span>
                        <span className="text-gray-900 font-medium">{selectedChat.fb_user_name.split(' ').slice(1).join(' ') || '-'}</span>
                      </div>
                      <button className="text-blue-800 text-xs font-medium mt-1 cursor-pointer hover:text-blue-700 active:text-blue-500">
                        View more details
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a chat to view profile
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 