import { useCallback, useState } from 'react';

const useModal = (defaultOpen = false) => {
  const [open, setOpen] = useState(defaultOpen);

  const showModal = useCallback(() => {
    setOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return {
    open,
    showModal,
    hideModal,
    toggleModal,
    setOpen,
  };
};

export default useModal;