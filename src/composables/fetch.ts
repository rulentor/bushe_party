import { ref } from 'vue'

interface UseFetchParams {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  body: string // Stringified JSON
  headers?: {
    [key: string]: string
  }
}

export function useFetch(params: UseFetchParams) {
  const { url, headers, method, body } = params
  const data = ref(null)
  const error = ref(null)

  fetch(url, { method, body, headers })
    .then((res) => res.json())
    .then((json) => (data.value = json))
    .catch((err) => (error.value = err))

  return { data, error }
}
