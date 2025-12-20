import Modal from '@/components/Modal';

const VerifyAccount = () => {
    return (
        <Modal
            image="/assets/verify-account.svg"
            title="Verify your account"
            description="To ensure the safety of LavenderCare users, all service vendors must be verified. Complete your verification in a few easy steps."
            primaryButton="Get Started"
            secondaryButton="Verify account later"
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                description: "text-center text-grey-500 mt-2 mb-20",
                footer: "flex flex-col gap-3 mt-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
                secondaryButton: "w-full px-5 py-3 bg-primary-50 text-primary-700 rounded-4xl font-semibold"
            }}
        />
    );
};

export default VerifyAccount;
