import React, { useEffect, useContext, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams, useSearchParams } from "react-router";

export function OrderSelect({ paginationData }) {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const defaultOrder = "asc";
  const [currentOrder, setCurrentOrder] = useState(() => {
    const orderParam = searchParams.get("order");
    // If parameter exists, use it; otherwise use default
    return orderParam || defaultOrder;
  });

  // Navigate when order or pagination changes
  useEffect(() => {
    if (!projectId || !paginationData) return;

    const currentPage = paginationData.meta.currentPage ?? 1;
    const limit = paginationData.meta.itemsPerPage ?? 5;
    const status = paginationData.meta.status ?? "todo,inProgress";

    const params = new URLSearchParams({
      limit: limit.toString(),
      page: currentPage.toString(),
      order: currentOrder,
      status: status,
    });

    navigate(`/projects/${projectId}/tasks?${params.toString()}`, {
      replace: true,
    });
  }, [currentOrder, paginationData, navigate, projectId]);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2 block">Sort</label>
      <Select value={currentOrder} onValueChange={setCurrentOrder}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={currentOrder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="asc">
              {/* <CalendarArrowUp className="h-4 w-4" /> */}
              First created
            </SelectItem>
            <SelectItem value="desc">
              {/* <CalendarArrowDown className="h-4 w-4" /> */}
              Last created
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
