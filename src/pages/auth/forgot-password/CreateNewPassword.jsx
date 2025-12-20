import AuthForm from "@/components/AuthForm"
import ErrorMsg1 from "@/components/ErrorMsg1"
import { onRequestApi } from "@/lib/requestApi"
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice"
import { ErrorMessage, Formik } from "formik"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import * as yup from 'yup'

const CreateNewPassword = () => {
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const { state } = useLocation()
  const email = state?.email

  const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev)
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(prev => !prev)

  useEffect(() => {
    if (!state?.email) navigate(-1);
  }, [state])

  useEffect(() => {
    const { isLoading, data } = apiReqs

    if(isLoading) dispatch(appLoadStart());
    else dispatch(appLoadStop());
    
    if(isLoading && data){
      const { type, requestInfo } = data
      
      if(type === 'resetPassword'){
        onRequestApi({
          requestInfo,
          successCallBack: resetPasswordSuccess,
          failureCallback: resetPasswordFailure
        })
      }
    }
  }, [apiReqs])

  const resetPasswordSuccess = ({ result }) => {
    try {

      setApiReqs({ isLoading: false, errorMsg: null, data: null })
      dispatch(appLoadStop())
      toast.success('Password successfully reset')

      navigate('/recover-password/password-recovered', { replace: true })
      
    } catch (error) {
      console.error(error)
      return resetPasswordFailure({ errorMsg: 'Something went wrong! Try again.' })
    }
  }
  const resetPasswordFailure = ({ errorMsg }) => {
    setApiReqs({ isLoading: false, errorMsg, data: null })
    toast.error(errorMsg)

    return;
  }

  if(!email) return <></>

  return (
    <div>
      <Formik
        validationSchema={yup.object().shape({
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
          password: '', confirmPassword: '',
        }}
        onSubmit={values => {
          setApiReqs({
            isLoading: true,
            errorMsg: null,
            data: {
              type: 'resetPassword',
              requestInfo: {
                url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/reset-password-from-forgot-password',
                method: 'POST',
                data: {
                  new_password: values?.password,
                  email
                }
              }
            }
          })          
        }}
      >
        {({
          values, isValid, dirty, handleBlur, handleChange, handleSubmit
        }) => (
          <AuthForm
            buttonFunc={handleSubmit}
            title="Create New Password"
            description="Create a new password"
            fields={[
              {}, {}
            ]}
            customFields={{
              0: (
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
              1: (
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
            buttonText="Create Password"
            styles={{
              wrapper: "bg-transparent max-w-md mx-auto -mt-2 md:mt-0 p-6",
              title: "text-3xl font-bold text-center text-gray-800 mb-1",
              description: "text-base text-gray-500 text-center mb-6",
              fieldWrapper: "flex flex-col space-y-1",
              label: "text-sm font-medium text-gray-600",
              input: "border border-gray-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none",
              button: "w-full bg-primary-500 text-grey-50 text-base py-7 rounded-full font-bold mt-2",
            }}
          />
        )
        }
      </Formik>
    </div>
  )
}

export default CreateNewPassword