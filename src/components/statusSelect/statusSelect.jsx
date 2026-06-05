import { useState } from "react";
import { useSearchParams } from "react-router";
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

export function StatusSelect() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentStatuses, setCurrentStatuses] = useState(() => {
    const statusParam = searchParams.get("status");
    if (statusParam !== null) {
      return statusParam === "" ? [] : statusParam.split(",").map((s) => s.trim());
    }
    return ["todo", "inProgress"];
  });

  const handleStatusChange = (selectedOptions) => {
    setCurrentStatuses(selectedOptions);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("status", selectedOptions.join(","));
      next.set("page", "1");
      return next;
    }, { replace: true });
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2 block">Task Status</label>
      <MultiSelect
        options={taskStatus}
        defaultValue={currentStatuses}
        onValueChange={handleStatusChange}
        placeholder="Choose task status..."
        className="w-full h-10"
      />
    </div>
  );
}
