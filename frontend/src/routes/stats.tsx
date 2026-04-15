import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { statsQueryOptions } from '../api/queryOptions'

export const Route = createFileRoute('/stats')({
  loader: ({ context }) => {
    if ((context as { queryClient?: { ensureQueryData: (o: object) => void } })?.queryClient) {
      ;(context as { queryClient: { ensureQueryData: (o: object) => void } }).queryClient.ensureQueryData(statsQueryOptions)
    }
  },
  component: StatsPage,
})

const PIE_COLORS = ['#22c55e', '#ef4444', '#eab308']
const BAR_COLOR = '#3b82f6'

function MetricCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm text-center ${color ?? ''}`}>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function StatsPage() {
  const { data, isPending, isError } = useQuery(statsQueryOptions)

  if (isPending) {
    return <div className="text-center py-20 text-gray-400">Loading stats …</div>
  }

  if (isError || !data) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
        Failed to load stats. Make sure the backend is running.
      </div>
    )
  }

  const pieData = Object.entries(data.result_distribution).map(([name, value]) => ({ name, value }))
  const barData = Object.entries(data.condition_distribution).map(([name, value]) => ({ name, value }))
  const m = data.model_metrics

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-800">📊 Model & Dataset Stats</h1>
        <p className="text-gray-500 text-sm mt-1">
          Active model: <span className="font-semibold capitalize">{data.model_name?.replace('_', ' ')}</span>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Patients" value={data.total_patients.toLocaleString()} />
        <MetricCard label="Total Predictions" value={data.total_predictions.toLocaleString()} />
        {m?.accuracy != null && (
          <MetricCard label="Accuracy" value={`${(m.accuracy * 100).toFixed(1)}%`} />
        )}
        {m?.f1 != null && (
          <MetricCard label="F1-Score" value={`${(m.f1 * 100).toFixed(1)}%`} />
        )}
      </div>

      {/* Model metrics detail */}
      {m?.accuracy != null && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Model Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Accuracy', value: m.accuracy },
              { label: 'Precision', value: m.precision },
              { label: 'Recall', value: m.recall },
              { label: 'F1-Score', value: m.f1 },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {(item.value * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${item.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Confusion matrix */}
          {m.confusion_matrix && m.confusion_matrix.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Confusion Matrix</h3>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse mx-auto">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-gray-50" />
                      {m.confusion_matrix[0].map((_, i) => (
                        <th key={i} className="p-2 border bg-gray-50 font-medium text-gray-600">
                          Pred {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {m.confusion_matrix.map((row, i) => (
                      <tr key={i}>
                        <td className="p-2 border bg-gray-50 font-medium text-gray-600">
                          Actual {i}
                        </td>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`p-3 border text-center font-semibold ${i === j ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie: result distribution */}
        {pieData.length > 0 && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Test Result Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar: condition distribution */}
        {barData.length > 0 && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-4">Condition Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}