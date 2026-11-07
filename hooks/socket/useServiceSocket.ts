"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getSocket } from "@/utils/socket";

type StatusPayload = { deployment_id: string; status: number };
type DeploymentItem = { id: string; status: number };

export function useServiceStatusSocket(
  service_id: string,
  setDeployments: Dispatch<SetStateAction<DeploymentItem[]>>,
) {
  useEffect(() => {
    const socket = getSocket();

    function joinServiceRoom() {
      socket.emit("join_service", service_id);
    }

    function handleStatus(payload: StatusPayload) {
      setDeployments((prev) =>
        prev.map((item) =>
          item.id === payload.deployment_id
            ? { ...item, status: payload.status }
            : item,
        ),
      );
    }

    socket.on("connect", joinServiceRoom);
    socket.on("deployment_status", handleStatus);

    if (socket.connected) joinServiceRoom();
    else socket.connect();

    return function () {
      socket.emit("leave", `service:${service_id}`);
      socket.off("connect", joinServiceRoom);
      socket.off("deployment_status", handleStatus);
    };
  }, [service_id, setDeployments]);
}
