import { Icon } from "@iconify/react"

const Pagination = ({
    currentPage = 1,
    totalPages = 10,
    onPageChange,
    showPreviousNext = true,
    maxVisiblePages = 5,
    className = ""
}) => {
    const generatePageNumbers = () => {
        const pages = []
        const halfVisible = Math.floor(maxVisiblePages / 2)

        let startPage = Math.max(1, currentPage - halfVisible)
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        if (startPage > 1) {
            pages.push(1)
            if (startPage > 2) pages.push("...")
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push("...")
            pages.push(totalPages)
        }

        return pages
    }

    const handlePageChange = (page) => {
        if (page !== "..." && onPageChange) {
            onPageChange(page)
        }
    }

    return (
        <div className={`flex items-center justify-between px-4 py-3 ${className}`}>
            {showPreviousNext && (
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 text-grey-600 disabled:text-grey-400 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl" />
                    <span>Previous</span>
                </button>
            )}

            <div className="flex gap-2">
                {generatePageNumbers().map((page, i) => (
                    <button
                        key={i}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-full transition-colors ${
                            page === currentPage
                                ? "bg-purple-100 text-primary-600"
                                : page === "..."
                                ? "text-grey-400 cursor-default"
                                : "text-grey-600 hover:bg-grey-100"
                        }`}
                        disabled={page === "..."}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {showPreviousNext && (
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 text-grey-600 disabled:text-grey-400 disabled:cursor-not-allowed cursor-pointer"
                >
                    <span>Next</span>
                    <Icon icon="mdi:arrow-right" className="text-xl" />
                </button>
            )}
        </div>
    )
}

export default Pagination