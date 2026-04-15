import { apiFetch } from './client'

export interface ModelMetrics {
  model_name: string
  accuracy: number
  precision: number
  recall: number
  f1: number
  confusion_matrix: number[][]
}

export interface StatsResponse {
  total_patients: number
  total_predictions: number
  result_distribution: Record<string, number>
  condition_distribution: Record<string, number>
  model_name: string | null
  model_metrics: ModelMetrics | null
}

export const fetchStats = () => apiFetch<StatsResponse>('/stats')
