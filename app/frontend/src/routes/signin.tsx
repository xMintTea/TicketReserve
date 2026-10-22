import LoginPage from '#/pages/loginPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signin')({
  component: LoginPage,
})
