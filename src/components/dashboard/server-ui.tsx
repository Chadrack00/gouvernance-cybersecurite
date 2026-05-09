"use client";
export type typeServer = "ACTIVE" | "INACTIVE" | "MAINTENANCE"
export default function ServerUi({
  name,
  ip,
  status,
}: {
  name: string;
  ip: string;
  status: typeServer;
}) {

  const statusServer = (status: typeServer) => {
    switch (status) {
      case "ACTIVE":
        return "#22C55E";
      case "INACTIVE":
        return "#EF4444";
      case "MAINTENANCE":
        return "#F59E0B";
      default:
        return "#cccccc";
    }
  };


  return (
    <svg
      width="320"
      height="180"
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* // Ombre --> */}
      <rect
        x="32"
        y="24"
        width="256"
        height="132"
        rx="18"
        fill="#000"
        opacity="0.08"
      />

      {/* // Corps du serveur --> */}
      <rect x="24" y="16" width="256" height="132" rx="18" fill="#1E293B" />

      {/* // Header --> */}
      <rect x="24" y="16" width="256" height="38" rx="18" fill="#334155" />
      <rect x="24" y="36" width="256" height="18" fill="#334155" />

      {/* // Voyants --> */}
      <circle cx="48" cy="35" r="5" fill="#22C55E" />
      <circle cx="66" cy="35" r="5" fill="#FACC15" />
      <circle cx="84" cy="35" r="5" fill="#EF4444" />

      {/* // Nom serveur --> */}
      <text
        x="35"
        y="78"
        fill="#F8FAFC"
        fontSize="18"
        fontFamily="Arial"
        fontWeight="bold"
      >
        {name}
      </text>

      {/* // IP --> */}
      <text x="35" y="106" fill="#CBD5E1" fontSize="14" fontFamily="Arial">
        IP: {ip}
      </text>

      {/* // Etat --> */}
      <rect x="35" y="118" width="88" height="24" rx="12" fill={statusServer(status)} />

      <text
        x="55"
        y="134"
        fill="#DCFCE7"
        fontSize="13"
        fontFamily="Arial"
        fontWeight="bold"
      >
        {status}
      </text>

      {/* // Disques / slots --> */}
      <rect
        x="168"
        y="72"
        width="88"
        height="12"
        rx="4"
        fill="#475569"
        className="animate-pulse"
      />
      <rect
        x="168"
        y="92"
        width="88"
        height="12"
        rx="4"
        fill="#475569"
        className="animate-pulse"
      />
      <rect
        x="168"
        y="112"
        width="88"
        height="12"
        rx="4"
        fill="#475569"
        className="animate-pulse"
      />

      {/* // LEDs --> */}
      <circle cx="264" cy="78" r="3" fill="#22C55E" className="animate-pulse" />
      <circle cx="264" cy="98" r="3" fill="#22C55E" className="animate-pulse" />
      <circle
        cx="264"
        cy="118"
        r="3"
        fill="#22C55E"
        className="animate-pulse"
      />
    </svg>
  );
}
