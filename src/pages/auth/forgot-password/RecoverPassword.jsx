import AuthForm from '@/components/AuthForm'
import { Icon } from '@iconify/react'
import { Formik } from 'formik'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'

const RecoverPassword = () => {
    const navigate = useNavigate()

    return (
        <div className='mt-5'>
            <button
                type="button"
                className="absolute top-16 md:top-20 left-4 md:left-20 z-50 flex items-center gap-2 cursor-pointer text-primary-600"
                onClick={() => navigate(-1)}
            >
                <span className="text-2xl">
                    <Icon icon="ph:arrow-left" />
                </span>
                <span className="font-semibold text-lg">Back</span>
            </button>

            <div className="w-screen flex justify-center -mt-6">
                <Formik
                    validationSchema={yup.object().shape({
                        email: yup.string().email("Must be a valid email address").required("Email is required"),
                    })}
                    initialValues={{
                        email: '',
                    }}
                    onSubmit={values => {
                        const stateData = values

                        navigate('/new-provider/verify-email', { state: { ...stateData, fromForgotPassword: true } })
                    }}
                >
                    {({
                        values, isValid, dirty, handleBlur, handleChange, handleSubmit
                    }) => (
                        <AuthForm
                            buttonFunc={handleSubmit}
                            title="Recover your password"
                            description="Enter your email to recover your LavenderCare password."
                            fields={[
                                { withErrMsg: true, name: "email", onChange: handleChange, onBlur: handleBlur, value: values.email, label: "Email Address", type: "email", placeholder: "Type your email address", required: true },
                            ]}
                            buttonText="Send OTP"
                            buttonLink="/recover-password/otp"
                            styles={{
                                wrapper: "bg-transparent max-w-md mx-auto p-6",
                                title: "text-3xl font-bold text-center text-gray-800 mb-1",
                                description: "text-base text-gray-500 text-center mb-6",
                                fieldWrapper: "flex flex-col space-y-1",
                                label: "text-sm font-medium text-gray-600",
                                input: "border border-gray-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none",
                                button: "w-full bg-primary-500 text-grey-50 text-base py-7 rounded-full font-bold mt-2",
                            }}
                        />
                    )}
                </Formik>
            </div>

        </div>
    )
}

export default RecoverPassword