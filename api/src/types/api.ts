/** Normalized upstream error, returned as the tuple's error slot. */
export interface IApiError {
  statusCode: number
  message: string
  details: any
  errors: object[]
}

/** MangaDex list envelope (pagination metadata + the `data` payload). */
export interface ListSuccess<D> {
  limit: number
  offset: number
  total: number
  result: string
  response: string
  data: D
}

/** Go-style result promise: `[null, data]` on success, `[error]` on failure. */
export type ApiResp<T> = Promise<[null, T] | [IApiError]>