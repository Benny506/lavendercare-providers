import Layout from "@/layouts/Layout";
import CreateVendorProfile from "@/pages/auth/become-vendor/CreateVendorProfile";
import Login from "@/pages/auth/Login";
import VerificationComplete from "@/pages/auth/become-vendor/VerificationComplete";
import VerifyEmail from "@/pages/auth/become-vendor/VerifyEmail";
import RecoverPassword from "@/pages/auth/forgot-password/RecoverPassword";
import EnterOtp from "@/pages/auth/forgot-password/EnterOtp";
import { Routes, Route } from "react-router-dom";
import CreateNewPassword from "@/pages/auth/forgot-password/CreateNewPassword";
import PasswordRecovered from "@/pages/auth/forgot-password/PasswordRecovered";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import Services from "@/pages/services/Services";
import ServiceDetails from "@/pages/services/ServiceDetails";
import Bookings from "@/pages/bookings/Bookings";
import BookingDetails from "@/pages/bookings/BookingDetails";
import Wallet from "../pages/wallet/Wallet";
import Inbox from "@/pages/inbox/Inbox";
import SettingsLayout from "@/layouts/SettingsLayout";
import BusinessProfile from "@/pages/settings/BusinessProfile";
import BankAccounts from "@/pages/settings/BankAccounts";
import ChangePassword from "@/pages/settings/ChangePassword";
import Notifications from "@/pages/notifications/Notifications";
import AutoLogin from "@/components/AutoLogin";
import Support from "@/pages/support/Support";
import ServiceSetup from "@/pages/services/serviceSetup/ServiceSetup";
import UserProfile from "@/pages/mothers/UserProfile";
import Users from "@/pages/mothers/Users";
import Screenings from "../pages/screenings/Screenings";
import SingleScreening from "../pages/screenings/SingleScreening";
import Availability from "../pages/availability/Availability";
import UserChat from "@/pages/mothers/UserChat";

const AppRoutes = () => {
  return (
    <AutoLogin>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/new-provider" element={<CreateVendorProfile />} />
          <Route path="/new-provider/verify-email" element={<VerifyEmail />} />
          <Route path="/new-provider/verification-complete" element={<VerificationComplete />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Forgot Password */}
          <Route path="/recover-password" element={<RecoverPassword />} />
          <Route path="/recover-password/otp" element={<EnterOtp />} />
          <Route path="/recover-password/new-password" element={<CreateNewPassword />} />
          <Route path="/recover-password/password-recovered" element={<PasswordRecovered />} />
        </Route>

        {/* Dashboard  */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<Services />} />
          <Route path="service/setup" element={<ServiceSetup />} />
          {/* <Route path="services/service" element={<ServiceDetails />} /> */}

          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/booking" element={<BookingDetails />} />

          <Route path="mothers" element={<Users />} />
          <Route path="mothers/single-mother" element={<UserProfile />} />
          <Route path="mothers/single-mother/booking-chat" element={<UserChat />} />
          <Route path="availability" element={<Availability />} />

          <Route path="screenings" element={<Screenings />} />
          <Route path="screenings/single-screening" element={<SingleScreening />} />

          <Route path="wallet" element={<Wallet />} />
          <Route path="inbox" element={<Inbox />} />

          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<BusinessProfile />} />
            <Route path="business-profile" element={<BusinessProfile />} />
            <Route path="bank-accounts" element={<BankAccounts />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="support" element={<Support />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </AutoLogin>
  );
};

export default AppRoutes;
