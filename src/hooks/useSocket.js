import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (namespace = '/games') => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(namespace, {
      withCredentials: true,
      autoConnect: true
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [namespace]);

  return socketRef.current;
};
