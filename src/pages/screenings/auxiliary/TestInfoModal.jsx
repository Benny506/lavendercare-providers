import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { isoToDateTime } from '@/lib/utils';
import { getAlertLevelBadge, getRiskLevelBadge } from '@/lib/utilsJsx';
import { useReactToPrint } from 'react-to-print';
import useApiReqs from '@/hooks/useApiReqs';
import ZeroItems from '@/components/ZeroItems';

const TestInfoModal = ({ show, onClose, data }) => {
    const dispatch = useDispatch()

    const { fetchTestResults, markAsViewed } = useApiReqs()

    const containerRef = useRef(null)

    const [highRiskAlerts, setHighRiskAlerts] = useState([])
    const [testQuestions, setTestQuestions] = useState([])

    const exportElementToPdf = useReactToPrint({
        contentRef: containerRef
    });

    useEffect(() => {
        if (data) {
            fetchTestResults({
                callBack: ({ groupedQuestions }) => {
                    setTestQuestions(groupedQuestions)
                },
                requestInfo: {
                    answer: data?.answer
                }
            })
        }
    }, [data])

    const screening_id = data?.id
    const highRiskAlertNotViewed = (highRiskAlerts || [])?.filter(risk_alert => (risk_alert?.screening_id === screening_id) && (risk_alert?.viewed === false))[0]

    const closeModal = () => {
        setTestQuestions([])
        onClose && onClose()

        return;
    }

    const handleViewed = () => {
        markAsViewed({
            callBack: ({ screening_id }) => {
                const updatedHighRiskAlerts = (highRiskAlerts || [])?.map(risk_alert => {
                    if (risk_alert?.screening_id == screening_id) {
                        return {
                            ...risk_alert,
                            viewed: true
                        }
                    }

                    return risk_alert
                })

                setHighRiskAlerts(updatedHighRiskAlerts)
            },
            screening_id
        })
    }

    if (!show || !data) return null;

    const { test_date, user_id, score, risk_level } = data

    const answerInfo = data?.answer

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
            <div className="bg-img rounded-xl p-4 w-full h-full max-h-[80vh] lg:max-w-[60vw] max-w-[98vw]  shadow-xl relative">
                <div className="bg-white rounded-2xl shadow-xl w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <button
                                onClick={closeModal}
                                className="flex mb-2 cursor-pointer items-center text-purple-600 font-medium"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back
                            </button>

                            <div className='flex flex-col gap-1'>
                                <button onClick={exportElementToPdf} className="cursor-pointer bg-purple-100 text-purple-600 px-6 py-2 rounded-lg font-medium">
                                    Download PDF
                                </button>

                                {
                                    highRiskAlertNotViewed
                                    &&
                                    <button onClick={handleViewed} className="cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-lg font-medium">
                                        Mark as viewed
                                    </button>
                                }
                            </div>
                        </div>

                        <div>
                            <p className='text-base m-0 p-0 mb-1 text-end text-right fw-500 text-000'>
                                {isoToDateTime({ isoString: new Date(test_date).toISOString() })}
                            </p>
                            <p className='text-base m-0 p-0  mb-1 text-end text-right fw-500 text-000'>
                                Score: {score}
                            </p>
                            <div className='text-base m-0 p-0 text-end text-right fw-500 text-000'>
                                Risk level (Score): {getRiskLevelBadge(risk_level)}
                            </div>
                        </div>
                    </div>

                    <div ref={containerRef} style={{ overflowY: 'auto' }}>
                        <div className="flex flex-col">

                            <div className='p-6'>
                                {
                                    testQuestions?.length > 0
                                        ?
                                        <div>
                                            {
                                                testQuestions.map((ques, i) => {
                                                    const { prompt, type, options, answer, id } = ques

                                                    const answerInfoForQues = (answerInfo || []).filter(info => info?.question_id == id)[0]

                                                    return (
                                                        <div
                                                            key={i}
                                                            className='mb-6'
                                                        >
                                                            <div className='flex flex-col items-start gap-1 mb-3'>
                                                                <p className='m-0 p-0 text-xl txt-000 fw-900 txt-15'>
                                                                    {i + 1}.
                                                                </p>

                                                                <p className='m-0 p-0 text-xl txt-000 fw-500 txt-15'>
                                                                    {prompt}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                {
                                                                    options?.map((opt, optIndex) => {
                                                                        const { label, value } = opt

                                                                        const isAnswer = value == answer ? true : false

                                                                        return (
                                                                            <div
                                                                                key={optIndex}
                                                                                className='mb-2 flex flex-wrap items-center gap-2'
                                                                            >
                                                                                <p className='lg:w-2/5 w-full m-0 p-0 text-sm txt-000 fw-500 txt-15'>
                                                                                    {label}
                                                                                </p>

                                                                                {
                                                                                    isAnswer
                                                                                    &&
                                                                                    <div className='mb-3 flex items-center gap-2'>
                                                                                        <CheckCircle
                                                                                            size={20}
                                                                                            color='#6F3DCB'
                                                                                        />

                                                                                        {
                                                                                            answerInfoForQues?.alert_level
                                                                                            &&
                                                                                            <>
                                                                                                {getAlertLevelBadge(answerInfoForQues?.alert_level)}

                                                                                                {
                                                                                                    answerInfoForQues?.risk_percent >= 0
                                                                                                    &&
                                                                                                    <p className='py-1 rounded-full text-sm font-medium'>
                                                                                                        risk - {answerInfoForQues?.risk_percent} %
                                                                                                    </p>
                                                                                                }
                                                                                            </>
                                                                                        }
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                        :
                                        <ZeroItems
                                            zeroText={"Questions will appear here"}
                                        />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestInfoModal;