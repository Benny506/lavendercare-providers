import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal"
import { currencies } from "@/constants/constant";
import { ErrorMessage, Formik } from "formik";
import React, { useState } from "react";
import * as yup from 'yup'

const SetServiceDetails = ({ 
        isOpen, 
        hide, 
        goBackAStep, 
        info={},
        handleContinueBtnClick=()=>{},
        continueBtnText
    }) => {

    return (
        <>
            {isOpen && (
                <Formik
                    validationSchema={yup.object().shape({
                        service_details: yup.string().required('Service details is required'),
                    })}
                    initialValues={{
                        service_details: info?.service_details || ''
                    }}
                    onSubmit={values => {
                        handleContinueBtnClick(values)
                    }}
                >
                    {({ handleBlur, handleChange, handleSubmit, values }) => (
                        <Modal
                            title="Set Details"
                            primaryButton="Go back"
                            secondaryButton={continueBtnText || "Continue"}
                            onClose={hide}
                            secondaryButtonFunc={handleSubmit}
                            primaryButtonFunc={goBackAStep}
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
                                <div>
                                    <label className="block text-sm font-medium">Service details</label>
                                    <textarea 
                                        name="service_details"
                                        value={values.service_details}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        style={{
                                            minHeight: '200px', minWidth: '100%'
                                        }}
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    />
                                    <ErrorMessage name="service_details">
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                    </ErrorMessage>
                                </div>
                            </div>
                        </Modal>
                    )}
                </Formik>
            )}
        </>
    )
}

export default SetServiceDetails