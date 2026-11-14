"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, Loader2 } from "lucide-react";
import { SearchInput } from "@/components/common/AppTable";
import { ServiceSelect } from "@/components/common/ServiceSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useDebounce from "@/hooks/app/useDebounce";
import {
  LOGS_QUERY_KEY,
  useGetLogs,
  type LogLine,
} from "@/hooks/queries/useLogs";
import { cn } from "@/lib/utils";

const DEFAULT_LIMIT = 200;
const MIN_LIMIT = 10;
const MAX_LIMIT = 1000;
const BOTTOM_THRESHOLD = 40;

function clampLimit(value: string) {
  const parsed = Number(value);
  if (!parsed) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(parsed)));
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function LogsModule() {
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lineLimit, setLineLimit] = useState(String(DEFAULT_LIMIT));
  const [isWrapped, setIsWrapped] = useState(true);
  const [isFollowing, setIsFollowing] = useState(true);
  const debounceSearch = useDebounce(search, 500);
  const debounceLimit = useDebounce(lineLimit, 500);
  const limit = clampLimit(debounceLimit);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetLogs({
      limit,
      search: debounceSearch,
      service_id: selectedService,
      isLive: isFollowing,
    });

  const lines: LogLine[] = data
    ? [...data.pages].reverse().flatMap((page) => page?.lines ?? [])
    : [];
  const showService = selectedService === null;
  const isEmpty = !isLoading && lines.length === 0;
  const emptyText = debounceSearch
    ? `No matches for "${debounceSearch}"`
    : "No logs yet";

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prevHeightRef.current !== null) {
      el.scrollTop += el.scrollHeight - prevHeightRef.current;
      prevHeightRef.current = null;
      return;
    }
    if (isFollowing) el.scrollTop = el.scrollHeight;
  }, [data]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsFollowing(distance < BOTTOM_THRESHOLD);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setIsFollowing(true);
  }

  function handleServiceChange(id: string | null) {
    setSelectedService(id);
    setIsFollowing(true);
  }

  function handleLimitChange(e: ChangeEvent<HTMLInputElement>) {
    setLineLimit(e.target.value.replace(/\D/g, ""));
    setIsFollowing(true);
  }

  function handleLimitBlur() {
    setLineLimit(String(clampLimit(lineLimit)));
  }

  async function loadOlder() {
    const el = scrollRef.current;
    if (!el) return;
    setIsFollowing(false);
    prevHeightRef.current = el.scrollHeight;
    const result = await fetchNextPage();
    if (result.isError) prevHeightRef.current = null;
  }

  function jumpToLatest() {
    setIsFollowing(true);
    if ((data?.pages.length ?? 0) > 1) {
      queryClient.resetQueries({ queryKey: [LOGS_QUERY_KEY] });
      return;
    }
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          search={search}
          setSearch={handleSearch}
          placeholder="Search log lines"
        />
        <ServiceSelect value={selectedService} onChange={handleServiceChange} />
        <div className="flex items-center gap-2">
          <Label htmlFor="line_limit" className="text-sm text-muted-foreground">
            Last
          </Label>
          <Input
            id="line_limit"
            inputMode="numeric"
            className="w-20"
            value={lineLimit}
            onChange={handleLimitChange}
            onBlur={handleLimitBlur}
          />
          <span className="text-sm text-muted-foreground">lines</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="wrap_lines"
            checked={isWrapped}
            onCheckedChange={(checked) => setIsWrapped(checked)}
          />
          <Label htmlFor="wrap_lines">Wrap lines</Label>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-16rem)] overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs"
        >
          {isLoading && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}

          {isEmpty && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {emptyText}
            </div>
          )}

          {!isLoading && lines.length > 0 && (
            <>
              <div className="mb-2 flex justify-center">
                {hasNextPage ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={loadOlder}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage && (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    )}
                    Load older
                  </Button>
                ) : (
                  <span className="text-muted-foreground">Start of logs</span>
                )}
              </div>

              {lines.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "flex gap-3 py-0.5",
                    !isWrapped && "w-max min-w-full",
                  )}
                >
                  <span className="shrink-0 text-muted-foreground">
                    {formatTimestamp(line.timestamp)}
                  </span>
                  {showService && (
                    <span className="shrink-0 text-primary">
                      {line.service_name}
                    </span>
                  )}
                  <span
                    className={cn(
                      "min-w-0 flex-1",
                      isWrapped
                        ? "whitespace-pre-wrap break-all"
                        : "whitespace-pre",
                    )}
                  >
                    {line.message}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {!isFollowing && lines.length > 0 && (
          <Button
            size="sm"
            className="absolute bottom-4 right-6 gap-1 shadow-md"
            onClick={jumpToLatest}
          >
            <ArrowDown size={14} />
            Jump to latest
          </Button>
        )}
      </div>
    </div>
  );
}
