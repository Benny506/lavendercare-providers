import { ErrorMessage } from "formik";
import ErrorMsg1 from "./ErrorMsg1";

export default function PhoneInput({
    value="",
    onChange=()=>{},
    onBlur=()=>{},
    placeholder="Type your business number",
    name="",
    withErrMsg=false
}) {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-600">
                Phone Number
            </label>
            <div className="flex">
                <select className="border border-gray-300 bg-gray-50 rounded-l-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="+234">+234</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                </select>
                <input
                    name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    type="tel"
                    placeholder={placeholder}
                    className="flex-1 border border-l-0 border-gray-300 bg-gray-50 rounded-r-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            {
                withErrMsg
                &&
                    <ErrorMessage name={name}>
                        { errorMsg => <ErrorMsg1 errorMsg={errorMsg} /> }
                    </ErrorMessage>
            }            
        </div>
    );
}
