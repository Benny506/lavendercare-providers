import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal"
import { currencies } from "@/constants/constant";
import { formatNumberWithCommas, secondsToLabel, splitSeconds, timeToAMPM_FromHour_Duration } from "@/lib/utils";
import { ErrorMessage, Formik } from "formik";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as yup from 'yup'

const minDuration = 15 * 60

const ServiceType = ({
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
                            // pricing_type: yup.string().required('Pricing type is required'),
                            currency: yup.string().required("Currency is required"),
                            type_name: yup.string().required("Type name is required"),
                            price: yup.number("Must be a valid number").min(1, "Cannot be less than 1").required("Price is required"),
                            duration_hour: yup
                                .number("Must be a valid number")
                                .max(24, "Hour cannot exceed 24"),
                            duration_minutes: yup
                                .number("Must be a valid number")
                                .max(59, "Minutes cannot exceed 59"),
                            is_virtual: yup
                                .boolean()
                                .required("Please specify if this service is virtual"),
                        })
                    }
                    initialValues={{
                        currency: info?.currency,
                        price: info?.price,
                        type_name: info?.type_name,
                        duration_hour: splitSeconds(info?.duration)?.hour,
                        duration_minutes: splitSeconds(info?.duration)?.minutes,
                        is_virtual: info?.is_virtual || false
                    }}
                    onSubmit={(values, { resetForm }) => {
                        const hourSecs = (values.duration_hour ? (Number(values.duration_hour) * 60 * 60) : 0)
                        const minSecs = (values.duration_minutes ? (Number(values.duration_minutes) * 60) : 0)

                        const duration = hourSecs + minSecs

                        if (isNaN(duration)) return toast.error("Duration inputs are invalid, recheck!");

                        if(hourSecs < 0 || minSecs < 0) return toast.error("Hour and/or minutes cannot be negative")

                        if (duration < minDuration) return toast.error("Duration must be at least 15mins!");

                        const requestInfo = {
                            currency: values.currency,
                            price: values.price,
                            duration,
                            type_name: values.type_name,
                            is_virtual: values?.is_virtual
                        }

                        handleContinueBtnClick({
                            requestInfo,
                            info
                        })

                        // resetForm()
                    }}
                >
                    {({ handleBlur, handleChange, handleSubmit, values, setFieldValue }) => (
                        <Modal
                            title="Set session type"
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
                                {/* <div>
                                    <label className="block text-sm font-medium">Pricing type</label>
                                    <select 
                                        name="pricing_type"
                                        value={values.pricing_type}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    >
                                        <option value={""} disabled selected>Select</option>
                                        <option value={'fixed'}>Fixed</option>
                                        <option value={'hourly'}>Hourly</option>
                                    </select>
                                    <ErrorMessage name="pricing_type">
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                    </ErrorMessage>
                                </div> */}

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="is_virtual"
                                        checked={values.is_virtual || false}
                                        onChange={e => {
                                            setFieldValue("is_virtual", e.target.checked)
                                        }}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <label className="text-sm font-medium">This is a virtual service</label>
                                    <ErrorMessage name="is_virtual">
                                        {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                <div className="">
                                    <label className="block text-sm font-medium">Session-type name</label>
                                    <input
                                        name="type_name"
                                        value={values.type_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="text"
                                        placeholder="basic, standard, premium...?"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    />
                                    <ErrorMessage name="type_name">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">Currency</label>
                                    <select
                                        name="currency"
                                        value={values.currency}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    >
                                        <option value={""} disabled selected>Select</option>
                                        {
                                            currencies.map((c, cIndex) => (
                                                <option
                                                    key={cIndex}
                                                    value={c}
                                                >
                                                    {c}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <ErrorMessage name="currency">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                <div className="">
                                    <label className="block text-sm font-medium">Hour duration</label>
                                    <input
                                        name="duration_hour"
                                        value={values.duration_hour}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    />
                                    <ErrorMessage name="duration_hour">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                <div className="">
                                    <label className="block text-sm font-medium">Additional minutes</label>
                                    <input
                                        name="duration_minutes"
                                        value={values.duration_minutes}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    />
                                    <ErrorMessage name="duration_minutes">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>

                                <div className="">
                                    <label className="block text-sm font-medium">Price</label>
                                    <input
                                        name="price"
                                        value={values.price}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    />
                                    <ErrorMessage name="price">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>
                                </div>
                            </div>
                        </Modal>
                    )}
                </Formik >
            )}
        </>
    )
}

export default ServiceType