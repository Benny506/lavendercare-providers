import { Button } from "@/components/ui/button";
import { ErrorMessage } from "formik";
import { Link } from "react-router-dom";
import ErrorMsg1 from "./ErrorMsg1";
import Image from "./ui/image";

const AuthForm = ({
    image,
    title,
    description,
    descriptionInner,
    fields = [],
    buttonText,
    buttonLink = "/", 
    buttonErrMsg = null,
    buttonFunc = null,
    footerText,
    footerLink,
    footerLinkText,
    onSubmit,
    customFields = {}, 
    styles = {}
}) => {
    return (
        <div 
            className={`${styles.wrapper || "max-w-md mx-auto shadow-md rounded-lg p-6 bg-white"}`}
        >
            {image && (
                <div className={`${styles.imageWrapper || "flex justify-center mb-4"}`}>
                    <Image src={image} alt="illustration" className={styles.image || "w-20 h-20"} />
                </div>
            )}

            <h2 className={`${styles.title || "text-xl font-semibold text-center mb-2"}`}>
                {title}
            </h2>

            {(description || descriptionInner) && (
                <p className={`${styles.description || "text-sm text-gray-500 text-center mb-4"}`}>
                    {description}{" "}
                    {descriptionInner && (
                        <span className={`${styles.descriptionInner || "text-gray-800 font-medium"}`}>
                            {descriptionInner}
                        </span>
                    )}
                </p>
            )}

            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    if (onSubmit) onSubmit(e);
                }}
                className={`${styles.form || "space-y-4"}`}
            >
                {fields.map((field, index) => (
                    <div
                        key={index}
                    >
                        <div key={index} className={`${styles.fieldWrapper || "flex flex-col"}`}>
                            <label className={`${styles.label || "text-sm font-medium mb-1"}`}>
                                {field.label}
                            </label>
                            {
                                (field.type == 'select' && field.options)
                                ?
                                    <select 
                                        name={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.handleBlur}
                                        className={`${styles.input || "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:border-purple-500"}`}
                                        required={field.required}                                    
                                    >
                                        <option value="" selected disabled>Select one</option>
                                        {field?.options?.map((opt, optIndex) => (
                                            <option value={opt} key={optIndex}>
                                                { opt }
                                            </option>
                                        ))}
                                    </select>
                                :
                                field?.name && field?.type
                                &&
                                    <input
                                        name={field.name}
                                        type={field.type}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.handleBlur}
                                        placeholder={field.placeholder}
                                        className={`${styles.input || "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:border-purple-500"}`}
                                        required={field.required}
                                    />                                
                            }
                            {customFields[index] && <div>{customFields[index]}</div>}
                        </div>

                        {
                            field?.withErrMsg
                            &&
                                <ErrorMessage name={field.name}>
                                    { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                                </ErrorMessage>
                        }
                    </div>
                ))}

                {
                    buttonErrMsg && 
                        <ErrorMsg1 errorMsg={buttonErrMsg} position={'center'} />
                }

                {(buttonText && !buttonFunc) && (
                    <Link to={buttonLink}>
                        <Button 
                            type="button" 
                            className={`cursor-pointer ${styles.button || "w-full bg-purple-600 text-white hover:bg-purple-700"}`}
                        >
                            {buttonText}
                        </Button>
                    </Link>
                )}

                {buttonFunc && (
                    <Button 
                        type="button" 
                        onClick={buttonFunc}
                        className={`cursor-pointer ${styles.button || "w-full bg-purple-600 text-white hover:bg-purple-700"}`}
                    >
                        {buttonText}
                    </Button>
                )}                
            </form>

            {footerText && (
                <p className={`${styles.footerText || "text-sm text-center mt-4"}`}>
                    {footerText}{" "}
                    <Link 
                        to={footerLink} 
                        className={`${styles.footerLink || "text-purple-600 font-medium hover:underline"}`}
                    >
                        {footerLinkText || "Click here"}
                    </Link>
                </p>
            )}
        </div>
    );
};

export default AuthForm;
