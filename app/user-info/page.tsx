"use client";

import { useEffect, useState, FormEvent } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface Todo {
  id: number;
  text: string;
}

const userId = 1; // Replace with the actual logged-in user's ID

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Fetch todos from backend
  useEffect(() => {
    fetch(`http://localhost:5000/todos/${userId}`)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("Error fetching todos:", err));
  }, []);

  // Create todo
  const createTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const res = await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, text: newTodo }),
    });

    if (res.ok) {
      const updatedTodos = await fetch(
        `http://localhost:5000/todos/${userId}`
      ).then((res) => res.json());
      setTodos(updatedTodos);
      setNewTodo("");
    }
  };

  // Update todo
  const updateTodo = async (id: number) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    });

    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, text: editText } : todo
    );
    setTodos(updatedTodos);
    setEditingId(null);
    setEditText("");
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
    });

    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Todo List
      </h1>

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

      <ul className="space-y-6">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex flex-col p-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg shadow-lg transition duration-300 ease-out hover:scale-105"
          >
            {editingId === todo.id ? (
              <div className="w-full">
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
