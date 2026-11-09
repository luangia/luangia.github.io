import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { Desk } from './Desk'
import { Dust } from './Dust'
import { Effects } from './Effects'
import { Books } from './objects/Books'
import { Globe } from './objects/Globe'
import { Laptop } from './objects/Laptop'
import { Letter } from './objects/Letter'
import { Portrait } from './objects/Portrait'
import { Scroll } from './objects/Scroll'

export function Scene() {
  return (
    <>
      <CameraRig />
      <Backdrop />
      <Desk />
      <Portrait />
      <Laptop />
      <Books />
      <Globe />
      <Scroll />
      <Letter />
      <Dust />
      <Effects />
    </>
  )
}
