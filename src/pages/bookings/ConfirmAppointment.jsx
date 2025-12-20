import Modal from "@/components/Modal";
import React, { useState } from "react";

export default function ConfirmAppointment() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {isOpen && (
        <Modal
          onClose={() => setIsOpen(false)}
          title="Confirm"
          description="We have sent a confirmation code to the client’s email. Enter this 6-digit code to confirm that you are at customer’s residence and about to provide service"
          primaryButton="Cancel"
          secondaryButton="Confirm"
          styles={{
            wrapper: "max-w-xs md:max-w-sm relative",
            content: "relative",
            title: "text-lg font-bold text-left text-black relative",
            description: "text-sm text-gray-500 text-left mt-2",
            body: "mt-4",
            footer: "flex justify-between gap-3 mt-6",
            primaryButton: "bg-primary-50 text-primary-700 rounded-4xl px-6 py-3 text-sm font-semibold w-full",
            secondaryButton: "bg-primary-500 text-grey-50 rounded-4xl px-6 py-3 text-sm font-semibold w-full",
            closeIconWrapper: "absolute top-6 right-5 z-10",
            closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
            closeIcon: "w-6 h-6",
          }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmation Code
          </label>
          <input
            type="text"
            placeholder="Type code"
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 text-sm placeholder-gray-400 focus:outline-none"
          />
        </Modal>
      )}
    </>
  );
}