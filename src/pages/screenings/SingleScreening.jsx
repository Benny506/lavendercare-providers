import { getRiskLevelBadgeClass } from '@/lib/utilsJsx';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMaxByKey } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';
import UserCard from '../mothers/auxiliary/UserCard';
import useApiReqs from '@/hooks/useApiReqs';
import ScreeningsTable from './auxiliary/ScreeningsTable';
import TestInfoModal from './auxiliary/TestInfoModal';

const SingleScreening = () => {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const { state } = useLocation()
    const user = state?.user
    const user_id = user?.id

    const { getUserScreenings } = useApiReqs()

    const containerRef = useRef(null)

    const exportElementToPdf = useReactToPrint({
        contentRef: containerRef
    });

    const [latestScreeningInfo, setLatestScreeningInfo] = useState()
    const [patientScreeningHistory, setPatientScreeningHistory] = useState()
    const [testInfoModal, setTestInfoModal] = useState({ show: false, data: null })

    useEffect(() => {
        if (!user_id) {        
            navigate(-1)
            toast.info("User not found")
            return;

        } else {

            getUserScreenings({
                callBack: ({ screenings }) => {
                    const latestScreeningInfo = screenings?.[0]

                    if(!latestScreeningInfo){
                        navigate(-1)
                        toast.info("User has not taken any Mental-Health-Screening-Test before")

                        return
                    }

                    setPatientScreeningHistory(screenings?.map(s => {
                        return {
                            ...s,
                            user_profile: user
                        }
                    }))
                    setLatestScreeningInfo(latestScreeningInfo)
                },
                user_id
            })
        }
    }, [])

    const openTestInfoModal = ({ data }) => setTestInfoModal({ show: true, data })

    if (!user_id || !latestScreeningInfo || !user) return <></>

    const {
        risk_level, test_date, score, test_type, remark, answer
    } = latestScreeningInfo

    const {
        name, profile_img,
    } = user

    return (
        <div>
            <div ref={containerRef} className="min-h-screen bg-white flex flex-wrap rounded-lg">
                {/* Left Sidebar */}
                <div className="lg:w-1/3 w-full lg:mb-0 mb-4 p-6 border-r border-gray-200">
                    {/* Patient Header */}
                    <div className='mb-6 flex items-start justify-between gap-3 w-full'>
                        <div className="flex items-start">
                            <div className="p-2 bg-orange-200 rounded-full flex items-center justify-center mr-4">
                                <img
                                    src={profile_img || "/default-avatar.png"}
                                    alt={name}
                                    className="w-14 h-14 rounded-full object-cover border"
                                />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold">{name}</h1>
                                <span className={`${getRiskLevelBadgeClass(risk_level)} px-2 py-1 rounded text-sm font-medium`}>
                                    {risk_level}
                                </span>
                            </div>
                        </div>
                    </div>

                    <UserCard
                        user={user}
                    />

                    <div className="mb-6 mt-6">
                        <button onClick={exportElementToPdf} className="cursor-pointer bg-purple-100 text-purple-600 px-6 py-2 rounded-lg font-medium">
                            Download PDF
                        </button>
                    </div>
                </div>
                {/* Right Content */}
                <div className="flex-1 p-6">
                    <h2 className="text-xl font-bold mb-6">Latest Result Summary</h2>
                    <div className="bg-white rounded-lg lg:p-6 p-2 mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left w-1/3 py-3 text-gray-600 font-medium">Field</th>
                                    <th className="text-left w-2/3 py-3 text-gray-600 font-medium">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    [
                                        { field: "Score", value: score },
                                        { field: "Test type", value: test_type },
                                        { field: "Risk level (Score)", value: risk_level },
                                        { field: "Max Risk % (Answer)", value: `${getMaxByKey({ arr: answer?.filter(ans => ans.alert_level == 'high' || ans?.alert_level == 'severe'), key: 'risk_level' })?.risk_percent}%` },
                                        { field: "Interpretation", value: remark },
                                        { field: "Submitted on", value: new Date(test_date).toDateString() },
                                        { field: "Test Info", value: "View", callBack: ({ data }) => openTestInfoModal({ data }) },
                                    ]
                                        .map(({ field, value, callBack }) => (
                                            <tr key={field} className="border-b border-gray-100">
                                                <td className="py-3 font-medium">{field}</td>
                                                {
                                                    callBack
                                                        ?
                                                        <td className="py-3">
                                                            <button
                                                                onClick={() => callBack({ data: latestScreeningInfo })}
                                                                className="cursor-pointer bg-purple-100 text-purple-600 px-6 py-2 rounded-lg font-medium"
                                                            >
                                                                {value}
                                                            </button>
                                                        </td>
                                                        :
                                                        <td className="py-3">{value}</td>
                                                }
                                            </tr>
                                        ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-xl font-bold mb-6">Full Screening History Table</h2>

                    <ScreeningsTable 
                        hideViewBtn={true}
                        screenings={patientScreeningHistory}
                    />                    
                </div>
            </div>

            <TestInfoModal
                show={testInfoModal.show}
                data={testInfoModal.data}
                onClose={() => setTestInfoModal({ show: false, data: null })}
            />
        </div>
    )
};

export default SingleScreening;