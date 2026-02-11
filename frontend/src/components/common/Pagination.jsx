import React from "react";

const Pagination = ({
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
    itemName = "items",
}) => {
    if (totalElements === 0) return null;

    return (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {currentPage * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {totalElements}
                </span>{" "}
                {itemName}
            </p>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(0)}
                    disabled={currentPage === 0}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">first_page</span>
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                <div className="flex items-center gap-1">
                    {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i;
                            } else if (currentPage < 3) {
                                pageNum = i;
                            } else if (currentPage > totalPages - 4) {
                                pageNum = totalPages - 5 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                            ? "bg-primary text-white"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        }
                    )}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
                <button
                    onClick={() => onPageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">last_page</span>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
