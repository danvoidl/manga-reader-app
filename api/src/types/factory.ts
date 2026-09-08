import type { FetchOptions } from 'ofetch'

/** Shape of a single HTTP request passed to `FetchFactory.call()`. */
export interface IHttpFactory {
  method: string
  url: string
  fetchOptions?: FetchOptions<'json'>
  data?: object
}
