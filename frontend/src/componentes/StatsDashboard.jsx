import React from 'react';

const StatsDashboard = ({ clients }) => {
  const totalValue = clients.reduce((sum, client) => sum + (parseFloat(client.deal) || 0), 0);
  
  const statusLabels = {
    started: 'Started',
    active: 'Active',
    onaction: 'On Action',
    closed: 'Closed',
    dead: 'Dead',
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '15px',
    border: '1px solid #ddd',
    textAlign: 'center'
  };

  const numberStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '5px 0'
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  };

  const progressBarStyle = {
    height: '4px',
    backgroundColor: '#eee',
    marginTop: '8px',
    overflow: 'hidden'
  };

  const progressFillStyle = {
    height: '100%',
    backgroundColor: '#2196f3'
  };

  return (
    <div style={containerStyle}>
      {/* Total Clients */}
      <div style={cardStyle}>
        <div style={labelStyle}>Total Clients</div>
        <div style={numberStyle}>{clients.length}</div>
        <div style={progressBarStyle}>
          <div style={{ ...progressFillStyle, width: '100%' }}></div>
        </div>
      </div>

      {/* Status Cards */}
      {Object.entries(statusLabels).map(([status, label]) => {
        const count = clients.filter(client => client.status === status).length;
        const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
        
        return (
          <div key={status} style={cardStyle}>
            <div style={labelStyle}>{label}</div>
            <div style={numberStyle}>{count}</div>
            <div style={progressBarStyle}>
              <div style={{ ...progressFillStyle, width: `${percentage}%` }}></div>
            </div>
            <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
              {percentage.toFixed(1)}%
            </div>
          </div>
        );
      })}

      {/* Total Deal Value */}
      {totalValue > 0 && (
        <div style={cardStyle}>
          <div style={labelStyle}>Total Value</div>
          <div style={numberStyle}>${totalValue.toLocaleString()}</div>
          <div style={progressBarStyle}>
            <div style={{ ...progressFillStyle, width: '100%', backgroundColor: '#4caf50' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;