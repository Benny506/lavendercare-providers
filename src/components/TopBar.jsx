import { Menu, Bell, ChevronDown, Settings, User, HandHelping } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const TopBar = ({ setIsOpen }) => {

    const navigate = useNavigate()

    const pathname = useLocation().pathname.toLowerCase()

    const routeMeta = [
        {
            key: "service",
            title: "Services",
            subtitle: "Manage and configure available services",
        },
        {
            key: "booking",
            title: "Bookings",
            subtitle: "Track, review, and manage appointments",
        },
        {
            key: "mother",
            title: "Mothers",
            subtitle: "Profiles and medical history overview of mothers assigned to you",
        },
        {
            key: "screening",
            title: "Screenings",
            subtitle: "Health screening records and results of mothers assigned to you",
        },
        {
            key: "setting",
            title: "Settings",
            subtitle: "System preferences and configurations",
        },
        {
            key: "support",
            title: "Support",
            subtitle: "Help requests and user communication",
        },
    ];

    const getHeaderMeta = () => {
        const match = routeMeta.find(route => pathname.includes(route.key));

        return (
            match ?? {
                title: "Dashboard",
                subtitle: "Summary, analytics, and key insights",
            }
        );
    };

    const { title, subtitle } = getHeaderMeta()

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">

                {/* Left Section */}
                <div className="flex items-center gap-3">
                    {/* Mobile Menu */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Title */}
                    <div className="leading-tight">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-500 hidden md:block">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button onClick={() => navigate('/settings')} className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                        <Settings size={20} />
                    </button>

                    {/* User */}
                    <button onClick={() => navigate('/support')} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                        <HandHelping size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
