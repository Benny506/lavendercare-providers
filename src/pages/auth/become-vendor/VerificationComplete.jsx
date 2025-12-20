import AuthForm from "@/components/AuthForm";
import { useNavigate } from "react-router-dom";

export default function VerificationComplete() {

  const navigate = useNavigate()

  const goToLogin = () => navigate('/login', { replace: true })

  return (
    <AuthForm
      image="/assets/accept.svg"
      title="Verification Complete"
      description="Your email has been successfully verified."
      buttonText="Go to login"
      buttonFunc={goToLogin}
      footerText=""
      styles={{
        wrapper: "bg-transparent max-w-sm mx-auto p-6",
        title: "text-grey-800 text-xl font-bold text-center",
        description: "text-gray-500 text-center",
        button: "w-full bg-primary-500 text-grey-50 text-base py-6 rounded-full font-bold mt-4 cursor-pointer",
      }}
    />
  );
}
