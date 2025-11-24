import React, { useState, useEffect, useCallback } from 'react';
import { userService } from './services/api';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import Pagination from './components/Pagination';
import Loading from './components/Loading';
import Toast from './components/Toast';
import './styles/App.css';

const PAGE_SIZE = 5;

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      showToast('Failed to fetch users: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter users by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, users]);

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Close toast
  const closeToast = () => {
    setToast(null);
  };

  // Open modal for creating new user
  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Save user (create or update)
  const handleSave = async (userData) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        await userService.updateUser(editingUser.id, userData);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser.id ? { ...user, ...userData } : user
          )
        );
        showToast('User updated successfully!', 'success');
      } else {
        // Create new user
        const response = await userService.createUser(userData);
        // Generate unique ID for local tracking
        const newId =
          users.length > 0
            ? Math.max(...users.map((u) => u.id)) + 1
            : Date.now();
        const newUser = { ...response, id: newId };
        setUsers((prevUsers) => [...prevUsers, newUser]);
        showToast('User created successfully!', 'success');
      }
      handleCloseModal();
    } catch (error) {
      showToast('Failed to save user: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setIsLoading(true);
    try {
      await userService.deleteUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      showToast('User deleted successfully!', 'success');

      // Adjust current page if needed
      const filtered = filteredUsers.filter((user) => user.id !== id);
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      showToast('Failed to delete user: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="app">
      {isLoading && <Loading />}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      <div className="container">
        <header className="app-header">
          <h1>User Management System</h1>
          <p className="subtitle">CRUD Application with React and Axios</p>
        </header>

        <div className="toolbar">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-create" onClick={handleCreate}>
            + Create New User
          </button>
        </div>

        <UserTable
          users={currentUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {filteredUsers.length > 0 && (
          <div className="user-count">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} of{' '}
            {filteredUsers.length} users
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}

export default App;

