
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendImage: (file: File) => void;
  isUploading: boolean;
}

const MessageInput = ({ onSendMessage, onSendImage, isUploading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !isUploading) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSendImage(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 border-t dark:border-gray-700">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Send image"
        >
          <Image className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isUploading}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={(!newMessage.trim() && !isUploading) || isUploading}
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
