import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Users,
  Settings,
  MessageCircle,
  Monitor,
  UserCheck,
} from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const ConferenceRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  const userName = searchParams.get("name") || "Anonymous";
  const isModerator = searchParams.get("moderator") === "true";

  // inject CSS untuk sembunyikan toolbar default Jitsi
useEffect(() => {
        const iframe = document.getElementById("jitsiConferenceFrame0");
     if (iframe) {
          (iframe as HTMLElement).style.display = "none";
        }
}, []);


  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => initializeJitsi();
    document.head.appendChild(script);

    return () => {
      if (api) api.dispose();
      document.head.removeChild(script);
    };
  }, [roomId]);

  const initializeJitsi = () => {
    if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
      const domain = "meet.ffmuc.net";
      const options = {
        roomName: roomId,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: userName },
        configOverwrite: {
      prejoinPageEnabled: false, // langsung join, no prejoin screen
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        disablePrejoinAudioPreview: true,
          enableLobby: true,
          resolution: 720,
          constraints: {
            video: { height: { ideal: 720, max: 720, min: 240 } },
          },
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [], // 🔥 buang semua tombol default
          TOOLBAR_ALWAYS_VISIBLE: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      };

      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(jitsiApi);

      jitsiApi.addEventListener("videoConferenceJoined", async () => {
        // aktifkan kamera otomatis
        const iframe = document.getElementById("jitsiConferenceFrame0");
        if (iframe) {
          (iframe as HTMLElement).style.display = "none";
        }
        // pin ke diri sendiri
        const participants = await jitsiApi.getParticipantsInfo();
        const local = participants.find((p) =>
          p.formattedDisplayName.includes(userName)
        );
        if (local) {
          jitsiApi.pinParticipant(local.participantId);
        }
      });

      jitsiApi.addEventListener("participantJoined", () =>
        setParticipantCount((p) => p + 1)
      );
      jitsiApi.addEventListener("participantLeft", () =>
        setParticipantCount((p) => Math.max(1, p - 1))
      );
      jitsiApi.addEventListener("audioMuteStatusChanged", (d: any) =>
        setIsAudioMuted(d.muted)
      );
      jitsiApi.addEventListener("videoMuteStatusChanged", (d: any) =>
        setIsVideoMuted(d.muted)
      );
      jitsiApi.addEventListener("videoConferenceLeft", () => navigate("/"));
    }
  };

  const toggleAudio = () => api?.executeCommand("toggleAudio");
  const toggleVideo = () => api?.executeCommand("toggleVideo");
  const leaveCall = () => {
    api?.dispose();
    navigate("/");
  };
  const toggleChat = () => api?.executeCommand("toggleChat");
  const toggleScreenShare = () => api?.executeCommand("toggleShareScreen");

  if (!roomId) return null;

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Logo kiri atas */}
      <div className="absolute top-4 left-4 z-40">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold">VideoMeet</span>
        </div>
      </div>

      {/* Participant counter kanan atas */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-4">
        {isModerator && (
          <div className="flex items-center gap-2 bg-green-600/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <UserCheck className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">Moderator</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <Users className="w-4 h-4 text-white" />
          <span className="text-white font-medium">{participantCount}</span>
        </div>
      </div>


      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default ConferenceRoom;
