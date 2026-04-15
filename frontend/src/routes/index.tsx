import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const cards = [
    {
      to: '/predict',
      icon: '🔬',
      title: 'Make a Prediction',
      desc: 'Enter patient data and get an instant ML-powered test result prediction.',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      to: '/patients',
      icon: '🏥',
      title: 'Browse Patients',
      desc: 'View, sort, and filter all 10,000 patient records with full pagination.',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
    {
      to: '/stats',
      icon: '📊',
      title: 'Model Statistics',
      desc: 'Inspect accuracy, F1-score, confusion matrix, and dataset distributions.',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      to: '/train',
      icon: '🏋️',
      title: 'Retrain Model',
      desc: 'Trigger a full retrain from the browser and learn how to improve accuracy.',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    },
  ]

  return (
    <div className="space-y-10">
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-4xl font-bold text-blue-800">Healthcare ML Dashboard</h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          End-to-end ML pipeline predicting patient test results as{' '}
          <span className="font-semibold text-green-600">Normal</span>,{' '}
          <span className="font-semibold text-red-600">Abnormal</span>, or{' '}
          <span className="font-semibold text-yellow-600">Inconclusive</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`border-2 rounded-xl p-6 transition-colors cursor-pointer ${c.color}`}
          >
            <div className="text-4xl mb-3">{c.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{c.title}</h2>
            <p className="text-gray-600 text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-2">
        <h3 className="font-semibold text-gray-700">How it works</h3>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          <li>10,000 synthetic patient records loaded from Kaggle into PostgreSQL</li>
          <li>XGBoost, Random Forest, Gradient Boosting, and Logistic Regression trained weekly</li>
          <li>Best-performing model is saved and served via FastAPI <code>/api/v1/predict</code></li>
          <li>Retrain anytime from the 🏋️ Train page without touching the terminal</li>
        </ol>
      </div>
    </div>
  )
}
