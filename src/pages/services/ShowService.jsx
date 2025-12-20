import Modal from '@/components/Modal'

const ShowService = () => {
    return (
        <Modal
            image="/assets/brush.svg"
            title="Show this Service setting up"
            description="Switching this service to active will make it visible to LavenderCare users. Are you sure you want to make this service active"
            primaryButton='Proceed'
            secondaryButton='Cancel'
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                description: "text-center text-grey-500 mt-2 mb-20",
                footer: "flex flex-col gap-3 mt-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
                secondaryButton: "w-full px-5 py-3 bg-primary-50 text-primary-700 rounded-4xl font-semibold"
            }}
        />
    )
}

export default ShowService