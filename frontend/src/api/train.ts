import { apiFetch } from './client'

export interface TrainResponse {
  status: 'success' | 'skipped'
  model_name: string | null
  accuracy: number | null
  precision: number | null
  recall: number | null
  f1: number | null
  confusion_matrix: number[][] | null
  message: string | null
}

export const postTrain = () =>
  apiFetch<TrainResponse>('/train', { method: 'POST' })
