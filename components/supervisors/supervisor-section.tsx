import { SupervisorExplorer } from './supervisor-explorer'

/** The home page version: same finder, fewer cards before "Show more". */
export function SupervisorSection() {
  return <SupervisorExplorer pageSize={12} />
}
