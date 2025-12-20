import Modal from '@/components/Modal'
import React from 'react'

const WithdrawalSuccessModal = () => {
    return (
        <Modal
            image="/assets/accept.svg"
            title="Withdrawal successful"
            description="Your account will be credited within 24hrs"
            primaryButton='View Receipt'
            secondaryButton='Done'
            styles={
                {
                    wrapper: "max-w-xs md:max-w-md",
                    footer: "flex flex-col md:flex-row gap-6 mt-20 w-full",
                    primaryButton: "w-full px-5 py-3  bg-primary-50 text-primary-700 rounded-4xl",
                    secondaryButton: "w-full px-5 py-3  text-grey-50 bg-primary-500 rounded-4xl",
                }
            }
        />
    )
}

export default WithdrawalSuccessModal