import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal"
import InputGroup from "@/components/ui/InputGroup";
import { ErrorMessage, Formik } from "formik";
import { Globe, Info } from "lucide-react";
import React from "react";
import * as yup from 'yup'

const ServiceLocation = ({
    isOpen,
    hide,
    info = {},
    continueBtnText,
    handleContinueBtnClick = () => { }
}) => {

    return (
        <>
            {isOpen && (
                <Formik
                    enableReinitialize
                    validationSchema={
                        yup.object().shape({
                            country: yup.string().required("Which country is this location in?"),
                            state: yup.string().required("State is required"),
                            city: yup.string().required("City or LGA is required"),
                            address: yup.string().required("Please provide the full street address"),
                        })
                    }
                    initialValues={{
                        country: info?.country || "Nigeria",
                        state: info?.state || "",
                        city: info?.city || "",
                        address: info?.address || "",
                    }}
                    onSubmit={values => {
                        handleContinueBtnClick({
                            requestInfo: values,
                            info
                        })
                    }}
                >
                    {({ handleBlur, handleChange, handleSubmit, values }) => (
                        <Modal
                            title="Add Business Location"
                            secondaryButton={continueBtnText || "Save Location"}
                            onClose={hide}
                            secondaryButtonFunc={handleSubmit}
                            styles={{
                                wrapper: "max-w-md relative",
                                content: "relative",
                                title: "text-xl font-bold text-left text-black relative",
                                footer: "flex gap-6 mt-10 w-full font-bold",
                                secondaryButton: "w-full px-5 py-3 text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-all",
                            }}
                        >
                            <div className="space-y-6">
                                {/* Help Tip */}
                                <div className="bg-primary-50 p-4 rounded-xl flex gap-3 items-start border border-primary-100">
                                    <Info className="text-primary-500 shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs text-primary-800 leading-relaxed">
                                        This location will be saved to your profile. You can link it to any of your services later.
                                    </p>
                                </div>

                                {/* Country */}
                                <InputGroup label="Country" icon={Globe}>
                                    <input
                                        value={values.country}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        name="country"
                                        placeholder="e.g. Nigeria"
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                    <ErrorMessage name="country">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </InputGroup>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* State */}
                                    <InputGroup label="State">
                                        <input
                                            value={values.state}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            name="state"
                                            placeholder="e.g. Lagos"
                                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        />
                                        <ErrorMessage name="state">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </InputGroup>

                                    {/* City */}
                                    <InputGroup label="City / LGA">
                                        <input
                                            value={values.city}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            name="city"
                                            placeholder="e.g. Ikeja"
                                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        />
                                        <ErrorMessage name="city">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </InputGroup>
                                </div>

                                {/* Specific Address */}
                                <InputGroup label="Full Street Address">
                                    <textarea
                                        placeholder="e.g. 123 Lavender Lane, Off Medical Road"
                                        name="address"
                                        value={values.address}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[100px] resize-none"
                                    />
                                    <ErrorMessage name="address">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </InputGroup>
                            </div>
                        </Modal>
                    )}
                </Formik >
            )}
        </>
    )
}

export default ServiceLocation