import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal"
import InputGroup from "@/components/ui/InputGroup";
import { ErrorMessage, Formik } from "formik";
import { Globe, X } from "lucide-react";
import React, { useState } from "react";
import * as yup from 'yup'

const minDuration = 15 * 60

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
                            country: yup.string().required("Country is required"),
                            state: yup.string().required("State is required"),
                            city: yup.string().required("City is required"),
                            address: yup.string().required("Address is required"),
                        })
                    }
                    initialValues={{
                        country: info?.country || "",
                        state: info?.state || "",
                        city: info?.city || "",
                        address: info?.address || "",
                    }}
                    onSubmit={values => {
                        const requestInfo = values

                        handleContinueBtnClick({
                            requestInfo: values,
                            info
                        })
                    }}
                >
                    {({ handleBlur, handleChange, handleSubmit, values, setFieldValue }) => (
                        <Modal
                            title="Set Pricing & Duration"
                            // primaryButton="Go back"
                            secondaryButton={continueBtnText || "Save"}
                            onClose={hide}
                            secondaryButtonFunc={handleSubmit}
                            // primaryButtonFunc={goBackAStep}
                            styles={{
                                wrapper: "max-w-sm relative",
                                content: "relative",
                                title: "text-lg font-bold text-left text-black relative",
                                closeIconWrapper: "absolute top-6 right-5 z-10",
                                closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                                closeIcon: "w-6 h-6",
                                footer: "flex gap-6 mt-10 w-full font-bold",
                                primaryButton: "w-full px-5 py-3  bg-primary-50 text-primary-700 rounded-4xl",
                                secondaryButton: "w-full px-5 py-3  text-grey-50 bg-primary-500 rounded-4xl",
                            }}
                        >
                            <div className="space-y-4">
                                {/* Country */}
                                <InputGroup label="Country" icon={Globe}>
                                    <input
                                        value={values.country}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        name="country"
                                        placeholder="Country"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <ErrorMessage name="country">
                                        {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </InputGroup>

                                {/* State */}
                                <InputGroup label="State">
                                    <input
                                        value={values.state}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        name="state"
                                        placeholder="State"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <ErrorMessage name="state">
                                        {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </InputGroup>

                                {/* City */}
                                <InputGroup label="City / LGA">
                                    <input
                                        value={values.city}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        name="city"
                                        placeholder="City/Local Govt Area"
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <ErrorMessage name="city">
                                        {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </InputGroup>

                                {/* Specific Address */}
                                <InputGroup label="Specific Address">
                                    <input
                                        placeholder="Address"
                                        name="address"
                                        value={values.address}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                    <ErrorMessage name="address">
                                        {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
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