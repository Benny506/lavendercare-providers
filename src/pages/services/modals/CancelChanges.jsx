import Modal from "@/components/Modal"

const CancelChanges = () => {
    return (
        <Modal
            image="/assets/brush-blue.svg"
            title="Cancel Changes"
            description='Cancelling your changes will revert your service details to its former state and place it back on the LavenderCare shop'
            primaryButton="Yes, cancel changes"
            secondaryButton="No, go back"
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                image: "mt-10",
                description: "text-center text-grey-500 mt-2 mb-20",
                footer: "flex flex-col gap-3 mt-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-error-600 text-grey-50 rounded-4xl font-semibold mb-1",
                secondaryButton: "w-full px-5 py-3 bg-primary-50 text-primary-700 rounded-4xl font-semibold"
            }}
        />
    )
}

export default CancelChanges