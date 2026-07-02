import React, { useEffect } from 'react';
import { Modal } from 'antd';
import TrafficSignalForm, {TrafficSignal, TrafficSignalFormData} from './TrafficSignalForm';
import {
    useCreateTrafficSignal,
    useUpdateTrafficSignal
} from "@/app/components/Dashboard/Symbols/hooks/useTrafficSignals";



interface AddTrafficSignalModalProps {
    visible: boolean;
    onClose: () => void;
    initialValues?: TrafficSignal | null;
    isEdit?: boolean;
}

function AddTrafficSignalModal({
                                   visible,
                                   onClose,
                                   initialValues = null,
                                   isEdit = false
                               }: AddTrafficSignalModalProps) {
    const createMutation = useCreateTrafficSignal();
    const updateMutation = useUpdateTrafficSignal();
    const [formKey, setFormKey] = React.useState(0);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (visible) {
            setFormKey(prev => prev + 1);
        }
    }, [visible]);

    const handleSubmit = (values: TrafficSignalFormData) => {
        if (isEdit && initialValues) {
            updateMutation.mutate(
                { id: initialValues.id, ...values },
                {
                    onSuccess: () => {
                        onClose();
                    }
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{isEdit ? '✏️' : '🚦'}</span>
                    <span>{isEdit ? 'Edit Traffic Signal' : 'Add New Traffic Signal'}</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            destroyOnHidden
        >
            <TrafficSignalForm
                key={formKey}
                onSubmit={handleSubmit}
                loading={isLoading}
                initialValues={initialValues || {}}
                submitText={isEdit ? 'Update Signal' : 'Add Signal'}
            />
        </Modal>
    );
}

export default AddTrafficSignalModal;