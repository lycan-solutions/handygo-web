const statusBadgeClasses = (status?: string | null) => {
  const value = (status || "").toUpperCase();

  if (["APPROVED", "COMPLETED", "MATCHED", "VERIFIED", "ACTIVE"].includes(value)) {
    return "bg-green-100 text-green-700";
  }
  if (["REJECTED", "NOT_MATCHED", "SUSPENDED"].includes(value)) {
    return "bg-red-100 text-red-700";
  }
  if (
    ["CHANGES_REQUIRED", "NEEDS_REVIEW", "NEEDS_RETRAINING", "INVITED", "INACTIVE"].includes(
      value
    )
  ) {
    return "bg-amber-100 text-amber-700";
  }
  if (!value) {
    return "bg-gray-100 text-gray-600";
  }
  return "bg-yellow-100 text-yellow-700";
};

type StatusBadgeProps = {
  value?: string | null;
  fallback?: string;
};

const StatusBadge = ({ value, fallback = "—" }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusBadgeClasses(
      value
    )}`}
  >
    {value || fallback}
  </span>
);

export default StatusBadge;
