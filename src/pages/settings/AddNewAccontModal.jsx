import Modal from "@/components/Modal";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { X } from "lucide-react";
import { ErrorMessage, Formik } from "formik";
import * as yup from 'yup'
import ErrorMsg1 from "@/components/ErrorMsg1";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { onRequestApi } from "@/lib/requestApi";
import supabase from "@/database/dbInit";

export default function AddNewAccountModal({ isOpen, onClose, setBank }) {
    const dispatch = useDispatch()

    const user = useSelector(state => getUserDetailsState(state).user)
    const profile = useSelector(state => getUserDetailsState(state).profile)
    const phone_number = useSelector(state => getUserDetailsState(state).phone_number)

    const phoneNoSet = phone_number?.country_code && phone_number?.phone_number

    const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })
    const [supportedBanks, setSupportedBanks] = useState([])
    const [bankCode, setBankCode] = useState('')

    useEffect(() => {
        if (!isOpen) return;

        setApiReqs({
            isLoading: true,
            errorMsg: null,
            data: {
                type: 'getSupportedBanks',
                requestInfo: {
                    url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/get-supported-banks',
                    method: 'GET'
                }
            }
        })
    }, [isOpen])

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if (isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if (isLoading && data) {
            const { type, requestInfo } = data

            if(type === 'createBank'){
                createBank({ requestInfo })
            }

            if (type === 'getSupportedBanks') {
                onRequestApi({
                    requestInfo,
                    successCallBack: getSupportedBanksSuccess,
                    failureCallback: getSupportedBanksFailure
                })
            }

            if (type === 'createAccount') {
                onRequestApi({
                    requestInfo,
                    successCallBack: createAccountSuccess,
                    failureCallback: createAccountFailure
                })
            }
        }
    }, [apiReqs])

    const createBank = async ({ requestInfo }) => {
        try {

            const { data, error } = await supabase
                .from('banks')
                .upsert({
                    ...requestInfo,
                    vendor_id: profile?.id
                }, {
                    onConflict: 'vendor_id'
                })
                .select()
                .single()

            if(error) {
                console.log(error)
                throw new Error()
            }

            if(setBank){
                setBank(data)
            }

            dispatch(setUserDetails({
                bank: data
            }))

            setApiReqs({ isLoading: false, errorMsg: null, data: null })
            toast.info("Bank saved!")

            onClose()
            
        } catch (error) {
            console.log(error)
            return createBankFailure({ errorMsg: 'Something went wrong! Try again later.' })
        }
    }
    const createBankFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    const getSupportedBanksSuccess = ({ result }) => {
        try {

            setSupportedBanks(result)
            setApiReqs({ isLoading: false, errorMsg: null, data: null })

        } catch (error) {
            console.log(error)
            return getSupportedBanksFailure({ errorMsg: 'Something went wrong! Try again.' })
        }
    }
    const getSupportedBanksFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    const createAccountSuccess = async ({ result }) => {
        try {

            console.log(result)

            setApiReqs({ isLoading: false, errorMsg: null, data: null })
            toast.success("Virtual account successfully created!")

            return

        } catch (error) {
            console.log(error)
            return createAccountFailure({ errorMsg: 'Something went wrong! Try again.' })
        }
    }
    const createAccountFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return
    }

    return (
        <>
            {isOpen && (
                <Formik
                    validationSchema={yup.object().shape({
                        first_name: yup.string().required("First name is required"),
                        last_name: yup.string().required("Last name is required"),
                        account_number: yup.string().required("Account number is required"),
                        account_type: yup.string().required("Account type is required"),
                    })}
                    initialValues={{
                        first_name: '', last_name: '', account_number: '', account_type: ''
                    }}
                    onSubmit={values => {

                        // CUSTOMER BANK SETUP!!!
                        if(!bankCode) return toast.info("Select a bank");

                        const bank = supportedBanks.filter(b => b?.code === bankCode)[0]

                        if(!bank) return toast.info("Select a bank");

                        const { country, code, currency, type, active, name, slug } = bank

                        if(!active) return toast.info("Selected bank is inactive");

                        const requestInfo = {
                            country, code, currency, type, name, slug, ...values
                        }

                        setApiReqs({
                            isLoading: true, 
                            errorMsg: null,
                            data: {
                                type: 'createBank',
                                requestInfo
                            }
                        })
                        



                        // VIRTUAL ACCOUNTS SETUP!!!

                        // if (!phoneNoSet) {
                        //     toast.info("You need a valid phone number to be able to create a virtual account! Go to your profile and set one!")
                        //     return
                        // }

                        // setApiReqs({
                        //     isLoading: true,
                        //     errorMsg: null,
                        //     data: {
                        //         type: 'createAccount',
                        //         requestInfo: {
                        //             url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/create-paystack-customer-account',
                        //             method: 'POST',
                        //             data: {
                        //                 email: user?.email,
                        //                 phone: phone_number?.country_code + phone_number?.phone_number,
                        //                 ...values
                        //             }
                        //         }
                        //     }
                        // })
                    }}
                >
                    {({ values, handleBlur, handleChange, handleSubmit, isValid, dirty }) => (
                        <Modal
                            title="Bank Account"
                            onClose={onClose}
                            primaryButton="Save Bank"
                            primaryButtonFunc={handleSubmit}
                            styles={{
                                wrapper: "max-w-xs md:max-w-sm relative",
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
                            <div className="flex flex-col gap-4">
                                <div className="mb-5">
                                    <div className="mb-3">
                                        <label className="text-sm font-medium">Bank</label>
                                        <select
                                            name="bank"
                                            value={bankCode}
                                            onChange={(e) => setBankCode(e.target.value)}
                                            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none mb-2"
                                        >
                                            <option selected disabled>
                                                Select bank
                                            </option>
                                            {
                                                supportedBanks.map((b, i) => {
                                                    const { country, code, currency, type, active, name } = b

                                                    return (
                                                        <option disabled={active != true ? true : false} value={code}>
                                                            { currency } ~ { name }
                                                        </option>
                                                    )
                                                })
                                            }
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="text-sm font-medium">Account type</label>
                                        <select
                                            name="account_type"
                                            value={values.account_type}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none mb-2"
                                        >
                                            <option selected disabled>
                                                Select account type
                                            </option>
                                            {
                                                [
                                                    { title: 'Personal', value: 'personal' },
                                                    { title: 'Business', value: 'business' },
                                                ].map((b, i) => {
                                                    const { title, value } = b

                                                    return (
                                                        <option value={value}>
                                                            { title }
                                                        </option>
                                                    )
                                                })
                                            }
                                        </select>
                                    </div>                                    

                                    <div>
                                        <label className="text-sm font-medium">Account number</label>
                                        <input
                                            type="text"
                                            placeholder="**********"
                                            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none mb-2"
                                            name="account_number"
                                            value={values.account_number}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <ErrorMessage name="account_number">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="This name will be tied to your virtual account"
                                            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none mb-2"
                                            name="first_name"
                                            value={values.first_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <ErrorMessage name="first_name">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="This name will be tied to your virtual account"
                                            className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none mb-2"
                                            name="last_name"
                                            value={values.last_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <ErrorMessage name="last_name">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </div>

                                    <Badge className="bg-green-50 text-green-700 mb-2 w-full rounded-4xl justify-start items-center py-1.5">
                                        <Icon icon="ei:check" width="20" height="20" />
                                        {user.email}
                                    </Badge>

                                    <Badge className={`${phoneNoSet ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} w-full rounded-4xl justify-start items-center py-1.5`}>
                                        {
                                            phoneNoSet
                                                ?
                                                <Icon icon="ei:check" width="20" height="20" />
                                                :
                                                <X size={20} />
                                        }
                                        {
                                            phoneNoSet
                                            ?
                                                `${phone_number?.country_code} ${phone_number?.phone_number}`
                                            :
                                                'set your phone number first in your profile page'
                                        }
                                    </Badge>
                                </div>
                            </div>
                        </Modal>
                    )}
                </Formik>
            )}
        </>
    );
}
