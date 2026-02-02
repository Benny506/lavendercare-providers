import { getAppointmentStatus, sortByStatusPriority } from "@/lib/utils"
import { createSlice } from "@reduxjs/toolkit"

const userDetailsSlice = createSlice({
    name: 'userDetailsSlice',
    initialState: {
        profile: null,
        session: null,
        user: null,
        appointments: [],
        services: [],
        bookings: [],
        phone_number: {
            phone_number: null,
            country_code: null
        },
        bank: null,
        license: {},
        assignedMothers: [],
        referral: null
    },
    reducers: {
        setUserDetails: (state, action) => {
            if (action?.payload?.profile) {
                state.profile = action.payload?.profile
            }

            if (action?.payload?.services) {
                state.services = action?.payload?.services
            }

            if (action?.payload?.session) {
                state.session = action?.payload?.session
            }

            if (action?.payload?.user) {
                state.user = action?.payload?.user
            }

            if (action?.payload?.bookings) {
                const allAppointments = (action.payload?.bookings || []).map(b => {

                    const { status, start_time, duration } = b                

                    const updatedStatus = getAppointmentStatus({
                        status,
                        start_time,
                        duration_secs: duration
                    })

                    console.log(updatedStatus)

                    return {
                        ...b,
                        status: updatedStatus
                    }
                })

                state.bookings = sortByStatusPriority(allAppointments)
            }

            if (action?.payload?.phone_number) {
                const number = action?.payload?.phone_number

                if (number?.phone_number && number?.country_code) {
                    state.phone_number.country_code = number?.country_code
                    state.phone_number.phone_number = number?.phone_number
                }
            }

            if (action?.payload?.bank) {
                state.bank = action?.payload?.bank
            }

            if (action?.payload?.license) {
                state.license = action?.payload?.license
            }

            if (action?.payload?.assignedMothers) {
                state.assignedMothers = action?.payload?.assignedMothers
            }

            if (action?.payload?.referral) {
                state.referral = action?.payload?.referral
            }
        },
        clearUserDetails: (state, action) => {
            state.profile = null
            state.session = null
            state.user = null
            state.services = []
            state.bookings = []
            state.phone_number = {
                phone_number: null,
                country_code: null
            }
            state.bank = null
            state.license = {}
            state.assignedMothers = []
            state.referral = null
        }
    }
})

export const { setUserDetails, clearUserDetails } = userDetailsSlice.actions

export const getUserDetailsState = state => state.userDetailsSlice

export default userDetailsSlice.reducer