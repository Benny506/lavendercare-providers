import React from "react";
import { ErrorMessage } from "formik";
import { Briefcase, Layers } from "lucide-react";
import Card from "@/components/ui/Card";
import ErrorMsg1 from "@/components/ErrorMsg1";

const ServiceNatureSection = ({ service_type, license, setFieldValue, navigate, toast, isEditing }) => {
    return (
        <Card
            title="What kind of service is this?"
            subtitle="Help us understand the nature of this service"
            icon={Layers}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Healthcare Service */}
                <button
                    type="button"
                    onClick={() => {
                        if (isEditing) return;
                        if (license.status !== 'approved') return toast.info("License not submitted or not approved!")
                        setFieldValue("service_type", "healthcare")
                    }}
                    className={`relative text-left p-5 rounded-2xl border transition-all duration-200 group
                        ${service_type === "healthcare"
                            ? "border-primary-500 bg-primary-50 ring-2 ring-primary-300"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                        } ${isEditing ? "cursor-not-allowed grayscale-[0.8] opacity-70" : ""}`}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={`p-3 rounded-xl transition
                                ${service_type === "healthcare"
                                    ? "bg-primary-500 text-white"
                                    : "bg-primary-100 text-primary-600"
                                }`}
                        >
                            <Briefcase size={22} />
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-base">Healthcare Service</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Professional health-related services that require formal
                                training and valid licensing to offer legally and ethically.
                            </p>
                            <div className="text-xs text-gray-500">
                                <span className="font-medium text-gray-600">Examples:</span> Therapy, counseling, physiotherapy
                            </div>

                            {license?.status !== 'approved' && (
                                <div className="mt-5">
                                    <hr />
                                    <p className="mt-3 text-xs text-gray-800 leading-relaxed">
                                        Your license document has either not been approved or submitted
                                    </p>
                                    <p
                                        onClick={e => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            navigate("/settings")
                                        }}
                                        className="clickable text-xs text-purple-600 underline cursor-pointer"
                                    >
                                        Go to profile
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {service_type === "healthcare" && (
                        <span className="absolute top-3 right-3 text-xs font-semibold text-primary-600 bg-white px-2 py-1 rounded-full shadow">
                            Selected
                        </span>
                    )}
                </button>

                {/* Domestic Service */}
                <button
                    type="button"
                    onClick={() => {
                        if (isEditing) return;
                        setFieldValue("service_type", "domestic");
                    }}
                    className={`relative text-left p-5 rounded-2xl border transition-all duration-200 group
                        ${service_type === "domestic"
                            ? "border-primary-500 bg-primary-50 ring-2 ring-primary-300"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                        } ${isEditing ? "cursor-not-allowed grayscale-[0.8] opacity-70" : ""}`}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={`p-3 rounded-xl transition
                                ${service_type === "domestic"
                                    ? "bg-primary-500 text-white"
                                    : "bg-primary-100 text-primary-600"
                                }`}
                        >
                            <Layers size={22} />
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-base">Domestic Service</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Practical, non-medical services that do not require professional
                                healthcare licensing.
                            </p>
                            <div className="text-xs text-gray-500">
                                <span className="font-medium text-gray-600">Examples:</span> Laundry, cleaning, beauty services
                            </div>
                        </div>
                    </div>
                    {service_type === "domestic" && (
                        <span className="absolute top-3 right-3 text-xs font-semibold text-primary-600 bg-white px-2 py-1 rounded-full shadow">
                            Selected
                        </span>
                    )}
                </button>
            </div>
            <ErrorMessage name="service_type">
                {errorMsg => <ErrorMsg1 className="mt-4" errorMsg={errorMsg} />}
            </ErrorMessage>
        </Card>
    );
};

export default ServiceNatureSection;
