import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal"
import { currencies } from "@/constants/constant";
import { formatNumberWithCommas, secondsToLabel, timeToAMPM_FromHour_Duration } from "@/lib/utils";
import { ErrorMessage, Formik } from "formik";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as yup from 'yup'

const durationsOptions = [
    { title: '15 mins', value: 15 * 60 },     // 900
    { title: '30 mins', value: 30 * 60 },     // 1800
    { title: '1 hour', value: 60 * 60 },      // 3600
];
const SetPricing = ({
    isOpen,
    hide,
    goBackAStep,
    info = {},
    handleContinueBtnClick = () => { },
    continueBtnText
}) => {

    return (
        <>
            {isOpen && (
                <Formik
                    validationSchema={yup.object().shape({
                        // pricing_type: yup.string().required('Pricing type is required'),
                        currency: yup.string().required("Currency is required"),
                        base_price: yup.string().matches(/^[0-9]+$/, "Only numbers are allowed").required("A valid base price is required"),
                        base_duration: yup.string().matches(/^[0-9]+$/, "Only numbers are allowed").required("A valid base duration is required"),
                    })}
                    initialValues={{
                        currency: info?.currency,
                        base_price: info?.base_price,
                        base_duration: info?.base_duration
                        // pricing_type: info?.pricing_type || '', 
                        // amount: info?.amount || ''
                    }}
                    onSubmit={values => {
                        handleContinueBtnClick({
                            ...values,                            
                        })
                    }}
                >
                    {({ handleBlur, handleChange, handleSubmit, values }) => (
                        <Modal
                            title="Set Pricing"
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
                                    <label className="block text-sm font-medium">Session duration</label>
                                    <select
                                        name="base_duration"
                                        value={values.base_duration}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="number"
                                        placeholder="Set a duration"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    >
                                        <option value={''} selected disabled>How long will this session last for?</option>
                                        {
                                            durationsOptions.map((d, i) => {
                                                const { title, value } = d

                                                return (
                                                    <option value={value}>
                                                        {title}
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                    <ErrorMessage name="base_duration">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                    </ErrorMessage>                                    
                                </div>

                                <div className="">
                                    <label className="block text-sm font-medium">Price per session</label>
                                    <input
                                        name="base_price"
                                        value={values.base_price}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:outline-none"
                                    />
                                    <ErrorMessage name="base_price">
                                        {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
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

export default SetPricing