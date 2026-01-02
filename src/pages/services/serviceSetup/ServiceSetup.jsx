import React, { useState, useEffect } from "react";
import { Formik, ErrorMessage } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import ErrorMsg1 from "@/components/ErrorMsg1";
import InputGroup from "@/components/ui/InputGroup";
import HourSelect from "@/components/HourSelect";
import { Button } from "@/components/ui/button";
import { countries, NigerianCities, states, currencies } from "@/constants/constant";
import useApiReqs from "@/hooks/useApiReqs";
import { extractHour_FromHHMM, formatNumberWithCommas, formatTo12Hour, hourNumberToHHMM, secondsToLabel, timeToAMPM_FromHour } from "@/lib/utils";
import { Briefcase, Clock, Globe } from "lucide-react";
import ServiceType from "../modals/ServiceType";
import { Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";

function reorderDays(obj) {
    const order = [
        "monday", "tuesday", "wednesday", "thursday",
        "friday", "saturday", "sunday"
    ];
    const sorted = {};
    order.forEach(day => obj[day] && (sorted[day] = obj[day]));
    return sorted;
}

export default function ServiceSetup({ info = {} }) {
    const navigate = useNavigate()

    const { addService, getServiceCategories } = useApiReqs();

    const license = useSelector(state => getUserDetailsState(state).license)

    const [allServices, setAllServices] = useState([]);
    const [selectedDay, setSelectedDay] = useState("monday");
    const [serviceTypes, setServiceTypes] = useState([])
    const [serviceTypeModal, setServiceTypeModal] = useState({ visible: false, hide: null })

    useEffect(() => {
        getServiceCategories({
            callBack: ({ serviceCategories }) => setAllServices(serviceCategories)
        });
    }, []);

    const openServiceTypeModal = () => setServiceTypeModal({ visible: true, hide: hideServiceTypeModal })
    const hideServiceTypeModal = () => setServiceTypeModal({ visible: false, hide: null })

    const initialValues = {
        service_type: info?.service_type || "domestic",
        service_name: info.service_name || "",
        service_category: info.service_category || "",
        service_details: info.service_details || "",
        country: info.country || "",
        state: info.state || "",
        city: info.city || "",
        location: info.location || "",
        availability: info.availability || {
            monday: { opening: "", closing: "" },
            tuesday: { opening: "", closing: "" },
            wednesday: { opening: "", closing: "" },
            thursday: { opening: "", closing: "" },
            friday: { opening: "", closing: "" },
            saturday: { opening: "", closing: "" },
            sunday: { opening: "", closing: "" },
        },
    };

    const validationSchema = yup.object({
        service_name: yup.string().required("Service name is required"),
        service_category: yup.string().required("Service category is required"),
        service_details: yup.string().required("Service details are required"),
        service_type: yup.string().required("Service type is required"),

        country: yup.string().required("Country is required"),
        state: yup.string().required("State is required"),
        city: yup.string().required("City is required"),
        location: yup.string().required("Address is required"),

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

    return (
        <>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => {

                    const serviceInfo = values

                    if (serviceTypes?.length === 0) return toast.info("Creat at least 1 session type")

                    addService({
                        callBack: ({ }) => {
                            navigate('/services')
                        },
                        serviceInfo,
                        serviceTypes
                    })
                }}
            >
                {({ values, handleChange, handleBlur, setFieldValue, handleSubmit }) => {
                    const availability = reorderDays(values.availability);

                    return (
                        <div className="space-y-8">

                            <Card
                                title="What kind of service is this?"
                                subtitle="Help us understand the nature of this service"
                                icon={Layers}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Healthcare Service */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if(license.status !== 'approved') return toast.info("License not submitted or not approved!")
                                            setFieldValue("service_type", "healthcare")
                                        }}
                                        className={`relative text-left p-5 rounded-2xl border transition-all duration-200 group
                                            ${values.service_type === "healthcare"
                                                ? "border-primary-500 bg-primary-50 ring-2 ring-primary-300"
                                                : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`p-3 rounded-xl transition
                                                    ${values.service_type === "healthcare"
                                                        ? "bg-primary-500 text-white"
                                                        : "bg-primary-100 text-primary-600"
                                                    }`}
                                            >
                                                <Briefcase size={22} />
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-base">
                                                    Healthcare Service
                                                </h4>

                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Professional health-related services that require formal 
                                                    training and valid licensing to offer legally and ethically.
                                                    These services involve medical, therapeutic, or psychological 
                                                    care and may impact a client’s physical or mental wellbeing. 
                                                    Providers are expected to hold recognized certifications or licenses and comply with professional standards.
                                                </p>

                                                <div className="text-xs text-gray-500">
                                                    <span className="font-medium text-gray-600">Examples:</span>{" "}
                                                    Therapy sessions, counseling, mental health consultations, physiotherapy, clinical wellness services
                                                </div>

                                                {
                                                    license?.status !== 'approved'
                                                    &&
                                                    <div className="mt-5">
                                                        <hr />
                                                        <p className="mt-3 text-xs text-gray-800 leading-relaxed">
                                                            You're license document has either not been approved or submitted
                                                        </p>
                                                        <p  
                                                            onClick={e => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                
                                                                navigate("/settings")
                                                            }}
                                                            style={{
                                                                textDecorationLine: 'underline',
                                                                cursor: 'pointer'
                                                            }}
                                                            className="clickable text-xs text-purple-600"
                                                        >
                                                            Go to profile
                                                        </p>
                                                    </div>
                                                }
                                            </div>
                                        </div>

                                        {values.service_type === "healthcare" && (
                                            <span className="absolute top-3 right-3 text-xs font-semibold text-primary-600 bg-white px-2 py-1 rounded-full shadow">
                                                Selected
                                            </span>
                                        )}
                                    </button>

                                    {/* Domestic Service */}
                                    <button
                                        type="button"
                                        onClick={() => setFieldValue("service_type", "domestic")}
                                        className={`relative text-left p-5 rounded-2xl border transition-all duration-200 group
                                            ${values.service_type === "domestic"
                                                ? "border-primary-500 bg-primary-50 ring-2 ring-primary-300"
                                                : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className={`p-3 rounded-xl transition
                                                    ${values.service_type === "domestic"
                                                        ? "bg-primary-500 text-white"
                                                        : "bg-primary-100 text-primary-600"
                                                    }`}
                                            >
                                                <Layers size={22} />
                                            </div>

                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-base">
                                                    Domestic Service
                                                </h4>

                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Practical, non-medical services that do not require professional 
                                                    healthcare licensing to provide. These services focus on everyday support, comfort, 
                                                    or maintenance. While skill and experience are important, 
                                                    they are not regulated by healthcare licensing bodies.
                                                </p>

                                                <div className="text-xs text-gray-500">
                                                    <span className="font-medium text-gray-600">Examples:</span>{" "}
                                                    Laundry services, home massage, cleaning, beauty services, household assistance
                                                </div>
                                            </div>
                                        </div>

                                        {values.service_type === "domestic" && (
                                            <span className="absolute top-3 right-3 text-xs font-semibold text-primary-600 bg-white px-2 py-1 rounded-full shadow">
                                                Selected
                                            </span>
                                        )}
                                    </button>

                                </div>

                                <ErrorMessage name="service_type">
                                    {errorMsg => <ErrorMsg1 className="mt-4" errorMsg={errorMsg} />}
                                </ErrorMessage>
                            </Card>


                            {/* Basic Info Card */}
                            <Card title="Service Information" subtitle="Tell us what you offer and where/how you operate" icon={Briefcase}>
                                <div className="space-y-4">

                                    {/* Service Name */}
                                    <InputGroup label="Name">
                                        <input
                                            name="service_name"
                                            value={values.service_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="e.g Deep tissue massage, Therapy consultation"
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />
                                        <ErrorMessage name="service_name">
                                            {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </InputGroup>

                                    {/* Service Category */}
                                    <InputGroup label="Category">
                                        <input
                                            type="text"
                                            name="service_category"
                                            value={values.service_category}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            list="service-categories"
                                            placeholder="Type or select a category"
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                        />

                                        <datalist id="service-categories">
                                            {allServices.map((s, i) => (
                                                <option key={i} value={s.service}>
                                                    {s.service}
                                                </option>
                                            ))}
                                        </datalist>

                                        <ErrorMessage name="service_category">
                                            {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </InputGroup>

                                    {/* Location Block */}
                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50">
                                        <h4 className="font-semibold text-sm text-gray-700">Location Information</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Country */}
                                            <InputGroup label="Country" icon={Globe}>
                                                <select
                                                    value={values.country}
                                                    onChange={e => {
                                                        setFieldValue("country", e.target.value);
                                                        setFieldValue("state", "");
                                                        setFieldValue("city", "");
                                                    }}
                                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                >
                                                    <option value="" disabled>Select country</option>
                                                    {countries.map((c, i) => (
                                                        <option key={i} value={c.value}>{c.title}</option>
                                                    ))}
                                                </select>
                                                <ErrorMessage name="country">
                                                    {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                                </ErrorMessage>
                                            </InputGroup>

                                            {/* State */}
                                            <InputGroup label="State">
                                                <select
                                                    value={values.state}
                                                    onChange={e => {
                                                        setFieldValue("state", e.target.value);
                                                        setFieldValue("city", "");
                                                    }}
                                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                                >
                                                    <option value="" disabled>Select state</option>
                                                    {states.filter(s => s.country === values.country).map((s, i) => (
                                                        <option key={i} value={s.value}>{s.title}</option>
                                                    ))}
                                                </select>
                                                <ErrorMessage name="state">
                                                    {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                                </ErrorMessage>
                                            </InputGroup>
                                        </div>

                                        {/* City */}
                                        <InputGroup label="City / LGA">
                                            <select
                                                name="city"
                                                value={values.city}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            >
                                                <option value="" disabled>Select city</option>
                                                {NigerianCities.filter(c => c.state === values.state)[0]?.lgas.map((c, i) => (
                                                    <option key={i} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <ErrorMessage name="city">
                                                {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                            </ErrorMessage>
                                        </InputGroup>

                                        {/* Specific Address */}
                                        <InputGroup label="Specific Address">
                                            <input
                                                placeholder="Address"
                                                name="location"
                                                value={values.location}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            />
                                            <ErrorMessage name="location">
                                                {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                            </ErrorMessage>
                                        </InputGroup>
                                    </div>

                                    {/* Service Details */}
                                    <InputGroup label="Details">
                                        <textarea
                                            placeholder="Describe how this service is going to be"
                                            name="service_details"
                                            value={values.service_details}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-300 min-h-[120px]"
                                        />
                                        <ErrorMessage name="service_details">
                                            {errorMsg => <ErrorMsg1 className="mb-7" errorMsg={errorMsg} />}
                                        </ErrorMessage>
                                    </InputGroup>
                                </div>
                            </Card>

                            <Card
                                title="Session Types"
                                subtitle="Different ways this service can be booked"
                                icon={Layers}
                            >
                                <div className="space-y-4">

                                    {/* Existing service types */}
                                    {serviceTypes.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            No service types added yet.
                                        </p>
                                    )}

                                    {serviceTypes.map((type, index) => {

                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between flex-wrap gap-3 items-center border border-gray-200 rounded-lg p-3"
                                            >
                                                <div>
                                                    <p className="font-semibold">{type.type_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {type.currency} {formatNumberWithCommas(type.price)} · {secondsToLabel({ seconds: type?.duration })} · {type.is_virtual ? "Virtual" : "Physical"}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = serviceTypes.filter((_, i) => i !== index);
                                                        setServiceTypes(updated);
                                                    }}
                                                    className="text-sm text-red-500 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )
                                    })}

                                    {/* Add button */}
                                    <button
                                        type="button"
                                        onClick={openServiceTypeModal}
                                        className="w-full border border-dashed border-primary-400 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
                                    >
                                        + Add service type
                                    </button>

                                </div>
                            </Card>

                            {/* Availability Card */}
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
                            </Card>



                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button onClick={handleSubmit} type="submit" className="bg-[#703DCB] px-8 rounded-full">
                                    Submit
                                </Button>
                            </div>
                        </div>
                    );
                }}
            </Formik>
            <ServiceType
                isOpen={serviceTypeModal.visible}
                hide={serviceTypeModal.hide}
                continueBtnText={"Continue"}
                handleContinueBtnClick={({ requestInfo, info }) => {
                    hideServiceTypeModal()
                    setServiceTypes([requestInfo, ...serviceTypes])
                }}
            />
        </>
    );
}
