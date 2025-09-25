class Storage {
    static getProjects() {
        const projects = localStorage.getItem('projects');
        return projects ? JSON.parse(projects) : [];
    }

    static saveProjects(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    static addProject(project) {
        const projects = this.getProjects();
        projects.push(project);
        this.saveProjects(projects);
    }

    static updateProject(updatedProject) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
            projects[index] = updatedProject;
            this.saveProjects(projects);
        }
    }

    static removeProject(projectId) {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(p => p.id !== projectId);
        this.saveProjects(filteredProjects);
    }
}

export default Storage;