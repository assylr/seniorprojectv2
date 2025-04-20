import { createFileRoute } from '@tanstack/react-router'
import RoomsPage from '../pages/Rooms'

export const Route = createFileRoute('/rooms')({
  component: RoomsPage,
})