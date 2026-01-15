import ErrorMsg1 from "@/components/ErrorMsg1";
import HourSelect from "@/components/HourSelect";
import Card from "@/components/ui/Card";
import InputGroup from "@/components/ui/InputGroup";
import { extractHour_FromHHMM, hourNumberToHHMM, timeToAMPM_FromHour } from "@/lib/utils";
import { ErrorMessage } from "formik";
import { Clock } from "lucide-react";
import { useState } from "react";

const getEmptyDays = (availability) =>
    Object.keys(availability).filter(
        day =>
            availability[day].opening == null ||
            availability[day].closing == null
    );


export default function ServiceAvailability({
    availability = {},
    setFieldValue
}) {

    const [selectedDay, setSelectedDay] = useState('monday')

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

            {(() => {
                const emptyDays = Object.keys(availability).filter(day =>
                    !availability[day]?.opening && !availability[day]?.closing
                );

                const current = availability[selectedDay];

                const canApply =
                    current?.opening &&
                    current?.closing &&
                    emptyDays.length > 0 &&
                    emptyDays.includes(selectedDay) === false;

                if (!canApply) return null;

                return (
                    <button
                        type="button mt-3"
                        className="px-4 py-2 bg-primary-500 text-white text-sm rounded-md shadow hover:bg-primary-600 transition"
                        onClick={() => {
                            Object.keys(availability).forEach(day => {
                                if (!availability[day].opening && !availability[day].closing) {
                                    setFieldValue(`availability.${day}.opening`, current.opening);
                                    setFieldValue(`availability.${day}.closing`, current.closing);
                                }
                            });
                        }}
                    >
                        Apply these hours to remaining days
                    </button>
                );
            })()}
        </Card>
    )
}