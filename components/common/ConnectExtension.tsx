import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Puzzle, Check, ExternalLink, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTENSION_ID } from "@/constants";
import { useGetExtension } from "@/hooks/queries/useAuth";
import Link from "next/link";

declare global {
  interface Window {
    chrome?: any;
  }
}

type ConnectionStatus =
  | "checking"
  | "not_installed"
  | "not_connected"
  | "connected";

export default function ConnectExtensionButton() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const { mutate, isPending } = useGetExtension();

  function handleDisconnect() {
    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      {
        type: "DISCONNECT",
      },
      (response: any) => {
        const error = window.chrome.runtime.lastError;

        if (error) {
          console.error("DISCONNECT error:", error.message);
          toast.error("Couldn't disconnect extension");
          return;
        }

        if (!response?.ok) {
          toast.error("Couldn't disconnect extension");
          return;
        }

        setStatus("not_connected");
        toast.success("Extension disconnected");
      },
    );
  }

  function refreshStatus() {
    setStatus("checking");

    if (!window.chrome?.runtime) {
      console.log("Chrome runtime unavailable");
      setStatus("not_installed");
      return;
    }

    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      { type: "PING" },
      (response: any) => {
        const error = window.chrome.runtime.lastError;

        if (error) {
          setStatus("not_installed");
          return;
        }

        if (!response?.ok) {
          setStatus("not_connected");
          return;
        }

        setStatus(response.connected ? "connected" : "not_connected");
      },
    );
  }
  useEffect(() => {
    refreshStatus();
  }, []);

  function handleConnect() {
    mutate(undefined, {
      onSuccess: (data) => {
        if (!data || !data.data) {
          return toast.error("Error occured");
        }
        window.chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: "SYNC_AUTH",
            payload: {
              token: data.data,
            },
          },
          (response: any) => {
            const error = window.chrome.runtime.lastError;

            if (error) {
              toast.error("Couldn't connect to extension");
              return;
            }

            if (!response?.ok) {
              toast.error("Couldn't connect to extension");
              return;
            }

            setStatus("connected");
            toast.success("Extension connected");
          },
        );
      },
    });
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
      >
        {status === "checking" && (
          <Button variant="ghost" size="sm" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking extension...
          </Button>
        )}
        {status === "not_installed" && (
          <Button variant="outline" size="sm">
            <Link
              href={`https://microsoftedge.microsoft.com/addons/detail/fillire-resume-autofill/${EXTENSION_ID}`}
              // href={`https://chromewebstore.google.com/detail/${EXTENSION_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Install Extension
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
          </Button>
        )}

        {status === "connected" && (
          <Button
            variant="outline"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400"
            size="sm"
            onClick={handleDisconnect}
          >
            <Check className="h-3.5 w-3.5" />
            Connected
          </Button>
        )}

        {status === "not_connected" && (
          <Button
            variant="outline"
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-sm font-medium text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400"
            size="sm"
            onClick={handleConnect}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plug className="h-3.5 w-3.5" />
            )}
            {isPending ? "Connecting..." : "Connect Extension"}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
