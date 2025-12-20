import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import AddNewAccountModal from "./AddNewAccontModal";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { toast } from "react-toastify";
import supabase from "@/database/dbInit";

const BankAccounts = () => {
    const dispatch = useDispatch()

    const profile = useSelector(state => getUserDetailsState(state).profile)
    const savedbank = useSelector(state => getUserDetailsState(state).bank)

    const [addAccountModalVisible, setAddAccountModalVisible] = useState(false)
    const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })
    const [bank, setBank] = useState(null)

    useEffect(() => {
        if (savedbank) {
            setBank(savedbank)

        } else {
            setApiReqs({
                isLoading: true,
                errorMsg: null,
                data: {
                    type: 'fetchBank'
                }
            })
        }
    }, [profile])

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if (isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if (isLoading && data) {
            const { type } = data

            if (type === 'fetchBank') {
                fetchBank()
            }
        }
    }, [apiReqs])

    const fetchBank = async () => {
        try {

            const { data, error } = await supabase
                .from('banks')
                .select('*')
                .eq("vendor_id", profile?.id)

            if (error) {
                console.log(error)
                throw new Error()
            }

            const b = data[0]

            if (b) {
                setBank(b)
                dispatch(setUserDetails({
                    bank: b
                }))
            }

            setApiReqs({ isLoading: false, errorMsg: null, data: null })

            return;

        } catch (error) {
            console.log(error)
            return fetchBankFailure({ errorMsg: 'Something went wrong! Try again later.' })
        }
    }
    const fetchBankFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    return (
        <div className="bg-grey-50 p-6 rounded-lg w-full flex items-center justify-center flex-col min-h-[500px]">
            {
                !bank
                    ?
                    <>
                        {/* Bank Image */}
                        <div className="mb-4">
                            <img src="/assets/cash.svg" alt="" />
                        </div>

                        {/* Text */}
                        <p className="text-grey-700 text-lg font-bold text-center">No Bank Accounts Added</p>
                        <p className="text-grey-500 mb-6 text-center text-sm">Your saved bank accounts will appear here</p>

                        {/* Add Bank Button */}
                        <Button onClick={() => setAddAccountModalVisible(true)} className="bg-primary-600 text-white flex items-center gap-2 rounded-4xl !px-9 !py-3 !h-auto cursor-pointer">
                            <Icon icon="mdi:plus" width="18" height="18" />
                            Add Bank
                        </Button>
                    </>
                    :
                    <>
                        <div className="bg-white drop-shadow-lg lg:p-5 p-4 rounded-lg lg:w-3/5 w-full">
                            {
                                [
                                    { title: 'Bank name', value: bank?.name },
                                    { title: 'Bank type', value: bank?.type },
                                    { title: 'Account type', value: bank?.account_type },
                                    { title: 'Account number', value: bank?.account_number },
                                    { title: 'Account name', value: `${bank?.first_name} ${bank?.last_name}` },
                                    { title: 'Country', value: bank?.country },
                                    { title: 'Currency', value: bank?.currency },
                                ].map((opt, i) => {
                                    const { title, value } = opt

                                    return (
                                        <div 
                                            key={i}
                                            className="flex items-center justify-between mb-4"
                                        >
                                            <p className="text-black-700">
                                                { title }
                                            </p>

                                            <p className="text-gray-700">
                                                { value }
                                            </p>
                                        </div>
                                    )
                                })
                            }

                            <div className="flex items-center justify-center mt-7">
                                <Button onClick={() => setAddAccountModalVisible(true)} className="bg-primary-600 text-white flex items-center gap-2 rounded-4xl !px-9 !py-3 !h-auto cursor-pointer">
                                    <Icon icon="mdi:plus" width="18" height="18" />
                                    Update Bank
                                </Button>                            
                            </div>
                        </div>
                    </>
            }

            {/* Modals  */}
            <AddNewAccountModal
                isOpen={addAccountModalVisible}
                onClose={() => setAddAccountModalVisible(false)}
                setBank={setBank}
            />
            {/* <AccountAddedModal /> */}
        </div>
    );
};

export default BankAccounts;
