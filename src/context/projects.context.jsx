import { createContext, useState } from "react";

export const ProjectsContext = createContext({
  projects: [],
  setProjects: () => {},
  currentProject: null,
  setCurrentProject: () => {},
});

export const ProjectsContextProvider = (props) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);

  return (
    <ProjectsContext.Provider
      value={{
        projects: projects,
        setProjects: setProjects,
        currentProject: currentProject,
        setCurrentProject: setCurrentProject,
      }}
    >
      {props.children}
    </ProjectsContext.Provider>
  );
};
