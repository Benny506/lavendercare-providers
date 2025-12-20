import Modal from '@/components/Modal'

const ConfirmChangesProgress = () => {
    return (
        <Modal
            image="/assets/loading-orange.svg"
            title="Review in progress"
            description="We are currently reviewing your service. This process takes up to 48hrs. You will be notified via email once our team is done. If it meets all our requirements, this service will be added to the LavenderCare store"
            primaryButton='I understand'
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

export default ConfirmChangesProgress