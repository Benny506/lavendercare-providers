import { Icon } from '@iconify/react'

const Notifications = () => {
    const notifications = [
        {
          message:
            "This is the message message. This message depends on the situation. Could be new appointments alerts, Product updates etc",
          date: "Jun 23, 2023",
        },
    ]

    return (
        <div className="bg-gray-50 w-full rounded-lg mt-6 p-4 space-y-4">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center m-auto my-20">
                    <img src="/assets/alarm.svg" alt="No notifications" className="mx-auto mb-3" />
                    <p className="text-gray-700 text-lg font-bold">No Notifications</p>
                    <p className="text-gray-500 text-sm">All your notifications will appear here</p>
                </div>
            ) : (
                notifications.flatMap(notification =>
                    [...Array(4)].map((_, index) => (
                        <div key={notification.message + index} className="border border-gray-200 p-3 rounded-lg space-y-4">
                            <p className="text-md text-gray-700">{notification.message}</p>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                                <button className="text-primary-500 flex items-center gap-2 font-bold">
                                    <span>View Details</span>
                                    <Icon icon="mdi:arrow-right" className="text-xl" />
                                </button>
                                <p className="text-gray-500">{notification.date}</p>
                            </div>
                        </div>
                    ))
                )
            )}
        </div>
    )
}

export default Notifications
