import { useSelector } from '@xstate/react'

import { useAuthInterpreter } from './useAuthInterpreter'

/**
 * Use `useAuthenticationStatus` to get the authentication status for the user.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading } = useAuthenticationStatus();
 * ```
 */
export const useAuthenticationStatus = () => {
  const service = useAuthInterpreter()
  return useSelector(
    service,
    (state) => ({
      isAuthenticated: state.matches({ authentication: 'signedIn' }),
      isLoading: state.hasTag('loading'),
      error: state.context.errors.authentication || null,
      isError: state.matches({ authentication: { signedOut: 'failed' } })
    }),
    (a, b) => a.isAuthenticated === b.isAuthenticated && a.isLoading === b.isLoading
  )
}
