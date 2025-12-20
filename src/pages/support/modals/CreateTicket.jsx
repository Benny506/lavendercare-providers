import ErrorMsg1 from "@/components/ErrorMsg1";
import Modal from "@/components/Modal";
import { ticketFields } from "@/constants/constant";
import { ticketsMap, ticketStatusMap } from "@/lib/utilsJsx";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { ErrorMessage, Formik } from "formik";
import { useSelector } from "react-redux";
import * as yup from 'yup'

export default function CreateTicket({
    hide=()=>{}, handleCreateTicket=()=>{}
}){

    const profile = useSelector(state => getUserDetailsState(state).profile)

    return(
        <Formik
            validationSchema={yup.object().shape({
                subject: yup.string().required("Subject is required"),
                ticket_details: yup.string().required("Ticket details is required"),
                field: yup.string().required("Field is required"),
                priority: yup.string().required("Priority is required")
            })}
            initialValues={{
                subject: '', ticket_details: '', field: '', priority: ''
            }}
            onSubmit={values => {
                handleCreateTicket({
                    requestInfo: {
                        ...values,
                        user_id: profile?.id,
                        usertype: 'vendor'
                    }
                })
            }}
        >
            {
                ({ values, handleBlur, handleChange, handleSubmit }) => (
                    <Modal
                        title="Create support ticket"
                        primaryButton="Create"
                        onClose={hide}
                        primaryButtonFunc={handleSubmit}
                        styles={{
                            wrapper: "max-w-md relative",
                            content: "relative",
                            title: "text-lg font-bold text-left text-black relative",
                            closeIconWrapper: "absolute top-6 right-5 z-10",
                            closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                            closeIcon: "w-6 h-6",
                            footer: "flex justify-end mt-4",
                            primaryButton:
                                "bg-primary-500 text-white flex items-center gap-2 rounded-4xl !px-9 !py-3 !h-auto",
                        }}
                    > 
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-grey-600 mb-1">Subject</label>
                                <input
                                    name="subject"
                                    value={values.subject}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    type="text"
                                    placeholder="Headline of your issue"
                                    className="w-full border border-grey-300 rounded-md p-2"
                                />
                                <ErrorMessage name="subject">
                                    { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                </ErrorMessage>
                            </div>                               

                            <div>
                                <label className="block text-sm font-medium text-grey-600 mb-1">Field</label>
                                <select 
                                    name="field"
                                    value={values.field}
                                    onChange={handleChange}
                                    onBlur={handleBlur}                                    
                                    className="w-full border border-grey-300 rounded-md p-2.5 focus:outline-none text-grey-500"
                                >
                                    <option value={""} selected disabled>What Field?</option>
                                    {
                                        ticketFields.map((opt, optIndex) => (
                                            <option
                                                key={optIndex}
                                                value={opt?.toLowerCase().replaceAll(" ", "_")}
                                            >
                                                { opt }
                                            </option>
                                        ))
                                    }
                                </select>
                                <ErrorMessage name="field">
                                    { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                </ErrorMessage>                                    
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-600 mb-1">Priority</label>
                                <select 
                                    name="priority"
                                    value={values.priority}
                                    onChange={handleChange}
                                    onBlur={handleBlur}                                    
                                    className="w-full border border-grey-300 rounded-md p-2.5 focus:outline-none text-grey-500"
                                >
                                    <option value={""} selected disabled>How severe?</option>
                                    {
                                        Object.keys(ticketsMap).map((opt, optIndex) => (
                                            <option
                                                key={optIndex}
                                                value={opt?.toLowerCase().replaceAll(" ", "_")}
                                            >
                                                { opt }
                                            </option>
                                        ))
                                    }
                                </select>
                                <ErrorMessage name="priority">
                                    { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                </ErrorMessage>                                    
                            </div>                            

                            <div>
                                <label className="block text-sm font-medium text-grey-600 mb-1">Ticket Details</label>
                                <textarea
                                    name="ticket_details"
                                    value={values.ticket_details}
                                    onChange={handleChange}
                                    onBlur={handleBlur}  
                                    style={{
                                        minHeight: '200px',
                                        minWidth: '100%'
                                    }}                                    
                                    placeholder=" e.g this service includes a 1hr long massage."
                                    className="w-full border border-gray-300 rounded-md p-2 placeholder:text-start align-top"
                                />
                                <ErrorMessage name="ticket_details">
                                    { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                </ErrorMessage>                                      
                            </div>
                        </div>
                    </Modal> 
                )
            }          
        </Formik>
    )
}