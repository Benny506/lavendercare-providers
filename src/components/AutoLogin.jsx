import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AppLoading from "./appLoading/AppLoading"
import { useDispatch } from "react-redux"
import { setUserDetails } from "@/redux/slices/userDetailsSlice"
import supabase, { getVendorDetails } from "@/database/dbInit"

export default function AutoLogin({ children }){
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [appLoading, setAppLoading] = useState(true)

    // 1. Restore session & subscribe to auth changes
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if(session?.user){
                setUser(session?.user)
                setSession(session)
            
            } else{
                autoLoginError()
            }
        })

        // const { subscription } = supabase.auth.onAuthStateChange(
        //     (_event, session) => {
        //         setSession(session)
        //     }
        // )

        // return () => subscription.unsubscribe()

    }, [])

    // 2. Fetch related data once we have the user
    useEffect(() => {
        if (!user || !session) return;

        // console.log(user)

        async function loadProfile() {

            const { data: infoData, error: infoError } = await getVendorDetails({ id: user.id })

            if (infoError) {
                autoLoginError()
                console.error('Error loading profile:', infoError)

            } else {

                const { profile, services, bookings, phone_number, bank } = infoData

                dispatch(setUserDetails({
                    user,
                    session,
                    profile,
                    services,
                    bookings,
                    phone_number,
                    bank
                }))

                setAppLoading(false)
            }
        }

        loadProfile()
    }, [user]) 
    
    const autoLoginError = () => {
        navigate('/login', { replace: true })
        setAppLoading(false)

        console.log("Auto-login failure")

        return;
    }

    if(appLoading) return <AppLoading tempLoading={true} />

    return (
        <div>
            { children }
        </div>
    )
}