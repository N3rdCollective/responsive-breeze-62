import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, X } from "lucide-react";
import { useSubmissionUpload } from "./hooks/useSubmissionUpload";
import { useAuth } from "@/hooks/useAuth";
import { SubmissionFormData } from "../types";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SubmissionForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitShow, isUploading, uploadProgress } = useSubmissionUpload();

  const [formData, setFormData] = useState<SubmissionFormData>({
    show_title: '',
    show_description: '',
    proposed_days: [],
    proposed_start_time: '',
    proposed_end_time: '',
    episode_title: '',
    episode_description: '',
    audio_file: null,
    artwork_file: null,
    submission_notes: ''
  });

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      proposed_days: prev.proposed_days.includes(day)
        ? prev.proposed_days.filter(d => d !== day)
        : [...prev.proposed_days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await submitShow(formData, user.id);
      navigate('/staff/shows/submissions');
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit Show for Review</CardTitle>
          <CardDescription>
            Fill out the details below to submit your show to the program director for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Show Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Show Details</h3>
              
              <div>
                <Label htmlFor="show_title">Show Title *</Label>
                <Input
                  id="show_title"
                  value={formData.show_title}
                  onChange={(e) => setFormData({ ...formData, show_title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="show_description">Show Description</Label>
                <Textarea
                  id="show_description"
                  value={formData.show_description}
                  onChange={(e) => setFormData({ ...formData, show_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>Proposed Days *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DAYS_OF_WEEK.map(day => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.proposed_days.includes(day) ? "default" : "outline"}
                      onClick={() => handleDayToggle(day)}
                      size="sm"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.proposed_start_time}
                    onChange={(e) => setFormData({ ...formData, proposed_start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.proposed_end_time}
                    onChange={(e) => setFormData({ ...formData, proposed_end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Episode Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Episode Details (Optional)</h3>
              
              <div>
                <Label htmlFor="episode_title">Episode Title</Label>
                <Input
                  id="episode_title"
                  value={formData.episode_title}
                  onChange={(e) => setFormData({ ...formData, episode_title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="episode_description">Episode Description</Label>
                <Textarea
                  id="episode_description"
                  value={formData.episode_description}
                  onChange={(e) => setFormData({ ...formData, episode_description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Files</h3>
              
              <div>
                <Label htmlFor="audio_file">Audio File * (MP3, WAV, M4A)</Label>
                <Input
                  id="audio_file"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFormData({ ...formData, audio_file: e.target.files?.[0] || null })}
                  required
                />
                {formData.audio_file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.audio_file.name} ({(formData.audio_file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="artwork_file">Show Artwork (Optional)</Label>
                <Input
                  id="artwork_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, artwork_file: e.target.files?.[0] || null })}
                />
                {formData.artwork_file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.artwork_file.name}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="submission_notes">Notes for Program Director</Label>
              <Textarea
                id="submission_notes"
                value={formData.submission_notes}
                onChange={(e) => setFormData({ ...formData, submission_notes: e.target.value })}
                rows={3}
                placeholder="Add any additional information or special requests..."
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/staff/shows/submissions')}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !formData.audio_file}>
                <Upload className="w-4 h-4 mr-2" />
                Submit Show
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
