import Modal from "@/components/Modal";
import { MessageSquareWarning, Redo, Trash } from "lucide-react";

const primary = "#703dcb";

export default function FailedMsgModal({
    isOpen,
    onClose,
    onResend,
    onDelete,

    title = "Message Failed",
    prompt = "This message could not be delivered. What would you like to do?",
}) {
    return (
        isOpen
        &&
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col items-center text-center gap-5">
                {/* Icon */}
                <div className="bg-red-100 text-red-600 p-4 rounded-full shadow-md">
                    <MessageSquareWarning size={30} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold">{title}</h2>

                {/* Prompt */}
                <p className="text-gray-600 max-w-md">{prompt}</p>

                {/* Actions */}
                <div className="flex gap-4 mt-4 w-full justify-center">
                    {/* Delete */}
                    <button
                        onClick={() => {
                            onDelete?.();
                            onClose();
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash />
                        Delete
                    </button>

                    {/* Resend */}
                    <button
                        onClick={() => {
                            onResend?.();
                            onClose();
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-white shadow-md hover:opacity-90 transition"
                        style={{ background: primary }}
                    >
                        <Redo />
                        Resend
                    </button>
                </div>
            </div>
        </Modal>
    );
}
