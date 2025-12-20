import { useNavigate } from "react-router-dom";

const VendorAccount = ({className = ""}) => {
  const navigate = useNavigate();
  return (
    <div className={`flex w-max ${ className || "mt-9.5 mr-5 ml-auto justify-end"}`}>
        <p className="gray-text-500">I have a Providers Acccount. <button type="button" className="text-primary-500 font-bold cursor-pointer" onClick={() => navigate("/login")}>Login</button></p>
    </div>
  )
}

export default VendorAccount