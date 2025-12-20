import Modal from '@/components/Modal'
import React from 'react'

const ConfirmAppointmentSuccess = () => {
    return (
        <Modal
            image="/assets/accept.svg"
            title="Confirmed"
            description="This appointment is now marked as ongoing. Once service is completed. The client will click on completed on their LavenderCare App"
            primaryButton='I understand'
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

export default ConfirmAppointmentSuccess