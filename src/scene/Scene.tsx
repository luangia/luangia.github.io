import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { Candle } from './Candle'
import { Desk } from './Desk'
import { Effects } from './Effects'
import { Laptop } from './Laptop'

export function Scene() {
  return (
    <>
      <CameraRig />
      <Backdrop />
      <Desk />
      <Candle />
      <Laptop />
      <Effects />
    </>
  )
}
