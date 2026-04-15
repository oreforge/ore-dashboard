export function useProjectIcon() {
  const client = useOreClient()
  function iconUrl(name: string): string {
    return client.projects.get(name).iconUrl
  }
  return { iconUrl }
}
