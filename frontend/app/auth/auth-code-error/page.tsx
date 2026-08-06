import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const AuthCodeErrorPage = () => {
  return (
    <div>
      <div>
        <div>
          <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div>Link Expired or Invalid</div>
        <p>
          Your sign-in link has expired or has already been used. Please return
          to the login page and request a new one.
        </p>
        <Link href="/">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default AuthCodeErrorPage;
