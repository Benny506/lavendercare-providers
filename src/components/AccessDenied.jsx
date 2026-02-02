// AccessDenied.jsx
import { Lock } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied = ({ message }) => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh' }} className="flex items-center justify-center h-full p-6 bg-gray-50">
            <div className="bg-white shadow-lg rounded-xl p-10 flex flex-col items-center text-center max-w-md">
                <Lock className="text-[#703DCB] w-16 h-16 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-6">
                    {message || "You do not have permission to view this page."}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-[#703DCB] text-white font-medium rounded-lg hover:bg-[#5a2fb5] transition-colors duration-200"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;
