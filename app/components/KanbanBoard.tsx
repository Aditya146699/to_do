'use client';

import { FC, useState, useEffect } from 'react';

// Task type representing a task's structure
type Task = {
  id: string; // Unique ID for each task
  content: string; // Content or description of the task
};

// Column type representing a column's structure
type Column = {
  id: string; // Unique ID for each column (To Do, Doing, Done)
  title: string; // Title of the column
  tasks: Task[]; // List of tasks in the column
};

// Initial column setup
const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [],
  },
  {
    id: 'doing',
    title: 'Doing',
    tasks: [],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [],
  },
];

const KanbanBoard: FC = () => {
  // State to store columns (including tasks) and other necessary states
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newTaskContent, setNewTaskContent] = useState<string>(''); // Input for new task
  const [isEditing, setIsEditing] = useState<boolean>(false); // Flag to check if we're editing a task
  const [editTaskId, setEditTaskId] = useState<string | null>(null); // ID of the task being edited
  const [editContent, setEditContent] = useState<string>(''); // Content of the task being edited
  const [isFullscreenViewOpen, setIsFullscreenViewOpen] = useState<boolean>(false); // Fullscreen view state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // Selected task for fullscreen view

  // Load columns data from localStorage when the component is mounted
  useEffect(() => {
    const savedColumns = localStorage.getItem('kanban-columns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  // Save the columns data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kanban-columns', JSON.stringify(columns));
  }, [columns]);

  // Handle the drag start event and store the task ID for later use
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId); // Store the task ID in the drag event
  };

  // Handle the drop event to move tasks between columns
  const onDrop = (e: React.DragEvent, columnId: string) => {
    const taskId = e.dataTransfer.getData('taskId'); // Get the dragged task ID
    const sourceColumnIndex = columns.findIndex((col) =>
      col.tasks.some((task) => task.id === taskId)
    );
    const destinationColumn = columns.find((col) => col.id === columnId);

    if (!destinationColumn) return;

    // Find the task in the source column and remove it
    const task = columns[sourceColumnIndex].tasks.find((task) => task.id === taskId);
    if (task) {
      // Update columns by removing the task from the source column and adding it to the destination column
      const updatedColumns = [...columns];
      updatedColumns[sourceColumnIndex].tasks = updatedColumns[sourceColumnIndex].tasks.filter(
        (task) => task.id !== taskId
      );
      destinationColumn.tasks.push(task); // Add the task to the new column

      setColumns(updatedColumns); // Update the state to reflect the changes
    }
  };

  // Handle adding a new task to the "To Do" column
  const handleCreateTask = () => {
    if (newTaskContent.trim()) {
      const newTask: Task = {
        id: `task-${Date.now()}`, // Create a unique ID for the new task using the current timestamp
        content: newTaskContent, // Use the input content as the task description
      };

      const updatedColumns = [...columns];
      updatedColumns[0].tasks.push(newTask); // Add the new task to the "To Do" column

      setColumns(updatedColumns); // Update the columns state
      setNewTaskContent(''); // Reset the input field after task creation
    }
  };

  // Handle input change for the new task content
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskContent(e.target.value);
  };

  // Handle deleting a task from any column
  const handleDeleteTask = (taskId: string) => {
    // Remove the task from the columns by filtering out the task by its ID
    const updatedColumns = columns.map((column) => {
      column.tasks = column.tasks.filter((task) => task.id !== taskId);
      return column;
    });
    setColumns(updatedColumns); // Update the state with the new columns list
  };

  // Handle task editing by setting the task content into the edit state
  const handleEditTask = (taskId: string, content: string) => {
    setIsEditing(true); // Switch to edit mode
    setEditTaskId(taskId); // Store the ID of the task being edited
    setEditContent(content); // Set the current task content to the edit content
  };

  // Handle saving the edited task
  const handleSaveEdit = () => {
    if (editTaskId && editContent.trim()) {
      // Update the task content in the state
      const updatedColumns = [...columns];

      updatedColumns.forEach((column) => {
        const taskIndex = column.tasks.findIndex((task) => task.id === editTaskId);
        if (taskIndex !== -1) {
          column.tasks[taskIndex].content = editContent; // Update the task content
        }
      });

      setColumns(updatedColumns); // Update the columns state
      setIsEditing(false); // Exit edit mode
      setEditTaskId(null); // Reset the task ID being edited
      setEditContent(''); // Reset the edited content
    }
  };

  // Handle canceling the editing process
  const handleCancelEdit = () => {
    setIsEditing(false); // Exit edit mode without saving
    setEditTaskId(null); // Reset the task ID being edited
    setEditContent(''); // Reset the edit content
  };

  // Open fullscreen view for a task
  const openFullscreenView = (task: Task) => {
    setSelectedTask(task);
    setIsFullscreenViewOpen(true);
  };

  // Close fullscreen view
  const closeFullscreenView = () => {
    setIsFullscreenViewOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="flex p-4">
      {/* Modal for adding new tasks */}
      <label htmlFor="my_modal_6" className="btn btn-primary absolute bottom-5 right-5">
        ➕
      </label>
      <input type="checkbox" id="my_modal_6" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={newTaskContent}
              onChange={handleInputChange} // Update input state as the user types
              placeholder="Enter new task"
              className="input input-bordered w-60 mb-4"
            />
          </div>
          <div className="modal-action w-full flex justify-center">
            <div>
              <button
                onClick={handleCreateTask} // Create new task when the button is clicked
                className="btn btn-primary mb-4 m-3"
              >
                Add Task
              </button>
            </div>
            <div className="m-3">
              <label htmlFor="my_modal_6" className="btn">
                Close!
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Render columns */}
      {columns.map((column) => (
        <div
          key={column.id}
          className="w-1/3 card bg-base-200 p-4 rounded-lg m-2"
          onDragOver={(e) => e.preventDefault()} // Allow dropping of tasks by preventing default behavior
          onDrop={(e) => onDrop(e, column.id)} // Handle task drop into the column
        >
          <h3 className="text-center font-bold text-xl mb-4">{column.title}</h3>
          <div>
            {/* Render tasks for each column */}
            {column.tasks.map((task) => (
              <div
                key={task.id}
                className="card bg-base-100 p-3 rounded-lg mb-2 shadow-md cursor-move max-h-40 overflow-hidden text-ellipsis "
                draggable
                onDragStart={(e) => onDragStart(e, task.id)} // Handle drag start event
              >
                <div className="flex justify-between items-center reletive">
                  <span>{task.content}</span> {/* Display the task content */}
                  <button
                    onClick={() => openFullscreenView(task)} // Open fullscreen view
                    className="btn btn-sm btn-primary absolute right-1"
                  >
<svg width="18" height="18" viewBox="0 0 48 48"  fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 42H43" stroke="currentColor" stroke-width="4" stroke-linecap="butt" stroke-linejoin="bevel"></path><path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="bevel"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Fullscreen view modal */}
      {isFullscreenViewOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-8 rounded-lg w-11/12 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Task Details</h2>
            {isEditing && editTaskId === selectedTask.id ? (
              // Edit mode in fullscreen view
              <div className="flex flex-col gap-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Edit task content"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={handleSaveEdit} className="btn btn-success">
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className="btn btn-error">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode in fullscreen view
              <div className="flex flex-col gap-4">
                <p className="mb-4">{selectedTask.content}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditTask(selectedTask.id, selectedTask.content)}
                    className="btn btn-warning"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteTask(selectedTask.id);
                      closeFullscreenView();
                    }}
                    className="btn btn-error"
                  >
                    Delete
                  </button>
                  <button onClick={closeFullscreenView} className="btn btn-primary">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;