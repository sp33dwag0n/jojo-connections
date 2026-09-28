// Toast shown above the board ("One away...", "Already guessed!")
function Notification({ message }) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center">
      <div
        key={message.id}
        role="status"
        className="rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-lg animate-pop"
      >
        {message.text}
      </div>
    </div>
  )
}

export default Notification
