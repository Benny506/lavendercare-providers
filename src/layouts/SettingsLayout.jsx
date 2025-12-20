import path from "path";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const SettingsLayout = () => {

    const { pathname } = useLocation()

    const tabs = [
        { name: "Business Profile", path: "business-profile" },
        { name: "Bank Accounts", path: "bank-accounts" },
        { name: "Change Password", path: "change-password" },
    ];

    const activeTab = 
        pathname.toLowerCase().includes('bank-accounts')
        ?
            'bank accounts'
        :
        pathname.toLowerCase().includes('change-password')
        ?
            'change password'
        :
            'business profile'

    return (
        <div className="w-full mx-auto p-6 px-0">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-grey-200 mb-6">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={() =>
                            `p-3 pb-2 font-bold ${activeTab === tab?.name.toLowerCase()
                                ? "text-primary-500 border-b-2 border-primary-500 bg-grey-100"
                                : "text-grey-400"
                            }`
                        }
                    >
                        {tab.name}
                    </NavLink>
                ))}
            </div>

            {/* Content */}
            <Outlet />
        </div>
    );
};

export default SettingsLayout;