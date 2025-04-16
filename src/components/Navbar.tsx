import { Link, useRouterState } from '@tanstack/react-router'

const Navbar = () => {
  const { location } = useRouterState()

  const links = [
    { path: '/', label: 'Buildings' },
    { path: '/rooms', label: 'Rooms' },
    { path: '/tenants', label: 'Tenants' },
    { path: '/reports', label: 'Reports' },
  ]

  return (
    <nav className="bg-gray-800 px-16 py-4 flex items-center justify-between">
      <div className="text-white font-bold text-lg">HOUSING MANAGEMENT SYSTEM</div>
      <ul className="flex gap-5 ml-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path

          return (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-white font-medium px-6 py-2 rounded-md transition-all ${
                  isActive ? 'bg-gray-700 font-bold' : 'hover:bg-gray-600'
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
				<li>
          <Link
            to="/auth"
            className={`text-white px-4 py-2 rounded-md transition-all border border-white/20 hover:bg-gray-700 ${
              location.pathname === '/auth' ? 'bg-gray-700 font-bold' : ''
            }`}
          >
            Login / Register
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
