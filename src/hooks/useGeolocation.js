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

    const { enableHighAccuracy = true, timeout = 15000, maximumAge = 0 } = options;

    const defaultOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(coords);
        setLoading(false);
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        let code = 'POSITION_UNAVAILABLE';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Location permission denied by user. Please enable GPS location access in browser settings.';
            code = 'PERMISSION_DENIED';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'GPS signal unavailable. Please ensure location services are enabled on your device.';
            code = 'POSITION_UNAVAILABLE';
            break;
          case err.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            code = 'TIMEOUT';
            break;
          default:
            msg = err.message;
        }

        setError({ code, message: msg });
        setLoading(false);
      },
      defaultOptions
    );
  }, []);

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
