import { getSocket } from "@/utils/socket";
import { Dispatch, SetStateAction, useEffect } from "react";
type LogLine = { stream: string; line: string };
export function useServiceSocket(
  service_id: string,
  deployment_id: string,
  setLogs: Dispatch<SetStateAction<LogLine[]>>,
) {
  function JoinDeploySocket() {
    const socket = getSocket();

    function JoinDeployRoom() {
      socket.emit("join_deployment", { deployment_id, service_id });
    }

    function handleLogs(lines: LogLine[]) {
      setLogs((prev) => [...prev, ...lines]);
    }

    socket.on("connect", JoinDeployRoom);

    if (socket.connected) JoinDeployRoom();
    else socket.connect();

    return function () {
      socket.off("connect", JoinDeployRoom);
      socket.off("deploy_logs", handleLogs);
    };
  }

  useEffect(() => {
    JoinDeploySocket();
  }, [service_id, deployment_id]);
}
