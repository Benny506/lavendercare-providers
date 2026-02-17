import { Icon } from '@iconify/react';
import React, { act, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import Image from './ui/image';
import { SidebarItems } from '@/constants/constant';
import { Copy, Dot, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearUserDetails, getUserDetailsState } from '@/redux/slices/userDetailsSlice';
import supabase from '@/database/dbInit';
import { appLoadStart, appLoadStop } from '@/redux/slices/appLoadingSlice';
import { toast } from 'react-toastify';
import { getPublicImageUrl } from '@/lib/requestApi';
import { copyToClipboard, formatNumberWithCommas } from '@/lib/utils';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch()

  const Navigate = useNavigate();

  const { pathname } = useLocation()

  const profile = useSelector(state => getUserDetailsState(state).profile)
  const referral = useSelector(state => getUserDetailsState(state).referral)
  const assignedMothers = useSelector(state => getUserDetailsState(state).assignedMothers)
  const user = useSelector(state => getUserDetailsState(state).user)
  const licenseApproved = useSelector(state => getUserDetailsState(state).license?.status)

  const userLogout = async () => {
    try {

      dispatch(appLoadStart())

      dispatch(clearUserDetails())
      await supabase.auth.signOut()

      dispatch(appLoadStop())

      toast.success("Logged out")

    } catch (error) {
      console.log(error)
      toast.error("Error logging you out")
    }
  }

  const activeNav =
    pathname.includes('service')
      ?
      'services'
      :
      pathname.includes('bookings')
        ?
        'bookings'
        :
        pathname.includes('inbox')
          ?
          'inbox'
          :
          pathname.includes('wallet')
            ?
            'wallet'
            :
            pathname.includes("settings")
              ?
              'settings'
              :
              pathname.includes("support")
                ?
                'support'
                :
                pathname.includes("mothers")
                  ?
                  'mothers'
                  :
                  pathname.includes("screenings")
                    ?
                    'screenings'
                    :
                    'dashboard'

  const imageUrl = getPublicImageUrl({ path: profile?.profile_img, bucket_name: 'user_profiles' })

  const navItems =
    assignedMothers?.length > 0
      ?
      licenseApproved
      ?
        SidebarItems
      :
        SidebarItems?.filter(item => item?.path !== '/screenings')
      :
      SidebarItems?.filter(item => item.path !== '/mothers' && item?.path !== '/screenings')

  return (
    <aside className={`fixed h-full overflow-y-auto md:h-max lg:h-screen max-w-max flex flex-col bg-white border-r border-[#E9E9E9] justify-between mt-0.5 transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
      <div className=''>
        {/* Logo */}
        <div className="flex items-center gap-2 px-8 pt-8 pb-6 cursor-pointer" onClick={() => Navigate('/')}>
          <Image src="assets/lavendercare-logo.svg" alt="LavenderCare Logo" className="w-50" />
          <X size={30} onClick={() => { setIsOpen(false) }} className='block lg:hidden' />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 px-8">
          {navItems.map((item) => {

            const active = activeNav === item.label.toLowerCase() ? true : false

            const handleItemClick = () => {
              setIsOpen(false)
              
              if(item?.path?.startsWith("https")){
                window.open(item.path, "_blank")
                return
              }

              item.path && Navigate(item.path)
            }

            return (
              <div
                key={item.label}
                onClick={handleItemClick}
                className={`flex items-center gap-4 py-3 px-4 rounded-lg cursor-pointer transition-colors ${active ? 'bg-[#7B3FE4] text-white' : 'text-[#2D1A4A] hover:bg-[#F3F0FA]'
                  }`}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  <Icon
                    icon={item.icon}
                    width="24"
                    height="24"
                    style={{ color: active ? "#FFFFFF" : "#000000" }}
                  />
                </span>
                <span className="font-medium text-md">{item.label}</span>
              </div>
            )
          }
          )}
        </nav>

        {/* Settings & Support */}
        <div className="mt-10 flex flex-col gap-2 px-8">
          <div
            onClick={() => {
              Navigate("/settings")
              setIsOpen(false)
            }}
            className={
              `flex items-center gap-4 py-3 px-4 rounded-lg cursor-pointer ${activeNav === 'settings'
                ? "bg-primary-500 text-grey-50"
                : "bg-transparent text-primary-900 hover:bg-[#F3F0FA]"
              }`
            }
          >
            <span className="w-6 h-6 flex items-center justify-center">
              <Icon
                icon="material-symbols:settings-outline-rounded"
                width="24"
                height="24"
                className={({ isActive }) =>
                  activeNav === 'settings' ? "text-grey-50" : "text-primary-900"
                }
              />
            </span>
            <span className="font-medium text-md">Settings</span>
          </div>

          <div
            onClick={() => {
              Navigate("/support")
              setIsOpen(false)
            }}
            className={
              `flex items-center gap-4 py-3 px-4 rounded-lg cursor-pointer ${activeNav === 'support'
                ? "bg-primary-500 text-grey-50"
                : "bg-transparent text-primary-900 hover:bg-[#F3F0FA]"
              }`
            }
          >
            <span className="w-6 h-6 flex items-center justify-center">
              <Icon
                icon="material-symbols-light:support-agent-outline-rounded"
                width="24"
                height="24"
                className={({ isActive }) =>
                  activeNav === 'support' ? "text-grey-50" : "text-primary-900"
                }
              />
            </span>
            <span className="font-medium text-md">Contact support</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 py-5 pb-15 border-t border-[#E9E9E9]">
        <div className='flex items-center gap-4'>
          {
            profile?.profile_img
              ?
              <img
                src={imageUrl}
                alt='Profile img'
                className='rounded-full h-8 w-8'
              />
              :
              <></>
          }
          <div className="flex-1">
            <div className="font-bold text-md text-[#2D1A4A]">{profile?.business_name}</div>
            <div className="text-[#7B3FE4] text-sm">{user?.email}</div>
          </div>
          <button onClick={userLogout} className="cursor-pointer">
            <Icon icon="solar:logout-outline" width="24" height="24" style={{ color: "red" }} />
          </button>
        </div>

        <div
          onClick={async () => {
            const { success } = await copyToClipboard(referral?.referral_code)
            return success ? toast.success("Copied!") : toast.error("Copying error!")
          }}
          className="flex items-center gap-2 mt-4"
        >
          <Copy size={14} />
          <p className="text-sm text-gray-500">
            {referral?.referral_code}
          </p>
          <Dot size={14} />
          <p className="text-sm text-gray-500">
            {formatNumberWithCommas(referral?.referred_count)} users referred
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;