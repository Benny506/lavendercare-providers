import Modal from '@/components/Modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from "@iconify/react"
import Image from '@/components/ui/image'
import React from 'react'
import { useState } from 'react'

const TransactionDetailsModal = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {isOpen && (
                <Modal
                    title="Transaction details"
                    onClose={() => setIsOpen(false)}
                    primaryButton='Share Receipt'
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
                    <div className="text-center mb-6 text-grey-700">
                        <div className="flex justify-center mb-4">
                            <Image src="assets/cash.svg" className="w-16 h-16" />
                        </div>
                        <div className="text-3xl font-bold">$30,010</div>
                        <div className="text-sm">Nov. 11, 2023 - 12:48am</div>
                    </div>

                    <div className='bg-grey-100 rounded-lg p-4'>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-grey-600">Status</span>
                                <Badge variant="default" className="bg-success-50 text-success-700 rounded-4xl py-2 px-3">
                                    Successful
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-grey-400">Recipient</span>
                                <span className="text-sm font-bold text-grey-600">John Doe</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-grey-400">Bank</span>
                                <span className="text-sm font-bold text-grey-600">Firstbank</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-grey-400">Fee</span>
                                <span className="text-sm font-bold text-grey-600">$10</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-grey-400">Reference ID</span>
                                <span className="text-sm font-bold text-grey-600">12392884218WERSDDAAI</span>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-dashed border-t-grey-500">
                                <span className="text-sm font-bold">Total Debit</span>
                                <span className="text-sm font-bold">$30010</span>
                            </div>
                        </div>
                    </div>

                </Modal>
            )}
        </>
    )
}

export default TransactionDetailsModal