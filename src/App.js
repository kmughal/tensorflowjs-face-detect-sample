import { useRef, useEffect } from "react"
import "@tensorflow/tfjs"
import * as cocoSsd from "@tensorflow-models/coco-ssd"

import "./style.css"

export default () => {

  const inputEl = useRef(null)
  const c1 = useRef(null)
  let model = null

  useEffect(async () => {
    model = await cocoSsd.load()
  })

  const constraints = { video: true }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
      const context = c1.current.getContext("2d")
      inputEl.current.srcObject = mediaStream
      inputEl.current.onloadedmetadata = function (e) {
        inputEl.current.play()
      }
      inputEl.current.addEventListener("loadeddata", async () => {
        await loadVideoToCanvas()
      })

      async function loadVideoToCanvas() {
        const width = inputEl.current.width
        const height = inputEl.current.height
        context.drawImage(inputEl.current, 0, 0, width, height)
        const img = inputEl.current
        
        !model && (model = await cocoSsd.load())
        const predictions = await model.detect(img)
        console.log(predictions)
        if (predictions.length > 0) {
          predictions.forEach((item) => {
            const box = item.bbox
            context.beginPath()
            context.lineWidth = "1"
            context.strokeStyle = "red"
            context.font = '48px serif';
            context.fillText(item.class, box[0], box[1]);
            context.rect(box[0], box[1], box[2], box[3])
            context.stroke()
          })
        }

        setTimeout(async () => {
          await loadVideoToCanvas()
        }, 0)
      }
    })
    .catch(console.log)

  return (
    <>
      <h1>Image detect sample using TensorFlow JS</h1>
      <video
        id="input-control"
        name="input-control"
        width="760"
        height="496"
        ref={inputEl}
        controls
      ></video>
      <div>
        <canvas id="c1" ref={c1} width="760" height="496"></canvas>
      </div>
    </>
  )
}
