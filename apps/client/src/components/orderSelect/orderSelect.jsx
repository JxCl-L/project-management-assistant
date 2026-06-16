import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "react-router";

export function OrderSelect() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentOrder, setCurrentOrder] = useState(() => {
    return searchParams.get("order") || "asc";
  });

  const handleOrderChange = (value) => {
    setCurrentOrder(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("order", value);
      next.set("page", "1");
      return next;
    }, { replace: true });
  };

  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Sort</label>
      <Select value={currentOrder} onValueChange={handleOrderChange}>
        <SelectTrigger className="w-36 h-10">
          <SelectValue placeholder={currentOrder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="asc">First created</SelectItem>
            <SelectItem value="desc">Last created</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
