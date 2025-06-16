
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus } from 'lucide-react';

interface AuthRequiredMessageProps {
  title: string;
  description: string;
  onSignInClick: () => void;
}

const AuthRequiredMessage: React.FC<AuthRequiredMessageProps> = ({
  title,
  description,
  onSignInClick
}) => {
  return (
    <Card className="text-center py-12 bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-muted-foreground/20">
      <CardHeader>
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onSignInClick} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Sign In to Access
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthRequiredMessage;
