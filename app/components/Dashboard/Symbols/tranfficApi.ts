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

// Mock data store
let mockSignals: TrafficSignal[] = [
    {
        id: 1,
        image: '/signals/stop.jpg',
        nepaliText: 'रोकिनुहोस्',
        englishText: 'Stop',
        category: 'Mandatory',
        description: 'Vehicles must stop at this sign',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        image: '/signals/slow.jpg',
        nepaliText: 'ढिलो गर्नुहोस्',
        englishText: 'Slow Down',
        category: 'Warning',
        description: 'Reduce vehicle speed',
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        image: '/signals/no-entry.jpg',
        nepaliText: 'प्रवेश निषेध',
        englishText: 'No Entry',
        category: 'Mandatory',
        description: 'Vehicles are not allowed to enter',
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        image: '/signals/parking.jpg',
        nepaliText: 'पार्किंग',
        englishText: 'Parking',
        category: 'Informative',
        description: 'Parking area ahead',
        createdAt: new Date().toISOString()
    }
];

let nextId = 5;

// Helper functions
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const trafficSignalApi = {
    getSignals: async (params: GetSignalsParams = {}): Promise<PaginatedResponse> => {
        await delay(500); // Simulate network delay

        const { page = 1, limit = 12, search = '', category = 'all' } = params;

        let filtered = [...mockSignals];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(signal =>
                signal.nepaliText.includes(search) ||
                signal.englishText.toLowerCase().includes(searchLower) ||
                signal.category.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (category && category !== 'all') {
            filtered = filtered.filter(signal =>
                signal.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Sort by newest first
        filtered.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return {
            data: paginatedData,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    createSignal: async (signalData: TrafficSignalFormData): Promise<{ success: boolean; data: TrafficSignal }> => {
        await delay(300);

        const newSignal: TrafficSignal = {
            id: nextId++,
            ...signalData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockSignals.push(newSignal);
        return { success: true, data: newSignal };
    },

    updateSignal: async ({ id, ...updateData }: Partial<TrafficSignal> & { id: number }): Promise<{ success: boolean; data: TrafficSignal }> => {
        await delay(300);

        const index = mockSignals.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Signal not found');
        }

        mockSignals[index] = {
            ...mockSignals[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        return { success: true, data: mockSignals[index] };
    },

    deleteSignal: async (id: number): Promise<{ success: boolean }> => {
        await delay(300);

        const index = mockSignals.findIndex(s => s.id === id);
        if (index === -1) {
            throw new Error('Signal not found');
        }

        mockSignals = mockSignals.filter(s => s.id !== id);
        return { success: true };
    }
};