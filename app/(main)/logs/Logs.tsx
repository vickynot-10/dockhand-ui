"use client";

import { SearchInput } from "@/components/common/AppTable";
import { ServiceSelect } from "@/components/common/ServiceSelect";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetLogs } from "@/hooks/queries/useLogs";
import { useState } from "react";

export default function LogsModule() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);
  const [page, setSelectedPage] = useState(1);

  const { data, isLoading } = useGetLogs({
    page,
    search: debounceSearch,
    service_id: selectedService,
  });

  function LoadMore() {
    setSelectedPage((prev) => prev + 1);
  }

  function handleSearch(value: string) {
    setSearch(value);
  }

  function handleServiceChange(id: string | null) {
    setSelectedService(id);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SearchInput
            search={search}
            setSearch={handleSearch}
            placeholder="Search Logs by service name"
          />
          <ServiceSelect
            value={selectedService}
            onChange={handleServiceChange}
          />
        </div>
      </div>
    </>
  );
}
