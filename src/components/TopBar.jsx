import { Icon } from "@iconify/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { Menu } from "lucide-react";

const TopBar = ({ setIsOpen }) => {
    const [selectedOption, setSelectedOption] = useState("lifetime");
    return (
        <header className="w-full lg:px-6 md:py-2 flex flex-col items-start md:items-center justify-between gap-4 border-b-[1.5px] border-primary-100 pb-5">
            <div className="flex justify-between w-full">
                <div className="flex items-center gap-2">
                    {/* Hamburger for mobile */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="lg:hidden"
                    >
                        <Menu size={24} />
                    </button>
                    {/* Left: Page Title */}
                    <h1 className="text-2xl font-bold text-[#000000]">Overview</h1>
                </div>

                {/* Right: Search + Notification + Avatar */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    {/* <div className="hidden md:block">
                        <Select value={selectedOption} onValueChange={setSelectedOption}>
                            <SelectTrigger className="w-[140px] bg-grey-50 border border-grey-200 rounded-none py-5 font-extrabold text-md">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="lifetime">Lifetime</SelectItem>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                    </div> */}

                    {/* Notification Icon with Badge */}
                    {/* <div className="relative cursor-pointer">
                        <div className="p-2 rounded-sm border border-grey-200">
                            <Icon icon="mdi:notifications-none" width="24" height="24" className="text-primary-500" />
                        </div>
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                            1
                        </span>
                    </div> */}
                </div>
            </div>

            {/* <div className="block md:hidden">
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                    <SelectTrigger className="w-[140px] bg-grey-50 border border-grey-200 rounded-none py-5 font-extrabold text-md">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div> */}
        </header>
    );
};

export default TopBar;
