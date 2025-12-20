import { bookingStatuses, serviceStatuses } from '../constants/constant'


//services
export const servicesMap = {
    approved: {
        color: "bg-green-100 text-green-500",
        feedBack: 'Prospective clients can see this service'
    },
    pending: {
        color: "bg-orange-100 text-orange-500",
        feedBack: 'Awaiting approval from admin.'
    },
    rejected: {
        color: "bg-red-100 text-red-500",
        feedBack: 'Rejected by admin. Edit and re-submit for approval'
    },
    hidden: {
        color: "bg-gray-100 text-gray-500",
        feedBack: "Prospective clients can not see this service"
    }
}

export const getServiceStatusBadge = ({ status }) => {
    const serviceStatus = serviceStatuses.filter(s => s === status)[0]

    if(!serviceStatus) return;

    return (
        <div className='flex items-center justify-start'>
            <p
                className={`${servicesMap[status]?.color} text-xs rounded-lg px-3 py-1`}
            >
                { status }
            </p>
        </div>
    )
}

export const getServiceStatusFeedBack = ({ status }) => servicesMap[status]?.feedBack

export const getServiceStatusColor = ({ status }) => servicesMap[status]?.color





//bookings
export const bookingsMap = {
    ongoing: {
        color: "bg-success-50 text-success-500",
        feedBack: "This appointment is currently on-going"
    },
    new: {
        color: "bg-green-50 text-green-700",
        feedBack: "This appointment has been confirmed"
    },
    completed: {
        color: "bg-primary-50 text-primary-700",
        feedBack: "This appointment has been completed"
    },
    cancelled: {
        color: "bg-grey-100 text-grey-700",
        feedBack: "This appointment was cancelled"
    },
    missed: {
        color: "bg-error-50 text-error-700",
        feedBack: "You missed this appointment"
    }    
}

export const getBookingStatusBadge = ({ status }) => {
    const bookingStatus = bookingStatuses.filter(s => s === status)[0]

    if(!bookingStatus) return;

    return (
        <div className='flex items-center justify-start'>
            <p
                className={`${bookingsMap[status]?.color} text-xs rounded-lg px-3 py-1`}
            >
                { status }
            </p>
        </div>
    )
}





// tickets 
export const ticketsMap = {
    low: {
        color: "bg-success-50 text-success-600",
    },
    medium: {
        color: "bg-warning-50 text-warning-700",
    },
    high: {
        color: "bg-primary-50 text-primary-700",
    },
    critical: {
        color: "bg-error-50 text-error-700",
    }
}
export const getTicketPriorityBadge = ({ status }) => {
    return (
        <div className='flex items-center justify-start'>
            <p
                className={`${ticketsMap[status]?.color} text-xs rounded-lg px-3 py-1`}
            >
                { status }
            </p>
        </div>
    )
}

export const ticketStatusMap = {
    open: {
        color: "bg-green-50 text-green-600"
    },
    closed: {
        color: "bg-gray-100 text-gray-600"
    }
}

export const getTicketStatusBadge = ({ status }) => {
    return (
        <div className='flex items-center justify-start'>
            <p
                className={`${ticketStatusMap[status]?.color} text-xs rounded-lg px-3 py-1`}
            >
                { status }
            </p>
        </div>
    )
}





//screenings
export const RISK_LEVEL_STYLES = {
  "low": { 
    bg: 'bg-green-100', 
    text: 'text-green-700', 
    interpretation: 'Minimal concern — generally safe or healthy condition' 
  }, 
  "mild": { 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-700', 
    interpretation: 'Slight concern — monitor but not alarming' 
  },
  "moderate": { 
    bg: 'bg-orange-100', 
    text: 'text-orange-700', 
    interpretation: 'Noticeable concern — requires attention soon' 
  },
  "worrying": { 
    bg: 'bg-amber-200', 
    text: 'text-amber-800', 
    interpretation: 'Concerning — needs active monitoring or action' 
  },
  "high": { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    interpretation: 'Serious concern — immediate action recommended' 
  },
  "very high": { 
    bg: 'bg-rose-100', 
    text: 'text-rose-700', 
    interpretation: 'Critical — urgent and potentially dangerous situation' 
  }
};

export const ALERT_LEVEL_STYLES = {
  "mild": { 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-700', 
    interpretation: 'Slight concern — monitor but not alarming' 
  },
  "moderate": { 
    bg: 'bg-orange-100', 
    text: 'text-orange-700', 
    interpretation: 'Noticeable concern — requires attention soon' 
  },
  "high": { 
    bg: 'bg-red-100', 
    text: 'text-red-700', 
    interpretation: 'Serious concern — immediate action recommended' 
  },
  "severe": { 
    bg: 'bg-rose-100', 
    text: 'text-rose-700', 
    interpretation: 'Critical — urgent and potentially dangerous situation' 
  }
};


export const getInterpretation = (risklevel) => {
    return RISK_LEVEL_STYLES[risklevel]?.interpretation
}

export function getRiskLevelBadge(riskLevel) {
    const { bg, text } = RISK_LEVEL_STYLES[riskLevel?.toLowerCase()] || RISK_LEVEL_STYLES["moderate"];
    return (
        <span className={`${bg} ${text} px-3 py-1 rounded-full text-sm font-medium`}>
            {riskLevel}
        </span>
    );
}

export function getAlertLevelBadge(alert_level) {
    const { bg, text } = ALERT_LEVEL_STYLES[alert_level?.toLowerCase()] || ALERT_LEVEL_STYLES["moderate"];
    return (
        <span className={`${bg} ${text} px-3 py-1 rounded-full text-sm font-medium`}>
            {alert_level}
        </span>
    );
}

export function getRiskLevelBadgeClass(riskLevel){
    const { bg, text } = RISK_LEVEL_STYLES[riskLevel?.toLowerCase()] || RISK_LEVEL_STYLES["moderate"];

    return `${bg} ${text}`
}
