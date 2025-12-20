import ErrorMsg1 from "@/components/ErrorMsg1";
import { Button } from "@/components/ui/button";
import { onRequestApi } from "@/lib/requestApi";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { Icon } from "@iconify/react";
import { ErrorMessage, Formik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as yup from 'yup'

const ChangePassword = () => {
    const dispatch = useDispatch()

    const profile = useSelector(state => getUserDetailsState(state).profile)

    const [passVisible, setPassVisible] = useState({
        old_password: false, new_password: false, confirm_new_password: false
    })
    const [apiReqs, setApiReqs] = useState({ isLoading: false, data: null, errorMsg: null })

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if(isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if(isLoading && data){
            const { type, requestInfo } = data

            if(type === 'updatePassword'){
                onRequestApi({
                    requestInfo,
                    successCallBack: updatePasswordSuccess,
                    failureCallback: updatePasswordFailure
                })
            }
        }
    }, [apiReqs])

    const updatePasswordSuccess = ({ result }) => {
        try {

            setApiReqs({ isLoading: false, data: null, errorMsg: null })
            toast.success("Password reset successful")

            return;
            
        } catch (error) {
            console.log(error)
            return updatePasswordFailure({ errorMsg: 'Something went wrong! Try again' })
        }
    }
    const updatePasswordFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, data: null, errorMsg: 'Old credentials are incorrect. Contact support for further assistance' })
        toast.error(errorMsg)

        return;
    }

    return (
        <Formik
            validationSchema={yup.object().shape({
                old_password: yup.string().required('Old password is required'),
                new_password: yup
                    .string()
                    .required('New Password is required')
                    .min(8, 'Password must be at least 8 characters')
                    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
                    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                    .matches(/\d/, 'Password must contain at least one number')
                    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),

                confirm_new_password: yup
                    .string()
                    .required('Confirm Password is required')
                    .oneOf([yup.ref('new_password'), null], 'Passwords must match'),  
            })}
            initialValues={{
                old_password: '',
                new_password: '',
                confirm_new_password: ''
            }}
            onSubmit={(values, { resetForm }) => {
                setApiReqs({
                    isLoading: true, 
                    errorMsg: null,
                    data: {
                        type: 'updatePassword',
                        requestInfo: {
                            url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/update-user-password',
                            method: 'POST',
                            data: {
                                ...values,
                                email: profile?.email
                            }
                        }
                    }
                })

                resetForm()
            }}
        >
            {
                ({ values, isValid, dirty, handleBlur, handleSubmit, handleChange }) => (
                    <div className="bg-grey-50 p-6 rounded-lg max-w-2xl">
                        <div className="space-y-6">
                            {[
                                {
                                    name: "old_password",
                                    value: values.old_password,
                                    id: "currentPassword",
                                    label: "Current Password",
                                    placeholder: "Enter your current password",
                                    type: passVisible?.old_password ? 'text' : 'password'
                                },
                                {
                                    name: "new_password",
                                    value: values.new_password,                                    
                                    id: "newPassword",
                                    label: "New Password",
                                    placeholder: "Create a new password",
                                    type: passVisible?.new_password ? 'text' : 'password'
                                },
                                {
                                    name: "confirm_new_password",
                                    value: values.confirm_new_password,                                    
                                    id: "confirmPassword",
                                    label: "Confirm Password",
                                    placeholder: "Re-enter your password",
                                    type: passVisible?.confirm_new_password ? 'text' : 'password'
                                },
                            ].map(({ name, id, value, label, placeholder, type }) => (
                                <div key={name} className="flex flex-col relative">
                                    <label className="text-sm font-medium mb-1" htmlFor={name}>
                                        {label}
                                    </label>
                                    <input
                                        id={id}
                                        name={name}
                                        value={value}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        type={type}
                                        placeholder={placeholder}
                                        required
                                        className="border border-grey-300 placeholder:text-grey-400 rounded-lg px-3 py-2 text-sm focus:outline-none pr-10"
                                    />
                                    {
                                        type == 'password'
                                        ?
                                            <EyeOff className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={() => setPassVisible(prev => ({ ...prev, [name]: !prev[name] }))} />                                        
                                        :
                                            <Eye className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={() => setPassVisible(prev => ({ ...prev, [name]: !prev[name] }))} />
                                    }
                                    <ErrorMessage name={name}>
                                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} /> }
                                    </ErrorMessage>
                                </div>
                            ))}

                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                className="bg-primary-500 text-white flex items-center gap-2 rounded-4xl !px-9 !py-3 !h-auto"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )
            }
        </Formik>
    );
};

export default ChangePassword;