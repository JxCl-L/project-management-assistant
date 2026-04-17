import { OrderSelect } from "../orderSelect/orderSelect.jsx";
import { TaskPagination } from "../taskPagination/taskPagination.jsx";
import { StatusSelect } from "../statusSelect/statusSelect.jsx";


export function FilterBar ({ paginationData }) {
    return (
        <>
            <nav className="flex flex-row flex-wrap items-end justify-between gap-4 mb-8 w-full min-w-96">
                {/* <TaskPagination paginationData={paginationData} /> */}
                <StatusSelect paginationData={paginationData} />
                <OrderSelect paginationData={paginationData} />
            </nav>
        </>
    );
}