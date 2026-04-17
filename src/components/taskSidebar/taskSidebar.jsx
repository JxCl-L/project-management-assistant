import { Card } from "@/components/ui/card";
import styles from "./taskSidebar.module.css";
import { UserProfile } from "../userProfile/userProfile.jsx";
import { CreateTaskForm } from "../createTaskForm/createTaskForm.jsx";
import Cookies from "js-cookie";

export function TaskSidebar(props) {
    const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

    return (
        <section className={`fixed right-4 top-4 ${styles.sidebarHeight}`}>
            <Card className="flex flex-col h-full w-full p-6 justify-between">
                <UserProfile firstName={user?.firstName} lastName={user?.lastName} email={user?.email} />
                <CreateTaskForm />
            </Card>
            
        </section>
    )

}