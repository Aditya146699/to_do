'use client';
import { FC, useState, useEffect } from 'react';

type Task = {
  id: string;
  content: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'doing', title: 'Doing', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

const KanbanBoard: FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newTaskContent, setNewTaskContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isFullscreenViewOpen, setIsFullscreenViewOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('kanban-columns');
      if (savedColumns) {
        setColumns(JSON.parse(savedColumns));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kanban-columns', JSON.stringify(columns));
    }
  }, [columns]);

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e: React.DragEvent, columnId: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnIndex = columns.findIndex((col) => col.tasks.some((task) => task.id === taskId));
    const destinationColumn = columns.find((col) => col.id === columnId);

    if (!destinationColumn) return;

    const task = columns[sourceColumnIndex].tasks.find((task) => task.id === taskId);
    if (task) {
      const updatedColumns = [...columns];
      updatedColumns[sourceColumnIndex].tasks = updatedColumns[sourceColumnIndex].tasks.filter((task) => task.id !== taskId);
      destinationColumn.tasks.push(task);
      setColumns(updatedColumns);
    }
  };

  const handleCreateTask = () => {
    if (newTaskContent.trim()) {
      const newTask: Task = { id: `task-${Date.now()}`, content: newTaskContent };
      const updatedColumns = [...columns];
      updatedColumns[0].tasks.push(newTask);
      setColumns(updatedColumns);
      setNewTaskContent('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskContent(e.target.value);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedColumns = columns.map((column) => {
      column.tasks = column.tasks.filter((task) => task.id !== taskId);
      return column;
    });
    setColumns(updatedColumns);
  };

  const handleEditTask = (taskId: string, content: string) => {
    setIsEditing(true);
    setEditTaskId(taskId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editTaskId && editContent.trim()) {
      const updatedColumns = [...columns];
      updatedColumns.forEach((column) => {
        const taskIndex = column.tasks.findIndex((task) => task.id === editTaskId);
        if (taskIndex !== -1) {
          column.tasks[taskIndex].content = editContent;
        }
      });
      setColumns(updatedColumns);
      setIsEditing(false);
      setEditTaskId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTaskId(null);
    setEditContent('');
  };

  const openFullscreenView = (task: Task) => {
    setSelectedTask(task);
    setIsFullscreenViewOpen(true);
  };

  const closeFullscreenView = () => {
    setIsFullscreenViewOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="flex p-4 max-[600px]:flex-col">
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
              onChange={handleInputChange}
              placeholder="Enter new task"
              className="input input-bordered w-60 mb-4"
            />
          </div>
          <div className="modal-action w-full flex justify-center">
            <div>
              <button onClick={handleCreateTask} className="btn btn-primary mb-4 m-3">
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
          className="w-1/3 card bg-base-200 p-4 rounded-lg m-2 max-[600px]:w-full max-[600px]:mx-0"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, column.id)}
        >
          <h3 className="text-center font-bold text-xl mb-4">{column.title}</h3>
          <div>
            {column.tasks.map((task) => (
              <div
                key={task.id}
                className="card bg-base-100 p-3 rounded-lg mb-2 shadow-md cursor-move max-h-40 overflow-hidden text-ellipsis"
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
              >
                <div className="flex justify-between items-center relative">
                  <span>{task.content}</span>
                  <button
                    onClick={() => openFullscreenView(task)}
                    className="btn btn-sm btn-primary absolute right-1"
                    aria-label="Open task details"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 42H43" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="bevel" />
                      <path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="bevel" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Fullscreen view modal */}
      {isFullscreenViewOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-base-100 p-8 rounded-lg w-11/12 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Task Details</h2>
            {isEditing && editTaskId === selectedTask.id ? (
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
              <div className="flex flex-col gap-4">
                <p className="mb-4">{selectedTask.content}</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleEditTask(selectedTask.id, selectedTask.content)} className="btn btn-warning">
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
