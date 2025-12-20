import Modal from '@/components/Modal'

const ShowServiceSuccess = () => {
    return (
        <Modal
            image="/assets/accept.svg"
            title="Successful"
            description="This service is now active on the LavenderCare shop"
            primaryButton='Done'
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                image: "mt-5",
                description: "text-center text-grey-500 mt-2 mb-10",
                footer: "flex flex-col gap-3 mt-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
            }}
        />
    )
}

export default ShowServiceSuccess