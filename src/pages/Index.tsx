import MadeToHikeApp from '../components/MadeToHikeApp';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div>
      <div className="fixed top-4 right-4 z-50 space-x-2">
        <Link to="/auth?mode=signup">
          <Button variant="outline">Sign Up</Button>
        </Link>
        <Link to="/auth?mode=signin">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
      <MadeToHikeApp />
    </div>
  );
};

export default Index;
