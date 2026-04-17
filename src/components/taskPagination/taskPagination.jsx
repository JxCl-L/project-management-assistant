import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useParams } from "react-router";
import { useToast } from "@/hooks/use-toast.js";

export function TaskPagination({ paginationData }) {
  const { toast } = useToast();
  const { projectId } = useParams();
  const links = paginationData?.links;
  const meta = paginationData?.meta;

  const limit = meta?.itemsPerPage || 5;
  const order = meta?.order || "asc";
  const status = meta?.status || "todo,inProgress";
  const currentPage = meta?.currentPage || 1;
  const totalPages = meta?.totalPages || 1;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Handlers for previous clicks
  const handlePreviousClick = (e) => {
    if (isFirstPage) {
      e.preventDefault();
      toast.info("You're already on the first page");
      // Or use alert: alert("You're already on the first page");
    }
  };

  // Handlers for next clicks
  const handleNextClick = (e) => {
    if (isLastPage) {
      e.preventDefault();
      toast.info("You're already on the last page");
      // Or use alert: alert("You're already on the last page");
    }
  };

  // const previousPage = links?.previous? extractQueryString(links.previous).toString() : "#";
  // const nextPage = links?.next? extractQueryString(links.next).toString() : "#";
  // const order = links?.next? extractQueryString(links.next).get("order") : "asc";

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {/* <PaginationPrevious to={`/projects/${projectId}/tasks?${previousPage}`} /> */}
          <PaginationPrevious to={links?.previous || "#"} onClick={handlePreviousClick} 
          className={isFirstPage ? "disabled" : ""}/>
        </PaginationItem>

        {meta &&
          [...Array(totalPages)].map((item, index) => (
            <PaginationItem key={`page${index}`}>
              <PaginationLink
                to={`/projects/${projectId}/tasks?limit=${limit}&page=${
                  index + 1
                }&order=${order}&status=${status}`}
                isActive={index + 1 === currentPage}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

        <PaginationItem>
          {/* <PaginationNext to={`/projects/${projectId}/tasks?${nextPage}`} /> */}
          <PaginationNext to={links?.next || "#"} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
