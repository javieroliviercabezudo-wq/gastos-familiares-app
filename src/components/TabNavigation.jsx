import { useNavigate, useLocation } from 'react-router-dom'

export default function TabNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="tab-nav">
      <button className={location.pathname === '/' ? 'active' : ''} onClick={() => navigate('/')}>Gastos</button>
      <button className={location.pathname === '/presupuesto' ? 'active' : ''} onClick={() => navigate('/presupuesto')}>Presupuesto</button>
      <button className={location.pathname === '/categorias' ? 'active' : ''} onClick={() => navigate('/categorias')}>Categorias</button>
      <button className={location.pathname === '/resumen' ? 'active' : ''} onClick={() => navigate('/resumen')}>Resumen</button>
      <button className={location.pathname === '/datos' ? 'active' : ''} onClick={() => navigate('/datos')}>Datos</button>
    </nav>
  )
}
