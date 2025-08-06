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

  const handlePreciseChange = (e) => {
    const newPreciseLocation = e.target.value;
    setPreciseLocation(newPreciseLocation);
    setLocationError('');
    
    // Update combined value
    const combinedValue = `${areaName} | ${newPreciseLocation}`;
    onChange({
      target: {
        name,
        value: combinedValue
      }
    });
  };

  return (
    <div className="space-y-2">
      {/* Area Name Input */}
      <div className="flex gap-2">
        <input
          value={areaName}
          onChange={handleAreaChange}
          required={required}
          placeholder="Area name (e.g., Downtown, Bole)"
          className="flex-1 px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
        />
        {isGeolocationSupported && (
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center min-w-[100px] text-sm ${
              isGettingLocation
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 hover:shadow-lg'
            }`}
            title="Get current location"
          >
            {isGettingLocation ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Current
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Precise Location Input */}
      <div className="space-y-1">
        <input
          value={preciseLocation}
          onChange={handlePreciseChange}
          placeholder="Precise location (address, coordinates, or Google Maps link)"
          className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
        />
        {preciseLocation && preciseLocation.includes('maps.google.com') && (
          <div className="flex items-center text-xs text-cyan-400">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <a 
              href={preciseLocation.split(' | ')[1] || preciseLocation} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan-300 underline"
            >
              Open in Google Maps
            </a>
          </div>
        )}
      </div>
      
      {locationError && (
        <div className="flex items-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {locationError}
        </div>
      )}
      
      {!isGeolocationSupported && (
        <div className="flex items-center text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Location services not available in this browser
        </div>
      )}
    </div>
  );
};

export default LocationInput;