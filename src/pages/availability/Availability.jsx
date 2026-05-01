import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import supabase from "@/database/dbInit";
import { Icon } from "@iconify/react";

// Components
import ServiceAvailability from "../services/serviceSetup/ServiceAvailability";
import CapacitySection from "../services/serviceSetup/sections/CapacitySection";
import { Button } from "@/components/ui/button";

export default function Availability() {
    const dispatch = useDispatch();
    const profile = useSelector(state => getUserDetailsState(state).profile);
    const [providerData, setProviderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviderData = async () => {
            if (!profile?.id) return;
            
            try {
                dispatch(appLoadStart());
                const { data, error } = await supabase
                    .from('providers')
                    .select('availability, concurrent_capacity')
                    .eq('id', profile.id)
                    .single();

                if (error) {
                    console.error("Error fetching availability:", error);
                    toast.error("Failed to load availability settings");
                } else {
                    setProviderData(data);
                }
            } finally {
                setLoading(false);
                dispatch(appLoadStop());
            }
        };

        fetchProviderData();
    }, [profile?.id, dispatch]);

    const initialValues = {
        availability: providerData?.availability || {
            monday: { opening: "", closing: "" },
            tuesday: { opening: "", closing: "" },
            wednesday: { opening: "", closing: "" },
            thursday: { opening: "", closing: "" },
            friday: { opening: "", closing: "" },
            saturday: { opening: "", closing: "" },
            sunday: { opening: "", closing: "" },
        },
        concurrent_capacity: providerData?.concurrent_capacity || 1,
    };

    const hasNoAvailability = !providerData?.availability || Object.values(providerData?.availability).every(day => !day.opening && !day.closing);

    if (loading) return null;

    const handleSubmit = async (values) => {
        try {
            dispatch(appLoadStart());
            const { error } = await supabase
                .from('providers')
                .update({
                    availability: values.availability,
                    concurrent_capacity: values.concurrent_capacity
                })
                .eq('id', profile.id);

            if (error) throw error;

            // Update local state
            dispatch(setUserDetails({ 
                profile: { 
                    ...profile, 
                    availability: values.availability,
                    concurrent_capacity: values.concurrent_capacity
                } 
            }));
            
            setProviderData(values);
            toast.success("Availability updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update availability");
        } finally {
            dispatch(appLoadStop());
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 pt-10 px-4">
            {/* Warning Banner */}
            {hasNoAvailability && (
                <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm animate-pulse">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                        <Icon icon="material-symbols:warning-outline-rounded" width="24" height="24" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-900 text-lg">Availability Not Set</h4>
                        <p className="text-red-700 text-sm mt-1 leading-relaxed">
                            Mothers cannot book your services until you define your working hours. 
                            Set your availability below to appear in search results and start receiving bookings.
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-primary-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold">Manage Your Availability</h1>
                    <p className="mt-2 text-primary-100 max-w-lg">
                        Set your global working hours and concurrent booking capacity. These settings apply to all your services.
                    </p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-3xl"></div>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={yup.object({
                    availability: yup.object().required(),
                    concurrent_capacity: yup.number().min(1).required()
                })}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, handleSubmit }) => (
                    <Form className="space-y-8">
                        <ServiceAvailability 
                            availability={values.availability}
                            setFieldValue={setFieldValue}
                        />

                        <CapacitySection 
                            value={values.concurrent_capacity}
                            setFieldValue={setFieldValue}
                        />

                        <div className="flex justify-end">
                            <Button 
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-12 py-6 text-lg rounded-full shadow-lg transition-all active:scale-95"
                            >
                                Save Availability Settings
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
