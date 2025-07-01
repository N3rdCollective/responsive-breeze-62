
import React from 'react';
import ChatRoom from '@/components/chat/ChatRoom';
import TitleUpdater from '@/components/TitleUpdater';

const ChatPage = () => {
  return (
    <>
      <TitleUpdater title="Chat - Rappin' Lounge" />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Community Chat
            </h1>
            <p className="text-muted-foreground">
              Join the conversation with fellow listeners while the music plays
            </p>
          </div>
          
          <ChatRoom />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
