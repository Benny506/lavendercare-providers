import AuthForm from "@/components/AuthForm";

export default function PasswordRecovered() {
  return (
    <AuthForm
      image="/assets/accept.svg"
      title="Password Recovered"
      description="You have successfully changed your password"
      buttonText="Goto Login"
      buttonLink="/login"
      styles={{
        wrapper: "bg-transparent max-w-sm mx-auto p-6",
        title: "text-grey-800 text-xl font-bold text-center",
        description: "text-gray-500 text-center",
        button: "w-full bg-primary-500 text-grey-50 text-base py-6 rounded-full font-bold mt-4",
      }}
    />
  );
}
