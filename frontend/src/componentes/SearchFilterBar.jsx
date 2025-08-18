import React from 'react';

const SearchFilterBar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const containerStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  };

  const inputStyle = {
    flex: 1,
    minWidth: '200px',
    padding: '10px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const selectStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    fontSize: '14px',
    minWidth: '150px'
  };

  return (
    <div style={containerStyle}>
      <input
        type="text"
        placeholder="Search clients by name, business, or location..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={inputStyle}
      />
      <select
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
        style={selectStyle}
      >
        <option value="all">All Status</option>
        <option value="started">Started</option>
        <option value="active">Active</option>
        <option value="onaction">On Action</option>
        <option value="closed">Closed</option>
        <option value="dead">Dead</option>
      </select>
    </div>
  );
};

export default SearchFilterBar;