import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
    return (
        <main>
            <h1>Welcome!</h1>
            <Link to='/movies'>
                Перейти к фильмам
            </Link>        
        </main>
  )
}
