"use client";

import { useState, FormEvent } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi"; // Using icons for Edit and Delete

interface Todo {
  id: number;
  text: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Sample Task 1" },
    { id: 2, text: "Sample Task 2" },
  ]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  const createTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const newItem = {
      id: Date.now(),
      text: newTodo,
    };
    setTodos([...todos, newItem]); // Adding new item at the end of the list
    setNewTodo("");
  };

  const updateTodo = (id: number) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, text: editText } : todo))
    );
    setEditingId(null);
    setEditText("");
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Todo List
      </h1>

      {/* Form for adding a new Todo */}
      <form onSubmit={createTodo} className="mb-6 flex gap-4 justify-center">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task"
          className="p-3 border rounded-lg w-2/3 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-600 transition duration-300 ease-in-out"
        >
          Add
        </button>
      </form>

      {/* List of Todos */}
      <ul className="space-y-6">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex flex-col p-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-lg transition duration-300 ease-out hover:scale-105"
          >
            {editingId === todo.id ? (
              <div className="w-full">
                {/* Input and buttons aligned correctly */}
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 p-2 rounded-lg focus:outline-none border-2 border-indigo-400 text-gray-800"
                  />
                  <button
                    onClick={() => updateTodo(todo.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
                  >
                    Save
                  </button>
                </div>
                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <span className="text-xl font-semibold text-center">
                  {todo.text}
                </span>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditText(todo.text);
                    }}
                    className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-300 ease-in-out"
                  >
                    <FiEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
