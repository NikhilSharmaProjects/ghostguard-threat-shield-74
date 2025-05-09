
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <ShieldX className="h-20 w-20 text-ghost-400" />
        </div>
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The page you're looking for is either missing or doesn't exist. Let's get you back to safety.
        </p>
        <div className="pt-4">
          <Button asChild className="bg-ghost-400 hover:bg-ghost-500">
            <Link to="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
