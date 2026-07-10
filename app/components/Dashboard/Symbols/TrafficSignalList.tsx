import React, { useState } from "react";
import { Spin, Empty, Pagination } from "antd";
import TrafficSignalCard, {
  CategoryType,
  TrafficSignal,
} from "./TrafficSignalCard";
import TrafficSignalFilters from "./TrafficSignalFilters";
import {
  useDeleteTrafficSignal,
  useTrafficSignals,
} from "@/app/components/Dashboard/Symbols/hooks/useTrafficSignals";

interface TrafficSignalListProps {
  onEdit: (signal: TrafficSignal) => void;
}

function TrafficSignalList({ onEdit }: TrafficSignalListProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryType>("all");

  const { data, isLoading, isFetching, isError } = useTrafficSignals({
    page,
    limit,
    search,
    category,
  });

  const deleteMutation = useDeleteTrafficSignal();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleReset = () => {
    setSearch("");
    setCategory("all");
    setPage(1);
  };

  const signals = data?.data || [];
  const total = data?.pagination?.total || 0;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <Spin size="large" description="Loading traffic signals..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Empty
        description="Failed to load traffic signals"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: "100px" }}
      />
    );
  }

  if (signals.length === 0) {
    return (
      <>
        <TrafficSignalFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          onReset={handleReset}
          total={total}
          isFetching={isFetching}
        />
        <Empty
          description="No traffic signals found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: "100px" }}
        />
      </>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TrafficSignalFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        onReset={handleReset}
        total={total}
        isFetching={isFetching}
      />

      <div
        style={{
          flex: 1,
          minHeight: "500px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "12px",
          alignContent: "start",
          opacity: isFetching ? 0.6 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {signals.map((signal) => (
          <TrafficSignalCard
            key={signal.id}
            signal={signal}
            onEdit={onEdit}
            onDelete={handleDelete}
            loading={deleteMutation.isPending}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          paddingBottom: 8,
        }}
      >
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={(newPage, newPageSize) => {
            setPage(newPage);
            setLimit(newPageSize);
          }}
          showSizeChanger
          pageSizeOptions={["12", "24", "48", "96"]}
        />
      </div>
    </div>
  );
}

export default TrafficSignalList;
