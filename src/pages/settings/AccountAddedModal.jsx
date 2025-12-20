import Modal from "@/components/Modal";

export default function AccountAddedModal() {
    return (
        <Modal
            image="/assets/accept.svg"
            title="Account Added"
            description="You have successfully added a new withdrawal account."
            primaryButton="Add New Bank"
            secondaryButton="Done"
            styles={
                {
                    wrapper: "max-w-xs md:max-w-md",
                    footer: "flex flex-col md:flex-row gap-6 mt-20 w-full font-bold",
                    primaryButton: "w-full px-5 py-3  bg-primary-50 text-primary-700 rounded-4xl",
                    secondaryButton: "w-full px-5 py-3  text-grey-50 bg-primary-500 rounded-4xl",
                }
            }
        />
    );
}
