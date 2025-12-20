import Modal from '@/components/Modal'
import { Input } from '@/components/ui/input'
import React from 'react'

const ConfirmWithdrawalModal = () => {
    return (
        <Modal
            image="/assets/achievement.svg"
            title="Confirm"
            description="Enter your password to confirm this withdrawal"
            primaryButton='Cancel'
            secondaryButton='Confirm'
            styles={
                {
                    wrapper: "max-w-xs md:max-w-md",
                    footer: "flex gap-6 mt-6 w-full",
                    primaryButton: "w-full px-5 py-3  bg-primary-50 text-primary-700 rounded-4xl",
                    secondaryButton: "w-full px-5 py-3  text-grey-50 bg-primary-500 rounded-4xl",
                }
            }
        >
            <div className="space-y-4">
                <Input
                    type="password"
                    placeholder="Enter password"
                />

                <div>
                    <Input
                        type="text"
                        placeholder="Enter Email OTP"
                        maxLength={6}
                    />
                    <label className='text-grey-500 text-sm p-1'>Type 6-digit code sent to your email</label>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmWithdrawalModal