import React, { useMemo } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const ChatList = ({ exchanges, selectedChat, handleOpenChat, unreadMessages, activeTab, setActiveTab, user }) => {
  const groupExchangesByUser = (exchanges, currentUserId) => {
    if (!currentUserId) return [];
    
    const groupedExchanges = exchanges.reduce((acc, exchange) => {
      const otherUserId = exchange.user1Id === currentUserId ? exchange.user2Id : exchange.user1Id;
      const otherUser = exchange.user1Id === currentUserId ? exchange.user2 : exchange.user1;
      
      if (!acc[otherUserId] || new Date(exchange.createdAt) > new Date(acc[otherUserId].createdAt)) {
        acc[otherUserId] = {
          ...exchange,
          otherUser
        };
      }
      return acc;
    }, {});
  
    return Object.values(groupedExchanges);
  };

  const filteredExchanges = useMemo(() => {
    if (!exchanges || !Array.isArray(exchanges) || !user) return [];
    
    const groupedExchanges = groupExchangesByUser(exchanges, user.id);
    
    return groupedExchanges.filter(exchange => {
      if (activeTab === 'all') return true;
      if (activeTab === 'archived') return exchange.status === 'cancelled';
      if (activeTab === 'starred') return exchange.isStarred;
      return true;
    });
  }, [exchanges, user, activeTab]);

  const getAvatarUrl = (user) => {
    if (!user) return 'https://via.placeholder.com/40';
    
    if (user.avatar) {
      if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        return user.avatar;
      }
      return `${process.env.REACT_APP_API_URL}/uploads/avatars/${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=40`;
  };

  return (
    <div className="w-96 bg-white border-r flex flex-col">
      <div className="h-16 border-b px-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-500" />
      </div>
      <div className="p-4">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-full ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-full ${activeTab === 'archived' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('archived')}
          >
            Archived
          </button>
          <button
            className={`px-4 py-2 rounded-full ${activeTab === 'starred' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('starred')}
          >
            Starred
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredExchanges.length > 0 ? (
          filteredExchanges.map(exchange => (
            <div 
              key={exchange.id} 
              className={`p-4 flex items-center cursor-pointer border-l-4 ${selectedChat === exchange.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent hover:bg-gray-50'}`}
              onClick={() => handleOpenChat(exchange.id)}
            >
              <div className="relative">
              <img 
                src={getAvatarUrl(exchange.otherUser)}
                className="h-12 w-12 rounded-full object-cover" 
                alt={exchange.otherUser?.name || 'User avatar'}
              />
                {unreadMessages[exchange.id] > 0 && selectedChat !== exchange.id && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                    {unreadMessages[exchange.id]}
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="font-semibold text-gray-800">{exchange.otherUser?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">
                  {`${exchange.skill1?.name || 'Unknown Skill'} <-> ${exchange.skill2?.name || 'Unknown Skill'}`}
                </p>
                <p className="text-xs text-gray-400">{exchange.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chats available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;