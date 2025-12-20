import Modal from '@/components/Modal'

const InProgress = () => {
    return (
        <Modal
            image="/assets/loading.svg"
            title="Verification in progress"
            description="We are currently verifying your Information. This process takes up to 48hrs. You will be notified via email on the status of your application"
            primaryButton='I understand'
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold my-10",
            }}
        />
    )
}

export default InProgress