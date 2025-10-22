type Props = { onClick: () => void }
export default function ButtonSOS({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 bg-red-600 text-white rounded-full shadow-lg p-4 text-lg font-bold animate-pulse"
    >
      SOS
    </button>
  )
}
