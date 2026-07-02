import React from 'react';
import { Input, Select, Space, Button, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

export type CategoryType = 'all' | 'Mandatory' | 'Warning' | 'Informative' | 'Other';
export const CATEGORIES: CategoryType[] = ['all', 'Mandatory', 'Warning', 'Informative', 'Other'];


const { Option } = Select;

interface TrafficSignalFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    category: CategoryType;
    setCategory: (value: CategoryType) => void;
    onReset: () => void;
    total: number;
    isFetching?: boolean;
}

function TrafficSignalFilters({
                                  search,
                                  setSearch,
                                  category,
                                  setCategory,
                                  onReset,
                                  total,
                                  isFetching = false
                              }: TrafficSignalFiltersProps) {
    return (
        <Space wrap style={{ width: '100%', marginBottom: '16px' }} size="middle">
            <Input
                placeholder="Search by Nepali or English text..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '280px' }}
                allowClear
                size="middle"
            />

            <Select
                placeholder="Filter by category"
                value={category}
                onChange={(value) => setCategory(value as CategoryType)}
                style={{ width: '200px' }}
                size="middle"
            >
                {CATEGORIES.map(cat => (
                    <Option key={cat} value={cat}>
                        {cat === 'all' ? '📋 All Categories' : cat}
                    </Option>
                ))}
            </Select>

            <Button icon={<ReloadOutlined />} onClick={onReset}>
                Reset
            </Button>

            <Badge
                count={total}
                showZero
                style={{ marginLeft: 'auto' }}
                title="Total signals"
            >
        <span style={{ marginRight: '8px', color: '#666' }}>
          {isFetching ? 'Loading...' : 'Signals'}
        </span>
            </Badge>
        </Space>
    );
}

export default TrafficSignalFilters;