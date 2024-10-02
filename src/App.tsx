import './App.css'
import { Route, Routes } from 'react-router-dom'
import CreateRoom from './pages/CreateRoom'
import Lobby from './pages/Lobby'
import Room from './pages/Room'

function App() {

  return (
    <Routes>
      <Route path={'/'} element={<CreateRoom />}  />
      <Route path={'/lobby/:type/*'} element={<Lobby />} />
      <Route path={'/join/:id'} element={<Room />} />
    </Routes>
  )
}

export default App
