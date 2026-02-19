import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
} from "react-icons/ri";
import "./css/OrdersPagination.css";

const clampInt = (v, min, max) => {
  const n = Number.parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

const OrdersPagination = ({ pagination, onPaginationChange, isLoading = false }) => {
  const { t } = useTranslation();

  const safe = pagination ?? {};
  const totalItems = Number(safe.totalItems ?? 0);
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Number(safe.totalPages ?? 1));
  const itemsPerPage = Math.max(1, Number(safe.itemsPerPage ?? 10));
  const currentPage = clampInt(safe.currentPage ?? 1, 1, totalPages);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    const next = clampInt(page, 1, totalPages);
    if (next === currentPage) return;
    onPaginationChange?.((prev) => ({ ...(prev ?? {}), currentPage: next }));
  };

  const handleItemsPerPageChange = (e) => {
    const nextLimit = clampInt(e.target.value, 1, 500);
    onPaginationChange?.((prev) => ({
      ...(prev ?? {}),
      itemsPerPage: nextLimit,
      currentPage: 1,
    }));
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="orders-pagination">
      <div className="orders-pagination-info">
        <span>
          {t("orders.pagination.showing")} {startItem}-{endItem}{" "}
          {t("orders.pagination.of")} {totalItems}
        </span>
      </div>

      <div className="orders-pagination-nav">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={isLoading || currentPage === 1}
          title={t("orders.pagination.first")}
          type="button"
        >
          <RiArrowLeftDoubleLine />
        </button>

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isLoading || currentPage === 1}
          title={t("orders.pagination.previous")}
          type="button"
        >
          <RiArrowLeftSLine />
        </button>

        <div className="pagination-pages">
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`pagination-page ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
              type="button"
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLoading || currentPage === totalPages}
          title={t("orders.pagination.next")}
          type="button"
        >
          <RiArrowRightSLine />
        </button>

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={isLoading || currentPage === totalPages}
          title={t("orders.pagination.last")}
          type="button"
        >
          <RiArrowRightDoubleLine />
        </button>
      </div>

      <div className="orders-pagination-size">
        <select value={itemsPerPage} onChange={handleItemsPerPageChange} disabled={isLoading}>
          <option value={10}>10 / {t("orders.pagination.page")}</option>
          <option value={25}>25 / {t("orders.pagination.page")}</option>
          <option value={50}>50 / {t("orders.pagination.page")}</option>
          <option value={100}>100 / {t("orders.pagination.page")}</option>
        </select>
      </div>
    </div>
  );
};

export default OrdersPagination;
