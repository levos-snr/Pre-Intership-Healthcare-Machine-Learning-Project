import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { postPredict, type PredictRequest, type PredictResponse } from '../api/predict'

export const Route = createFileRoute('/predict')({
  component: PredictPage,
})

const GENDERS = ['Male', 'Female']
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Obesity', 'Cancer', 'Arthritis']
const ADMISSION_TYPES = ['Emergency', 'Elective', 'Urgent']
const INSURANCE = ['Aetna', 'Blue Cross', 'Cigna', 'Medicare', 'UnitedHealthcare']
const MEDICATIONS = ['Aspirin', 'Ibuprofen', 'Lisinopril', 'Metformin', 'Paracetamol', 'Penicillin']

const RESULT_STYLES: Record<string, string> = {
  Normal: 'bg-green-50 border-green-400 text-green-800',
  Abnormal: 'bg-red-50 border-red-400 text-red-800',
  Inconclusive: 'bg-yellow-50 border-yellow-400 text-yellow-800',
}

const RESULT_ICONS: Record<string, string> = {
  Normal: '✅',
  Abnormal: '🚨',
  Inconclusive: '⚠️',
}

// Named but NOT exported — fixes TanStack Router bundle-split warning
function PredictPage() {
  const mutation = useMutation<PredictResponse, Error, PredictRequest>({
    mutationFn: postPredict,
  })

  const form = useForm<PredictRequest>({
    defaultValues: {
      Age: 45,
      Gender: 'Male',
      'Blood Type': 'O+',
      'Medical Condition': 'Diabetes',
      'Billing Amount': 2000,
      'Admission Type': 'Emergency',
      'Insurance Provider': 'Cigna',
      Medication: 'Aspirin',
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value)
    },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-blue-800">🔬 Predict Test Result</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Fill in patient details and the ML model will predict the test outcome.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <form.Field name="Age">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Age</span>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            )}
          </form.Field>

          <form.Field name="Gender">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Gender</span>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="Blood Type">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Blood Type</span>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="Medical Condition">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Medical Condition</span>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="Billing Amount">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Billing Amount ($)</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            )}
          </form.Field>

          <form.Field name="Admission Type">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Admission Type</span>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {ADMISSION_TYPES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="Insurance Provider">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Insurance Provider</span>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {INSURANCE.map((i) => <option key={i}>{i}</option>)}
                </select>
              </label>
            )}
          </form.Field>

          <form.Field name="Medication">
            {(field) => (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Medication</span>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {MEDICATIONS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
            )}
          </form.Field>
        </div>

        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => form.handleSubmit()}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {mutation.isPending ? 'Predicting …' : 'Run Prediction'}
        </button>
      </div>

      {mutation.isSuccess && mutation.data && (
        <div
          className={`border-2 rounded-xl p-5 ${RESULT_STYLES[mutation.data.predicted_test_result] ?? 'bg-gray-50 border-gray-300'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {RESULT_ICONS[mutation.data.predicted_test_result] ?? '🔍'}
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                Predicted Result
              </p>
              <p className="text-2xl font-bold">{mutation.data.predicted_test_result}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                Confidence
              </p>
              <p className="text-2xl font-bold">
                {(mutation.data.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="border-2 border-red-300 bg-red-50 rounded-xl p-4 text-red-700 text-sm">
          <strong>Error:</strong>{' '}
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Prediction failed. Is the backend running?'}
        </div>
      )}
    </div>
  )
}
