"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { ClusterState, RunEvent } from "./types";

type Store = { id: string | null; events: RunEvent[] };

export function useRunStream(runId: string | null) {
  const [store, setStore] = useState<Store>({ id: null, events: [] });

  useEffect(() => {
    if (!runId) return;

    const source = new EventSource(`${API_BASE}/events/${runId}`);
    source.addEventListener("run", (raw) => {
      const event = JSON.parse((raw as MessageEvent).data) as RunEvent;
      setStore((prev) =>
        prev.id === runId
          ? { id: runId, events: [...prev.events, event] }
          : { id: runId, events: [event] },
      );
      if (event.kind === "done") source.close();
    });
    source.onerror = () => source.close();

    return () => source.close();
  }, [runId]);

  return store.id === runId ? store.events : [];
}

export function useClusterState() {
  const [state, setState] = useState<ClusterState | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let active = true;

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/state`);
        if (active) setState(await response.json());
      } catch {
        if (active) setState(null);
      }
      if (active) timer = setTimeout(poll, 2000);
    };

    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return state;
}
