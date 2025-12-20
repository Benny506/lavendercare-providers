import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => (
  <div className="bg-img w-screen min-h-screen bg-primary-100 flex flex-col items-center">
    <Navbar />
    <div className="w-full flex-1 flex flex-col">
      <Outlet />
    </div>
  </div>
);

export default Layout;