import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { Storage } from './index';

class UI {
        static init() {
        if (Storage.getProjects().length === 0) {
            // Add default project
            const defaultProject = {
                id: 'all',
                name: 'All Tasks',
                todos: []
            };
    
            // Add example project with tasks
            const exampleProject = {
                id: 'example-project',
                name: '📋 Getting Started',
                todos: [
                    {
                        id: 'welcome-task',
                        title: '👋 Welcome to Prio-List!',
                        description: 'This is an example task to help you get started. Try checking it off, editing it, or deleting it!',
                        dueDate: new Date().toISOString().split('T')[0],
                        priority: 'high',
                        completed: false,
                        projectId: 'example-project'
                    },
                    {
                        id: 'features-task',
                        title: '✨ Try These Features',
                        description: '1. Create a new project\n2. Add tasks with different priorities\n3. Check completed tasks\n4. View tasks by date\n5. Delete or edit tasks',
                        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                        priority: 'medium',
                        completed: false,
                        projectId: 'example-project'
                    }
                ]
            };
    
            Storage.addProject(defaultProject);
            Storage.addProject(exampleProject);
        }
        this.loadHomePage();
        this.setupEventListeners();
        console.log('UI initialized');
    }

    static loadHomePage() {
        this.loadTodos('all');
        this.loadProjects();
        this.updateTaskCounts();
        const allTasksBtn = document.querySelector('[data-project="all"]');
        if (allTasksBtn) {
            allTasksBtn.classList.add('active');
        }
    }

    static loadProjects() {
        const projectsList = document.getElementById('projects-list');
        const projects = Storage.getProjects();

        if (projectsList) {
            projectsList.innerHTML = projects
                .filter(project => project.id !== 'all')
                .map(project => `
                    <div class="project-item">
                        <button class="sidebar-btn" data-project-id="${project.id}">
                            <i class="fas fa-folder-open"></i>
                            <span>${project.name}</span>
                        </button>
                        <button class="delete-project" data-project-id="${project.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            this.updateTaskCounts();
        }
    }

    static updateTaskCounts() {
        const projects = Storage.getProjects();
        const allTasks = projects.flatMap(project => project.todos);
        
        // Update All Tasks count
        const allCount = document.querySelector('[data-project="all"] .task-count');
        if (allCount) allCount.textContent = allTasks.length;

        // Update Today count
        const todayCount = document.querySelector('[data-project="today"] .task-count');
        if (todayCount) {
            const todayTasks = allTasks.filter(todo => isToday(parseISO(todo.dueDate)));
            todayCount.textContent = todayTasks.length;
        }

        // Update Week count
        const weekCount = document.querySelector('[data-project="week"] .task-count');
        if (weekCount) {
            const weekTasks = allTasks.filter(todo => isThisWeek(parseISO(todo.dueDate)));
            weekCount.textContent = weekTasks.length;
        }

        // Update Completed count
        const completedCount = document.querySelector('[data-project="completed"] .task-count');
        if (completedCount) {
            const completedTasks = allTasks.filter(todo => todo.completed);
            completedCount.textContent = completedTasks.length;
        }

        // Update individual project counts
        projects.forEach(project => {
            if (project.id !== 'all') {
                const projectCount = document.querySelector(`[data-project-id="${project.id}"] .task-count`);
                if (projectCount) {
                    const projectTasks = project.todos.length;
                    projectCount.textContent = projectTasks;
                }
            }
        });
    }
    
    static loadTodos(filter = 'all') {
        console.log('Loading todos for filter:', filter);
        const todosList = document.getElementById('todos-list');
        const projects = Storage.getProjects();
        let todos = [];

        switch(filter) {
            case 'all':
                todos = projects.flatMap(project => 
                    project.todos.map(todo => ({...todo, projectName: project.name}))
                );
                break;
            case 'today':
                todos = projects.flatMap(project => 
                    project.todos.filter(todo => isToday(parseISO(todo.dueDate)))
                        .map(todo => ({...todo, projectName: project.name}))
                );
                break;
            case 'week':
                todos = projects.flatMap(project => 
                    project.todos.filter(todo => isThisWeek(parseISO(todo.dueDate)))
                        .map(todo => ({...todo, projectName: project.name}))
                );
                break;
            case 'completed':
                todos = projects.flatMap(project => 
                    project.todos.filter(todo => todo.completed === true)
                        .map(todo => ({...todo, projectName: project.name}))
                );
                break;
            default:
                const project = projects.find(p => p.id === filter);
                if (project) {
                    todos = project.todos.map(todo => ({...todo, projectName: project.name}));
                }
        }

        if (todosList) {
            todosList.innerHTML = todos.map(todo => `
                <div class="todo-item" data-id="${todo.id}">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <div class="priority-circle ${todo.priority}"></div>
                    <div class="todo-info">
                        <h3>${todo.title}</h3>
                        <p>${format(parseISO(todo.dueDate), 'MMM dd, yyyy')} - ${todo.projectName}</p>
                        <p class="description">${todo.description}</p>
                    </div>
                    <div class="todo-actions">
                        <button class="edit-todo" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-todo" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        this.updateTaskCounts();
    }

    static setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            const projectBtn = e.target.closest('.sidebar-btn');
            if (projectBtn && !e.target.closest('.delete-project')) {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                projectBtn.classList.add('active');
                this.loadTodos(projectBtn.dataset.projectId || projectBtn.dataset.project);
            }
        });

        // Add Task button
        const addTaskBtn = document.getElementById('add-todo');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.showTaskModal();
            });
        }

        // Add Project button
        const addProjectBtn = document.getElementById('add-project');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.showProjectModal();
            });
        }

        // Form submissions
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const formData = {
                    title: taskForm.querySelector('#task-title').value,
                    description: taskForm.querySelector('#task-description').value,
                    dueDate: taskForm.querySelector('#task-date').value,
                    priority: taskForm.querySelector('#task-priority').value,
                    projectId: taskForm.querySelector('#task-project').value
                };
                this.handleTaskSubmit(formData);
            });
        }

        // Project form submission
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const projectName = projectForm.querySelector('#project-name').value;
                if (projectName.trim()) {
                    const newProject = {
                        id: crypto.randomUUID(),
                        name: projectName.trim(),
                        todos: []
                    };
                    Storage.addProject(newProject);
                    this.loadProjects();
                    projectForm.reset();
                    document.getElementById('project-modal').style.display = 'none';
                }
            });
        }

        // Todo item actions
        document.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            const todoId = todoItem.dataset.id;
            
            if (e.target.type === 'checkbox') {
                this.toggleTodoComplete(todoId, e.target.checked);
            }
            if (e.target.closest('.edit-todo')) {
                this.editTodo(todoId);
            }
            if (e.target.closest('.delete-todo')) {
                this.deleteTodo(todoId);
            }
        });

        // Modal controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
                const modal = e.target.closest('.modal') || e.target;
                modal.style.display = 'none';
            }
        });

        // Project deletion
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-project');
            if (deleteBtn) {
                const projectId = deleteBtn.dataset.projectId;
                this.deleteProject(projectId);
            }
        });
    }

    static showTaskModal(todo = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const modalTitle = modal.querySelector('h3');
        const submitButton = form.querySelector('.submit-btn');
        const projectSelect = form.querySelector('#task-project');
        
        modalTitle.textContent = todo ? 'Edit Task' : 'Add Task';
        submitButton.textContent = todo ? 'Save Changes' : 'Add Task';
        
        // Get only custom projects
        const projects = Storage.getProjects()
            .filter(project => project.id !== 'all' && 
                !['today', 'week', 'completed'].includes(project.id));

        // Update project select options
        projectSelect.innerHTML = projects.map(project => `
            <option value="${project.id}">${project.name}</option>
        `).join('');

        if (!todo) {
            form.reset();
            delete form.dataset.todoId;
        } else {
            form.querySelector('#task-title').value = todo.title;
            form.querySelector('#task-description').value = todo.description;
            form.querySelector('#task-date').value = todo.dueDate;
            form.querySelector('#task-priority').value = todo.priority;
            if (todo.projectId) {
                projectSelect.value = todo.projectId;
            }
            form.dataset.todoId = todo.id;
        }

        modal.style.display = 'flex';
    }

    static handleTaskSubmit(formData) {
        const form = document.getElementById('task-form');
        const todoId = form.dataset.todoId;
        
        const todo = {
            id: todoId || crypto.randomUUID(),
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            priority: formData.priority,
            completed: todoId ? this.getTodoById(todoId)?.completed || false : false,
            projectId: formData.projectId
        };

        const projects = Storage.getProjects();
        
        if (todoId) {
            // Editing existing todo
            for (const project of projects) {
                const index = project.todos.findIndex(t => t.id === todoId);
                if (index !== -1) {
                    project.todos.splice(index, 1);
                    Storage.updateProject(project);
                    break;
                }
            }
        }

        const targetProject = projects.find(p => p.id === formData.projectId);
        if (targetProject) {
            targetProject.todos.push(todo);
            Storage.updateProject(targetProject);
            this.loadTodos(document.querySelector('.sidebar-btn.active').dataset.project || 'all');
        }

        form.reset();
        delete form.dataset.todoId;
        document.getElementById('task-modal').style.display = 'none';
        this.updateTaskCounts();
    }

    // Add this helper method
    static getTodoById(todoId) {
        const projects = Storage.getProjects();
        for (const project of projects) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) return todo;
        }
        return null;
    }

    static showProjectModal() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    static toggleTodoComplete(todoId, isComplete) {
        const projects = Storage.getProjects();
        for (const project of projects) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) {
                todo.completed = isComplete;
                Storage.updateProject(project);
                const currentView = document.querySelector('.sidebar-btn.active').dataset.project;
                this.loadTodos(currentView);
                this.updateTaskCounts();
                break;
            }
        }
    }

    static deleteTodo(todoId) {
        const deleteModal = document.getElementById('delete-task-modal');
        deleteModal.style.display = 'flex';

        const handleDelete = () => {
            const projects = Storage.getProjects();
            for (const project of projects) {
                const index = project.todos.findIndex(t => t.id === todoId);
                if (index !== -1) {
                    project.todos.splice(index, 1);
                    Storage.updateProject(project);
                    const currentView = document.querySelector('.sidebar-btn.active').dataset.project;
                    this.loadTodos(currentView);
                    this.updateTaskCounts();
                    break;
                }
            }
            deleteModal.style.display = 'none';
        };

        const handleCancel = () => {
            deleteModal.style.display = 'none';
        };

        const deleteBtn = deleteModal.querySelector('.delete-btn');
        const cancelBtn = deleteModal.querySelector('.cancel-btn');

        deleteBtn.replaceWith(deleteBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));

        deleteModal.querySelector('.delete-btn').addEventListener('click', handleDelete);
        deleteModal.querySelector('.cancel-btn').addEventListener('click', handleCancel);
    }

    static deleteProject(projectId) {
        const deleteModal = document.getElementById('delete-project-modal');
        deleteModal.style.display = 'flex';

        const handleDelete = () => {
            Storage.removeProject(projectId);
            this.loadProjects();
            
            const allTasksBtn = document.querySelector('[data-project="all"]');
            if (allTasksBtn) {
                allTasksBtn.classList.add('active');
                this.loadTodos('all');
            }
            this.updateTaskCounts();
            deleteModal.style.display = 'none';
        };

        const handleCancel = () => {
            deleteModal.style.display = 'none';
        };

        const deleteBtn = deleteModal.querySelector('.delete-btn');
        const cancelBtn = deleteModal.querySelector('.cancel-btn');

        deleteBtn.replaceWith(deleteBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));

        deleteModal.querySelector('.delete-btn').addEventListener('click', handleDelete);
        deleteModal.querySelector('.cancel-btn').addEventListener('click', handleCancel);
    }

    static editTodo(todoId) {
        const projects = Storage.getProjects();
        for (const project of projects) {
            const todo = project.todos.find(t => t.id === todoId);
            if (todo) {
                this.showTaskModal(todo);
                break;
            }
        }
    }
}

export default UI;