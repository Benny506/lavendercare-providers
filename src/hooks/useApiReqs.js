import supabase from "@/database/dbInit"
import { sendEmail } from "@/database/email/email"
import { removeDuplicatesFromStringArr } from "@/lib/utils"
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice"
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { v4 as uuidv4 } from 'uuid'

export default function useApiReqs() {

    const dispatch = useDispatch()

    const user = useSelector(state => getUserDetailsState(state).user)
    const license = useSelector(state => getUserDetailsState(state).license)
    const bookings = useSelector(state => getUserDetailsState(state).bookings)
    const assignedMothers = useSelector(state => getUserDetailsState(state).assignedMothers)
    const services = useSelector(state => getUserDetailsState(state).services)





    //dashboard
    const getDashboardStats = async ({ callBack = () => { } }) => {
        try {

            dispatch(appLoadStart())

            const assignedMothersIds = removeDuplicatesFromStringArr({ arr: assignedMothers.map(assigned => assigned?.mother_id) })

            const { count: physicalBookingsCount, error: physicalBookingsError } = await supabase
                .from('all_bookings')
                .select('*', { count: 'exact', head: true })
                .eq("provider_id", user?.id)
                .is("is_virtual", false)

            const { count: newPhysicalBookingsCount, error: newPhysicalBookingsError } = await supabase
                .from('all_bookings')
                .select('*', { count: 'exact', head: true })
                .eq("provider_id", user?.id)
                .is("is_virtual", false)
                .eq('status', 'new')

            const { count: virtualBookingsCount, error: virtualBookingsError } = await supabase
                .from('all_bookings')
                .select('*', { count: 'exact', head: true })
                .eq("provider_id", user?.id)
                .is("is_virtual", true)

            const { count: newVirtualBookingsCount, error: newVirtualBookingsError } = await supabase
                .from('all_bookings')
                .select('*', { count: 'exact', head: true })
                .eq("provider_id", user?.id)
                .is("is_virtual", true)
                .eq('status', 'new')

            const { count: screeningsCount, error: screeningsError } = await supabase
                .from('mental_health_test_answers')
                .select('*', { count: 'exact', head: true })
                .in('user_id', assignedMothersIds)

            const { count: HRA_Count, error: HRA_Error } = await supabase
                .from('high_risk_alerts')
                .select('*', { count: 'exact', head: true })
                .in('user_id', assignedMothersIds)

            if (physicalBookingsError || virtualBookingsError || screeningsError || HRA_Error || newVirtualBookingsError || newPhysicalBookingsError) {
                console.log("physicalBookingsError", physicalBookingsError)
                console.log("virtualBookingsError", virtualBookingsError)
                console.log("screeningsError", screeningsError)
                console.log("HRA_Error", HRA_Error)
                console.log("newVirtualBookingsError", newVirtualBookingsError)
                console.log("newPhysicalBookingsError", newPhysicalBookingsError)

                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({
                physicalBookingsCount,
                virtualBookingsCount,
                screeningsCount,
                HRA_Count,
                newVirtualBookingsCount,
                newPhysicalBookingsCount
            })

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error loading dashboard statistics' })
        }
    }





    //servicees
    const addService = async ({ callBack = () => { }, serviceInfo, serviceTypes = [], locations = [] }) => {
        try {
            if (serviceTypes?.length === 0) throw new Error("At least one pricing tier is required")

            dispatch(appLoadStart())

            // Separate existing locations from newly created ones
            const existingLocIds = locations.filter(loc => loc.id && typeof loc.id === 'string' && loc.id.length > 10).map(loc => loc.id);
            const newLocs = locations.filter(loc => !loc.id || typeof loc.id === 'number'); // New locations have temp numeric IDs

            const { data: serviceId, error: setupError } = await supabase.rpc("setup_full_service", {
                p_service_id: serviceInfo.id || null,
                p_service_data: serviceInfo,
                p_service_types: serviceTypes.map(({ scheduling_mode, ...rest }) => rest), // Strip UI helper fields
                p_existing_location_ids: existingLocIds,
                p_new_locations: newLocs.map(({ id, ...rest }) => rest)
            })

            if (setupError) {
                console.error("setup_full_service error:", setupError)
                throw setupError
            }

            // Fetch the fully created service to update local state
            const { data: fullService } = await supabase
                .from("services")
                .select(`
                    *,
                    service_types(*),
                    service_location_links(
                        location_id,
                        provider_locations(*)
                    )
                `)
                .eq("id", serviceId)
                .single()

            // Smart update: replace if editing, prepend if new
            let updatedServices;
            if (serviceInfo.id) {
                updatedServices = (services || []).map(s => s.id === serviceInfo.id ? fullService : s);
            } else {
                updatedServices = [fullService, ...(services || [])];
            }

            dispatch(setUserDetails({ services: updatedServices }))
            callBack({ service: fullService })

        } catch (error) {
            console.error("Error adding service:", error)
            toast.error(error.message || "Failed to create service. Please try again.")
        } finally {
            dispatch(appLoadStop())
        }
    }

    const getServices = async ({ callBack = () => { } }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from('services')
                .select(`
                    *,
                    service_types(*),
                    service_location_links(
                        location_id,
                        provider_locations(*)
                    )
                `)
                .eq('provider_id', user?.id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(setUserDetails({ services: data }))

            dispatch(appLoadStop())

            callBack && callBack({ services: data })

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error loading services' })
        }
    }
    const getServiceCategories = async ({ callBack = () => { } }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("vendor_service_categories")
                .select("*");

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ serviceCategories: data })

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error loading services categories' })
        }
    }
    const getServiceTypes = async ({ callBack = () => { }, service_id }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("service_types")
                .select("*")
                .eq("service_id", service_id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ serviceTypes: data })

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error loading service types' })
        }
    }
    const getSingleService = async ({ callBack = () => { }, service_id }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("services")
                .select(`
                    *,
                    types: service_types ( * )    
                `)
                .single()
                .eq("id", service_id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ service: data })

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error loading single service' })
        }
    }
    const editService = async ({ callBack = () => { }, update, service }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from('services')
                .update(update)
                .eq('id', service?.id)
                .select()
                .single()

            if (error) {
                console.log(error)
                throw new Error()
            }

            const updatedService = {
                ...(service || {}),
                ...update
            }

            const updatedServices = (services || []).map(s => {
                if (s.id === service?.id) {
                    return {
                        ...s,
                        ...update
                    }
                }

                return s
            })

            dispatch(setUserDetails({ services: updatedServices }))

            dispatch(appLoadStop())

            callBack && callBack({ updatedService })

            toast.success("Service editted")

            return


        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error updating service' })
        }
    }
    const addServiceType = async ({ callBack = () => { }, requestInfo, service }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("service_types")
                .insert(requestInfo)
                .select()
                .single()

            if (error) {
                console.log(error)
                if (error.message?.toLowerCase().includes("duplicate key")) return apiReqsError({ errorMsg: 'Session with this duration already exists for this service' });
                throw new Error()
            }

            const updatedService = {
                ...(service || {}),
                types: [data, ...(service?.types || [])]
            }

            const updatedServices = services?.map(s => {
                if (s?.id === service?.id) {
                    return updatedService
                }

                return s
            })

            dispatch(setUserDetails({ services: updatedServices }))

            dispatch(appLoadStop())

            callBack && callBack({ updatedService })

            toast.success("Service type saved")

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error adding service type' })
        }
    }
    const updateServiceType = async ({ callBack = () => { }, requestInfo, service }) => {
        try {

            dispatch(appLoadStart())

            const { update, type_id } = requestInfo

            if (!update || !type_id) throw new Error();

            const { data, error } = await supabase
                .from("service_types")
                .update(update)
                .eq("id", type_id)
                .select()
                .single()

            if (error) {
                console.log(error)
                if (error.message?.toLowerCase().includes("duplicate key")) return apiReqsError({ errorMsg: 'Session with this duration already exists for this service' });
                throw new Error()
            }

            const updatedService = {
                ...(service || {}),
                types: (service?.types || [])?.map(t => {
                    if (t?.id === type_id) {
                        return data
                    }

                    return t
                })
            }

            const updatedServices = services?.map(s => {
                if (s?.id === service?.id) {
                    return updatedService
                }

                return s
            })

            dispatch(setUserDetails({ services: updatedServices }))

            dispatch(appLoadStop())

            callBack && callBack({ updatedService })

            toast.success("Service type info saved")

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error updating service type' })
        }
    }
    const deleteServiceType = async ({ callBack = () => { }, service, requestInfo }) => {
        try {

            dispatch(appLoadStart())

            const { type_id } = requestInfo

            if (!type_id) throw new Error();

            const { data, error } = await supabase
                .from("service_types")
                .delete()
                .eq("id", type_id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            const updatedService = {
                ...(service || {}),
                types: (service?.types || [])?.filter(t => t?.id !== type_id)
            }

            const updatedServices = services?.map(s => {
                if (s?.id === service?.id) {
                    return updatedService
                }

                return s
            })

            dispatch(setUserDetails({ services: updatedServices }))

            dispatch(appLoadStop())

            callBack && callBack({ updatedService })

            toast.success("Service type info saved")

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error deleting service type' })
        }
    }





    //bookings
    const getBookings = async ({ callBack = () => { } }) => {
        try {
            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from('all_bookings')
                .select(`
                    *,
                    user_profile: user_profiles(*),
                    serviceInfo: services(*)
                `)
                .eq('provider_id', user?.id)
                .neq('status', 'pending')
                .order("day", { ascending: true, nullsFirst: false })
                .order('start_time', { ascending: true, nullsFirst: false })

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(setUserDetails({ bookings: data }))

            dispatch(appLoadStop())

            callBack && callBack({})

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error loading bookings' })
        }
    }
    const updateBookingSummary = async ({ callBack = () => { }, booking_id, summary_note, prescription }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from('all_bookings')
                .update({
                    summary_note,
                    prescription
                })
                .eq("id", booking_id)
                .select()
                .single()

            if (error) {
                console.log(error)
                throw new Error()
            }

            const updatedBookings = bookings?.map(b => {
                if (b?.id === booking_id) {
                    return {
                        ...b,
                        summary_note,
                        prescription
                    }
                }

                return b
            })

            dispatch(setUserDetails({ bookings: updatedBookings }))

            dispatch(appLoadStop())

            callBack && callBack({})

            toast.success("Booking Summary saved!")

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error setting summary note and prescription' })
        }
    }





    //availability
    const deleteConsultationType = async ({ callBack = () => { }, type_id }) => {
        try {

            if (!type_id) throw new Error();

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("consultation_types")
                .delete()
                .eq("id", type_id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            const updatedProfile = {
                ...(profile || {}),
                consultation_types: (profile?.consultation_types || [])?.filter(t => t?.id !== type_id)
            }

            dispatch(setUserDetails({
                profile: updatedProfile
            }))

            dispatch(appLoadStop())

            callBack && callBack({ deleted_type_id: type_id })

            toast.success("Consultation info saved")

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Something went wrong! Try again' })
        }
    }

    const updateConsultationType = async ({ callBack = () => { }, update, type_id }) => {
        try {

            if (!update || !type_id) throw new Error();

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("consultation_types")
                .update(update)
                .eq("id", type_id)
                .select()
                .single()

            if (error) {
                console.log(error)
                if (error.message?.toLowerCase().includes("duplicate key")) return apiReqsError({ errorMsg: 'Session with this duration already exists for this service' });
                throw new Error()
            }

            const updatedProfile = {
                ...(profile || {}),
                consultation_types: (profile?.consultation_types || [])?.map(t => {
                    if (t?.id === type_id) {
                        return data
                    }

                    return t
                })
            }

            dispatch(setUserDetails({ profile: updatedProfile }))

            dispatch(appLoadStop())

            callBack && callBack({ updatedType: data })

            toast.success("Consultation info saved")

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Something went wrong! Try again' })
        }
    }

    const insertConsultationType = async ({ callBack = () => { }, requestInfo }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("consultation_types")
                .insert(requestInfo)
                .select()
                .single()

            if (error) {
                console.log(error)
                if (error.message?.toLowerCase().includes("duplicate key")) return apiReqsError({ errorMsg: 'Session with this duration already exists' });
                throw new Error()
            }

            const updatedProfile = {
                ...(profile || {}),
                consultation_types: [data, ...(profile?.consultation_types || [])]
            }

            dispatch(setUserDetails({ profile: updatedProfile }))

            dispatch(appLoadStop())

            callBack && callBack({ newType: data })

            toast.success("Session info saved")

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Error creating session type!' })
        }
    }





    //users
    const getUserInfo = async ({ callBack = () => { }, user_id }) => {
        try {

            dispatch(appLoadStart())

            const { data: userInfo, error: userInfoError } = await supabase
                .from('user_profiles')
                .select("*")
                .single()
                .eq("id", user_id)

            const { data: userBookings, error: userBookingsError } = await supabase
                .from("all_bookings")
                .select(`
                    *,
                    serviceInfo: services (*)    
                `)
                .eq("user_id", user_id)
                .eq("provider_id", user?.id)

            const { data: userScreenings, error: userScreeningsError } = await supabase
                .from('mental_health_test_answers')
                .select(`*`)
                .eq('user_id', user_id)

            if (userInfoError || userBookingsError || userScreeningsError) {
                console.log(userInfoError, userBookingsError, userScreeningsError)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ user: userInfo, userBookings, userScreenings })

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Error retrieving user information!' })
        }
    }
    const fetchUsersAssignedToMe = async ({ callBack = () => { }, }) => {
        try {

            dispatch(appLoadStart())

            const assignedMothersIds = removeDuplicatesFromStringArr({ arr: assignedMothers.map(assigned => assigned?.mother_id) })

            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .in("id", assignedMothersIds)

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ bookedUsers: data })

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Error retrieving booked users information!' })
        }
    }





    //screenings
    const getScreenings = async ({ callBack = () => { } }) => {
        try {

            dispatch(appLoadStart())

            const assignedMothersIds = removeDuplicatesFromStringArr({ arr: assignedMothers.map(assigned => assigned?.mother_id) })

            const { data, error } = await supabase
                .from('mental_health_test_answers')
                .select(`
                    *,
                    user_profile: user_profiles (*)
                `)
                .in('user_id', assignedMothersIds)
                .order("created_at", { ascending: false })

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ screenings: data })

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Error retrieving booked users screening information!' })
        }
    }
    const getUserScreenings = async ({ callBack = () => { }, user_id }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from('mental_health_test_answers')
                .select(`*`)
                .eq('user_id', user_id)
                .order("created_at", { ascending: false })

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ screenings: data })

        } catch (error) {
            console.log(error)
            apiReqsError({ errorMsg: 'Error retrieving booked user screening information!' })
        }
    }
    const fetchTestResults = async ({ callBack = () => { }, requestInfo }) => {
        try {

            dispatch(appLoadStart())

            const { answer } = requestInfo

            const questionIds = answer?.map(ans => ans.question_id)

            const { data: questions, error } = await supabase
                .from('questions')
                .select('*')
                .in("id", questionIds)

            if (error) {
                console.log(error)
                throw new Error()
            }

            const groupedQuestions = questions.map((ques => {
                const _answer = answer.filter(ans => ans.question_id == ques.id).map(ans => ans.answer)[0]

                return {
                    ...ques,
                    answer: _answer
                }
            }))

            dispatch(appLoadStop())

            callBack && callBack({ groupedQuestions })

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error fetching test results' })
        }
    }





    //high risk alerts
    const markAsViewed = async ({ callBack = () => { }, screening_id }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from('high_risk_alerts')
                .update({ viewed: true })
                .eq("screening_id", screening_id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(appLoadStop())

            callBack && callBack({ screening_id })

            toast.success("Marked as viewed")

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error marking as viewed' })
        }
    }





    //licenses
    const updateLicense = async ({ callBack = () => { }, documents }) => {
        try {

            dispatch(appLoadStart())

            const { data, error } = await supabase
                .from("providers_licenses")
                .upsert(
                    {
                        provider_id: user?.id,
                        updated_at: new Date().toISOString(),
                        created_at: license?.created_at || new Date().toISOString(),
                        documents,
                        id: license?.id || uuidv4(),
                        status: 'pending'
                    },
                    {
                        onConflict: 'provider_id'
                    }
                )
                .select()
                .single()

            if (error) {
                console.log(error)
                throw new Error()
            }

            dispatch(setUserDetails({ license: data }))

            dispatch(appLoadStop())

            callBack && callBack({})

            toast.success("License updated")

        } catch (error) {
            console.log(error)
            return apiReqsError({ errorMsg: 'Error updating license document' })
        }
    }





    const apiReqsError = ({ errorMsg }) => {
        dispatch(appLoadStop())
        toast.error(errorMsg)

        return;
    }





    return {
        //dashboard
        getDashboardStats,





        //services
        addService,
        getServices,
        getServiceCategories,
        getServiceTypes,
        getSingleService,
        editService,
        addServiceType,
        updateServiceType,
        deleteServiceType,





        //bookings
        getBookings,
        updateBookingSummary,




        //availability
        updateConsultationType,
        deleteConsultationType,
        insertConsultationType,





        //users
        getUserInfo,
        fetchUsersAssignedToMe,





        //screenings
        getScreenings,
        getUserScreenings,
        fetchTestResults,





        //high risk alerts
        markAsViewed,





        //licenses
        updateLicense
    }
}