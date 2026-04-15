import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { patientsQueryOptions } from '../api/queryOptions'
import type { Patient } from '../api/patients'

export const Route = createFileRoute('/patients')({
  loader: ({ context }) => {
    if ((context as { queryClient?: { ensureQueryData: (o: object) => void } })?.queryClient) {
      ;(context as { queryClient: { ensureQueryData: (o: object) => void } }).queryClient.ensureQueryData(patientsQueryOptions(1))
    }
  },
  component: PatientsPage,
})

const col = createColumnHelper<Patient>()

const RESULT_BADGE: Record<string, string> = {
  Normal: 'bg-green-100 text-green-700',
  Abnormal: 'bg-red-100 text-red-700',
  Inconclusive: 'bg-yellow-100 text-yellow-700',
}

const columns = [
  col.accessor('id', { header: 'ID', size: 60 }),
  col.accessor('age', { header: 'Age', size: 60 }),
  col.accessor('gender', { header: 'Gender' }),
  col.accessor('blood_type', { header: 'Blood Type' }),
  col.accessor('medical_condition', { header: 'Condition' }),
  col.accessor('admission_type', { header: 'Admission' }),
  col.accessor('insurance_provider', { header: 'Insurance' }),
  col.accessor('medication', { header: 'Medication' }),
  col.accessor('billing_amount', {
    header: 'Billing ($)',
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
  col.accessor('test_result', {
    header: 'Result',
    cell: (info) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${RESULT_BADGE[info.getValue()] ?? 'bg-gray-100 text-gray-600'}`}>
        {info.getValue()}
      </span>
    ),
  }),
]

function PatientsPage() {
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data, isPending, isError } = useQuery(patientsQueryOptions(page))

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: data?.total_pages ?? 1,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">🏥 Patients</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {data ? `${data.total.toLocaleString()} total records` : 'Loading …'}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search all columns …"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
        />
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700 text-sm">
          Failed to load patients. Is the backend running and the database seeded?
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ↑'}
                    {header.column.getIsSorted() === 'desc' && ' ↓'}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  Loading patients …
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2.5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {page} of {data?.total_pages ?? 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(data?.total_pages ?? 1, p + 1))}
            disabled={page === (data?.total_pages ?? 1)}
            className="px-3 py-1.5 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}