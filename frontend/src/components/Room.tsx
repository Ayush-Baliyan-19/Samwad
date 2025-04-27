"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Navbar from "./navbar";
import Image from "next/image";
// import { useRouter } from "next/router";
import * as tmImage from "@teachablemachine/image";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: // isPrediction,
// setIsPrediction,
{
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
  isPrediction: boolean;
  setIsPrediction: (value: boolean) => void;
}) => {
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const roomIdRef = useRef<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPrediction, setIsPrediction] = useState(true);
  // const router = useRouter();

  const [lobby, setLobby] = useState(true);
  // const [videoSwitch, setvideoSwitch] = useState(true);
  const [socket, setSocket] = useState<null | Socket>(null);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [remotePrediction, setRemotePrediction] =
    useState<PredictionData | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const userIdRef = useRef<string | null>(null);

  const [isScreenSharing, setIsScreenSharing] = useState(false); // New state for screen sharing
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null); //new here

  // Function to start screen sharing
  const startScreenShare = async () => {
    if (!socket || !sendingPc) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setScreenStream(stream);
      const screenTrack = stream.getVideoTracks()[0];
      const sender = sendingPc
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) {
        sender.replaceTrack(screenTrack); // Replace video track with screen track
      }

      screenTrack.onended = () => stopScreenShare(); // Handle when user stops sharing
      setIsScreenSharing(true);

      // Notify remote peer via socket
      socket.emit("start-screen-share", {});
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  // Function to stop screen sharing
  const stopScreenShare = () => {
    if (!socket || !sendingPc || !screenStream) return;

    const screenTrack = screenStream.getVideoTracks()[0];
    screenTrack.stop(); // Stop the screen stream

    // Replace screen track with original video track
    const sender = sendingPc
      .getSenders()
      .find((s) => s.track?.kind === "video");
    if (sender && localVideoTrack) {
      sender.replaceTrack(localVideoTrack);
    }

    setScreenStream(null);
    setIsScreenSharing(false);

    // Notify remote peer via socket
    socket.emit("stop-screen-share", {});
  };

  setTimeout(() => {
    if (
      socket &&
      sendingPc &&
      receivingPc &&
      remoteAudioTrack &&
      remoteMediaStream &&
      remoteVideoTrack
    ) {
    }
  }, 3000);

  useEffect(() => {
    const socket = io(URL, {
      query: {
        name,
      },
    });

    socket.on("send-offer", async ({ roomId }) => {
      console.log("sending offer");
      roomIdRef.current = roomId;
      userIdRef.current = socket?.id || "";
      setLobby(false);
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }, // Free STUN
        ],
      });


      setSendingPc(pc);
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        console.log("receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        console.log("on negotiation needed, sending offer");
        const sdp = await pc.createOffer();
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("received offer", roomId);
      setLobby(false);
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }, // Free STUN
        ],
      });

      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        timmer();
      }
      setRemoteMediaStream(stream);
      setReceivingPc(pc);

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });

      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;
        if (track1.kind === "video") {
          setRemoteAudioTrack(track2);
          setRemoteVideoTrack(track1);
        } else {
          setRemoteAudioTrack(track1);
          setRemoteVideoTrack(track2);
        }
        //@ts-expect-error Add track to srcObject if available
        remoteVideoRef.current?.srcObject?.addTrack(track1);

        //@ts-expect-error Add track to srcObject if available
        remoteVideoRef.current?.srcObject?.addTrack(track2);

        remoteVideoRef.current?.play();
      }, 1500);
    });

    socket.on("answer", ({ sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type == "sender") {
        setReceivingPc((pc) => {
          if (!pc) {
            console.error("receiving pc not found");
          } else {
            console.error(pc.ontrack);
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          if (!pc) {
            console.error("sending pc not found");
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    socket.on("start-screen-share", () => {
      console.log("Remote peer started screen sharing");
    });

    socket.on("stop-screen-share", () => {
      console.log("Remote peer stopped screen sharing");
    });

    const handlePrediction = (predictionData: PredictionData) => {
      setRemotePrediction(predictionData);
      // if (predictionData[0].length > 0) setRemotePrediction(predictionData[0]);
    };

    socket.on("prediction", handlePrediction);

    // New logic for Teachable Machine model
    if (isPrediction && name?.length > 0) {
      const modelURL =
        "https://teachablemachine.withgoogle.com/models/2UnELG3RZ/model.json";
      const metadataURL =
        "https://teachablemachine.withgoogle.com/models/2UnELG3RZ/metadata.json";

      let model: tmImage.CustomMobileNet | undefined;
      let webcam: tmImage.Webcam | undefined;

      const initModel = async () => {
        model = await tmImage.load(modelURL, metadataURL);
        webcam = new tmImage.Webcam(200, 200, true); // Width, height, flip
        await webcam.setup();
        await webcam.play();
        setInterval(() => {
          loop();
        }, 1000);
      };

      const loop = async () => {
        if (webcam) {
          webcam.update();
          await predict(name);
        }
      };

      const predict = async (myId: string | undefined) => {
        if (!webcam || !myId || myId.length <= 0 || !socket) {
          return;
        }
        const prediction = await model!.predict(webcam.canvas);
        const highestPrediction = prediction.reduce(
          (max, current) =>
            current.probability > max.probability ? current : max,
          prediction[0]
        );
        socket.emit("prediction", {
          prediction: highestPrediction.className,
          roomId: roomIdRef.current,
          userId: userIdRef.current,
        });
      };

      initModel();

      return () => {
        if (webcam) webcam.stop();
      };
    }

    setSocket(socket);
  }, [name, socket]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);

        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  // const switchVideo = () => {
  //   setvideoSwitch((prev) => !prev);
  //   console.log(videoSwitch);
  // };
  // switchVideo();

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.enabled = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };
  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.enabled = !isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  //========== new from here ==========
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRecording = async () => {
    try {
      // Request access to capture a specific window
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window" }, // Capture a specific window
        audio: true, // Include audio capture if needed
      });

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect video chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle when recording stops
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });

        // Create a downloadable URL
        const videoUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = videoUrl;
        a.download = "recorded-window.webm";
        a.click();

        // Stop the media stream
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      console.log("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("Recording stopped.");
    }
  };

  const [sec, setsec] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  const timmer = () => {
    timerRef.current = setInterval(() => {
      setsec((prevTime) => prevTime + 1);
    }, 1000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const call = () => {
    // alert("hello")
    // router.reload();
    window.location.reload();
  };

  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <div className="w-8/12 flex m-auto justify-around max-lg:flex-col relative max-md:w-11/12">
          {!lobby ? (
            <div>
              {/* {videoSwitch ?  */}
              <video
                autoPlay
                className="border border-pink-200 max-lg:m-auto h-[75vh] w-full rounded-lg max-sm:h-[85vh]"
                style={{ transform: "scaleX(-1)" }}
                ref={remoteVideoRef}
              ></video>
            </div>
          ) : (
            <div className="border border-pink-200 max-lg:m-auto h-[75vh] w-full rounded-lg m-auto flex justify-center max-sm:h-[85vh]">
              <p className="flex flex-col justify-center">
                Waiting to connect you with someone!!
              </p>
            </div>
          )}

          <div className="absolute bottom-2 right-2">
            <video
              autoPlay
              className="border border-pink-200 max-lg:m-auto bg-blue-300 rounded-lg h-[150px] w-[200px] max-md:w-[100px]"
              style={{ objectFit: "cover", transform: "scaleX(-1)" }}
              ref={localVideoRef}
            ></video>
            {/* } */}
          </div>

          {/*============================ controllers =============================== */}
          <div className="absolute bottom-2 left-4">
            <div className="flex justify-center">
              <div
                onClick={toggleAudio}
                className={`${
                  isAudioMuted ? "bg-[#1f1d1d]" : "bg-[#f94d4d]"
                } max-sm:text-xs max-sm:p-2 p-4 mr-5 rounded-full`}
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
                  isVideoOff ? "bg-[#1f1d1d]" : "bg-[#f94d4d]"
                } max-sm:text-xs max-sm:p-2 p-4 mr-5 rounded-full`}
              >
                {!isVideoOff ? (
                  <Image
                    height={1000}
                    width={1000}
                    src={"/no-video.png"}
                    className={`w-[25px] ${
                      !isVideoOff ? "invert-[.15]" : "invert-[.55]"
                    } `}
                    alt=""
                  />
                ) : (
                  <Image
                    height={1000}
                    width={1000}
                    src={"/video-camera.png"}
                    className={`w-[25px] ${
                      !isVideoOff ? "invert-[.15]" : "invert-[.55]"
                    } `}
                    alt=""
                  />
                )}
              </div>
              <div>
                {!isScreenSharing ? (
                  <button
                    onClick={startScreenShare}
                    className="max-sm:text-xs max-sm:p-2 p-4 bg-blue-500 text-white rounded-full mr-4"
                  >
                    Share Screen
                  </button>
                ) : (
                  <button
                    onClick={stopScreenShare}
                    className="max-sm:text-xs max-sm:p-2 p-4 bg-red-500 text-white rounded-full mr-4"
                  >
                    Stop Sharing
                  </button>
                )}
                {/* <button className="p-4 bg-red-500 text-white rounded-full" onClick={() => {switchVideo()}}>switch</button> */}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-4">
            {!isRecording ? (
              <button
                className="px-2 bg-red-500 text-white rounded"
                onClick={() => {
                  startRecording();
                }}
              >
                Record
              </button>
            ) : (
              <button
                className="px-2 bg-red-500 text-white rounded-full"
                onClick={() => {
                  stopRecording();
                }}
              >
                recording...
              </button>
            )}
          </div>
          <div className="absolute bottom-3 right-9">
            <button
              className="p-2 bg-red-500 text-white rounded-full"
              onClick={() => {
                call();
              }}
            >
              <Image
                height={1000}
                width={1000}
                src={"/call.png"}
                className={`w-[25px] 
                     `}
                alt=""
              />
            </button>
          </div>
          <div className="absolute top-2 left-4">
            {!remoteVideoRef.current ? (
              ""
            ) : (
              <div>
                <p className="bg-[#090909a2] rounded-lg px-2">
                  {formatTime(sec)}
                </p>
              </div>
            )}
          </div>
        </div>
          <div className="flex justify-center mt-5 w-8/12 m-auto">
            {remotePrediction ? (
              <p className="bg-[#090909a2] rounded-lg px-2 text-white">
                {remotePrediction.userId} : {remotePrediction.prediction}
              </p>
            ) : (
              ""
            )}
          </div>
      </div>
    </div>
  );
};

export default Room;


interface PredictionData {
  prediction: string;
  userId: string;
}