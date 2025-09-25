class Project {
    constructor(name, isDefault = false) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.todos = [];
        this.isDefault = isDefault;
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    }

    getTodo(todoId) {
        return this.todos.find(todo => todo.id === todoId);
    }

    static updateProject(project) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index] = project;
            this.saveProjects(projects);
        }
    }
}

export default Project;