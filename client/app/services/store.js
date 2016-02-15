'use strict';
import * as uuid from 'node-uuid';
import localStorage from 'localStorage';

export class Todo {
  completed;
  title;
  uid;

  setTitle(title) {
    this.title = title.trim();
  }

  constructor(title) {
    this.uid = uuid.v4();
    this.completed = false;
    this.title = title.trim();
  }
}

export class TodoLocalStore {
  todos = [];
  _servizio;

  constructor() {
    let persistedTodos = JSON.parse(localStorage.getItem('angular2-todos')) || [];

    this.todos = persistedTodos.map( (todo) => {
      let ret = new Todo(todo.title);
      ret.completed = todo.completed;
      ret.uid = todo.uid;
      return ret;
    });
  }

  get(state) {
    return this.todos.filter((todo) => todo.completed === state.completed);
  }

  allCompleted() {
    return this.todos.length === this.getCompleted().length;
  }

  setAllTo(completed) {
    this.todos.forEach((todo) => todo.completed = completed);
    this.persist();
  }

  removeCompleted() {
    this.todos = this.get({completed: false});
    this.persist();
  }

  getRemaining() {
    if (!this.remainingTodos) {
      this.remainingTodos = this.get({completed: false});
    }

    return this.remainingTodos;
  }

  getCompleted() {
    if (!this.completedTodos) {
      this.completedTodos = this.get({completed: true});
    }

    return this.completedTodos;
  }

  toggleCompletion(uid) {
    let todo = this._findByUid(uid);

    if (todo) {
      todo.completed = !todo.completed;
      this.persist();
    }
  }

  remove(uid) {
    let todo = this._findByUid(uid);

    if (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
      this.persist();
    }
  }

  add(title) {
    this.todos.push(new Todo(title));
    this.persist();
  }

  persist() {
    this._clearCache();
    localStorage.setItem('angular2-todos', JSON.stringify(this.todos));
  }

  _findByUid(uid) {
    return this.todos.find((todo) => todo.uid == uid);
  }

  _clearCache() {
    this.completedTodos = null;
    this.remainingTodos = null;
  }
}
