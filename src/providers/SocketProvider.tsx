import { createContext, useMemo } from 'react'
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {

    const socket = useMemo(() => io(import.meta.env.VITE_APP_BACKEND_URL), []);

  return (
    <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
  )
}