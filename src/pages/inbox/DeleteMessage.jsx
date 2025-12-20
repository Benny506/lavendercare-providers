import Modal from '@/components/Modal'
import React from 'react'

const DeleteMessage = () => {
    return (
        <Modal
            image="/assets/ancient.svg"
            title="Delete messages"
            description="Are you sure you want to permanently erase this chat history"
            primaryButton='No, Cancel'
            secondaryButton='Yes, Delete'
            styles={{
                wrapper: "max-w-xs md:max-w-md",
                imageWrapper: "flex justify-center m-10",
                description: "text-center text-grey-500 mt-2 mb-15",
                footer: "flex flex-col gap-3 mt-6 w-full",
                primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
                secondaryButton: "w-full px-5 py-3 text-error-700 rounded-4xl font-semibold"
            }}
        />
    )
}

export default DeleteMessage