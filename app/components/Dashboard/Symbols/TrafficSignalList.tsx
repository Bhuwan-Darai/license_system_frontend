import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import { Grid } from 'react-window';
import TrafficSignalCard, {CategoryType, TrafficSignal} from './TrafficSignalCard';
import TrafficSignalFilters from './TrafficSignalFilters';
import { useDeleteTrafficSignal, useTrafficSignals } from '@/app/components/Dashboard/Symbols/hooks/useTrafficSignals';


interface TrafficSignalListProps {
    onEdit: (signal: TrafficSignal) => void;
}

function TrafficSignalList({ onEdit }: TrafficSignalListProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<CategoryType>('all');
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const { data, isLoading, isFetching, isError } = useTrafficSignals({
        page,
        limit,
        search,
        category
    });

    const deleteMutation = useDeleteTrafficSignal();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleReset = () => {
        setSearch('');
        setCategory('all');
        setPage(1);
    };

    const signals = data?.data || [];
    const total = data?.pagination?.total || 0;

    // Render individual card in virtual grid
    const Cell = useCallback(
        ({ columnIndex, rowIndex, style }: any) => {
            const columns = Math.max(1, Math.floor(dimensions.width / 340));
            const index = rowIndex * columns + columnIndex;
            const signal = signals[index];

            if (!signal) {
                return <div style={style} />;
            }

            return (
                <div style={{ ...style, padding: '12px' }}>
                    <TrafficSignalCard
                        signal={signal}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        loading={deleteMutation.isPending}
                    />
                </div>
            );
        },
        [signals, onEdit, handleDelete, deleteMutation.isPending, dimensions.width]
    );

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px'
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
                style={{ marginTop: '100px' }}
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
                    style={{ marginTop: '100px' }}
                />
            </>
        );
    }

    const columns = Math.max(1, Math.floor(dimensions.width / 340));
    const rowCount = Math.ceil(signals.length / columns);

    return (
        <div
            ref={containerRef}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <TrafficSignalFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                onReset={handleReset}
                total={total}
                isFetching={isFetching}
            />

            <div style={{ flex: 1, minHeight: '500px', width: '100%' }}>
                {dimensions.width > 0 && dimensions.height > 0 && (
                    <Grid
                        columnCount={columns}
                        columnWidth={340}
                        height={dimensions.height}
                        rowCount={rowCount}
                        rowHeight={380}
                        width={dimensions.width}
                        overscanRowCount={2}
                    >
                        {Cell}
                    </Grid>
                )}
            </div>
        </div>
    );
}

export default TrafficSignalList;