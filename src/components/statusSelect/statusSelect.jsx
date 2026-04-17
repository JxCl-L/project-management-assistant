import { useState, useEffect, use } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { MultiSelect } from "@/components/ui/multi-select";

const taskStatus = [
  {
    heading: "Active",
    options: [
      { value: "todo", label: "Todo" },
      { value: "inProgress", label: "In Progress" },
    ],
  },
  {
    heading: "Inactive",
    options: [{ value: "completed", label: "Completed" }],
  },
];

export function StatusSelect({ paginationData }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultStatuses = ["todo", "inProgress"];
  const [currentStatuses, setCurrentStatuses] = useState(() => {
    const statusParam = searchParams.get("status");
    // status param exists, include empty => use param value
    if (statusParam !== null) {
      // Empty string: user cleared selection
      return statusParam === ""
        ? []
        : statusParam.split(",").map((s) => s.trim());
    }
    // status param missing => use defaults
    return defaultStatuses;
  });

  // navigate when paginationData or currentStatuses change
  useEffect(() => {
    if (!projectId || !paginationData) return;

    const currentPage = paginationData.meta.currentPage ?? 1;
    const limit = paginationData.meta.itemsPerPage ?? 5;
    const order = paginationData.meta.order ?? "asc";

    const params = new URLSearchParams({
      limit: limit.toString(),
      page: currentPage.toString(),
      order: order,
    });

    // Always add status parameter to distinguish between "missing" and "empty" !!!!
    params.set("status", currentStatuses.join(","));

    navigate(`/projects/${projectId}/tasks?${params.toString()}`, {
      replace: true,
    });
  }, [currentStatuses, paginationData, navigate, projectId]);

  const handleStatusChange = (selectedOptions) => {
    console.log("🫡 Selected statuses:", selectedOptions);
    setCurrentStatuses(selectedOptions);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Task Status</label>
        <MultiSelect
          options={taskStatus}
          defaultValue={currentStatuses}
          onValueChange={handleStatusChange}
          placeholder="Choose task status..."
          className="w-full"
        />
      </div>
    </div>
  );
}
