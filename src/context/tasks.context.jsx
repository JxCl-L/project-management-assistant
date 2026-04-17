import { createContext, useEffect, useState } from "react";

export const TasksContext = createContext({
    tasks: undefined,
    setTasks: () => {},
});

export const TasksContextProvider = (props) => {
    const [tasks, setTasks] = useState();
    useEffect(() => {
        console.log("📦 TasksContextProvider - tasks updated:", tasks);
    }, [setTasks, tasks]);

    return (
        <TasksContext.Provider value={{ tasks: tasks, setTasks: setTasks }}>
            {props.children}
        </TasksContext.Provider>
    );
};
