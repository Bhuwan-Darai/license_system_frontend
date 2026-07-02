import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

import {trafficSignalApi} from "@/app/components/Dashboard/Symbols/tranfficApi";

export const TRAFFIC_SIGNALS_QUERY_KEY = 'traffic-signals';

export interface TrafficSignal {
    id: number;
    image: string;
    nepaliText: string;
    englishText: string;
    category: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface TrafficSignalFormData {
    nepaliText: string;
    englishText: string;
    category: string;
    description?: string;
    image: string;
}

export interface PaginatedResponse {
    data: TrafficSignal[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetSignalsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export type CategoryType = 'all' | 'Mandatory' | 'Warning' | 'Informative' | 'Other';

export const CATEGORIES: CategoryType[] = ['all', 'Mandatory', 'Warning', 'Informative', 'Other'];

// Hook to fetch signals with pagination
export function useTrafficSignals(params: GetSignalsParams = {}) {
    return useQuery<PaginatedResponse>({
        queryKey: [TRAFFIC_SIGNALS_QUERY_KEY, params],
        queryFn: () => trafficSignalApi.getSignals(params),
        // keepPreviousData: true,
        staleTime: 5000,
    });
}

// Hook to create a new signal
export function useCreateTrafficSignal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TrafficSignalFormData) => trafficSignalApi.createSignal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TRAFFIC_SIGNALS_QUERY_KEY] });
            message.success('Traffic signal added successfully!');
        },
        onError: (error: any) => {
            message.error(error?.message || 'Failed to add traffic signal');
        },
    });
}

// Hook to update a signal
export function useUpdateTrafficSignal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: Partial<TrafficSignal> & { id: number }) =>
            trafficSignalApi.updateSignal({ id, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TRAFFIC_SIGNALS_QUERY_KEY] });
            message.success('Traffic signal updated successfully!');
        },
        onError: (error: any) => {
            message.error(error?.message || 'Failed to update traffic signal');
        },
    });
}

// Hook to delete a signal
export function useDeleteTrafficSignal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => trafficSignalApi.deleteSignal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TRAFFIC_SIGNALS_QUERY_KEY] });
            message.success('Traffic signal deleted successfully!');
        },
        onError: (error: any) => {
            message.error(error?.message || 'Failed to delete traffic signal');
        },
    });
}