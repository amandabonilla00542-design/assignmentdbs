import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Verify from './pages/Verify.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/IB/Welcome" />} />
        <Route path="/IB/Welcome" element={<Verify />} />
        <Route path="/member/IB/profile" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App