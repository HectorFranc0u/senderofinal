import MapView from '../components/MapView'
import ButtonSOS from '../components/ButtonSOS'

export default function Home({ onOpenSOS }: { onOpenSOS: () => void }) {
  return (
    <div className="relative">
      <MapView />
      <ButtonSOS onClick={onOpenSOS} />
    </div>
  )
}
