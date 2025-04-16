import { createFileRoute } from '@tanstack/react-router'
import BuildingsPage from '../pages/Buildings'

export const Route = createFileRoute('/')({
  component: BuildingsPage,
})