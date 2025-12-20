import { useMemo } from "react";

/**
 * Pagination hook
 * - Splits `arr` into pages of size `maxShow`
 * - Returns items of page `index` (0-based)
 * - Returns a compact `pageList` for UI with leading/trailing ellipses based on `pageListIndex`
 */
export function usePagination({
  arr = [],
  maxShow = 10,        // items per page
  index = 0,           // current item-page index (0-based)
  maxPage = 5,         // how many page numbers per chunk
  pageListIndex = 0    // which chunk of page numbers to show (0-based)
}) {
  return useMemo(() => {
    // Guards
    if (!Array.isArray(arr) || arr.length === 0 || maxShow <= 0 || maxPage <= 0) {
      return {
        pageItems: [],
        totalPages: 0,
        pageList: [],
        totalPageListIndex: 0
      };
    }

    // --- Item pagination ---
    const totalPages = Math.ceil(arr.length / maxShow);
    const safeIndex = Math.min(Math.max(index, 0), Math.max(totalPages - 1, 0));
    const start = safeIndex * maxShow;
    const end = start + maxShow;
    const pageItems = arr.slice(start, end);

    // --- Build page number chunks ---
    const allPageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const pageChunks = [];
    for (let i = 0; i < allPageNumbers.length; i += maxPage) {
      pageChunks.push(allPageNumbers.slice(i, i + maxPage));
    }

    const totalPageListIndex = Math.max(pageChunks.length - 1, 0);
    const safePLI = Math.min(Math.max(pageListIndex, 0), totalPageListIndex);

    let pageList = pageChunks[safePLI] || [];

    // Ellipses logic:
    // If there are previous chunks, prepend "..."
    if (safePLI > 0) {
      pageList = ["...", ...pageList];
    }
    // If there are more chunks ahead, append "..."
    if (safePLI < totalPageListIndex) {
      pageList = [...pageList, "..."];
    }

    return {
      pageItems,
      totalPages,
      pageList,
      totalPageListIndex
    };
  }, [arr, maxShow, index, maxPage, pageListIndex]);
}
