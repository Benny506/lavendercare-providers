import Modal from '@/components/Modal'
import supabase from '@/database/dbInit'
import { appLoadStart, appLoadStop } from '@/redux/slices/appLoadingSlice'
import { getUserDetailsState, setUserDetails } from '@/redux/slices/userDetailsSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const HideService = ({
    isOpen=false,
    service=null,
    hide=()=>{}
}) => {

    const dispatch = useDispatch()

    const profile = useSelector(state => getUserDetailsState(state).profile)
    const services = useSelector(state => getUserDetailsState(state).services)
    const bookings = useSelector(state => getUserDetailsState(state).bookings)

    const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if(isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());
        
        if(isLoading && data){
            const { type } = data

            if(type === 'hideService' || type === 'showService'){
                updateServiceVisibility({ status: type === 'hideService' ? 'hidden' : 'approved' })
            }

            // if(type === 'deleteService'){
            //     deleteService()
            // }
        }
    }, [apiReqs])

    const updateServiceVisibility = async ({ status }) => {
        try {

            const { data, error } = await supabase
                .from('services')
                .update({
                    status
                })
                .eq('vendor_id', profile?.id)
                .eq('id', service?.id)
                .select()
                .single()

            if(error){
                console.error(error)
                throw new Error()
            }

            const updatedServices = (services || []).map(s => {
                if(s?.id === service?.id){
                    return {
                        ...s,
                        status
                    }
                }

                return s
            })

            dispatch(setUserDetails({
                services: updatedServices
            }))

            setApiReqs({ isLoading: false, errorMsg: null, data: null })
            hide()
            toast.success("Service status updated to: " + status)
            
        } catch (error) {
            console.error(error)
            return updateServiceVisibilityFailure({ errorMsg: 'Something went wrong! Try again.' })
        }
    }
    const updateServiceVisibilityFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    // const deleteService = async () => {
    //     try {

    //         //check if any future booking exists
    //         const { count: bookingsForServiceCount, error: bookingsForServiceCountError } = await supabase
    //             .from('vendor_bookings')
    //             .select('*', { count: "exact", head: true })
    //             .eq("service_id", service?.id)    
    //             .gte("day", new Date().toISOString().split("T")[0])   
                
    //         if(bookingsForServiceCountError){
    //             console.error(bookingsForServiceCountError)
    //             throw new Error()
    //         }

    //         if(bookingsForServiceCount > 0){
    //             hide()

    //             setApiReqs({ isLoading: false, errorMsg: null, data: null })
    //             toast.info("A booking at a future date exists for this service. You must complete that booking before you can delete the service")

    //             return;
    //         }
            
    //         const { error: deleteBookingsError } = await supabase
    //             .from("vendor_bookings")
    //             .delete()
    //             .eq("vendor_id", profile?.id)
    //             .eq('service_id', service?.id)

    //         const { error: deleteServiceError } = await supabase
    //             .from('services')
    //             .delete()
    //             .eq('vendor_id', profile?.id)
    //             .eq('id', service?.id)

    //         if(deleteServiceError || deleteBookingsError){
    //             console.error("deleteServiceError", deleteServiceError)
    //             console.error("deleteBookingsError", deleteBookingsError)

    //             throw new Error()
    //         }

    //         const updatedServices = (services || []).filter(s => s?.id !== service?.id)
    //         const updatedBookings = (bookings || []).filter(b => b?.service_id !== service?.id)

    //         dispatch(setUserDetails({
    //             services: updatedServices,
    //             bookings: updatedBookings
    //         }))

    //         hide()
    //         toast.success("Service deleted")
            
    //     } catch (error) {
    //         console.error(error)
    //         return deleteServiceFailure({ errorMsg: 'Something went wrong! Try again.' })
    //     }
    // }
    // const deleteServiceFailure = ({ errorMsg }) => {
    //     setApiReqs({ isLoading: false, errorMsg, data: null })
    //     toast.error(errorMsg)

    //     return
    // }

    if(!service) return <></>

    return (
        <>
            {
                isOpen
                &&
                    <Modal
                        onClose={hide}
                        image="/assets/brush.svg"
                        title={service?.status === 'hidden' ? 'Show' : "Hide Service"}
                        // description={service?.status === 'hidden' ? 'Deleting a service removes it completely. This action cannot be undone' : "Hiding this service will invisble to users. All bookings already made will not be affected, but new bookings cannot be made. Only hidden services can be deleted."}
                        description={service?.status === 'hidden' ? 'This service will now be visible by all users. Thus, it can accept new bookings' : 'Hiding this service will invisble to users. All bookings already made along with rescheduled bookings will not be affected, but new bookings cannot be made.'}
                        primaryButton='Proceed'
                        secondaryButton='Cancel'
                        secondaryButtonFunc={hide}
                        primaryButtonFunc={() => {
                            if(service?.status === 'pending'){
                                toast.info("Wait till service has been reviewed by admin!")
                                return 
                            }
                            setApiReqs({
                                isLoading: true,
                                errorMsg: null,
                                data: {
                                    // type: service?.status === 'hidden' ? 'deleteService' : 'hideService'
                                    type: service?.status === 'hidden' ? "showService" : 'hideService'
                                }
                            })
                        }}
                        styles={{
                            wrapper: "max-w-xs md:max-w-md",
                            description: "text-center text-grey-500 mt-2 mb-20",
                            footer: "flex flex-col gap-3 mt-6 w-full",
                            primaryButton: "w-full px-5 py-3 bg-primary-500 text-grey-50 rounded-4xl font-semibold mb-1",
                            secondaryButton: "w-full px-5 py-3 bg-primary-50 text-primary-700 rounded-4xl font-semibold"
                        }}
                    />                
            }
        </>
    )
}

export default HideService