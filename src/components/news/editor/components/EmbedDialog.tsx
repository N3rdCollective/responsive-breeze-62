import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface EmbedDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (data: any) => void;
  type: 'social' | 'audio' | 'code' | 'interactive' | 'document';
}

export const EmbedDialog: React.FC<EmbedDialogProps> = ({ open, onClose, onInsert, type }) => {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleInsert = () => {
    if (type === 'code') {
      onInsert({ code, language });
    } else {
      onInsert({ url, platform });
    }
    setUrl('');
    setCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert {type === 'social' ? 'Social Media' : type === 'audio' ? 'Audio' : type === 'code' ? 'Code Snippet' : type === 'interactive' ? 'Interactive Content' : 'Document'}</DialogTitle>
        </DialogHeader>
        
        {type === 'code' ? (
          <div className="space-y-4">
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code</Label>
              <Textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Platform/Type</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {type === 'social' && (
                    <>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </>
                  )}
                  {type === 'audio' && (
                    <>
                      <SelectItem value="spotify">Spotify</SelectItem>
                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                      <SelectItem value="apple">Apple Music</SelectItem>
                    </>
                  )}
                  {type === 'interactive' && (
                    <>
                      <SelectItem value="maps">Google Maps</SelectItem>
                      <SelectItem value="codepen">CodePen</SelectItem>
                      <SelectItem value="codesandbox">CodeSandbox</SelectItem>
                    </>
                  )}
                  {type === 'document' && (
                    <>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="gdocs">Google Docs</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste URL here" />
            </div>
          </div>
        )}
        
        <Button onClick={handleInsert}>Insert</Button>
      </DialogContent>
    </Dialog>
  );
};
