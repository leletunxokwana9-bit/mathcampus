import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#03070F' }}>
      <Outlet />
    </div>
  )
}
