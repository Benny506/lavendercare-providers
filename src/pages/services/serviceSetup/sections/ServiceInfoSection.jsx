import React from "react";
import { ErrorMessage } from "formik";
import { Briefcase, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import InputGroup from "@/components/ui/InputGroup";
import ErrorMsg1 from "@/components/ErrorMsg1";

const ServiceInfoSection = ({ values, handleChange, handleBlur, allServices }) => {
    return (
        <Card title="General Service Information" subtitle="This is what mothers will see when browsing for your service." icon={Briefcase}>
            <div className="space-y-6">
                {/* Service Name */}
                <InputGroup label="What should mothers call this service?">
                    <input
                        name="service_name"
                        value={values.service_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 7-Day Omugwo Special, Weekend Laundry Express"
                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                    />
                    <div className="flex items-start gap-2 mt-2">
                        <Info size={14} className="text-gray-400 shrink-0 mt-1" />
                        <p className="text-xs text-gray-500">Pick a name that is clear and catchy. Avoid using just technical terms.</p>
                    </div>
                    <ErrorMessage name="service_name">
                        {errorMsg => <ErrorMsg1 className="mt-1" errorMsg={errorMsg} />}
                    </ErrorMessage>
                </InputGroup>

                {/* Service Category */}
                <InputGroup label="Where does this service fit best?">
                    <select
                        name="service_category"
                        value={values.service_category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white shadow-sm"
                    >
                        <option value={""}>Select a category</option>
                        {allServices.map((s, i) => (
                            <option key={i} value={s.service}>
                                {s.service}
                            </option>
                        ))}
                    </select>
                    <ErrorMessage name="service_category">
                        {errorMsg => <ErrorMsg1 className="mt-1" errorMsg={errorMsg} />}
                    </ErrorMessage>
                </InputGroup>

                {/* Service Details */}
                <InputGroup label="Tell mothers exactly what they'll get">
                    <textarea
                        placeholder="e.g. This 7-day program includes specialized massage for mother and baby, nutritional support, and nursery guidance..."
                        name="service_details"
                        value={values.service_details}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm min-h-[140px] resize-none"
                    />
                    <div className="flex items-start gap-2 mt-2">
                        <Info size={14} className="text-gray-400 shrink-0 mt-1" />
                        <p className="text-xs text-gray-500">Be descriptive! Tell them about the benefits, what is included, and any special value you bring.</p>
                    </div>
                    <ErrorMessage name="service_details">
                        {errorMsg => <ErrorMsg1 className="mt-1" errorMsg={errorMsg} />}
                    </ErrorMessage>
                </InputGroup>
            </div>
        </Card>
    );
};

export default ServiceInfoSection;
