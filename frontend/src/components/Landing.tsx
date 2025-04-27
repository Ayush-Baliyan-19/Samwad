"use client";
import React, { useEffect, useRef, useState } from "react";
import Room from "./Room";
import Navbar from "./navbar";
import { useTheme } from "next-themes";
import Image from "next/image";
import { BrainCircuit } from "lucide-react";

const Page = () => {
  const [name, setname] = useState("");
  const [joined, setjoined] = useState(false);
  const [localVideoTrack, setlocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setlocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isPrediction,setIsPrediction] = useState(true);
  // const [Loading, setLoading] = useState(true);

  const getCam = async () => {
    const streams = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const audioTrack = streams.getAudioTracks()[0];
    const videoTrack = streams.getVideoTracks()[0];
    setlocalAudioTrack(audioTrack);
    setlocalVideoTrack(videoTrack);
    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
      videoRef.current.play();
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };
  const toggleVideo = () => {
    if (localVideoTrack && !isVideoOff) {
      localVideoTrack.stop();
      localVideoTrack.enabled = false;
      setIsVideoOff(true);
    } else {
      getCam();
      setIsVideoOff(false);
    }
  };

  // console.log(localVideoTrack?.enabled)
  // console.log("Audio: ",localAudioTrack?.enabled)

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  const { theme } = useTheme();

  if (!joined) {
    return (
      <div>
        <Navbar />
        {/* {Loading ? 
        <div></div> 
        :  */}
        <div className="pt-28 flex max-md:flex-col-reverse w-10/12 m-auto my-auto flex-start max-sm:w-11/12 max-md:pt-7 min-md:h-screen">
          <div className="w-5/12 max-md:w-full m-auto flex flex-col max-md:mb-10 max-sm:mt-[-10vw] max-md:flex-col-reverse">
            <div className="">
              <p className="text-center text-4xl font-semibold max-sm:text-2xl">
                Samwad: Bridging Communication Gaps
                {/* Meet for Mute: Bridging Communication Gaps */}
              </p>
              <p
                className={`${
                  theme == "dark" ? "text-gray-300" : "text-gray-700"
                } text-center text-sm py-7 max-sm:text-xs`}
              >
                Empowering seamless conversations for everyone, with real-time
                sign language interpretation and easy accessibility for those
                who communicate differently.
              </p>
            </div>
            <div className="flex justify-center m-1 max-sm:border-b-2 pb-8 mb-5 my-auto max-sm:mt-16">
              <input
                type="text"
                className="bg-blue-200 mx-2 p-1 rounded px-3 w-[300px] text-blue-900"
                onChange={(e) => setname(e.target.value)}
                placeholder={"Your Name"}
              />
              <button
                onClick={() => setjoined(true)}
                className="bg-blue-500 px-4 rounded py-1"
              >
                Join
              </button>
              {/* </div> */}
            </div>
          </div>
          <div className="relative">
            <video
              className=" m-auto max-sm:h-auto h-[350px] rounded-md max-md:mb-5 my-auto max-md:pt-16"
              autoPlay
              ref={videoRef}
              style={{ transform: "scaleX(-1)" }}
              src=""
            ></video>
            <div className="flex justify-center my-3 max-md:mb-5 max-sm:my-0 ">
              <div
                onClick={toggleAudio}
                className={`${
                  isAudioMuted ? "bg-[#1f1d1d]" : "bg-[#f94d4d]"
                } p-4 mr-5 rounded-full`}
              >
                {!isAudioMuted ? (
                  <Image
                    height={1000}
                    width={1000}
                    src={"/microphone.png"}
                    className={`w-[25px] ${
                      !isAudioMuted ? "invert-[.15]" : "invert-[.55]"
                    } `}
                    alt=""
                  />
                ) : (
                  <Image
                    height={1000}
                    width={1000}
                    src={"/microphone (1).png"}
                    className={`w-[25px] ${
                      !isAudioMuted ? "invert-[.15]" : "invert-[.55]"
                    } `}
                    alt=""
                  />
                )}
              </div>
              <div
                onClick={toggleVideo}
                className={`${
                  isVideoOff ? "bg-[#f94d4d]" : "bg-[#1f1d1d]"
                } p-4 rounded-full`}
              >
                {isVideoOff ? (
                  <Image
                    height={1000}
                    width={1000}
                    src={"/no-video.png"}
                    className={`w-[25px] ${
                      isVideoOff ? "invert-[.15]" : "invert-[.55]"
                    }`}
                    alt=""
                  />
                ) : (
                  <Image
                    height={1000}
                    width={1000}
                    src={"/video-camera.png"}
                    className={`w-[25px] ${
                      isVideoOff ? "invert-[.15]" : "invert-[.55]"
                    }`}
                    alt=""
                  />
                )}
              </div>
              <div
                onClick={() => setIsPrediction(!isPrediction)}
                className={`${
                  isPrediction ? "bg-[#1f1d1d]" : "bg-[#f94d4d]"
                } p-4 ml-5 rounded-full`}
              >
                <BrainCircuit
                  size={25}
                  color={"#787777"}
                  className={`${
                    isPrediction ? "invert-[.15]" : "invert-[.55]"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
        {/* } */}
      </div>
    );
  } else {
    return (
      <>
        <Room
          name={name}
          localAudioTrack={localAudioTrack}
          localVideoTrack={localVideoTrack}
          isPrediction={isPrediction}
          setIsPrediction={setIsPrediction}
        />
      </>
    );
  }
};

export default Page;
