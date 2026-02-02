import Modal from "@/components/Modal";
import useApiReqs from "@/hooks/useApiReqs";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
    summary_note: Yup.string()
        .trim()
        .required("Summary note is required"),
    prescription: Yup.string()
        .trim()
        .required("Prescription is required"),
});

export default function BookingSummary({ isOpen, onClose, bookingInfo }) {

    const { updateBookingSummary } = useApiReqs()

    if (!isOpen || !bookingInfo) return null;

    return (
        <Formik
            enableReinitialize
            initialValues={{
                summary_note: bookingInfo?.summary_note || "",
                prescription: bookingInfo?.prescription || "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                updateBookingSummary({
                    callBack: ({ }) => { },
                    booking_id: bookingInfo?.id,
                    prescription: values.prescription,
                    summary_note: values.summary_note,
                })
            }}
        >
            {({ handleSubmit, errors, touched }) => (
                <Modal
                    onClose={onClose}
                    primaryButton={"Save"}
                    primaryButtonFunc={handleSubmit}
                    title="Summary & Prescription (if any)"
                    description="Notes, prescriptions, summary about this particular appointment"
                >
                    <Form className="space-y-5">
                        {/* Summary Note */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Summary Note
                            </label>
                            <Field
                                as="textarea"
                                name="summary_note"
                                rows={4}
                                className={`w-full border rounded-md p-3 outline-none ${errors.summary_note && touched.summary_note
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                                placeholder="Write detailed summary of the session..."
                            />
                            <ErrorMessage
                                name="summary_note"
                                component="div"
                                className="text-red-500 text-xs mt-1"
                            />
                        </div>

                        {/* Prescription */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Prescription
                            </label>
                            <Field
                                as="textarea"
                                name="prescription"
                                rows={4}
                                className={`w-full border rounded-md p-3 outline-none ${errors.prescription && touched.prescription
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                                placeholder="Enter any prescribed medications or instructions..."
                            />
                            <ErrorMessage
                                name="prescription"
                                component="div"
                                className="text-red-500 text-xs mt-1"
                            />
                        </div>
                    </Form>
                </Modal>
            )}
        </Formik>
    );
}
