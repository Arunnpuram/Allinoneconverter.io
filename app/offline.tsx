"use client"

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">You are offline</h1>
      <p className="text-center mb-6">
        Don't worry! Converter.io works offline. You can still convert your files without an internet connection.
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Go to Home
      </button>
    </div>
  )
}
