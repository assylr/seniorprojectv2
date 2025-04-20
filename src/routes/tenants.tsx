import { createFileRoute } from '@tanstack/react-router'
import TenantsPage from '../pages/Tenants'

export const Route = createFileRoute('/tenants')({
  component: TenantsPage,
})

