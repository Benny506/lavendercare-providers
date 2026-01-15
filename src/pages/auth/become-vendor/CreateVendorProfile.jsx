import AuthForm from "@/components/AuthForm";
import VendorAccount from "@/components/VendorAccount";
import PhoneInput from "@/components/PhoneInput";
import { ErrorMessage, Formik } from "formik";
import * as yup from 'yup'
import { vendorServicesOptions } from "@/constants/constant";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { toast } from "react-toastify";
import supabase, { checkPhoneNumberExists } from "@/database/dbInit";
import { Eye, EyeOff } from "lucide-react";
import ErrorMsg1 from "@/components/ErrorMsg1";

export default function CreateVendorProfile() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const [passwordVisible, setPasswordVisible] = useState(false)
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

    const togglePasswordVisibility = () => setPasswordVisible(prev => !prev)
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(prev => !prev)

    return (
        <div>
            <style>
                {`
                   body{
                   overflow-x: hidden;
                   }
                `}
            </style>
            <div className="hidden md:block -mt-10 mr-10">
                <VendorAccount />
            </div>
            <div className="w-screen flex justify-center -mt-6">
                <Formik
                    validationSchema={yup.object().shape({
                        referral_code: yup.string(),
                        username: yup.string().required("Username is required"),
                        email: yup.string().email("Must be a valid email address").required("Email is required"),
                        password: yup
                            .string()
                            .required('Password is required')
                            .min(8, 'Password must be at least 8 characters')
                            .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                            .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                            .matches(/\d/, 'Password must contain at least one number')
                            .matches(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),

                        confirmPassword: yup
                            .string()
                            .required('Confirm Password is required')
                            .oneOf([yup.ref('password'), null], 'Passwords must match'),
                    })}
                    initialValues={{
                        username: '', email: '', password: '', confirmPassword: '',
                        phone_number: '', referral_code: ''
                    }}
                    onSubmit={values => {
                        const stateData = values

                        delete stateData.confirmPassword

                        navigate('/new-provider/verify-email', { state: stateData })
                    }}
                >
                    {({
                        values, isValid, dirty, handleBlur, handleChange, handleSubmit
                    }) => (
                        <AuthForm
                            buttonFunc={handleSubmit}
                            title="Create your Provider Profile"
                            description="Become a lavendercare provider by filling in your information below"
                            buttonText="Create account"
                            buttonLink="/new-provider/verify-email"
                            fields={[
                                { withErrMsg: true, name: "username", onChange: handleChange, onBlur: handleBlur, value: values.username, label: "Username (How users will see you)", type: "text", placeholder: "Type your username", required: true },
                                { withErrMsg: true, name: "email", onChange: handleChange, onBlur: handleBlur, value: values.email, label: "Email Address", type: "email", placeholder: "Type your email address", required: true },
                                {},
                                {},
                                { withErrMsg: false, name: "referral_code", onChange: handleChange, onBlur: handleBlur, value: values.referral_code, label: "Referral code", type: "text", placeholder: "Optional", required: false },
                            ]}
                            customFields={{
                                2: (
                                    <div className="flex flex-col relative">
                                        <label className="text-sm font-medium mb-1">
                                            Password
                                        </label>
                                        <input
                                            name={'password'}
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            type={passwordVisible ? 'text' : 'password'}
                                            placeholder={"Your password"}
                                            required
                                            className="border border-grey-300 bg-white placeholder:text-grey-400 rounded-lg px-3 py-2 text-sm focus:outline-none pr-10"
                                        />
                                        {
                                            passwordVisible
                                                ?
                                                <EyeOff className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={togglePasswordVisibility} />
                                                :
                                                <Eye className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={togglePasswordVisibility} />
                                        }
                                        <ErrorMessage name={'password'}>
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>
                                ),
                                3: (
                                    <div className="flex flex-col relative">
                                        <label className="text-sm font-medium mb-1">
                                            Confirm Password
                                        </label>
                                        <input
                                            name={'confirmPassword'}
                                            value={values.confirmPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            type={confirmPasswordVisible ? 'text' : 'password'}
                                            placeholder={"Re-type password"}
                                            required
                                            className="border border-grey-300 bg-gray-50 placeholder:text-grey-400 rounded-lg px-3 py-2 text-sm focus:outline-none pr-10"
                                        />
                                        {
                                            confirmPasswordVisible
                                                ?
                                                <EyeOff className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={toggleConfirmPasswordVisibility} />
                                                :
                                                <Eye className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={toggleConfirmPasswordVisibility} />
                                        }
                                        <ErrorMessage name={'confirmPassword'}>
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>
                                )
                            }}
                            styles={{
                                wrapper: "bg-transparent shadow-none p-8 max-w-lg w-full",
                                title: "text-3xl font-bold text-center text-gray-800 mb-1",
                                description: "text-base text-gray-500 text-center mb-6",
                                fieldWrapper: "flex flex-col space-y-1",
                                label: "text-sm font-medium text-gray-600",
                                input: "border border-gray-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
                                button: "w-full bg-primary-500 text-grey-50 text-base py-7 rounded-full font-bold mt-4 cursor-pointer",
                            }}
                        />
                    )}
                </Formik>
            </div>
            <div className="block md:hidden my-4 -mt-4">
                <VendorAccount className="mx-auto justify-center" />
            </div>
        </div>
    );
}
