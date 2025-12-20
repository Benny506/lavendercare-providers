import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex max-h-screen overflow-hidden min-h-screen bg-primary-100 bg-img">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="fit-and-scroll flex-1 p-6 flex-col">
          <TopBar setIsOpen={setIsOpen} />

          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )};


export default DashboardLayout;