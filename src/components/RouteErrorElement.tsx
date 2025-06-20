
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function RouteErrorElement() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-2">
          The page you're looking for doesn't exist.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Path: {location.pathname}
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Reload page
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="gap-1"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
