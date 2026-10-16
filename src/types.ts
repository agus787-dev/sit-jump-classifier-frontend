export type Activity = 'jump' | 'sit'

export type Prediction = {
  prediction: Activity
  confidence: number
  probabilities: Record<Activity, number>
}

export type ServerStatus = 'connecting' | 'waking' | 'online' | 'offline' | 'configuration-error'
