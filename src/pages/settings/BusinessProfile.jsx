import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { ErrorMessage, Formik } from "formik";
import * as yup from 'yup'
import { Eye, EyeOff, MapPinHouse } from "lucide-react";
import { countries } from "@/constants/constant";
import ErrorMsg1 from "@/components/ErrorMsg1";
import { useEffect, useRef, useState } from "react";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import supabase from "@/database/dbInit";
import { toast } from "react-toastify";
import { cloudinaryUpload, onRequestApi } from "@/lib/requestApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const BusinessProfile = () => {
    const dispatch = useDispatch()

    const profile = useSelector(state => getUserDetailsState(state).profile)
    const user = useSelector(state => getUserDetailsState(state).user)
    const phone_number = useSelector(state => getUserDetailsState(state).phone_number)

    const profileInputRef = useRef(null)

    const [apiReqs, setApiReqs] = useState({ isLoading: false, data: null, errorMsg: null })
    const [profileImgPreview, setProfileImgPreview] = useState(null)
    const [passwordVisible, setPasswordVisible] = useState(false)

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if (isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if (isLoading && data) {
            const { type, requestInfo } = data

            if (type == 'editProfile') {
                editProfile({ requestInfo })
            }

            if(type == 'editPhoneNumber'){
                editPhoneNumber({ requestInfo })
            }

            if(type == 'editEmail'){
                onRequestApi({
                    requestInfo,
                    successCallBack: editEmailSuccess,
                    failureCallback: editEmailFailure
                })
            }
        }
    }, [apiReqs])

    const editEmailSuccess = async({ result }) => {
        try {

            const { newSession } = result

            const { data, error } = await supabase.auth.setSession(newSession);

            if(error){
                console.error(error)
                throw new Error()
            }

            const { user, session } = data

            dispatch(setUserDetails({
                session,
                user
            }))

            setApiReqs({ isLoading: false, errorMsg: null, data: null })

            toast.success("Email successfully updated")

            return;
            
        } catch (error) {
            console.log(error)
            return editEmailFailure({ errorMsg: 'Something went wrong! Try again. Are you sure those that is the right password?' })
        }
    }
    const editEmailFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    const editPhoneNumber = async ({ requestInfo }) => {
        try {

            const { data, error } = await supabase
                .from('unique_phones')
                .upsert(
                    {
                        ...requestInfo,
                        user_id: profile?.id
                    },
                    {
                        onConflict: ['user_id']
                    }
                )
                .select()
                .single()

            if(error) {
                console.error(error)
                throw new Error()
            }

            dispatch(setUserDetails({
                phone_number: data
            }))

            setApiReqs({ isLoading: false, errorMsg: null, data: null })
            toast.success("Phone number updated")

            return;
            
        } catch (error) {
            console.error(error)
            return editPhoneNumberFailure({ errorMsg: 'Something went wrong! Try again. That phone number might be taken' })
        }
    }
    const editPhoneNumberFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    const editProfile = async ({ requestInfo }) => {
        try {

            const { data, error } = await supabase
                .from('vendor_profiles')
                .update(requestInfo)
                .eq('id', profile?.id)
                .select()
                .single()

            if (error) {
                console.log(error)
                if (error.code === '23505') {
                    const errorMsg = 'Phone number in use'

                    setApiReqs({ isLoading: false, data: null, errorMsg })
                    toast.error(errorMsg)

                    return;
                }
                throw new Error()
            }

            const updatedProfile = {
                ...profile,
                ...data
            }

            dispatch(setUserDetails({ profile: updatedProfile }))

            setApiReqs({ isLoading: false, data: null, errorMsg: null })

            toast.success("Profile updated")

            return;

        } catch (error) {
            console.log(error)
            return editProfileFailure({ errorMsg: 'Something went wrong! Try again' })
        }
    }
    const editProfileFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return
    }

    const uploadFiles = async ({ files, requestBody }) => {
        try {

            const { result } = await cloudinaryUpload({ files })

            if (!result) throw new Error();

            const profile_img = result[0]?.secure_url

            if (!profile_img) throw new Error();

            toast.success("Image uploaded")

            setApiReqs({
                isLoading: true,
                errorMsg: null,
                data: {
                    type: 'editProfile',
                    requestInfo: {
                        ...requestBody,
                        profile_img
                    }
                }
            })

            return;

        } catch (error) {
            console.log(error)
            return editProfileFailure({ errorMsg: 'Error uploading image' })
        }
    }

    const togglePasswordVisibility = () => setPasswordVisible(prev => !prev)

    return (
        <div className="bg-grey-50 w-full rounded-lg">
            <div className="p-4 sm:p-6 max-w-full md:max-w-2xl">
                <Formik
                    validationSchema={yup.object().shape({
                        country_code: yup.string(),
                        location: yup.string(),
                        bio: yup.string().max(400, "Must not be more than 400 characters"),
                        working_condition: yup.string(),
                        profile_img: yup
                            .mixed()
                            .test(
                                'is-file',
                                'You must select a file',
                                value => value instanceof File
                            )
                            .test(
                                'file-type',
                                'Only image files are allowed',
                                value => value && value.type.startsWith('image/')
                            )
                            .test(
                                'file-size',
                                'File must be smaller than 5 MB',
                                value => value && value.size <= MAX_FILE_SIZE
                            )
                    })}
                    initialValues={{
                        country_code: profile?.country_code || '',
                        location: profile?.location || '',
                        bio: profile?.bio || '',
                        working_condition: profile?.working_condition || '',
                        profile_img: profile?.profile_img || ''
                    }}
                    onSubmit={values => {
                        const requestInfo = values

                        if (profileImgPreview) {
                            delete requestInfo.profile_img

                            setApiReqs({ isLoading: true, errorMsg: null, data: null })
                            uploadFiles({ files: [profileImgPreview], requestBody: requestInfo })

                        } else {
                            setApiReqs({
                                isLoading: true,
                                errorMsg: null,
                                data: {
                                    type: 'editProfile',
                                    requestInfo
                                }
                            })
                        }
                    }}
                >
                    {
                        ({ handleBlur, handleChange, handleSubmit, isValid, dirty, values, setFieldValue }) => (
                            <div className="p-4 sm:p-6 max-w-full md:max-w-2xl">
                                {/* Top section with logo and verification */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 justify-between mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            {/* Profile Logo */}
                                            {
                                                (values?.profile_img || profileImgPreview)
                                                    ?
                                                    <img src={profileImgPreview || values?.profile_img} alt="Profile image" className="border-grey-50 border-2 shadow-2xl w-16 h-16 sm:w-18 sm:h-18 rounded-full" />
                                                    :
                                                    <span className="text-gray-600 font-medium text-xs">Profile not set</span>
                                            }

                                            {/* Info */}
                                            <div className="flex flex-col">
                                                <h2 className="text-xl sm:text-2xl font-semibold text-grey-800">
                                                    {profile?.business_name}
                                                </h2>
                                                <p className="text-sm sm:text-md text-grey-500">
                                                    {profile?.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {/* <Badge className="self-start sm:self-auto rounded-full bg-error-50 text-error-600 text-xs sm:text-md font-medium px-2 sm:px-3 py-1">
                                        Unverified
                                    </Badge> */}
                                    </div>

                                    {/* Verify Account Button */}
                                    {/* <Button className="w-full sm:w-auto bg-success-500 text-white text-sm sm:text-md font-bold rounded-full">
                                    Verify Account
                                </Button> */}
                                </div>

                                {/* Upload Logo Link */}
                                <input
                                    ref={profileInputRef}
                                    name="profile_img"
                                    type="file"
                                    accept="image/*"
                                    placeholder="Click to select file"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.currentTarget.files?.[0] ?? null

                                        if(!file) return;

                                        setFieldValue("profile_img", file)

                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                // reader.result is a base64 data-URL
                                                setProfileImgPreview(reader.result)
                                            }
                                            reader.readAsDataURL(file)

                                        }
                                    }}
                                />

                                <button
                                    onClick={() => profileInputRef.current?.click()}
                                    className="cursor-pointer text-sm text-primary-500 font-bold hover:underline mb-6 flex items-center gap-1"
                                >
                                    <Icon icon="mdi:edit-outline" width="16" height="16" />
                                    {profile?.profile_img ? "Update" : "Upload"} Logo
                                </button>
                                <ErrorMessage name="profile_img">
                                    {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                </ErrorMessage>

                                {/* Form */}
                                <form className="space-y-4">
                                    {/* Business Location */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-grey-700 mb-1">
                                            Primary Business Location
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="location"
                                                value={values.location}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                type="text"
                                                placeholder="Enter primary business address"
                                                className="border border-grey-300 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-full"
                                            />
                                            <MapPinHouse
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400"
                                                size={18}
                                            />
                                        </div>
                                        <ErrorMessage name="location">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    {/* About */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-grey-700 mb-1">
                                            About
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={values.bio}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Tell potential clients about your company"
                                            maxLength={400}
                                            rows={6}
                                            className="border border-grey-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none placeholder-grey-400"
                                        />
                                        <span className="text-xs text-grey-400 text-right mt-1">
                                            {values.bio?.length}/400
                                        </span>
                                        <ErrorMessage name="bio">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    {/* Working Conditions */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-grey-700 mb-1">
                                            Working Conditions
                                        </label>
                                        <textarea
                                            name="working_condition"
                                            value={values.working_condition}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder=" e.g All bookings must be done via the LavenderCare app"
                                            rows={6}
                                            className="border border-grey-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none placeholder-grey-400"
                                        />
                                        <p className="text-xs sm:text-sm text-grey-500 m-2 text-left">
                                            This helps potential clients understand the limitations of your services
                                        </p>
                                        <ErrorMessage name="working_condition">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    {/* Service Category */}
                                    {/* <div className="flex flex-col">
                                    <label className="text-sm font-medium text-grey-700 mb-1">
                                        Service Category
                                    </label>
                                    <div className="relative">
                                        <Icon
                                            icon="iconamoon:search"
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none"
                                            width="18"
                                            height="18"
                                        />
                                        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
                                            <Badge className="bg-grey-100 text-grey-700 text-xs font-medium px-2 rounded-full">
                                                Category name
                                            </Badge>
                                            <Badge className="bg-grey-100 text-grey-700 text-xs font-medium px-2 rounded-full">
                                                Category name
                                            </Badge>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Type to add"
                                            className="border border-grey-300 rounded-lg pl-32 sm:pl-[260px] pr-4 py-3 text-sm focus:outline-none w-full"
                                        />
                                    </div>
                                </div> */}

                                    {/* Save Changes Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full sm:w-auto bg-primary-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                    >
                                        Save Changes
                                    </Button>
                                </form>
                            </div>
                        )
                    }
                </Formik>

                <div className="py-5" />

                <hr />

                <div className="py-5" />

                <Formik
                    validationSchema={yup.object().shape({
                        phone_number: yup.string().matches(/^\d+$/, "Phone number must contain only digits"),
                        country_code: yup.string(),
                    })}
                    initialValues={{
                        phone_number: phone_number?.phone_number || '',
                        country_code: phone_number?.country_code || '',
                    }}
                    onSubmit={values => {
                        const requestInfo = values

                        setApiReqs({
                            isLoading: true,
                            errorMsg: null,
                            data: {
                                type: 'editPhoneNumber',
                                requestInfo
                            }
                        })
                    }}
                >
                    {
                        ({ handleBlur, handleChange, handleSubmit, isValid, dirty, values, setFieldValue }) => (
                            <div className="p-4 sm:p-6 max-w-full md:max-w-2xl">
                                {/* Form */}
                                <div className="space-y-4">
                                    {/* Phone Number */}
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-600">
                                            Phone Number
                                        </label>
                                        <div className="flex flex-col sm:flex-row">
                                            <select
                                                name="country_code"
                                                value={values.country_code}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="border border-grey-300 bg-grey-50 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none px-2 py-3 text-sm focus:outline-none"
                                            >
                                                <option value="" selected disabled>...</option>
                                                {
                                                    countries.map((c, i) => {

                                                        const { countryCode } = c

                                                        return (
                                                            <option
                                                                key={i}
                                                                value={countryCode}
                                                            >
                                                                {countryCode}
                                                            </option>
                                                        )
                                                    })
                                                }
                                            </select>
                                            <input
                                                name="phone_number"
                                                value={values.phone_number}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                type="tel"
                                                placeholder="A valid phone number"
                                                className="flex-1 border border-t-0 sm:border-t border-grey-300 bg-grey-50 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none px-4 py-3 text-sm placeholder-grey-400 focus:outline-none"
                                            />
                                        </div>
                                        <ErrorMessage name="phone_number">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    {/* Save Changes Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full sm:w-auto bg-primary-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                    >
                                        Update phone number
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                </Formik>

                <div className="py-5" />

                <hr />

                <div className="py-5" />

                <Formik
                    validationSchema={yup.object().shape({
                        email: yup.string().email("Must be a valid email address").required("Email address is required"),
                        password: yup.string().required("Password is required")
                    })}
                    initialValues={{
                        email: user?.email || '',
                        password: ''
                    }}
                    onSubmit={values => {
                        setApiReqs({
                            isLoading: true,
                            errorMsg: null,
                            data: {
                                type: 'editEmail',
                                requestInfo: {
                                    url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/update-user-email',
                                    method: 'POST',
                                    data: {
                                        current_email: user?.email,
                                        current_password: values?.password, 
                                        new_email: values?.email
                                    }
                                }
                            }
                        })
                    }}
                >
                    {
                        ({ handleBlur, handleChange, handleSubmit, isValid, dirty, values, setFieldValue }) => (
                            <div className="p-4 sm:p-6 max-w-full md:max-w-2xl">
                                {/* Form */}
                                <div className="space-y-4">
                                    {/* Phone Number */}
                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-600">
                                            Email address
                                        </label>
                                        <input
                                            name="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            type="tel"
                                            placeholder="A valid phone number"
                                            className="flex-1 border border-t-0 sm:border-t border-grey-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none"
                                        />
                                        <ErrorMessage name="email">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    <div className="flex flex-col relative">
                                        <label className="text-sm font-medium text-gray-600 mb-1">
                                            Current password
                                        </label>
                                        <input
                                            name={'password'}
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            type={passwordVisible ? 'text' : 'password'}
                                            placeholder={'Your current password'}
                                            required
                                            className="border border-grey-300 placeholder:text-grey-400 rounded-lg px-3 py-2 text-sm focus:outline-none pr-10"
                                        />
                                        {
                                            !passwordVisible
                                            ?
                                                <EyeOff className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={togglePasswordVisibility} />                                        
                                            :
                                                <Eye className="cursor-pointer absolute right-3 top-8 text-grey-800" size={16} onClick={togglePasswordVisibility} />
                                        }
                                        <ErrorMessage name={'password'}>
                                            { errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} /> }
                                        </ErrorMessage>
                                    </div>

                                    {/* Save Changes Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full sm:w-auto bg-primary-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                    >
                                        Update email
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                </Formik>                
            </div>
        </div>
    );
};

export default BusinessProfile;