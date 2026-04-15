import { queryOptions } from '@tanstack/react-query'
import { fetchPatients } from './patients'
import { fetchStats } from './stats'

export const patientsQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ['patients', page],
    queryFn: () => fetchPatients(page),
    staleTime: 1000 * 60 * 5,
  })

export const statsQueryOptions = queryOptions({
  queryKey: ['stats'],
  queryFn: fetchStats,
  staleTime: 1000 * 60 * 5,
})
