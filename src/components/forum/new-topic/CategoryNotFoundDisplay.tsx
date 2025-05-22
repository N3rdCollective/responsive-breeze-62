
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const CategoryNotFoundDisplay = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-2">Category not found</p>
            <p className="text-muted-foreground mb-4">
              The forum category you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/members/forum">Back to Forum</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryNotFoundDisplay;
