import { apiFetch } from './client'

export interface PredictRequest {
  Age: number
  Gender: string
  'Blood Type': string
  'Medical Condition': string
  'Billing Amount': number
  'Admission Type': string
  'Insurance Provider': string
  Medication: string
}

export interface PredictResponse {
  predicted_test_result: 'Normal' | 'Abnormal' | 'Inconclusive'
  confidence: number
}

export const postPredict = (data: PredictRequest) =>
  apiFetch<PredictResponse>('/predict', {
    method: 'POST',
    body: JSON.stringify(data),
  })
