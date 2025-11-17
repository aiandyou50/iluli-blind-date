import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useRef } from 'react';
import Header from './Header';
import ImageDisplay from './ImageDisplay';
import ActionButtons from './ActionButtons';
import RejectionForm from './RejectionForm';
import type { ModalProps } from './types';

/**
 * Admin Photo Approval Modal Component
 * 
 * Features:
 * - Accessibility: role="dialog", aria-labelledby, focus trap, ESC to close
 * - Responsive: Mobile (<= 480px), Tablet (~768px), Desktop (>= 1280px)
 * - Dark mode support
 * - Approve: Immediate close
 * - Reject: Shows form on first click, validates min 10 chars
 */
export default function AdminPhotoApprovalModal({
  photo,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ModalProps) {
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const focusRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowRejectionForm(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onClose]);

  if (!photo) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(photo.id);
      onClose();
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = () => {
    if (!showRejectionForm) {
      setShowRejectionForm(true);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setIsProcessing(true);
    try {
      await onReject(photo.id, reason);
      onClose();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectionForm(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={isProcessing ? () => {} : onClose}
        initialFocus={focusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl
                         transform overflow-hidden rounded-2xl 
                         bg-background-light dark:bg-background-dark
                         p-4 sm:p-6 lg:p-8
                         text-left align-middle shadow-google-lg 
                         transition-all"
                role="dialog"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
              >
                <div ref={focusRef} tabIndex={-1}>
                  <Header onClose={onClose} />
                  
                  <div id="modal-description" className="sr-only">
                    사진 승인 또는 거절을 처리할 수 있는 모달입니다.
                  </div>

                  <ImageDisplay photo={photo} />

                  <div className="mt-6">
                    {showRejectionForm ? (
                      <RejectionForm
                        onSubmit={handleRejectConfirm}
                        onCancel={handleRejectCancel}
                        isSubmitting={isProcessing}
                      />
                    ) : (
                      <ActionButtons
                        onApprove={handleApprove}
                        onReject={handleRejectClick}
                        isProcessing={isProcessing}
                      />
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
