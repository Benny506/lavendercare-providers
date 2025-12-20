import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { cities, countries, NigerianCities, services, states, vendorServicesOptions } from "@/constants/constant";
import { ErrorMessage, Formik } from "formik";
import { Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import * as yup from 'yup'


export default function DuplicateService({
    isOpen, 
    hide=()=>{}, 
    goBackAStep=()=>{}, 
    handleContinueBtnClick=()=>{},
    continueBtnText=null, 
}){

    return (
        <div>
            {isOpen && (
                <Formik
                    validationSchema={yup.object().shape({
                        location: yup.string().required("Service location is required"),
                        country: yup.string().required("Country is required"),
                        city: yup.string().required("City is required"),
                        state: yup.string().required("State is required")
                    })}
                    initialValues={{
                        location: '',
                        country: '',
                        city: '',
                        state: '',
                    }}
                    onSubmit={(values) => {
                        handleContinueBtnClick(values)
                    }}
                >
                    {({ values, isValid, dirty, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
                        <Modal
                            title="Same service, different location ?"
                            primaryButton="Save"
                            onClose={hide}
                            primaryButtonFunc={handleSubmit}
                            styles={{
                                wrapper: "max-w-md relative",
                                content: "relative",
                                title: "text-lg font-bold text-left text-black relative",
                                closeIconWrapper: "absolute top-6 right-5 z-10",
                                closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                                closeIcon: "w-6 h-6",
                                footer: "flex justify-end mt-4",
                                primaryButton:
                                    "bg-primary-500 text-white flex items-center gap-2 rounded-4xl !px-9 !py-3 !h-auto",
                            }}
                        >                           
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-grey-600 mb-1">Country</label>
                                    <select
                                        name="country"
                                        value={values.country}
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            setFieldValue("state", "")
                                            setFieldValue("city", "")
                                            setFieldValue("country", e.target.value)
                                        }}
                                        type="text"
                                        className="w-full border border-grey-300 rounded-md p-2"
                                    >
                                        <option value={''} selected disabled>
                                            Country where your service is located
                                        </option>
                                        {
                                            countries.map((c, i) => {
                                                const { title, value } = c

                                                return (
                                                    <option key={i} value={value}>
                                                        { title }
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                    <ErrorMessage name="country">
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                    </ErrorMessage>
                                </div> 

                                <div>
                                    <label className="block text-sm font-medium text-grey-600 mb-1">State</label>
                                    <select
                                        name="state"
                                        value={values.state}
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            setFieldValue("city", "")
                                            setFieldValue("state", e.target.value)
                                        }}
                                        type="text"
                                        className="w-full border border-grey-300 rounded-md p-2"
                                    >
                                        <option value={''} selected disabled>
                                            State where your service is located
                                        </option>
                                        {
                                            states.filter(s => s?.country === values?.country).map((s, i) => {
                                                const { title, value } = s

                                                return (
                                                    <option key={i} value={value}>
                                                        { title }
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                    <ErrorMessage name="state">
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                    </ErrorMessage>
                                </div> 

                                <div>
                                    <label className="block text-sm font-medium text-grey-600 mb-1">City</label>
                                    <select
                                        name="city"
                                        value={values.city}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full border border-grey-300 rounded-md p-2"
                                    >
                                        <option value={''} selected disabled>
                                            City where your service is located
                                        </option>
                                        {
                                            NigerianCities.filter(c => c?.state === values?.state)[0]?.lgas.map((c, i) => {
                                                return (
                                                    <option key={i} value={c}>
                                                        { c }
                                                    </option>
                                                )
                                            })
                                        }
                                    </select>
                                    <ErrorMessage name="city">
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                    </ErrorMessage>
                                </div>                                                                                                 

                                <div>
                                    <label className="block text-sm font-medium text-grey-600 mb-1">Location</label>
                                    <input
                                        name="location"
                                        value={values.location}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type="text"
                                        placeholder="Specific address"
                                        className="w-full border border-grey-300 rounded-md p-2"
                                    />
                                    <ErrorMessage name="location">
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                    </ErrorMessage>
                                </div>                                
                            </div>
                        </Modal>
                    )}
                </Formik>
            )}
        </div>
    );
}