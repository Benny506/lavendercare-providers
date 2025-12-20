import Modal from '@/components/Modal'
import { Input } from '@/components/ui/input'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Icon } from "@iconify/react"
import React from 'react'
import { useState } from 'react'

const WithdrawModal = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {isOpen && (
                <Modal
                    title="Withdraw funds"
                    onClose={() => setIsOpen(false)}
                    // width="max-w-md"
                    primaryButton='Withdraw'
                    styles={{
                        wrapper: "max-w-xs md:max-w-sm relative",
                        content: "relative",
                        title: "text-lg font-bold text-left text-black relative",
                        closeIconWrapper: "absolute top-6 right-5 z-10",
                        closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                        closeIcon: "w-6 h-6",
                        footer: "flex justify-end mt-4",
                        primaryButton: "bg-primary-500 text-grey-50 py-3 px-5 rounded-4xl"
                    }}
                >
                    <div>
                        <div className="p-4 flex flex-col items-center justify-center gap-1.5">
                            <div className="flex justify-between items-center gap-2">
                                <Icon icon="ic:outline-account-balance-wallet" className="w-6 h-6 text-success-500" />
                                <span className="text-sm text-gray-600">Available Balance</span>
                            </div>
                            <div className="text-3xl font-semibold text-grey-800">₦7,200,000.00</div>
                        </div>

                        <div className='my-2 w-full'>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-500 font-bold">$</span>
                                <Input
                                    type="number"
                                    placeholder="Enter Amount"
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className='my-2 w-full'>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary</label>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select beneficiary" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="john-doe">John Doe</SelectItem>
                                    <SelectItem value="jane-doe">Jane Doe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    )
}

export default WithdrawModal