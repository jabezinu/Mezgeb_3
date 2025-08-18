import React, { useState, useEffect } from 'react';

const LocationInput = ({ value, onChange, name, placeholder = "Enter location", required = false }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isGeolocationSupported, setIsGeolocationSupported] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [preciseLocation, setPreciseLocation] = useState('');

  useEffect(() => {
    setIsGeolocationSupported('geolocation' in navigator);
    
    // Parse existing value if it contains both parts
    if (value && typeof value === 'string') {
      const parts = value.split(' | ');
      if (parts.length === 2) {
        setAreaName(parts[0]);
        setPreciseLocation(parts[1]);
      } else {
        setAreaName(value);
        setPreciseLocation('');
      }
    }
  }, [value]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try multiple geocoding services for better reliability
          let areaAddress = null;
          let detailedAddress = null;
          
          try {
            // First try: BigDataCloud (free, no API key needed)
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              // Area name (city/locality)
              areaAddress = data.locality || data.city || data.principalSubdivision || 'Unknown Area';
              // Detailed address for precise location
              detailedAddress = data.locality && data.principalSubdivision 
                ? `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`
                : `${data.city || data.principalSubdivision}, ${data.countryName}`;
            }
          } catch (error) {
            console.log('BigDataCloud failed, trying alternative...');
          }
          
          // Fallback: Try OpenStreetMap Nominatim
          if (!areaAddress) {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                {
                  headers: {
                    'User-Agent': 'ClientApp/1.0'
                  }
                }
              );
              
              if (response.ok) {
                const data = await response.json();
                if (data.address) {
                  areaAddress = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Unknown Area';
                  detailedAddress = data.display_name ? data.display_name.split(',').slice(0, 4).join(', ') : null;
                }
              }
            } catch (error) {
              console.log('Nominatim also failed');
            }
          }
          
          // Create Google Maps link for precise location
          const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          
          // Final fallback
          if (!areaAddress) {
            areaAddress = `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
          
          const newAreaName = areaAddress;
          const newPreciseLocation = `${detailedAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`} | ${googleMapsLink}`;
          
          setAreaName(newAreaName);
          setPreciseLocation(newPreciseLocation);
          
          // Combine both parts for the form value
          const combinedValue = `${newAreaName} | ${newPreciseLocation}`;
          
          onChange({
            target: {
              name,
              value: combinedValue
            }
          });
        } catch (error) {
          console.error('Error getting address:', error);
          // Fallback to coordinates
          const { latitude, longitude } = position.coords;
          const coordsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          
          const fallbackArea = `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          const fallbackPrecise = `${coordsString} | ${googleMapsLink}`;
          
          setAreaName(fallbackArea);
          setPreciseLocation(fallbackPrecise);
          
          onChange({
            target: {
              name,
              value: `${fallbackArea} | ${fallbackPrecise}`
            }
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
            break;
        }
      },
      options
    );
  };

  const handleAreaChange = (e) => {
    const newAreaName = e.target.value;
    setAreaName(newAreaName);
    setLocationError('');
    
    // Update combined value
    const combinedValue = preciseLocation ? `${newAreaName} | ${preciseLocation}` : newAreaName;
    onChange({
      target: {
        name,
        value: combinedValue
      }
    });
  };

  const containerStyle = {
    marginBottom: '10px'
  };

  const inputContainerStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px'
  };

  const inputStyle = {
    flex: 1,
    padding: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: isGettingLocation ? '#ccc' : '#4caf50',
    color: 'white',
    border: 'none',
    cursor: isGettingLocation ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    minWidth: '80px'
  };

  const errorStyle = {
    color: '#f44336',
    fontSize: '12px',
    backgroundColor: '#ffebee',
    padding: '8px',
    border: '1px solid #f44336',
    marginTop: '5px'
  };

  const warningStyle = {
    color: '#ff9800',
    fontSize: '12px',
    backgroundColor: '#fff3e0',
    padding: '8px',
    border: '1px solid #ff9800',
    marginTop: '5px'
  };

  return (
    <div style={containerStyle}>
      <div style={inputContainerStyle}>
        <input
          value={areaName}
          onChange={handleAreaChange}
          required={required}
          placeholder={placeholder}
          style={inputStyle}
        />
        {isGeolocationSupported && (
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            style={buttonStyle}
            title="Get current location"
          >
            {isGettingLocation ? 'Getting...' : 'Current'}
          </button>
        )}
      </div>
      
      {locationError && (
        <div style={errorStyle}>
          ⚠️ {locationError}
        </div>
      )}
      
      {!isGeolocationSupported && (
        <div style={warningStyle}>
          ℹ️ Location services not available in this browser
        </div>
      )}
    </div>
  );
};

export default LocationInput;