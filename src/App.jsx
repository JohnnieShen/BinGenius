import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Axios from "axios";
import { useSpeechSynthesis } from 'react-speech-kit';
import './App.css'


function App() {
  const webcamRef = useRef(null);
  const [newOutput,setNewOutput] = useState("");
  const [imgSrc, setImgSrc] = useState(null);
  const [newPrompt, setNewPrompt] = useState("Which trash bin should I choose?");
  const {speak} = useSpeechSynthesis();

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const handleReset = (event) => {
    event.preventDefault();
    setImgSrc(null)
    setNewOutput("")
    setNewPrompt("Which trash bin should I choose?")
  }

  const handleSubmit = async (event)=> {
    event.preventDefault();
    event.target.reset();
    let formdata = new FormData()
    if (imgSrc != null) {
      formdata.set('files',imgSrc)
      const result = await Axios ({
        method: "POST",
        url: "http://10.203.127.124:5000/upload_image",
        headers: {"Content-Type": "multipart/form-data"},
        data: formdata,
      })
      .catch(function (error) {
        console.log(error)
      })
      setNewOutput(result.data)
      speak({text: result.data})
      await delay(500);
      let returnData = new FormData()
      returnData.set('is_tf',false)
      const returnResult = await Axios ({
        method: "POST",
        url: "http://10.203.127.124:5000/return_prompt",
        headers: {"Content-Type": "multipart/form-data"},
        data: returnData,
      })
      .catch(function (error) {
        console.log(error)
      })
      console.log(returnResult.data)
      setNewOutput(returnResult.data.result)
      console.log(returnResult.data.prompt)
      speak({text: returnResult.data.result})
      if (returnResult.data.prompt == "Plastic") {
        setNewPrompt(returnResult.data.prompt+" - Gray Incinerate Bin or Green Recycle Bin")
      } else if (returnResult.data.prompt == "Glass" || returnResult.data.prompt == "Metal") {
        setNewPrompt(returnResult.data.prompt+" - Green Recycle Bin")
      } else if (returnResult.data.prompt == "Cardboard" || returnResult.data.prompt == "Paper") {
        setNewPrompt(returnResult.data.prompt+" - Blue Paper Bin")
      } else if (returnResult.data.prompt == "Trash") {
        setNewPrompt(returnResult.data.prompt+" - Yellow Compost Bin")
      }
    } else {
      console.error("null image")
    }
  }
  

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setNewOutput("Picture captured!")
    speak({text: "Picture captured!"})
  }, [webcamRef]);
  
  return (
    <>
      <header>
        <img className= "logo" src="/images/logo2.png" alt="BinGenius"></img>
      </header>
      <h2>{newPrompt}</h2>
      <div className="Cam">
      <header className="Cam-header">
        <Webcam
          ref={webcamRef}
          muted={true} 
          width={560}
          height={420}
          mirrored={false}
        />
        </header>
      </div>
      <div className="TextOutput">
          <h3>{newOutput}</h3>
      </div>
      <div className="PromptInput">
        <form className="PromptForm" onSubmit={handleSubmit}>
          <button type="submit">submit</button>
        </form>
        <br/>
        <div className="buttonsWrapper">
          <button className="button" onClick={capture}>Capture Picture</button>
          <button className="button" onClick={handleReset}>Reset</button>
        </div>
      </div>
      <div className="features">
        <h2>
          BinGenius, a recycling aid powered by Machine Learning
        </h2>
        <div className="featureBlockWrapper">
          <img src="/images/icon5.png" height={200}/>
          <p className="featureBlock">
            Through this app, we strive to make trash classification easier and promote environmental consciousness in our community. By identifying trash types and offering instruction on possible disposal, our app fosters a great sense of collective responsibility. Moreover, our app benefits the visually impaired, allowing them to independently sort and dispose of their waste with the help of our app’s audio cues and OpenCV. 
          </p>
        </div>
      </div>
      <footer className="footer">
        <div className="footerWrapper">
          <p>Powered by Tensorflow, Opencv, React.js and Flask</p>
          <p>BinGenius, 2023</p>
        </div>
      </footer>
    </>
  )
}

export default App
