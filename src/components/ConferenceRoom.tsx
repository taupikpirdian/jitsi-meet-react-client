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
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();

  const userName = user?.name || searchParams.get("name") || "Anonymous";
  const isModerator = Boolean(user?.isModerator);

  // Hapus penyembunyian iframe agar UI Jitsi (toolbar mic/camera) tampil
  // Jika ingin menyembunyikan toolbar default, gunakan config Jitsi bukan menyembunyikan seluruh iframe.


  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const script = document.createElement("script");
    const externalApiUrl =
      import.meta.env.VITE_JITSI_EXTERNAL_API_URL ||
      "https://meet.jit.si/external_api.js";
    script.src = externalApiUrl;
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
      const envDomain = import.meta.env.VITE_JITSI_DOMAIN;
      const externalApiUrlCfg =
        import.meta.env.VITE_JITSI_EXTERNAL_API_URL ||
        "https://meet.jit.si/external_api.js";
      let domain = envDomain;
      if (!domain) {
        try {
          const parsed = new URL(externalApiUrlCfg);
          domain = parsed.hostname; // derive domain from external_api url if env not set
        } catch {
          // ignore URL parse errors
        }
      }
      if (!domain) {
        console.warn("[Jitsi] VITE_JITSI_DOMAIN is not set; defaulting to meet.jit.si");
        domain = "meet.jit.si";
      }
      console.log("[Jitsi] Initializing with domain:", domain);
      const useJwtParam = searchParams.get("useJwt");
      const useJwt = (useJwtParam ?? import.meta.env.VITE_JITSI_USE_JWT ?? "true") === "true";
      const jwtParam = searchParams.get("jwt");
      const jwt = useJwt ? (jwtParam || import.meta.env.VITE_JITSI_JWT) : undefined;
      const options: any = {
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
          // Tampilkan tombol toolbar dasar
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "fullscreen",
            "hangup",
            "chat",
            "settings",
            "tileview",
          ],
        },
      };

      // Tambahkan JWT bila fitur aktif dan token tersedia
      if (jwt) {
        options.jwt = jwt;
      }

      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(jitsiApi);

      jitsiApi.addEventListener("videoConferenceJoined", async () => {
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
          <span className="text-white font-semibold">Live Team Media Stream</span>
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
