import AuthForm from "@/components/AuthForm";
import OtpInput from "@/components/OtpInput";
import { onRequestApi } from "@/lib/requestApi";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VerifyEmail() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const { state } = useLocation()
    const fromForgotPassword = state?.fromForgotPassword ? true : false

    const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })

    useEffect(() => {
        if(!state?.email) navigate('/new-provider');
    }, [state])

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if(isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop())

        if(isLoading && data){
            const { type, requestInfo } = data
            
            if(type == 'createProvider'){
                onRequestApi({
                    requestInfo,
                    successCallBack: createProviderSuccess,
                    failureCallback: createProviderFailure
                })
            }
        }
    }, [apiReqs])

    const createProviderSuccess = async () => {
        try {

            dispatch(appLoadStop())

            setApiReqs({ isLoading: false, data: null, errorMsg: null })

            toast.success("Registration successfuly. Login to access your dashboard")

            navigate('/new-provider/verification-complete', { replace: true })

            return;
            
        } catch (error) {
            console.log(error)
            return createProviderFailure({ errorMsg: 'Something went wrong! Try again later' })
        }
    }
    const createProviderFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return
    }

    if(!state?.email) return <></>

    const { email } = state

    const onValidated = () => {
        if(fromForgotPassword){
            return navigate('/recover-password/new-password', { state: { email }, replace: true })
        }

        setApiReqs({
            isLoading: true,
            errorMsg: null,
            data: {
                type: 'createProvider',
                requestInfo: {
                    url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/create-provider',
                    method: 'POST',
                    data: state
                }
            }
        })

        return;
    }

    return (
        <AuthForm
            image="/assets/email-icon.svg"
            title="Enter OTP"
            description="We've sent a 6-digit code to your email. Please enter it below."
            // Dummy field to allow custom UI injection
            fields={[{ label: "", type: "hidden", placeholder: "" }]}
            customFields={{
                0: (
                    <div className="flex flex-col items-center gap-4 mt-2">
                        {/* OTP Boxes */}
                        <OtpInput 
                            onValidated={onValidated}
                            email={email}
                            goBackPath={'/new-vendor'}
                            fromForgotPassword={fromForgotPassword}
                        />
                    </div>
                ),
            }}
            styles={{
                wrapper: "max-w-sm mx-auto md:p-6",
                title: "text-xl font-bold text-center text-gray-800",
                description: "text-gray-500 text-center",
            }}
        />
    );
}
