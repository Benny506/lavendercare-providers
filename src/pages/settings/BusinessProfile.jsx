import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { ErrorMessage, Formik } from "formik";
import * as yup from 'yup'
import { Briefcase, Eye, EyeOff, MapPinHouse, User } from "lucide-react";
import { countries } from "@/constants/constant";
import ErrorMsg1 from "@/components/ErrorMsg1";
import { useEffect, useRef, useState } from "react";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import supabase from "@/database/dbInit";
import { toast } from "react-toastify";
import { cloudinaryUpload, getPublicImageUrl, onRequestApi, uploadAsset } from "@/lib/requestApi";
import useApiReqs from "@/hooks/useApiReqs";
import { statusUpdateMail } from "@/database/email/email";
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const BusinessProfile = () => {
    const dispatch = useDispatch()

    const { updateLicense } = useApiReqs()

    const profile = useSelector(state => getUserDetailsState(state).profile)
    const user = useSelector(state => getUserDetailsState(state).user)
    const license = useSelector(state => getUserDetailsState(state).license)
    const phone_number = useSelector(state => getUserDetailsState(state).phone_number)

    const profileInputRef = useRef(null)
    const licenseInputRef = useRef(null)

    const [apiReqs, setApiReqs] = useState({ isLoading: false, data: null, errorMsg: null })
    const [profileImgPreview, setProfileImgPreview] = useState({ file: null, preview: null })
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [licenseFile, setLicenseFile] = useState({ file: null, ext: null })
    const [licenseExtraText, setLicenseExtraText] = useState('')

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if (isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if (isLoading && data) {
            const { type, requestInfo } = data

            if (type == 'editProfile') {
                editProfile({ requestInfo })
            }

            if (type == 'editPhoneNumber') {
                editPhoneNumber({ requestInfo })
            }

            if (type == 'editEmail') {
                onRequestApi({
                    requestInfo,
                    successCallBack: editEmailSuccess,
                    failureCallback: editEmailFailure
                })
            }
        }
    }, [apiReqs])

    const editEmailSuccess = async ({ result }) => {
        try {

            const { newSession } = result

            const { data, error } = await supabase.auth.setSession(newSession);

            if (error) {
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

            console.log(requestInfo)

            const { data, error } = await supabase
                .from('unique_phones')
                .upsert(
                    {
                        ...requestInfo,
                        id: phone_number?.id || uuidv4(),
                        user_id: profile?.id
                    },
                    {
                        onConflict: ['phone_number', 'country_code', 'user_id']
                    }
                )
                .select()
                .single()

            if (error) {
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
                .from('providers')
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

    const uploadFiles = async ({ file, requestBody }) => {
        try {

            dispatch(appLoadStart())

            const { filePath, error } = await uploadAsset({ file, id: user?.id, bucket_name: 'user_profiles', ext: 'png' })

            if (!filePath) throw new Error()

            toast.success("Image uploaded")

            setApiReqs({
                isLoading: true,
                errorMsg: null,
                data: {
                    type: 'editProfile',
                    requestInfo: {
                        ...requestBody,
                        profile_img: filePath
                    }
                }
            })

            return;

        } catch (error) {
            console.log(error)
            dispatch(appLoadStop())
            return editProfileFailure({ errorMsg: 'Error uploading image' })
        }
    }

    const handleLicenseUpload = async () => {
        try {

            if (!licenseFile.ext || !licenseFile.file) return toast.info("Select a file first");

            if (!licenseExtraText) return toast.info("Write something about the document you are uploading");

            dispatch(appLoadStart())

            const { filePath, error } = await uploadAsset({ file: licenseFile.file, id: user?.id, bucket_name: 'provider_licenses', ext: licenseFile.ext })

            if (!filePath) throw new Error();

            const documents = [
                ...(license.documents || []),
                {
                    file: filePath,
                    extraText: licenseExtraText
                }
            ]

            updateLicense({
                callBack: async ({ }) => {
                    setLicenseExtraText('')
                    setLicenseFile({ file: null, ext: null })

                    await statusUpdateMail({
                        toAdmin: true,
                        to_email: '',
                        receiver_id: '',
                        subject: 'New Provider Credentials',
                        username: 'Admin',
                        extra_text: `Provider ${profile?.username} just submitted his credentials. View it and approve or dis-approve`,
                        title: `New Credentials Alert`,
                        btn_link: "https://admin.lavendercare.co/#/admin/healthcare-provider/credentials-review"
                    })
                },
                documents
            })

        } catch (error) {
            console.log(error)
            dispatch(appLoadStop())
            return apiReqError({ errorMsg: 'Error uploading license document' })
        }
    }

    const apiReqError = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return
    }

    const togglePasswordVisibility = () => setPasswordVisible(prev => !prev)

    const imageUrl = getPublicImageUrl({ path: profile?.profile_img, bucket_name: 'user_profiles' })

    return (
        <div className="bg-grey-50 w-full rounded-lg">
            <div className="p-4 sm:p-6 max-w-full md:max-w-2xl">
                <Formik
                    enableReinitialize
                    validationSchema={yup.object().shape({
                        username: yup.string(),
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
                        username: profile?.username || '',
                        profile_img: imageUrl || ''
                    }}
                    onSubmit={values => {
                        const requestInfo = values

                        if (profileImgPreview?.file) {
                            delete requestInfo.profile_img

                            setApiReqs({ isLoading: true, errorMsg: null, data: null })
                            uploadFiles({ file: profileImgPreview?.file, requestBody: requestInfo })

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
                                                (values?.profile_img || profileImgPreview?.preview)
                                                    ?
                                                    <img src={profileImgPreview?.preview || values?.profile_img} alt="Profile image" className="border-grey-50 border-2 shadow-2xl w-16 h-16 sm:w-18 sm:h-18 rounded-full" />
                                                    :
                                                    <span className="text-gray-600 font-medium text-xs">Profile image not set</span>
                                            }

                                            {/* Info */}
                                            <div className="flex flex-col">
                                                <h2 className="text-xl sm:text-2xl font-semibold text-grey-800">
                                                    {profile?.username}
                                                </h2>
                                                <p className="text-sm sm:text-md text-grey-500">
                                                    {user?.email}
                                                </p>
                                                <Badge
                                                    className={"mt-2"}
                                                    variant={license.status === 'approved' ? 'default' : license.status === 'pending' ? 'outline' : license.status === 'rejected' ? 'destructive' : 'secondary'}
                                                >
                                                    {
                                                        license?.status === 'approved'
                                                            ?
                                                            'Licensed'
                                                            :
                                                            license?.status === 'pending'
                                                                ?
                                                                'Pending License'
                                                                :
                                                                license.status === 'rejected'
                                                                    ?
                                                                    'Rejected Licens'
                                                                    :
                                                                    'Unlicensed'
                                                    }
                                                </Badge>
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

                                        if (!file) return;

                                        setFieldValue("profile_img", file)

                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                // reader.result is a base64 data-URL
                                                setProfileImgPreview({ file, preview: reader.result })
                                            }
                                            reader.readAsDataURL(file)

                                        }
                                    }}
                                />

                                {
                                    (profileImgPreview.file || profileImgPreview.preview)
                                    &&
                                    <button
                                        onClick={() => {
                                            setProfileImgPreview({ file: null, preview: null })
                                            setFieldValue("profile_img", imageUrl)
                                        }}
                                        className="cursor-pointer text-sm text-primary-500 font-bold hover:underline mb-6 flex items-center gap-1"
                                    >
                                        <Icon icon="mdi:iconoir-cancel" width="16" height="16" />
                                        Reset Profile-Image
                                    </button>
                                }
                                <button
                                    onClick={() => profileInputRef.current?.click()}
                                    className="cursor-pointer text-sm text-primary-500 font-bold hover:underline mb-6 flex items-center gap-1"
                                >
                                    <Icon icon="mdi:edit-outline" width="16" height="16" />
                                    {profile?.profile_img ? "Update" : "Upload"} Profile-Image
                                </button>
                                <ErrorMessage name="profile_img">
                                    {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                </ErrorMessage>

                                {/* Form */}
                                <div className="space-y-4">
                                    {/* Business Location */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-grey-700 mb-1">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="username"
                                                value={values.username}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                type="text"
                                                placeholder="Enter Usernam"
                                                className="border border-grey-300 rounded-lg pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-full"
                                            />
                                            <User
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400"
                                                size={18}
                                            />
                                        </div>
                                        <ErrorMessage name="username">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    {/* Save Changes Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full sm:w-auto bg-primary-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                </Formik>

                <div className="py-5" />

                <hr />

                <div className="py-5" />

                <div className="p-4 sm:p-6">
                    <div
                        onClick={() => {
                            if (licenseFile.ext || licenseFile.file) return toast.info("File already selected");

                            licenseInputRef.current?.click()
                        }}
                        className="p-4 rounded-xl border border-primary-200 bg-primary-50/40"
                    >
                        <div className="flex items-start gap-3">

                            {/* Icon */}
                            <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                                <Briefcase size={18} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <p className="text-sm font-semibold text-gray-800">
                                    License credentials
                                </p>

                                <p className="text-xs text-gray-600 leading-relaxed">
                                    To offer healthcare-related services, you’ll need to upload valid
                                    professional credentials. This helps maintain trust and compliance. You DO NOT need a license to offer domestic services!
                                </p>

                                {/* Upload */}
                                <label className="inline-flex items-center gap-2 text-xs font-medium text-primary-600">
                                    Upload license document
                                </label>

                                <input
                                    ref={licenseInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    style={{
                                        display: 'none'
                                    }}
                                    // className="hidden"

                                    onChange={(e) => {
                                        const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9MB

                                        const file = e.target.files?.[0]
                                        if (!file) return

                                        const allowedTypes = [
                                            'application/pdf',
                                            'image/png',
                                            'image/jpg',
                                            'image/jpeg',
                                        ]

                                        // File type check
                                        if (!allowedTypes.includes(file.type)) {
                                            return toast.info("Invalid file type. Must be PDF, JPG, JPEG or PNG")
                                        }

                                        // File size check
                                        if (file.size > MAX_FILE_SIZE) {
                                            return toast.info("File size too large. Maximum allowed is 5MB")
                                        }

                                        const ext = file.type === 'application/pdf' ? 'pdf' : 'image'

                                        setLicenseFile({ file, ext })
                                    }}

                                />

                                {/* Helper */}
                                <p className="text-[11px] text-gray-400">
                                    Accepted formats: PDF, JPG, PNG · Max size 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {
                        (licenseFile.ext && licenseFile.file)
                        &&
                        <div className="mt-5">
                            <div className="mb-3">
                                <label className="text-sm font-medium text-grey-700 mb-1">
                                    Extra text
                                </label>
                                <input
                                    value={licenseExtraText}
                                    onChange={e => setLicenseExtraText(e.target.value)}
                                    type="text"
                                    placeholder="Say something about this particular document"
                                    className="border border-grey-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-full"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleLicenseUpload}
                                    className="w-full sm:w-auto bg-primary-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                >
                                    Upload
                                </Button>

                                <Button
                                    onClick={() => {
                                        setLicenseExtraText("")
                                        setLicenseFile({ file: null, ext: null })
                                    }}
                                    className="w-full sm:w-auto bg-red-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    }
                </div>


                <div className="py-5" />

                <hr />

                <div className="py-5" />

                <Formik
                    enableReinitialize
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
                    enableReinitialize
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
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
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

                <div className="py-5" />

                <hr />

                <div className="py-5" />

                <Formik
                    enableReinitialize
                    validationSchema={yup.object().shape({
                        country: yup.string().required("Country is required"),
                        state: yup.string().required("State is required"),
                        city: yup.string().required("City is required"),
                        address: yup.string().required("Address is required"),
                    })}
                    initialValues={{
                        country: profile?.country || '',
                        state: profile?.state || '',
                        city: profile?.city || '',
                        address: profile?.address || '',
                    }}
                    onSubmit={values => {
                        setApiReqs({
                            isLoading: true,
                            errorMsg: null,
                            data: {
                                type: 'editProfile',
                                requestInfo: values
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
                                            Country
                                        </label>
                                        <input
                                            name="country"
                                            value={values.country}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Nigeria, USA, Ghana e.t.c"
                                            className="flex-1 border border-t-0 sm:border-t border-grey-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none"
                                        />
                                        <ErrorMessage name="country">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-600">
                                            State
                                        </label>
                                        <input
                                            name="state"
                                            value={values.state}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Lagos, Cross River, e.t.c."
                                            className="flex-1 border border-t-0 sm:border-t border-grey-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none"
                                        />
                                        <ErrorMessage name="state">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-600">
                                            City
                                        </label>
                                        <input
                                            name="city"
                                            value={values.city}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Calabar, e.t.c."
                                            className="flex-1 border border-t-0 sm:border-t border-grey-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none"
                                        />
                                        <ErrorMessage name="city">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                        <label className="text-sm font-medium text-gray-600">
                                            Addreess
                                        </label>
                                        <input
                                            name="address"
                                            value={values.address}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="No 3. 123-road off..."
                                            className="flex-1 border border-t-0 sm:border-t border-grey-300 bg-grey-50 rounded-lg px-4 py-3 text-sm placeholder-grey-400 focus:outline-none"
                                        />
                                        <ErrorMessage name="address">
                                            {errorMsg => <ErrorMsg1 errorMsg={errorMsg} position={'left'} />}
                                        </ErrorMessage>
                                    </div>

                                    {/* Save Changes Button */}
                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full sm:w-auto bg-primary-600 shadow-2xl text-white rounded-4xl py-4 sm:py-5 font-medium"
                                    >
                                        Update Address
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