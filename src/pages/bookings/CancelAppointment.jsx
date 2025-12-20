import Modal from '@/components/Modal'
import React from 'react'

const CancelAppointment = () => {
    return (
        <Modal
            image="/assets/brush-red.svg"
            title="Cancel Appointment"
            description="Are you sure you want to cancel this appointment. This is irreversible"
            primaryButton='Yes, Cancel'
            secondaryButton='No, Go back'
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                image: "mt-10",
                description: "text-center text-grey-500 mt-2 mb-20",
                footer: "flex flex-col gap-3 mt-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-error-500 text-grey-50 rounded-4xl font-semibold mb-1",
                secondaryButton: "w-full px-5 py-3 bg-primary-50 text-primary-700 rounded-4xl font-semibold"
            }}
        />
    )
}

export default CancelAppointment