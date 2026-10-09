import { useTRPC } from '#/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const trpc = useTRPC()
  const health = useQuery(trpc.health.queryOptions())
    return (
        <main>
            <h1>Welcome!</h1>
            <Link to='/movies'>
                Перейти к фильмам
            </Link>        
            <p>Здоровье: {JSON.stringify(health.data)}</p>
        </main>
  )
}
