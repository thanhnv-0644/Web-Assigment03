import React from 'react';
import '../styles/UserTable.css';

const UserTable = ({ users, onEdit, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
        </table>
        <div className="no-data">No users found</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => onEdit(user)}
                  aria-label="Edit user"
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(user.id)}
                  aria-label="Delete user"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

