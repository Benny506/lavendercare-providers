import AuthForm from "@/components/AuthForm";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function EnterOtp() {
    const navigate = useNavigate()
    return (
        <div>
            <button 
                type="button" 
                className="absolute top-16 md:top-20 left-4 md:left-20 z-50 flex items-center gap-2 cursor-pointer text-primary-600"
                onClick={() => navigate(-1)}
            >
                <span className="text-2xl">
                    <Icon icon="ph:arrow-left" />
                </span>
                <span className="font-semibold text-lg">Back</span>
            </button>

            <AuthForm
                image="/assets/email-icon.svg"
                title="Enter OTP"
                description="Enter the 6-digit code we have sent to"
                descriptionInner={
                    <span
                        className="text-grey-700 font-extrabold"
                    >
                        janed****@gmail.com
                    </span>
                }
                fields={[{ label: "", type: "hidden", placeholder: "" }]}
                customFields={{
                    0: (
                        <div className="flex flex-col items-center gap-4 mt-2">
                            <div className="flex justify-center gap-3">
                                {Array(6)
                                    .fill("")
                                    .map((_, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            className="w-11 md:w-12 h-12 text-center border border-gray-300 rounded-lg text-lg bg-gray-50 focus:outline-none"
                                            maxLength={1}
                                        />
                                    ))}
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="font-bold">00:30</span>
                            </p>
                        </div>
                    ),
                }}
                buttonText="Recover password"
                buttonLink="/recover-password/new-password"
                footerText="I entered the wrong Email."
                footerLink="/recover-password"
                footerLinkText="Change Email"
                styles={{
                    wrapper: "max-w-sm mx-auto p-2 md:p-6",
                    title: "text-xl font-bold text-center text-gray-800",
                    description: "text-gray-500 text-center",
                    button: "w-full bg-primary-500 text-grey-50 text-base py-6 rounded-full font-bold mt-2",
                    footerText: "text-grey-500 text-center mt-2",
                    footerLink: "text-primary-500 font-bold cursor-pointer"
                }}
            />
        </div>

    );
}
