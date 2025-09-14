export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md">
        <h2 className="text-red-800 text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    </div>
  )
}