"use client";
import { useState, useCallback, useMemo } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import debounce from "lodash/debounce";

interface SingleSelectProps extends Omit<
  SelectProps,
  "options" | "onSearch" | "filterOption"
> {
  fetchOptions: (search: string) => Promise<any[]>;
  debounceTime?: number;
  placeholder?: string;
}

const SingleSelect = ({
  fetchOptions,
  debounceTime = 300,
  placeholder = "Search and select",
  ...props
}: SingleSelectProps) => {
  const [options, setOptions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (searchValue: string) => {
        if (!searchValue) {
          setOptions([]);
          setFetching(false);
          return;
        }

        setFetching(true);
        try {
          const result = await fetchOptions(searchValue);
          setOptions(result || []);
        } catch (error) {
          console.error("Failed to fetch options:", error);
          setOptions([]);
        } finally {
          setFetching(false);
        }
      }, debounceTime),
    [fetchOptions, debounceTime],
  );

  const handleSearch = useCallback(
    (value: string) => {
      debouncedFetch(value);
    },
    [debouncedFetch],
  );

  return (
    <Select
      showSearch={{
        filterOption: false,
        optionFilterProp: "label",
        onSearch: handleSearch,
      }}
      placeholder={placeholder}
      notFoundContent={
        fetching ? (
          <div style={{ textAlign: "center", padding: "8px" }}>
            <Spin size="small" /> Loading...
          </div>
        ) : null
      }
      options={options}
      loading={fetching}
      {...props}
    />
  );
};

export default SingleSelect;
