"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LogOutIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function handleThemeToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <header className="grid h-14 grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-2 border-b px-4">
      <div className="flex items-center">
        <SidebarTrigger />
      </div>

      <form onSubmit={handleSearch} className="relative w-full" role="search">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search_query"
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-9"
        />
      </form>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleThemeToggle}
        >
          <SunIcon className="hidden dark:block" />
          <MoonIcon className="block dark:hidden" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
