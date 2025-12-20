import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Table from "@/components/Table";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { formatNumberWithCommas } from "@/lib/utils";
import { getBookingStatusBadge } from "@/lib/utilsJsx";
import { useNavigate } from "react-router-dom";
import useApiReqs from "@/hooks/useApiReqs";
import BookingsTable from "../bookings/auxiliary/BookingsTable";

/* ------------------ Animations ------------------ */

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getDashboardStats } = useApiReqs();

  const allBookings = useSelector(
    state => getUserDetailsState(state).bookings
  );

  const [dashboardStats, setDashboardStats] = useState({
    physicalBookingsCount: 0,
    virtualBookingsCount: 0,
    screeningsCount: 0,
    HRA_Count: 0,
    newPhysicalBookingsCount: 0,
    newVirtualBookingsCount: 0
  });

  useEffect(() => {
    getDashboardStats({
      callBack: (args) => {
        if (!args) return;
        setDashboardStats(args);
      }
    });
  }, []);

  return (
    <div className="py-4 md:p-4 overflow-x-hidden space-y-6">

      {/* ------------------ Stats Section ------------------ */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
      >
        {[
          {
            title: "Total Physical Bookings",
            count: dashboardStats.physicalBookingsCount,
            text: formatNumberWithCommas(
              dashboardStats.physicalBookingsCount
            ),
            newCount: dashboardStats.newPhysicalBookingsCount,
            link: "/bookings",
          },
          {
            title: "Total Virtual Bookings",
            count: dashboardStats.virtualBookingsCount,
            text: formatNumberWithCommas(
              dashboardStats.virtualBookingsCount
            ),
            newCount: dashboardStats.newVirtualBookingsCount,
            link: "/consultations",
          },
          {
            title: "Total Screenings",
            count: dashboardStats.screeningsCount,
            text: formatNumberWithCommas(
              dashboardStats.screeningsCount
            ),
            link: "screenings",
          },
          {
            title: "High-Risk Alerts",
            count: dashboardStats.HRA_Count,
            text: formatNumberWithCommas(
              dashboardStats.HRA_Count
            ),
            link: "high-risk-alerts",
          },
        ].map((info, i) => {
          const { link, title, text, count, newCount } = info;

          return (
            <motion.div
              key={i}
              variants={card}
              whileHover={{ y: -4 }}
              className="bg-white shadow-sm hover:shadow-md transition rounded-2xl p-4 flex flex-col"
            >
              <div className="flex justify-between items-start">
                <Icon
                  icon="uil:calender"
                  className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg p-2"
                />

                {newCount > 0 && (
                  <div className="h-6 rounded-lg bg-success-50 flex items-center px-2">
                    <p className="text-sm text-success-500 font-medium">
                      {formatNumberWithCommas(newCount)} new
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-3">{title}</p>

              <p className="text-2xl font-bold my-3">
                {count > 0 ? text : "—"}
              </p>

              <hr className="bg-[#D2C3EF] h-0.5 border-none" />

              <button
                onClick={() => navigate(link)}
                className="flex items-center gap-2 text-primary-600 font-bold mt-3"
              >
                View all
                <Icon icon="mdi:arrow-right" className="text-xl" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ------------------ Recent Bookings Table ------------------ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-white shadow-sm rounded-2xl border"        
      >
        <div className="border-b-1 p-4 flex justify-between items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-bold text-xl text-gray-900">
              Recent Bookings
            </h2>
            <p className="text-xs text-gray-400">
              See your most recent bookings below
            </p>
          </div>

          <button
            onClick={() => navigate("/bookings")}
            className="text-primary-500 font-bold flex items-center gap-1"
          >
            View all bookings
            <Icon icon="mdi:arrow-right" className="text-xl" />
          </button>
        </div>

        <BookingsTable
          bookings={allBookings.slice(0, 6)}
        />
      </motion.div>
    </div>
  );
}
