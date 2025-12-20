import { getUserDetailsState } from "@/redux/slices/userDetailsSlice"
import { useSelector } from "react-redux"
import { Button } from "./ui/button"
import Image from "./ui/image"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function ProtectedRoute({ children }){
    
    const navigate = useNavigate() 
    
    const userProfile = useSelector(state => getUserDetailsState(state).profile)

    useEffect(() => {
        if(!userProfile?.id){
            navigate('/login', { replace: true })
        }
    }, [userProfile])

    if(!userProfile?.id) return <></>

    return(
        <> 
            { children }
        </>
    )
}