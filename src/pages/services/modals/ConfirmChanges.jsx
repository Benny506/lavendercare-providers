import Modal from "@/components/Modal"
import { useState } from "react"

const ConfirmChanges = () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div>
            {isOpen && (
                <Modal
                    onClose={() => setIsOpen(false)}
                    image="/assets/brush-red.svg"
                    title="Confirm Changes"
                    description={
                        <p>
                            You currently have <span className="font-semibold text-primary-500">2 upcoming</span> appointments for this service.
                            Are you sure you want to save these changes?
                        </p>
                    }
                    primaryButton="Cancel, but keep Appointments"
                    secondaryButton="Cancel all appointments"
                    styles={{
                        wrapper: "max-w-xs md:max-w-md",
                        closeIconWrapper: "absolute top-25 md:top-10 right-10 z-10",
                        closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                        closeIcon: "w-6 h-6",
                        image: "mt-10",
                        description: "text-center text-grey-500 mt-2 mb-20",
                        footer: "flex flex-col gap-3 mt-6 w-full",
                        primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
                        secondaryButton: "w-full px-5 py-3 text-error-700 font-semibold"
                    }}
                />
            )
            }
        </div>
    )
}

export default ConfirmChanges