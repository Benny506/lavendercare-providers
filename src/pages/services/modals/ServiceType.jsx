import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal"
import { ErrorMessage, Formik } from "formik";
import { Info, Tag } from "lucide-react";
import React from "react";
import * as yup from 'yup'
import DurationPicker from "@/components/ui/DurationPicker";

const ServiceType = ({
    isOpen,
    hide,
    info = {},
    continueBtnText,
    scheduling_mode,
    handleContinueBtnClick = () => { }
}) => {
    // Mode-specific logic
    const isInstant = scheduling_mode === "instant";
    const isLogistics = scheduling_mode === "logistics";
    const isBlock = scheduling_mode === "block";
    const isProgram = scheduling_mode === "program";

    // Instant is ALWAYS virtual. Others are NEVER virtual.
    const is_virtual = isInstant;

    return (
        <>
            {isOpen && (
                <Formik
                    enableReinitialize
                    validationSchema={
                        yup.object().shape({
                            type_name: yup.string().required("Give this tier a name (e.g. Basic Session)"),
                            price: yup.number().required("How much do you charge?").min(1, "Price must be at least 1"),
                            duration: yup.number().required("How long is this session/shift?").min(1, "Must have a duration"),
                        }).test('program-min-days', 'Programs must be at least 1 day long', function(values) {
                            if (isProgram && values.duration < 1 * 24 * 60 * 60) {
                                return this.createError({ path: 'duration', message: 'Programs must be at least 1 day' });
                            }
                            return true;
                        }).test('instant-max-hrs', 'Instant sessions cannot exceed 24 hours', function(values) {
                            if (isInstant && values.duration >= 24 * 60 * 60) {
                                return this.createError({ path: 'duration', message: 'Instant sessions must be less than 24 hours' });
                            }
                            return true;
                        })
                    }
                    initialValues={{
                        type_name: info?.type_name || "",
                        price: info?.price || info?.fee || "",
                        duration: info?.duration || "", // In seconds
                        currency: info?.currency || "NGN",
                        is_virtual: is_virtual,
                    }}
                    onSubmit={values => {
                        handleContinueBtnClick({
                            requestInfo: { ...values, is_virtual },
                            info
                        })
                    }}
                >
                    {({ handleBlur, handleChange, handleSubmit, values, setFieldValue }) => (
                        <Modal
                            title={isInstant ? "Set Instant Session Pricing" : isProgram ? "Set Program Duration & Fee" : "Set Pricing & Timing"}
                            secondaryButton={continueBtnText || "Save Tier"}
                            onClose={hide}
                            secondaryButtonFunc={handleSubmit}
                            styles={{
                                wrapper: "max-w-md relative",
                                content: "relative",
                                title: "text-xl font-bold text-left text-black relative",
                                footer: "flex gap-6 mt-10 w-full font-bold",
                                secondaryButton: "w-full px-5 py-3 text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-all shadow-lg shadow-primary-200",
                            }}
                        >
                            <div className="space-y-6">
                                {/* Guidance Tip */}
                                <div className="bg-primary-50 p-4 rounded-xl flex gap-3 items-start border border-primary-100">
                                    <Info className="text-primary-500 shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs text-primary-800 leading-relaxed">
                                        {isInstant && "Instant sessions are 1-on-1 virtual calls. Mothers book these for immediate help."}
                                        {isProgram && "Programs are long-term commitments (at least 1 day). Perfect for specialized care packages."}
                                        {isLogistics && "For logistics, mothers want to know how soon they'll get their items back."}
                                        {isBlock && "Blocks allow mothers to book you for a set number of hours or days."}
                                    </p>
                                </div>

                                {/* Tier Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Tag size={16} className="text-gray-400" />
                                        Tier Name
                                    </label>
                                    <input
                                        name="type_name"
                                        value={values.type_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g. Standard Session, Weekend Premium"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                                    />
                                    <ErrorMessage name="type_name">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">
                                        {isInstant ? "Session Length" : isProgram ? "Program Length" : isLogistics ? "Delivery Window" : "Shift Duration"}
                                    </label>
                                    <DurationPicker
                                        value={values.duration}
                                        onChange={(val) => setFieldValue("duration", val)}
                                        allowedUnits={
                                            isInstant ? ["hours"] :
                                            isProgram ? ["days"] :
                                            ["hours", "days"]
                                        }
                                        label={null} // Label is handled by parent
                                    />
                                    {isLogistics && <p className="text-xs text-gray-500 italic mt-1">When should the mother expect their items back?</p>}
                                    <ErrorMessage name="duration">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Price (NGN)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₦</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={values.price}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g. 5000"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <ErrorMessage name="price">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                {/* Status Info */}
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className={`w-2 h-2 rounded-full ${is_virtual ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <p className="text-xs font-medium text-gray-600">
                                        This tier will be <span className="text-gray-900 font-bold">{is_virtual ? "Virtual" : "Physical"}</span>
                                    </p>
                                </div>
                            </div>
                        </Modal>
                    )}
                </Formik >
            )}
        </>
    )
}

export default ServiceType;