import React, { useState } from 'react';

const ClientCard = ({ client, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate days until next visit
  const daysUntilVisit = Math.ceil((new Date(client.nextVisit) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilVisit <= 3 && daysUntilVisit >= 0;
  const isOverdue = daysUntilVisit < 0;

  const cardStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#fff'
  };

  const headerStyle = {
    cursor: 'pointer',
    borderBottom: isExpanded ? '1px solid #eee' : 'none',
    paddingBottom: isExpanded ? '10px' : '0',
    marginBottom: isExpanded ? '10px' : '0'
  };

  const urgentStyle = {
    backgroundColor: isOverdue ? '#ffebee' : isUrgent ? '#fff3e0' : '#fff',
    border: isOverdue ? '2px solid #f44336' : isUrgent ? '2px solid #ff9800' : '1px solid #ddd'
  };

  const statusLabels = {
    started: 'Started',
    active: 'Active', 
    onaction: 'On Action',
    closed: 'Closed',
    dead: 'Dead'
  };

  return (
    <div style={{...cardStyle, ...urgentStyle}}>
      {/* Urgency Banner */}
      {(isUrgent || isOverdue) && (
        <div style={{
          backgroundColor: isOverdue ? '#f44336' : '#ff9800',
          color: 'white',
          padding: '5px 10px',
          margin: '-15px -15px 10px -15px',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {isOverdue ? `OVERDUE BY ${Math.abs(daysUntilVisit)} DAYS` : `URGENT - ${daysUntilVisit} DAYS LEFT`}
        </div>
      )}

      {/* Header */}
      <div 
        style={headerStyle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
              {client.businessName}
            </h3>
            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
              Manager: {client.managerName}
            </p>
            <div style={{ fontSize: '12px', color: '#888' }}>
              <span>Phone: {client.phone?.slice(-4)}</span>
              <span style={{ marginLeft: '15px' }}>
                Location: {client.place?.split(' | ')[0]?.slice(0, 20) || client.place?.slice(0, 20)}...
              </span>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              padding: '4px 8px', 
              backgroundColor: '#f5f5f5', 
              border: '1px solid #ddd',
              fontSize: '12px',
              marginBottom: '5px'
            }}>
              {statusLabels[client.status] || client.status}
            </div>
            {client.deal && (
              <div style={{ fontSize: '12px', color: '#4caf50', fontWeight: 'bold' }}>
                ${parseFloat(client.deal).toLocaleString()}
              </div>
            )}
            <div style={{ fontSize: '18px', marginTop: '5px' }}>
              {isExpanded ? '▲' : '▼'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div>
          {/* Quick Actions */}
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => window.open(`tel:${client.phone}`, '_self')}
              style={{ padding: '8px 12px', backgroundColor: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Call
            </button>
            <button 
              onClick={() => window.open(`sms:${client.phone}`, '_self')}
              style={{ padding: '8px 12px', backgroundColor: '#2196f3', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              SMS
            </button>
            <button 
              onClick={() => {
                const mapUrl = client.place?.includes(' | ') && client.place.split(' | ')[1]?.includes('maps.google.com') 
                  ? client.place.split(' | ')[1].split(' | ')[1] || client.place.split(' | ')[1]
                  : `https://maps.google.com/?q=${encodeURIComponent(client.place?.split(' | ')[0] || client.place)}`;
                window.open(mapUrl, '_blank'); 
              }}
              style={{ padding: '8px 12px', backgroundColor: '#ff9800', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Map
            </button>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
              <strong style={{ fontSize: '12px', color: '#666' }}>PHONE</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{client.phone}</p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
              <strong style={{ fontSize: '12px', color: '#666' }}>LOCATION</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                {client.place?.split(' | ')[0] || client.place}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Timeline</h4>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: '#666' }}>First Contact:</strong>
              <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                {new Date(client.firstVisit).toLocaleDateString()}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ fontSize: '12px', color: isOverdue ? '#f44336' : isUrgent ? '#ff9800' : '#666' }}>
                Next Visit:
              </strong>
              <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                {new Date(client.nextVisit).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Deal Value */}
          {client.deal && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #4caf50',
              marginBottom: '15px'
            }}>
              <strong style={{ fontSize: '12px', color: '#2e7d32' }}>DEAL VALUE</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                ${parseFloat(client.deal).toLocaleString()}
              </p>
            </div>
          )}

          {/* Notes */}
          {client.description && (
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ fontSize: '12px', color: '#666' }}>NOTES</strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', lineHeight: '1.4' }}>
                {client.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(client);
              }}
              style={{ 
                flex: 1, 
                padding: '10px', 
                backgroundColor: '#ff9800', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(client._id);
              }}
              style={{ 
                flex: 1, 
                padding: '10px', 
                backgroundColor: '#f44336', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCard;