
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, XCircle } from 'lucide-react';

interface MessageInputBarProps {
  onSendMessage: (content: string) => void; // File will be taken from parent's state
  isSending: boolean;
  conversationId: string | null;
  otherParticipantId: string | undefined;
  
  inputValue: string;
  onInputValueChange: (value: string) => void;

  // File related props managed by parent (ChatView)
  selectedFile: File | null;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  isSending,
  conversationId,
  otherParticipantId,
  inputValue,
  onInputValueChange,
  selectedFile,
  previewUrl,
  fileInputRef,
  onFileSelect,
  onRemoveFile,
}) => {
  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputValueChange(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contentToSend = inputValue.trim();
    if ((contentToSend === '' && !selectedFile) || !conversationId || !otherParticipantId) {
      console.error("MessageInputBar: Cannot send message. Missing data.");
      return;
    }
    onSendMessage(contentToSend); // Parent will use its selectedFile
  };
  
  const isDisabled = isSending || !conversationId;
  const canSubmit = (inputValue.trim() !== '' || !!selectedFile) && !isSending && !!otherParticipantId && !!conversationId;

  return (
    <div className="p-4 border-t dark:border-gray-700/50 bg-background">
      {previewUrl && selectedFile && (
        <div className="mb-2 p-2 border rounded-md relative max-w-xs animate-fade-in">
          <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={onRemoveFile}
            aria-label="Remove image"
          >
            <XCircle size={16} />
          </Button>
          <p className="text-xs text-muted-foreground truncate mt-1">{selectedFile.name}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={onFileSelect}
          ref={fileInputRef}
          className="hidden"
          disabled={isDisabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          aria-label="Attach file"
        >
          <Paperclip size={18} />
        </Button>
        <Input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={handleLocalInputChange}
          className="flex-1"
          disabled={isDisabled}
        />
        <Button type="submit" disabled={!canSubmit}>
          {isSending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
          ) : (
            <Send size={18} />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
};

export default MessageInputBar;
