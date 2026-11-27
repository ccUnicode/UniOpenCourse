/** Preserves the public course/class/material not-found contract. */
export async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 404) return { error: 'Not Found', statusCode: 404 };
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
