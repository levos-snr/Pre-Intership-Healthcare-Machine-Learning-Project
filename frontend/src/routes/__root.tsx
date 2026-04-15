/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../api/client'
import appCss from '../styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Healthcare ML' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </main>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </RootDocument>
  )
}

function Nav() {
  const links = [
    { to: '/', label: '🏠 Home' },
    { to: '/predict', label: '🔬 Predict' },
    { to: '/patients', label: '🏥 Patients' },
    { to: '/stats', label: '📊 Stats' },
    { to: '/train', label: '🏋️ Train' },
  ]
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6 flex-wrap">
        <span className="font-bold text-lg tracking-tight mr-4">HealthcareML</span>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="hover:text-blue-200 transition-colors text-sm font-medium"
            activeProps={{ className: 'text-blue-200 underline underline-offset-4' }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
        <Scripts />
      </body>
    </html>
  )
}