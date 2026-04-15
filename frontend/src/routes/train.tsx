import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { postTrain, type TrainResponse } from '../api/train'
import { statsQueryOptions } from '../api/queryOptions'
import { queryClient } from '../api/client'

export const Route = createFileRoute('/train')({
  component: TrainPage,
})

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = (value * 100).toFixed(1)
  const color =
    value >= 0.7
      ? 'bg-green-500'
      : value >= 0.5
        ? 'bg-yellow-500'
        : 'bg-red-400'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-bold ${value >= 0.7 ? 'text-green-700' : value >= 0.5 ? 'text-yellow-700' : 'text-red-600'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  if (accuracy >= 0.80) return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-bold text-sm">🟢 Good ({(accuracy * 100).toFixed(1)}%)</span>
  if (accuracy >= 0.60) return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">🟡 Fair ({(accuracy * 100).toFixed(1)}%)</span>
  return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-sm">🔴 Poor ({(accuracy * 100).toFixed(1)}%)</span>
}

function TrainPage() {
  const { data: stats } = useQuery(statsQueryOptions)

  const mutation = useMutation<TrainResponse, Error>({
    mutationFn: postTrain,
    onSuccess: () => {
      // Refresh stats so the Stats page reflects the new model
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const currentAccuracy = stats?.model_metrics?.accuracy ?? null
  const currentModel = stats?.model_name ?? null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-blue-800">🏋️ Model Training</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Retrain all candidate models on the full patient database and auto-select the best.
        </p>
      </div>

      {/* Current model status */}
      {currentModel && currentAccuracy !== null && (
        <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Currently deployed</p>
            <p className="text-lg font-bold text-gray-800 capitalize mt-0.5">
              {currentModel.replace(/_/g, ' ')}
            </p>
          </div>
          <AccuracyBadge accuracy={currentAccuracy} />
        </div>
      )}

      {/* Train button */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-700">Trigger Retraining</h2>
        <p className="text-sm text-gray-500">
          Trains XGBoost, Random Forest, Gradient Boosting, and Logistic Regression in parallel,
          then saves the best-accuracy model. Takes ~30–60 s on 10 000 rows.
        </p>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Training… (please wait)
            </>
          ) : (
            '🚀 Start Retraining'
          )}
        </button>

        {mutation.isError && (
          <div className="border border-red-300 bg-red-50 rounded-lg p-4 text-red-700 text-sm">
            <strong>Training failed:</strong> {mutation.error.message}
          </div>
        )}
      </div>

      {/* Training results */}
      {mutation.isSuccess && mutation.data && (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-gray-700">Training Results</h2>
            {mutation.data.accuracy != null && (
              <AccuracyBadge accuracy={mutation.data.accuracy} />
            )}
          </div>

          {mutation.data.status === 'skipped' ? (
            <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              ⚠️ {mutation.data.message}
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Best model:{' '}
                <span className="font-bold text-gray-800 capitalize">
                  {mutation.data.model_name?.replace(/_/g, ' ')}
                </span>
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Accuracy', value: mutation.data.accuracy },
                  { label: 'Precision', value: mutation.data.precision },
                  { label: 'Recall', value: mutation.data.recall },
                  { label: 'F1-Score', value: mutation.data.f1 },
                ].map(({ label, value }) =>
                  value != null ? (
                    <MetricBar key={label} label={label} value={value} />
                  ) : null,
                )}
              </div>

              {mutation.data.accuracy != null && mutation.data.accuracy < 0.6 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 space-y-1">
                  <p className="font-semibold">⚠️ Accuracy is below 60% — see the guide below to understand why.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Accuracy Improvement Guide ── */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="font-semibold text-gray-700 text-lg">
          📚 Why is accuracy ~43%? And how to improve it
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
          <p className="font-semibold">The honest answer: the dataset is synthetic with random labels.</p>
          <p>
            The Kaggle <em>Healthcare Dataset</em> by Prasad generates test results
            (Normal / Abnormal / Inconclusive) <strong>randomly</strong> — they have no
            mathematical relationship to the patient features. A 3-class random baseline is{' '}
            <strong>33%</strong>, so ~43% means the model has learned a tiny
            spurious correlation in the training set that doesn't generalise.
            No amount of hyperparameter tuning will push this above ~45–50% on this
            specific dataset.
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <h3 className="font-semibold text-gray-800">What actually improves accuracy (with real data)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: '1️⃣',
                title: 'Use data with real signal',
                body: 'Replace this dataset with one where labels are clinically derived — e.g. MIMIC-III, PhysioNet, or your own EHR exports. Real data can achieve 75–95% accuracy on structured tasks.',
                impact: 'High',
              },
              {
                icon: '2️⃣',
                title: 'Feature engineering',
                body: 'Add derived features: Length of stay (discharge – admission), age buckets (child/adult/elderly), billing percentile rank, condition × medication interaction. Edit backend/app/ml/preprocess.py.',
                impact: 'Medium',
              },
              {
                icon: '3️⃣',
                title: 'Hyperparameter tuning',
                body: 'Add GridSearchCV or Optuna to train.py. For XGBoost tune: n_estimators, max_depth, learning_rate, min_child_weight, gamma. Can gain 2–5% on real data.',
                impact: 'Medium',
              },
              {
                icon: '4️⃣',
                title: 'Fix class imbalance',
                body: 'If classes are unbalanced, add class_weight="balanced" to RandomForest/LogisticRegression and scale_pos_weight to XGBoost. Or use SMOTE from imbalanced-learn (already in requirements).',
                impact: 'Medium',
              },
              {
                icon: '5️⃣',
                title: 'Cross-validation',
                body: 'Replace the single train/test split with StratifiedKFold(n_splits=5). This gives a more reliable accuracy estimate and prevents lucky splits.',
                impact: 'Low (estimate quality)',
              },
              {
                icon: '6️⃣',
                title: 'More training data',
                body: 'ML models improve logarithmically with data. Going from 10k → 100k rows on real data typically gives +3–8% accuracy. The current 10k rows is adequate only if labels have signal.',
                impact: 'High (real data only)',
              },
            ].map((tip) => (
              <div key={tip.title} className="border rounded-lg p-4 space-y-1 bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800">{tip.icon} {tip.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tip.impact === 'High' ? 'bg-green-100 text-green-700' :
                    tip.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {tip.impact} impact
                  </span>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900 space-y-1">
          <p className="font-semibold">🎯 When is accuracy "good"?</p>
          <ul className="space-y-0.5 text-xs list-disc list-inside">
            <li><strong>≥ 80%</strong> — Solid. Model is ready for prototyping with real clinical review.</li>
            <li><strong>70–79%</strong> — Acceptable. Worth investigating which class is hardest to predict.</li>
            <li><strong>60–69%</strong> — Marginal. Better than random, but check for data leakage.</li>
            <li><strong>≤ 50%</strong> — Near random. The labels likely have no relationship to features (as here).</li>
          </ul>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4 text-xs text-gray-500 font-mono space-y-1">
          <p className="font-semibold text-gray-700 font-sans text-sm">Quick code fix for feature engineering (preprocess.py)</p>
          <pre className="overflow-x-auto text-xs leading-relaxed">{`# Add to preprocess_dataframe():
if "date_of_admission" in df.columns and "discharge_date" in df.columns:
    df["length_of_stay"] = (
        pd.to_datetime(df["discharge_date"], errors="coerce") -
        pd.to_datetime(df["date_of_admission"], errors="coerce")
    ).dt.days.fillna(0)

# Then add "length_of_stay" to NUMERIC_FEATURES in preprocess.py
# and re-run: python -m app.ml.train`}</pre>
        </div>
      </div>
    </div>
  )
}
