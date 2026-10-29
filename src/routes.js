export function getRoute(pathname) {
  if (pathname === '/app' || pathname === '/app/') return 'app'
  if (pathname === '/analytics' || pathname === '/analytics/') return 'analytics'
  return 'landing'
}
