import test from 'node:test'
import assert from 'node:assert/strict'
import { getRoute } from './routes.js'

test('resolves app and analytics routes with or without a trailing slash', () => {
  const routes = [
    ['/app', 'app'],
    ['/app/', 'app'],
    ['/analytics', 'analytics'],
    ['/analytics/', 'analytics'],
  ]

  for (const [pathname, expectedRoute] of routes) {
    assert.equal(getRoute(pathname), expectedRoute, pathname)
  }
})

test('keeps the landing route for the root and unrelated paths', () => {
  const paths = ['/', '/other', '/app/tasks', '/analytics/reports']

  for (const pathname of paths) {
    assert.equal(getRoute(pathname), 'landing', pathname)
  }
})
