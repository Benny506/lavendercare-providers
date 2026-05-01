import Modal from "@/components/Modal";
import useApiReqs from "@/hooks/useApiReqs";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
    summary_note: Yup.string()
        .trim()
        .required("Summary note is required"),
});

export default function BookingSummary({ isOpen, onClose, bookingInfo }) {

    const { updateBookingSummary } = useApiReqs()

    if (!isOpen || !bookingInfo) return null;

    return (
        <Formik
            enableReinitialize
            initialValues={{
                summary_note: bookingInfo?.summary_note || "",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                updateBookingSummary({
                    callBack: () => { onClose() },
                    booking_id: bookingInfo?.id,
                    summary_note: values.summary_note,
                })
            }}
        >
            {({ handleSubmit, errors, touched }) => (
                <Modal
                    onClose={onClose}
                    primaryButton={"Save Summary"}
                    primaryButtonFunc={handleSubmit}
                    title="Clinical Summary"
                    description="Write a detailed summary of this particular appointment/session."
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
                                rows={8}
                                className={`w-full border rounded-xl p-4 outline-none transition-all focus:border-primary-500 ${errors.summary_note && touched.summary_note
                                    ? "border-red-500"
                                    : "border-gray-200"
                                    }`}
                                placeholder="What happened during this session? Any observations or recommendations?"
                            />
                            <ErrorMessage
                                name="summary_note"
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
