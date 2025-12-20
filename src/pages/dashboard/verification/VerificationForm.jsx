import Modal from '@/components/Modal';
import { Icon } from '@iconify/react';
import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

const VerificationForm = () => {
    return (
        <>
            <style>
                {`
                    /* Hide scrollbar but keep scroll functionality */
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            <Modal
                title="Verify Account"
                primaryButton="Submit"
                styles={{
                    wrapper: "max-w-xs md:max-w-md",
                    body: "mt-4 max-h-[480px] overflow-y-scroll no-scrollbar pr-1",
                    footer: "flex justify-end",
                    primaryButton: "bg-primary-500 rounded-4xl w-35 py-3 ",
                }}
            >
                <form className="space-y-5">
                    {/* Govt. ID */}
                    <div>
                        <label className="text-sm text-grey-600 mb-1 block">Govt. ID</label>
                        <Select>
                            <SelectTrigger className="w-full border border-grey-200 rounded-md">
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="national-id">National ID</SelectItem>
                                <SelectItem value="drivers-license">Driver's License</SelectItem>
                                <SelectItem value="passport">International Passport</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="border border-grey-200 rounded-xl px-4 py-5 flex flex-col items-center text-center my-4">
                            <Icon icon="lucide:cloud-upload" className="text-3xl text-gray-400 mb-2" />
                            <div className="text-sm font-medium mb-1">Choose a file or drag & drop it here</div>
                            <div className="text-xs text-gray-500 mb-3">PDF, JPG or PNG. Max 10 MB</div>
                            <button type="button" className="border border-gray-300 rounded px-4 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100">Browse File</button>
                        </div>
                    </div>

                    {/* Utility Bill */}
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Utility Bill</label>
                        <Select>
                            <SelectTrigger className="w-full border border-gray-300 rounded-md">
                                <SelectValue placeholder="Select bill type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="electricity">Electricity Bill</SelectItem>
                                <SelectItem value="water">Water Bill</SelectItem>
                                <SelectItem value="internet">Internet Bill</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="border border-gray-300 rounded-xl px-4 py-5 flex flex-col items-center text-center mt-4">
                            <Icon icon="lucide:cloud-upload" className="text-3xl text-gray-400 mb-2" />
                            <div className="text-sm font-medium mb-1">Choose a file or drag & drop it here</div>
                            <div className="text-xs text-gray-500 mb-3">PDF, JPG or PNG. Max 10 MB</div>
                            <button type="button" className="border border-gray-300 rounded px-4 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100">Browse File</button>
                        </div>
                    </div>

                    {/* Upload CAC */}
                    <div>
                        <label className="text-sm text-gray-600 mb-3 block">Upload CAC Document</label>
                        <div className="border border-gray-300 rounded-xl px-4 py-5 flex flex-col items-center text-center mb-2">
                            <Icon icon="lucide:cloud-upload" className="text-3xl text-gray-400 mb-2" />
                            <div className="text-sm font-medium mb-1">Choose a file or drag & drop it here</div>
                            <div className="text-xs text-gray-500 mb-3">PDF, JPG or PNG. Max 10 MB</div>
                            <button type="button" className="border border-gray-300 rounded px-4 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100">Browse File</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default VerificationForm;
