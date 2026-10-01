import { useState, useCallback, useEffect, useRef } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const clearLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 'NOT_SUPPORTED',
        message: 'Browser does not support Geolocation.'
      });
      return;
    }

    setLoading(true);
    setError(null);

    const primaryOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 15000,
      maximumAge: options.maximumAge ?? 30000
    };

    const handleSuccess = (position) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      setLocation(coords);
      setLoading(false);
    };

    const handleError = (err) => {
      let msg = 'Unable to retrieve location.';
      let code = 'POSITION_UNAVAILABLE';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          msg = 'Location permission denied. Please allow location access in your browser site settings.';
          code = 'PERMISSION_DENIED';
          break;
        case err.POSITION_UNAVAILABLE:
          msg = 'GPS signal unavailable. Please ensure location services are turned on.';
          code = 'POSITION_UNAVAILABLE';
          break;
        case err.TIMEOUT:
          msg = 'Location request timed out. Retrying with network location...';
          code = 'TIMEOUT';
          break;
        default:
          msg = err.message;
      }

      setError({ code, message: msg });
      setLoading(false);
    };

    // First attempt with high accuracy (GPS)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (firstErr) => {
        // Fallback retry with standard accuracy (WiFi/IP triangulation for laptops)
        if (firstErr.code === firstErr.TIMEOUT || firstErr.code === firstErr.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 25000, maximumAge: 60000 }
          );
        } else {
          handleError(firstErr);
        }
      },
      primaryOptions
    );
  }, [options]);

  useEffect(() => {
    return () => {
      clearLocation();
    };
  }, [clearLocation]);

  return {
    location,
    loading,
    error,
    requestPosition,
    clearLocation
  };
};
