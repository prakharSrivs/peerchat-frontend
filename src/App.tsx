import './App.css'
import { Route, Routes } from 'react-router-dom'
import CreateRoom from './pages/CreateRoom'
import Lobby from './pages/Lobby'
import Room from './pages/Room'

function App() {

  return (
    <Routes>
      <Route path={'/'} element={<CreateRoom />}  />
      <Route path={'/lobby/create'} element={<Lobby type={"create"} />} />
      <Route path={'/lobby/join/:id'} element={<Lobby type={"join"} />} />
      <Route path={'/lobby/join/'} element={<Lobby type={"join"} />} />
      <Route path={'/join/:id'} element={<Room />} />
    </Routes>
  )
}

export default App
