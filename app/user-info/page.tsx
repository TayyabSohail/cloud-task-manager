"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPaperclip,
  FiX,
  FiImage,
  FiFile,
  FiFileText,
  FiFilm,
  FiMusic,
  FiPackage,
} from "react-icons/fi";

interface Todo {
  id: number;
  text: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
}

const userId = 1; // Replace with the actual logged-in user's ID
const API_BASE_URL = "http://localhost:5000";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFilePreview, setEditFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch todos from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/todos/${userId}`)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("Error fetching todos:", err));
  }, []);

  // Get the icon for file type
  const getFileIcon = (fileType: string | undefined) => {
    switch (fileType) {
      case "image":
        return <FiImage className="text-lg" />;
      case "document":
        return <FiFileText className="text-lg" />;
      case "video":
        return <FiFilm className="text-lg" />;
      case "audio":
        return <FiMusic className="text-lg" />;
      case "archive":
        return <FiPackage className="text-lg" />;
      default:
        return <FiFile className="text-lg" />;
    }
  };

  // Check if file is an image for preview
  const isImage = (fileName: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return imageExtensions.includes(extension);
  };

  // Handle file selection for new todo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL only for images
      if (isImage(file.name)) {
        const previewUrl = URL.createObjectURL(file);
        setFilePreview(previewUrl);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Handle file selection for edit
  const handleEditFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFile(file);

      // Create preview URL only for images
      if (isImage(file.name)) {
        const previewUrl = URL.createObjectURL(file);
        setEditFilePreview(previewUrl);
      } else {
        setEditFilePreview(null);
      }
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  // Remove edit file
  const removeEditFile = () => {
    setEditFile(null);
    if (editFilePreview) {
      URL.revokeObjectURL(editFilePreview);
      setEditFilePreview(null);
    }
  };

  // Create todo with optional file
  const createTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setIsLoading(true);

    try {
      let response;

      // If there's a file, use FormData to send multipart data
      if (selectedFile) {
        const formData = new FormData();
        formData.append("user_id", userId.toString());
        formData.append("text", newTodo);
        formData.append("file", selectedFile);

        console.log("Uploading with file:", selectedFile.name);

        response = await fetch(`${API_BASE_URL}/todos`, {
          method: "POST",
          body: formData,
        });
      } else {
        // Otherwise use JSON
        console.log("Creating todo without file");

        response = await fetch(`${API_BASE_URL}/todos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, text: newTodo }),
        });
      }

      if (response.ok) {
        console.log("Todo created successfully");
        const updatedTodos = await fetch(
          `${API_BASE_URL}/todos/${userId}`
        ).then((res) => res.json());
        console.log("Updated todos:", updatedTodos);
        setTodos(updatedTodos);
        setNewTodo("");
        setSelectedFile(null);
        if (filePreview) {
          URL.revokeObjectURL(filePreview);
          setFilePreview(null);
        }
      } else {
        console.error("Failed to create todo:", await response.text());
        alert("Failed to create todo. See console for details.");
      }
    } catch (error) {
      console.error("Error creating todo:", error);
      // Fix: Properly handle the unknown error type
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      alert("Error creating todo: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update todo
  const updateTodo = async (id: number) => {
    setIsLoading(true);

    try {
      let response;

      // If there's a file to update, use FormData
      if (editFile) {
        const formData = new FormData();
        formData.append("text", editText);
        formData.append("file", editFile);

        console.log("Updating todo with file:", editFile.name);

        response = await fetch(`${API_BASE_URL}/todos/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Otherwise use JSON
        console.log("Updating todo without changing file");

        response = await fetch(`${API_BASE_URL}/todos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editText }),
        });
      }

      if (response.ok) {
        console.log("Todo updated successfully");
        // Fetch updated todos to get the new file URL if a file was uploaded
        const updatedTodos = await fetch(
          `${API_BASE_URL}/todos/${userId}`
        ).then((res) => res.json());
        console.log("Updated todos after edit:", updatedTodos);
        setTodos(updatedTodos);
      } else {
        console.error("Failed to update todo:", await response.text());
        alert("Failed to update todo. See console for details.");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      // Fix: Properly handle the unknown error type
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      alert("Error updating todo: " + errorMessage);
    } finally {
      setIsLoading(false);
      setEditingId(null);
      setEditText("");
      setEditFile(null);
      if (editFilePreview) {
        URL.revokeObjectURL(editFilePreview);
        setEditFilePreview(null);
      }
    }
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    setIsLoading(true);

    try {
      await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
      });

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a todo
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    // Keep track of existing file but don't set editFile (which would be a File object)
    setEditFilePreview(todo.file_url || null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
    setEditFile(null);
    if (editFilePreview) {
      URL.revokeObjectURL(editFilePreview);
      setEditFilePreview(null);
    }
  };

  // Format bytes to human-readable size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center text-amber-500 mb-8">
        Todo List - Cloud Project
      </h1>

      {/* Add new todo form */}
      <form
        onSubmit={createTodo}
        className="mb-6 flex flex-col gap-4 items-center"
      >
        <div className="flex gap-4 w-full justify-center">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
            className="p-3 border rounded-lg w-2/3 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-600 transition duration-300 ease-in-out disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </button>
        </div>

        {/* File upload section */}
        <div className="flex items-center gap-4 w-2/3">
          <div className="flex gap-2">
            {/* Image upload button */}
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center gap-2">
              <FiImage className="text-lg" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
            </label>

            {/* File upload button */}
            <label className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out flex items-center gap-2">
              <FiPaperclip className="text-lg" />
              <span>Attach File</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                {isImage(selectedFile.name) && filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-600">
                    {getFileIcon(selectedFile.type.split("/")[0])}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={isLoading}
              >
                <FiX className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Todo list */}
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
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => updateTodo(todo.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>

                {/* Edit file section */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-2">
                    {/* Image upload button for edit */}
                    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center gap-2">
                      <FiImage className="text-lg" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>

                    {/* File upload button for edit */}
                    <label className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out flex items-center gap-2">
                      <FiPaperclip className="text-lg" />
                      <span>Attach File</span>
                      <input
                        type="file"
                        onChange={handleEditFileChange}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>

                  {/* Show file information */}
                  {(editFile || (todo.file_url && !editFile)) && (
                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg text-gray-800">
                      {/* If there's a new file being uploaded */}
                      {editFile ? (
                        <>
                          <div className="flex items-center gap-2">
                            {isImage(editFile.name) && editFilePreview ? (
                              <img
                                src={editFilePreview}
                                alt="Preview"
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-600">
                                {getFileIcon(editFile.type.split("/")[0])}
                              </span>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-xs">
                                {editFile.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(editFile.size)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeEditFile}
                            className="ml-2 text-red-500 hover:text-red-700"
                            disabled={isLoading}
                          >
                            <FiX className="text-lg" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Existing file */}
                          <div className="flex items-center gap-2">
                            {todo.file_type === "image" && todo.file_url ? (
                              <img
                                src={todo.file_url}
                                alt="Preview"
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-600">
                                {getFileIcon(todo.file_type)}
                              </span>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-xs">
                                {todo.file_name || "Attached file"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeEditFile}
                            className="ml-2 text-red-500 hover:text-red-700"
                            disabled={isLoading}
                          >
                            <FiX className="text-lg" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    onClick={cancelEditing}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 ease-in-out disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <span className="text-xl font-semibold text-center mb-4">
                  {todo.text}
                </span>

                {/* Display todo file if available */}
                {todo.file_url && (
                  <div className="mb-4 bg-white bg-opacity-20 p-4 rounded-lg">
                    {todo.file_type === "image" ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={todo.file_url}
                          alt={todo.text}
                          className="max-h-48 rounded-lg object-contain mb-2"
                        />
                        <a
                          href={todo.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline hover:text-blue-100"
                        >
                          View Full Image
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        {getFileIcon(todo.file_type)}
                        <a
                          href={todo.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline hover:text-blue-100"
                        >
                          {todo.file_name || "Download Attachment"}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 justify-center mt-4">
                  <button
                    onClick={() => startEditing(todo)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                    disabled={isLoading}
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300"
                    disabled={isLoading}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Display when there are no todos */}
      {todos.length === 0 && !isLoading && (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-lg">
            No tasks yet. Add your first todo!
          </p>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && todos.length === 0 && (
        <div className="text-center p-8">
          <p className="text-gray-600 text-lg">Loading todos...</p>
        </div>
      )}
    </div>
  );
}
