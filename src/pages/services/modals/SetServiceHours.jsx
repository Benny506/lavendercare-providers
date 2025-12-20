import ErrorMsg1 from '@/components/ErrorMsg1';
import HourSelect from '@/components/HourSelect';
import Modal from '@/components/Modal'
import { Button } from '@/components/ui/button';
import Card from '@/components/ui/Card';
import InputGroup from '@/components/ui/InputGroup';
import { extractHour_FromHHMM, hourNumberToHHMM, timeToAMPM_FromHour } from '@/lib/utils';
import { ErrorMessage, Formik } from 'formik';
import { Clock } from 'lucide-react';
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as yup from 'yup'

const validationSchema = yup.object({
    availability: yup
        .object()
        .test(
            "at-least-one-day",
            "Set at least one availability",
            value =>
                value &&
                Object.values(value).some(d => d?.opening != null && d?.closing != null)
        )
        .test(
            "valid-availability",
            "Closing hour must be later than opening hour",
            value => {
                if (!value) return true;

                return Object.values(value).every(day => {
                    if (day?.opening == null && day?.closing == null) return true;
                    return day.closing > day.opening;
                });
            }
        ),
});

function reorderDays(obj) {
    const order = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const sortedObj = {};

    order.forEach(day => {
        if (obj.hasOwnProperty(day)) {
            sortedObj[day] = obj[day];
        }
    });

    return sortedObj;
}

const SetServiceHours = ({
    info = {
        monday: { opening: '', closing: '' },
        tuesday: { opening: '', closing: '' },
        wednesday: { opening: '', closing: '' },
        thursday: { opening: '', closing: '' },
        friday: { opening: '', closing: '' },
        saturday: { opening: '', closing: '' },
        sunday: { opening: '', closing: '' }
    },
    handleContinueBtnClick = () => { },
}) => {

    const [selectedDay, setSelectedDay] = useState('monday')

    const onContinue = (days) => {
        const dayKeys = Object.keys(days)

        let hasValue = false

        for (let i = 0; i < dayKeys.length; i++) {
            const day = days[dayKeys[i]]

            if (day.opening && day.closing) {
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
            <Formik
                enableReinitialize
                initialValues={{
                    availability: info || {
                        monday: { opening: "", closing: "" },
                        tuesday: { opening: "", closing: "" },
                        wednesday: { opening: "", closing: "" },
                        thursday: { opening: "", closing: "" },
                        friday: { opening: "", closing: "" },
                        saturday: { opening: "", closing: "" },
                        sunday: { opening: "", closing: "" },
                    },
                }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    onContinue(values.availability)
                }}
            >
                {({ values, handleChange, handleBlur, setFieldValue, handleSubmit }) => {
                    const availability = reorderDays(values.availability)

                    return (
                        <Card
                            title="Service Availability"
                            subtitle="Set opening and closing hours for each day of the week"
                            icon={Clock}
                        >
                            <div className="flex flex-col gap-6">
                                {/* Days of the week horizontal scroll */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                    {Object.keys(availability).map(day => {
                                        const active = selectedDay === day;
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setSelectedDay(day)}
                                                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold text-sm transition ${active
                                                    ? "bg-primary-500 text-white shadow-md"
                                                    : "border border-gray-300 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Current hours display */}
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm">
                                    <p className="text-sm text-gray-600">
                                        {availability[selectedDay]?.opening != null
                                            ? `Currently: ${timeToAMPM_FromHour({ hour: availability[selectedDay].opening })} - ${timeToAMPM_FromHour({ hour: availability[selectedDay].closing })}`
                                            : "No hours set yet"}
                                    </p>
                                </div>

                                {/* Hour Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Opening Hour">
                                        <HourSelect
                                            name={`availability.${selectedDay}.opening`}
                                            value={hourNumberToHHMM(availability[selectedDay]?.opening)}
                                            onChange={e => {
                                                const hour = extractHour_FromHHMM({ hourString: e.target.value });
                                                setFieldValue(`availability.${selectedDay}.opening`, hour);
                                            }}
                                        />
                                    </InputGroup>

                                    <InputGroup label="Closing Hour">
                                        <HourSelect
                                            name={`availability.${selectedDay}.closing`}
                                            value={hourNumberToHHMM(availability[selectedDay]?.closing)}
                                            minHour={availability[selectedDay]?.opening}
                                            onChange={e => {
                                                const hour = extractHour_FromHHMM({ hourString: e.target.value });
                                                setFieldValue(`availability.${selectedDay}.closing`, hour);
                                            }}
                                        />
                                    </InputGroup>
                                </div>

                                {/* Helper / Info */}
                                <p className="text-xs text-gray-400 mt-1">
                                    Set opening and closing hours for each day. Leave empty if the service is unavailable.
                                </p>

                                <ErrorMessage name={`availability`}>
                                    {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                </ErrorMessage>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button onClick={handleSubmit} type="submit" className="bg-[#703DCB] px-8 rounded-full">
                                    Save
                                </Button>
                            </div>                            
                        </Card>
                    )
                }}
            </Formik>
        </>
    )
}

export default SetServiceHours  