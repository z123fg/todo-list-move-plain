import {
    deleteIcon,
    editIcon,
    leftArrowIcon,
    rightArrowIcon,
} from "./assets/svgs.js";

const APIs = (() => {
    const url = "http://localhost:3000";
    const path = "todos";
    const getTodos = () => {
        return fetch(`${url}/${path}`).then((res) => res.json());
    };

    const createTodo = (newTodo) => {
        return fetch(`${url}/${path}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTodo),
        }).then((res) => res.json());
    };

    const toggleTodo = (id, newTodo) => {
        return fetch(`${url}/${path}/${id}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTodo),
        }).then((res) => res.json());
    };

    const editTodo = (id, newTodo) => {
        return fetch(`${url}/${path}/${id}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTodo),
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch(`${url}/${path}/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    return {
        getTodos,
        createTodo,
        toggleTodo,
        editTodo,
        deleteTodo,
    };
})();

const Model = (function () {
    class State {
        #todos;
        #pendingTodos;
        #completedTodos;
        #handleUpdate;
        constructor() {
            this.#todos = [];
        }
        set todos(newTodos) {
            console.log("set",newTodos)
            newTodos = newTodos.map((item, index) => ({ ...item, isEdit: false, index }));
            this.#todos = newTodos;
            this.#pendingTodos = newTodos.filter((item) => !item.isCompleted);
            this.#completedTodos = newTodos.filter((item) => item.isCompleted);
            this.#handleUpdate(this.#todos, this.#pendingTodos, this.#completedTodos);
        }
        get todos() {
            return this.#todos;
        }
        get pendingTodos() {
            return this.#pendingTodos;
        }
        get completedTodos() {
            return this.#completedTodos;
        }
        onUpdate(cb) {
            this.#handleUpdate = cb;
        }
    }

    const getTodos = APIs.getTodos;
    const createTodo = APIs.createTodo;
    const toggleTodo = APIs.toggleTodo;
    const editTodo = APIs.editTodo;
    const deleteTodo = APIs.deleteTodo;

    return {
        getTodos,
        createTodo,
        toggleTodo,
        editTodo,
        deleteTodo,
        State,
    };
})();

const View = (function () {
    const getForm = () => document.querySelector(".todo__form");
    const getFormInputValue = () => document.querySelector(".form__input").value;

    const getSubmitButton = () => document.querySelector(".form__submit-btn");
    const getPendingList = () => document.querySelector(".list--pending");
    const getCompletedList = () => document.querySelector(".list--completed");
    const getListContainer = () => document.querySelector(".list__container");

    const createTodoTemp = (todos) => {
        return todos
            .map(
                (todo) => {
                    const namePrefix = `${todo.isCompleted ? "completed" : "pending"}-${todo.index}`
                    return `
            <li>
                ${todos.isCompleted ? `<button name="${namePrefix}-move">${leftArrowIcon}</button>` : ""}
                
                ${todo.isEdit
                            ? `<input  value="${todo.content}"/>`
                            : `
                        <span>
                            ${todo.content}
                        </span>
                    `
                        }
                    ${todo.content}
                <button name="${namePrefix}-edit">
                    ${editIcon}
                </button>
                <button name="${namePrefix}-delete">
                    ${deleteIcon}
                </button>
                ${!todos.isCompleted ? `<button name="${namePrefix}-move">${rightArrowIcon}</button>` : ""
                        }
            </li>
        `}
            )
            .join("");
    };
    const render = (parent, template) => {
        parent.innerHTML = template;
    };

    return {
        getForm,
        getFormInputValue,
        getSubmitButton,
        createTodoTemp,
        render,
        getPendingList,
        getCompletedList,
        getListContainer
    };
})();

const Controller = (function Controller(model, view) {
    const state = new model.State();
    console.log(model)

    const bindOnUpdate = () => state.onUpdate(function () {
        console.log("onUpdate",this.pendingTodos,view.getPendingList())
        view.render(view.getPendingList(), view.createTodoTemp(this.pendingTodos));
        view.render(view.getCompletedList(), view.createTodoTemp(this.completedTodos));
    });

    const addTodo = () => {
        view.getForm().addEventListener("submit", function (e) {
            e.prevnetDefault();
            const newTodo = { content: view.getFormInputValue(), isCompleted: false }
            model.createTodo(newTodo).then((todos) => {
                state.todos = todos;
            });
        });
    };

    const todoActions = () => {
        view.getListContainer().addEventListener("click", function (e) {
            const [isCompleted, index, role] = e.target.name.split("-");

            if(role==="edit"){
                const temp = [...state.todos];
                temp[index].isEdit = !temp[index].isEdit;
                console.log("e",temp[index])
                state.todos = [...temp];
            }else if(role === "delete"){
                const temp = [...state.todos];
                temp.splice(index,1);
                state.todos = temp;
            }else if(role ==="move"){
                state.todos[index].isCompleted = !state.todos[index].isCompleted ;
                state.todos = [...state.todos]
            }

        })
    }

    const init = () => {
        model.getTodos().then((todos) => {
            console.log(todos)
            state.todos = todos;
        });
    };
    const bootstrap = () => {
        bindOnUpdate();
        init()
        addTodo();
        todoActions();
    };
    return { bootstrap }
})(Model, View);

Controller.bootstrap();


