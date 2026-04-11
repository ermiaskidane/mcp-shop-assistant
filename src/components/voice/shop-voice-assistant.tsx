"use client";

import Vapi from "@vapi-ai/web";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { vapiAssistantId, vapiPublicKey } from "@/lib/env-public";

type TranscriptLine = {
  id: string;
  role: string;
  text: string;
};

function parseTranscriptMessage(message: unknown): TranscriptLine | null {
  if (!message || typeof message !== "object") return null;
  const m = message as Record<string, unknown>;
  if (m.type !== "transcript") return null;
  const text =
    typeof m.transcript === "string"
      ? m.transcript
      : typeof m.transcription === "string"
        ? m.transcription
        : null;
  if (!text?.trim()) return null;
  const role = typeof m.role === "string" ? m.role : "assistant";
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text: text.trim(),
  };
}

export function ShopVoiceAssistant() {
  const vapiRef = useRef<Vapi | null>(null);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const configured = Boolean(vapiPublicKey && vapiAssistantId);

  useEffect(() => {
    if (!configured) return;

    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    const onMessage = (message: unknown) => {
      const line = parseTranscriptMessage(message);
      if (line) {
        setLines((prev) => [...prev.slice(-80), line]);
      }
    };

    const onCallStart = () => {
      setActive(true);
      setError(null);
    };

    const onCallEnd = () => {
      setActive(false);
    };

    const onError = (e: unknown) => {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: unknown }).message)
          : String(e);
      setError(msg);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => {
      vapi.removeListener("call-start", onCallStart);
      vapi.removeListener("call-end", onCallEnd);
      vapi.removeListener("message", onMessage);
      vapi.removeListener("error", onError);
      void vapi.stop();
      vapiRef.current = null;
    };
  }, [configured]);

  const toggleCall = useCallback(async () => {
    if (!configured || !vapiRef.current) return;
    setError(null);
    try {
      if (active) {
        await vapiRef.current.stop();
      } else {
        setLines([]);
        await vapiRef.current.start(vapiAssistantId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start call");
    }
  }, [active, configured]);

  const toggleMute = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    const next = !muted;
    vapi.setMuted(next);
    setMuted(next);
  }, [muted]);

  if (!configured) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Voice assistant</CardTitle>
          <CardDescription>
            Add{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              NEXT_PUBLIC_VAPI_PUBLIC_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              NEXT_PUBLIC_VAPI_ASSISTANT_ID
            </code>{" "}
            to <code className="text-xs">.env.local</code>, then restart the dev
            server.
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-xs text-muted-foreground">
          Keys come from the Vapi dashboard. Use the public API key in the
          browser only.
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="font-heading text-lg">Shop voice assistant</CardTitle>
            <CardDescription>
              Powered by Vapi. Connect MCP tools in the dashboard so the agent can
              use your shop systems during calls.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Vapi + MCP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="lg"
            variant={active ? "destructive" : "default"}
            className="gap-2"
            onClick={() => void toggleCall()}
          >
            {active ? (
              <>
                <PhoneOff className="size-4" aria-hidden />
                End call
              </>
            ) : (
              <>
                <Phone className="size-4" aria-hidden />
                Start voice session
              </>
            )}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={!active}
            className="gap-2"
            onClick={toggleMute}
          >
            {muted ? (
              <>
                <MicOff className="size-4" aria-hidden />
                Unmute mic
              </>
            ) : (
              <>
                <Mic className="size-4" aria-hidden />
                Mute mic
              </>
            )}
          </Button>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Live transcript
          </p>
          <ScrollArea className="h-40 rounded-lg border bg-muted/30 p-3">
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {active
                  ? "Speak to see transcripts here…"
                  : "Start a session to talk with your shop assistant."}
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lines.map((line) => (
                  <li key={line.id}>
                    <span className="font-medium capitalize text-foreground">
                      {line.role}:
                    </span>{" "}
                    <span className="text-muted-foreground">{line.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">MCP:</strong> In the Vapi dashboard,
          add an MCP tool (Tools → Create → MCP) with your MCP server URL, then
          attach it to this assistant under Tools and publish. See{" "}
          <a
            href="https://docs.vapi.ai/tools/mcp"
            className="underline underline-offset-2 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            Vapi MCP docs
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
