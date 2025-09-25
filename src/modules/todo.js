import { format, isToday, isThisWeek, parseISO } from 'date-fns';

class Todo {
    constructor(title, description, dueDate, priority) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false;
        this.important = false;
        this.createdAt = new Date().toISOString();
    }

    isTaskDueToday() {
        return isToday(parseISO(this.dueDate));
    }

    isTaskDueThisWeek() {
        return isThisWeek(parseISO(this.dueDate));
    }

    getFormattedDate() {
        return format(parseISO(this.dueDate), 'MMM dd, yyyy');
    }
}

export default Todo;