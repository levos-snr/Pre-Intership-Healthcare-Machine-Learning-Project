import { apiFetch } from './client'

export interface Patient {
  id: number
  age: number
  gender: string
  blood_type: string
  medical_condition: string
  billing_amount: number
  admission_type: string
  insurance_provider: string
  medication: string
  test_result: string
  date_of_admission: string | null
}

export interface PatientsResponse {
  items: Patient[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const fetchPatients = (page: number, pageSize = 20) =>
  apiFetch<PatientsResponse>(`/patients?page=${page}&page_size=${pageSize}`)
