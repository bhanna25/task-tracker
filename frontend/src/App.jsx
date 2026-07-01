import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, CheckSquare, Square, Calendar, Filter, ArrowUpDown, Bell } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [editingId, setEditingId] = useState(null);

  // --- BONUS STATE VARIABLES ---
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Use environment variables for flexibility during public deployment
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/tasks';

  // Helper for flash notifications (Bonus Feature)
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (response.ok) setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showNotification('Failed to connect to backend server', 'error');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Advanced Form Validation (Mandatory Feature)
    if (!title.trim() || title.trim().length < 3) {
      showNotification('Validation Error: Title must be at least 3 characters long', 'error');
      return;
    }

    const taskData = { title, description, status };

    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/update/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          setEditingId(null);
          fetchTasks();
          resetForm();
          showNotification('Task updated successfully!');
        }
      } else {
        const response = await fetch(`${API_URL}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          fetchTasks();
          resetForm();
          showNotification('New task created successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Pending');
  };

  const handleEditClick = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchTasks();
          showNotification('Task deleted permanently.', 'error');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const toggleComplete = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await fetch(`${API_URL}/update/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: nextStatus }),
      });
      fetchTasks();
      showNotification(`Task marked as ${nextStatus}`);
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // --- BONUS COMPUTED LOGIC: FILTERING & SORTING ---
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'All') return true;
    return task.status === filterStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="app-container">
      {/* Dynamic Flash Notifications Banner */}
      {notification.message && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', 
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', padding: '1rem 1.5rem', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', 
          alignItems: 'center', gap: '10px', zIndex: 1000, fontWeight: '600'
        }}>
          <Bell size={18} /> {notification.message}
        </div>
      )}

      <header>
        <h1>Task Tracker</h1>
        <p>Full-Stack MERN Engineering Project Dashboard</p>
      </header>

      <form className="task-form" onSubmit={handleSubmit}>
        <h3>{editingId ? '📝 Edit Task Details' : '➕ Create New Task'}</h3>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Task Title *</label>
          <input 
            type="text" 
            placeholder="e.g., Revise Dynamic Programming" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            placeholder="Add specific criteria or code challenges..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save Changes' : 'Add Task'}
          </button>
          {editingId && (
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => { setEditingId(null); resetForm(); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* --- FILTER & SORT CONTROL BAR --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select style={{ width: 'auto', padding: '0.4rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
          <select style={{ width: 'auto', padding: '0.4rem' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Title (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="task-list">
        <h3>Your Current Tasks ({sortedTasks.length})</h3>
        
        {sortedTasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>
            No tasks match your selection criteria.
          </p>
        ) : (
          sortedTasks.map((task) => (
            <div className="task-card" key={task._id}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <button 
                  onClick={() => toggleComplete(task)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem', color: task.status === 'Completed' ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {task.status === 'Completed' ? <CheckSquare size={22} /> : <Square size={22} />}
                </button>
                <div>
                  <h4 style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? 'var(--text-muted)' : 'inherit' }}>
                    {task.title}
                  </h4>
                  {task.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{task.description}</p>}
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${task.status.replace(' ', '-')}`}>{task.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="task-actions">
                <button className="action-btn edit" onClick={() => handleEditClick(task)}><Edit2 size={18} /></button>
                <button className="action-btn delete" onClick={() => handleDelete(task._id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;