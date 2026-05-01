import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import useApiReqs from "@/hooks/useApiReqs";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { statusUpdateMail } from "@/database/email/email";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";

// Sections
import SchedulingModeSection from "./sections/SchedulingModeSection";
import ServiceNatureSection from "./sections/ServiceNatureSection";
import ServiceInfoSection from "./sections/ServiceInfoSection";
import PricingSection from "./sections/PricingSection";
import LocationSection from "./sections/LocationSection";
import RenderingPreferenceSection from "./sections/RenderingPreferenceSection";


// Modals
import ServiceType from "../modals/ServiceType";
import ServiceLocation from "../modals/ServiceLocation";
import { Button } from "@/components/ui/button";
import supabase from "@/database/dbInit";

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
    const navigate = useNavigate();
    const { addService, getServiceCategories } = useApiReqs();

    const license = useSelector(state => getUserDetailsState(state).license);
    const profile = useSelector(state => getUserDetailsState(state).profile);

    const locationState = useLocation();
    const service_id = locationState?.state?.service_id;

    const [allServices, setAllServices] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [locationPool, setLocationPool] = useState([]);
    const [serviceTypeModal, setServiceTypeModal] = useState({ visible: false });
    const [serviceLocationModal, setServiceLocationModal] = useState({ visible: false });
    const [fetchedService, setFetchedService] = useState(null);

    useEffect(() => {
        getServiceCategories({
            callBack: ({ serviceCategories }) => setAllServices(serviceCategories)
        });

        // Fetch provider locations (pool)
        const fetchPool = async () => {
            const { data } = await supabase.from('provider_locations').select('*');
            setLocationPool(data || []);
        };
        fetchPool();

        // If editing, fetch service details
        if (service_id) {
            const fetchService = async () => {
                const { data } = await supabase
                    .from('services')
                    .select(`
                        *,
                        service_types(*),
                        service_location_links(
                            location_id,
                            provider_locations(*)
                        )
                    `)
                    .eq('id', service_id)
                    .single();

                if (data) {
                    setFetchedService(data);
                    setServiceTypes(data.service_types || []);
                    setLocations((data.service_location_links || []).map(link => link.provider_locations));
                }
            };
            fetchService();
        }
    }, [service_id]);

    const openServiceTypeModal = () => setServiceTypeModal({ visible: true });
    const hideServiceTypeModal = () => setServiceTypeModal({ visible: false });

    const openServiceLocationModal = () => setServiceLocationModal({ visible: true });
    const hideServiceLocationModal = () => setServiceLocationModal({ visible: false });

    const initialValues = {
        scheduling_mode: fetchedService?.scheduling_mode || "instant",
        service_type: fetchedService?.service_type || "domestic",
        service_name: fetchedService?.service_name || "",
        service_category: fetchedService?.service_category || "",
        service_details: fetchedService?.service_details || "",
        travel_to_client: fetchedService?.travel_to_client || false,
        client_travel_to_provider: fetchedService?.client_travel_to_provider || false,
        is_hidden: fetchedService?.status === "hidden",
        country: fetchedService?.country || "",
        city: fetchedService?.city || "",
        state: fetchedService?.state || "",
        location: fetchedService?.location || "",
    };

    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={yup.object({
                service_name: yup.string().required("Give your service a friendly name"),
                service_category: yup.string().required("What category does this fall into?"),
                service_details: yup.string().required("Tell mothers what they get in this service"),
                service_type: yup.string().required("Is this a healthcare or domestic service?"),
                scheduling_mode: yup.string().required("How should this be booked?"),
            })}
            onSubmit={async (values) => {
                const serviceInfo = {
                    ...values,
                    locations // Still keeping for backwards compatibility as requested
                };

                if (serviceTypes?.length === 0) return toast.info("At least one pricing tier (Shift or Session) is required!");

                if (values.scheduling_mode !== 'instant' && !values.travel_to_client && !values.client_travel_to_provider) {
                    return toast.info("Please select at least one way to render this service (We come to you or You come to us)");
                }

                const isLocationRequired = values.client_travel_to_provider || values.scheduling_mode === 'logistics';

                if (isLocationRequired && locations?.length === 0) {
                    return toast.info(
                        values.scheduling_mode === 'logistics'
                            ? "Logistics services require at least 1 processing location. Kindly link a center!"
                            : "You've selected that mothers can visit you. Kindly link at least 1 of your center locations!"
                    );
                }

                addService({
                    callBack: async () => {
                        toast.success(service_id ? "Service updated successfully!" : "Service created successfully!");
                        navigate('/services');
                    },
                    serviceInfo: { ...values, id: service_id }, // RPC handles both
                    serviceTypes,
                    locations
                });
            }}
        >
            {({ values, handleChange, handleBlur, setFieldValue, handleSubmit }) => (
                <div className="max-w-4xl mx-auto space-y-10 pb-20">
                    {/* 1. Header & Guidance */}
                    <div className="bg-primary-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold">{service_id ? "Edit Your Service" : "Set Up Your Service"}</h1>
                            <p className="mt-2 text-primary-100 max-w-lg">
                                {service_id
                                    ? "Update your service details and pricing to keep mothers informed."
                                    : "Create a service that's easy for mothers to understand and book."}
                            </p>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-3xl"></div>
                    </div>

                    {/* Identity Banner (Shown ONLY when editing) */}
                    {service_id && (
                        <div className="bg-white border-2 border-primary-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary-50 rounded-2xl text-primary-600">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">
                                        {values.service_type} | {values.scheduling_mode}
                                    </h4>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        This service's core identity is fixed to maintain booking integrity and historical data accuracy.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-bold border border-amber-100 uppercase tracking-wider">
                                <ShieldCheck size={14} />
                                Identity Protected
                            </div>
                        </div>
                    )}

                    {/* Visibility Toggle (Shown when editing) */}
                    {service_id && (
                        <Card
                            title="Service Visibility"
                            subtitle="Should mothers see this service in your profile?"
                            icon={values.is_hidden ? EyeOff : Eye}
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900">{!values.is_hidden ? "Service is Public" : "Service is Hidden"}</p>
                                    <p className="text-sm text-gray-500">
                                        {!values.is_hidden
                                            ? "Mothers can see and book this service."
                                            : "This service will not be visible on your profile until you enable it."}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFieldValue("is_hidden", !values.is_hidden)}
                                    className={`px-6 py-2 rounded-full font-bold transition-all ${!values.is_hidden
                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                >
                                    {!values.is_hidden ? "Hide Service" : "Show Service"}
                                </button>
                            </div>
                        </Card>
                    )}

                    {/* 2. Persistent Basic Information */}
                    <ServiceInfoSection
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        allServices={allServices}
                    />

                    {/* 3. Service Nature & 4. Scheduling Mode (Shown ONLY for NEW services) */}
                    {!service_id && (
                        <>
                            <ServiceNatureSection
                                service_type={values.service_type}
                                license={license}
                                setFieldValue={setFieldValue}
                                navigate={navigate}
                                toast={toast}
                                isEditing={false}
                            />

                            <SchedulingModeSection
                                scheduling_mode={values.scheduling_mode}
                                setFieldValue={setFieldValue}
                                isEditing={false}
                                setServiceTypes={setServiceTypes}
                                setLocations={setLocations}
                            />
                        </>
                    )}

                    {/* 5. Pricing & Timing (Dynamic based on Mode) */}
                    <PricingSection
                        serviceTypes={serviceTypes}
                        openServiceTypeModal={openServiceTypeModal}
                        setServiceTypes={setServiceTypes}
                        scheduling_mode={values.scheduling_mode}
                    />

                    {/* 6. Rendering Preferences (Dynamic - Hidden for Instant) */}
                    <RenderingPreferenceSection
                        travel_to_client={values.travel_to_client}
                        client_travel_to_provider={values.client_travel_to_provider}
                        setFieldValue={setFieldValue}
                        scheduling_mode={values.scheduling_mode}
                    />

                    {/* 7. Location Management (Dynamic - Shown if Client travels) */}
                    {(values.client_travel_to_provider || values.scheduling_mode === 'logistics') && (
                        <LocationSection
                            locations={locations}
                            pool={locationPool}
                            openServiceLocationModal={openServiceLocationModal}
                            setLocations={setLocations}
                            scheduling_mode={values.scheduling_mode}
                            client_travel_to_provider={values.client_travel_to_provider}
                        />
                    )}

                    <div className="flex justify-end pt-6">
                        <Button
                            onClick={handleSubmit}
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-12 py-6 text-lg rounded-full shadow-lg transition-all active:scale-95"
                        >
                            {service_id ? "Update Service" : "Save and Launch Service"}
                        </Button>
                    </div>

                    {/* Modals */}
                    <ServiceType
                        isOpen={serviceTypeModal.visible}
                        hide={hideServiceTypeModal}
                        scheduling_mode={values.scheduling_mode}
                        continueBtnText={"Save Tier"}
                        handleContinueBtnClick={({ requestInfo }) => {
                            hideServiceTypeModal();
                            setServiceTypes([
                                { ...requestInfo, scheduling_mode: values.scheduling_mode },
                                ...serviceTypes
                            ]);
                        }}
                    />

                    <ServiceLocation
                        isOpen={serviceLocationModal.visible}
                        hide={hideServiceLocationModal}
                        continueBtnText={"Create Location"}
                        handleContinueBtnClick={({ requestInfo }) => {
                            hideServiceLocationModal();
                            const newLoc = { ...requestInfo, id: Date.now() };
                            setLocationPool([newLoc, ...locationPool]);
                            setLocations([newLoc, ...locations]);
                        }}
                    />
                </div>
            )}
        </Formik>
    );
}
