import Modal from "@/components/Modal"

const CancelChangesSuccess = () => {
    return (
        <Modal
            image="/assets/accept.svg"
            title="Success"
            description='All changes have been cancelled and your service has been placed back on the LavenderCare shop.'
            primaryButton="Done"
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                image: "mt-10",
                description: "text-center text-grey-500 mt-2 mb-10",
                footer: "flex flex-col gap-3 my-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
            }}
        />
    )
}

export default CancelChangesSuccess