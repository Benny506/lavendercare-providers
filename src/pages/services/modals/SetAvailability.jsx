import ErrorMsg1 from '@/components/ErrorMsg1';
import HourSelect from '@/components/HourSelect';
import Modal from '@/components/Modal'
import { Button } from '@/components/ui/button';
import { extractHour_FromHHMM, timeToAMPM_FromHour } from '@/lib/utils';
import { ErrorMessage, Formik } from 'formik';
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup'

const DEFAULT_SLOTS = [
    { "start_hour": 1, "end_hour": 2 },
    { "start_hour": 2, "end_hour": 3 },
    { "start_hour": 3, "end_hour": 4 },
    { "start_hour": 4, "end_hour": 5 },
    { "start_hour": 5, "end_hour": 6 },
    { "start_hour": 6, "end_hour": 7 },
    { "start_hour": 7, "end_hour": 8 },
    { "start_hour": 8, "end_hour": 9 },
    { "start_hour": 9, "end_hour": 10 },
    { "start_hour": 10, "end_hour": 11 },
    { "start_hour": 11, "end_hour": 12 },
    { "start_hour": 12, "end_hour": 13 },
    { "start_hour": 13, "end_hour": 14 },
    { "start_hour": 14, "end_hour": 15 },
    { "start_hour": 15, "end_hour": 16 },
    { "start_hour": 16, "end_hour": 17 },
    { "start_hour": 17, "end_hour": 18 },
    { "start_hour": 18, "end_hour": 19 },
    { "start_hour": 19, "end_hour": 20 },
    { "start_hour": 20, "end_hour": 21 },
    { "start_hour": 21, "end_hour": 22 },
    { "start_hour": 22, "end_hour": 23 },
]


function isSlotAvailable({ existingSlots, newSlot }) {
    return existingSlots.every(({ start_hour, end_hour }) => {
        // no overlap if new slot ends before or at existing start
        // OR new slot starts after or at existing end
        return newSlot.end_hour <= start_hour || newSlot.start_hour >= end_hour;
    });
}

const SetAvailability = ({
    info = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    },
    isOpen,
    hide = () => { },
    goBackAStep = () => { },
    handleContinueBtnClick = () => { },
    continueBtnText = null
}) => {

    const [days, setDays] = useState(info)

    const [selectedDay, setSelectedDay] = useState('monday')

    const displaySelectedSlotsForDay = days[selectedDay]?.map((s, i) => {
        const { start_hour, end_hour } = s

        const removeSlot = () => {
            const updatedSelectedDay = days[selectedDay].filter(s => s.start_hour !== start_hour && s.end_hour !== end_hour)
            setDays(prev => ({
                ...prev,
                [selectedDay]: updatedSelectedDay
            }))
        }

        return (
            <div
                key={i}
                onClick={removeSlot}
                className='flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded border border-grey-100 px-5 py-2'
            >
                <p className='m-0 p-0 text-sm'>
                    {start_hour} - {end_hour}
                </p>

                <X color='#000' size={18} />
            </div>
        )
    })

    const displayDefaultSlots = DEFAULT_SLOTS.map((s, i) => {
        const { start_hour, end_hour } = s

        const selected = days[selectedDay]?.map(s => ({
            start_hour: extractHour_FromHHMM({ hourString: s?.start_hour }),
            end_hour: extractHour_FromHHMM({ hourString: s?.end_hour }),
        }))

        const getIsSelected = () => {
            for (let i = 0; i < selected?.length; i++) {
                if (selected[i]?.start_hour === start_hour && selected[i]?.end_hour === end_hour) {
                    return true
                }
            }

            return false
        }

        const isSelected = getIsSelected()

        const addSlot = () => {
            if (isSelected) return;

            const sH = `${String(start_hour).padStart(2, "0")}:00`
            const eH = `${String(end_hour).padStart(2, "0")}:00`

            const slotAvailable = isSlotAvailable({
                existingSlots: days[selectedDay],
                newSlot: {
                    start_hour: sH,
                    end_hour: eH,
                }
            })

            if (!slotAvailable) {
                toast.info("Slot is not available")
                return
            }

            const updatedDays = days[selectedDay] = [
                ...days[selectedDay],
                {
                    start_hour: sH, end_hour: eH
                }
            ]

            setDays(prev => ({
                ...prev,
                [selectedDay]: updatedDays
            }))
        }

        return (
            <div
                key={i}
                onClick={addSlot}
                className={`flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-100'} rounded border border-grey-100 px-5 py-2`}
            >
                <p className='m-0 p-0 text-xs'>
                    {timeToAMPM_FromHour({ hour: start_hour })} - {timeToAMPM_FromHour({ hour: end_hour })}
                </p>

                {/* <X color='#000' size={18} /> */}
            </div>
        )
    })

    const onContinue = () => {
        const dayKeys = Object.keys(days)

        let hasValue = false

        for (let i = 0; i < dayKeys.length; i++) {
            const day = days[dayKeys[i]]

            if (day.length > 0) {
                hasValue = true
                break
            }
        }

        if (!hasValue) {
            toast.info("Select at least one availability")
            return;
        }

        handleContinueBtnClick(days)
    }

    return (
        <>
            {isOpen && (
                <Modal
                    title="Set Availability"
                    onClose={hide}
                    description="You can set your available hours each day. Leave empty where you won’t be available. You can edit anytime."
                    primaryButton="Go back"
                    primaryButtonFunc={goBackAStep}
                    secondaryButtonFunc={onContinue}
                    secondaryButton={continueBtnText || "Save and Continue"}
                    width='w-full'
                    styles={{
                        wrapper: "w-full lg:max-w-[70vw] relative",
                        content: "relative",
                        title: "text-lg font-bold text-left text-black relative",
                        closeIconWrapper: "absolute top-6 right-5 z-10",
                        closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                        closeIcon: "w-6 h-6",
                        description: "text-sm my-2",
                        footer: "flex flex-col md:flex-row gap-2 justify-between mt-10 w-full font-bold",
                        primaryButton: "w-full px-5 py-3  bg-primary-50 text-primary-700 rounded-4xl",
                        secondaryButton: "w-full px-5 py-3  text-grey-50 bg-primary-500 rounded-4xl",
                    }}
                >
                    <div className='mb-3 font-bold text-sm my-10'>
                        Selected slots for {selectedDay}:
                    </div>

                    <div className='mb-4'>
                        {
                            days[selectedDay]?.length > 0
                                ?
                                <div className='flex flex-wrap items-center gap-5'>
                                    {displaySelectedSlotsForDay}
                                </div>
                                :
                                <div className='text-sm'>
                                    No slots created
                                </div>
                        }
                    </div>

                    <div className='border border-grey-100 rounded-md lg:flex block w-full'>
                        <div className='border-r border-grey-100 py-4 pb-2 px-2  space-y-4 flex flex-row flex-wrap lg:flex-col items-center lg:w-[20%] w-full lg:mb-0 mb-4 font-semibold text-sm'>
                            {Object.keys(days).map((day, index) => {

                                const active = day === selectedDay ? true : false

                                const handleDayClick = () => setSelectedDay(day)

                                return (
                                    <div key={day} onClick={handleDayClick} className={`lg:w-full w-1/2 text-center py-3 ${active ? "text-grey-50 bg-primary-500" : "cursor-pointer hover:bg-gray-100"} p-2 rounded-lg`}>
                                        <p>{day}</p>
                                    </div>
                                )
                            }
                            )}
                        </div>

                        <div>
                            <div className='mb-4 p-2'>
                                <h1>
                                    Defaults
                                </h1>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    {displayDefaultSlots}
                                </div>
                            </div>

                            <Formik
                                validationSchema={yup.object().shape({
                                    start_hour: yup.string()
                                        .required("Start hour is required"),
                                    end_hour: yup.string()
                                        .required("End hour is required")
                                        .test("is-greater", "End hour must be later than start hour", function (value) {
                                            const { start_hour } = this.parent;
                                            if (!start_hour || !value) return false;

                                            // Convert to minutes for easy comparison
                                            const [sh, sm] = start_hour.split(":").map(Number);
                                            const [eh, em] = value.split(":").map(Number);

                                            const startTotal = sh * 60 + sm;
                                            const endTotal = eh * 60 + em;

                                            return endTotal > startTotal;
                                        })
                                })}
                                initialValues={{
                                    start_hour: '', end_hour: ''
                                }}
                                onSubmit={(values, { resetForm }) => {
                                    const { start_hour, end_hour } = values

                                    const slotAvailable = isSlotAvailable({
                                        existingSlots: days[selectedDay],
                                        newSlot: values
                                    })

                                    if (!slotAvailable) {
                                        toast.info("Slot is not available")
                                        return
                                    }

                                    const updatedDays = days[selectedDay] = [
                                        ...days[selectedDay],
                                        values
                                    ]

                                    setDays(prev => ({
                                        ...prev,
                                        [selectedDay]: updatedDays
                                    }))

                                    resetForm()
                                }}
                            >
                                {({ handleBlur, handleChange, handleSubmit, isValid, dirty, values }) => (
                                    <div className='flex flex-col items-start justify-center px-2 gap-4'>
                                        <div className='w-full'>
                                            <label className=''>Start time</label>
                                            <br />
                                            <HourSelect
                                                name="start_hour"
                                                value={values.start_hour}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                            <ErrorMessage name='start_hour'>
                                                {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                            </ErrorMessage>
                                        </div>

                                        <div className='w-full'>
                                            <label className=''>End time</label>
                                            <br />
                                            <HourSelect
                                                name="end_hour"
                                                value={values.end_hour}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                            <ErrorMessage name='end_hour'>
                                                {errorMsg => <ErrorMsg1 errorMsg={errorMsg} />}
                                            </ErrorMessage>
                                        </div>

                                        <Button
                                            onClick={handleSubmit}
                                            className={'bg-primary-600'}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                )}
                            </Formik>
                        </div>
                    </div>
                </Modal>
            )
            }
        </>
    )
}

export default SetAvailability  