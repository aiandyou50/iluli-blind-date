import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

/**
 * Action buttons component for approve/reject actions
 * Handles button state and accessibility
 */
export default function ActionButtons({ 
  onApprove, 
  onReject, 
  isProcessing,
  disabled = false
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onApprove}
        disabled={isProcessing || disabled}
        aria-label="사진 승인"
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 
                 bg-success-500 text-white rounded-lg 
                 hover:bg-success-600 active:bg-success-700
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors font-medium
                 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2
                 dark:focus:ring-offset-background-dark"
      >
        <CheckIcon className="w-5 h-5" />
        <span>{isProcessing ? '처리 중...' : '승인'}</span>
      </button>
      <button
        onClick={onReject}
        disabled={isProcessing || disabled}
        aria-label="사진 거절"
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 
                 bg-danger-500 text-white rounded-lg 
                 hover:bg-danger-600 active:bg-danger-700
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors font-medium
                 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2
                 dark:focus:ring-offset-background-dark"
      >
        <XMarkIcon className="w-5 h-5" />
        <span>거절</span>
      </button>
    </div>
  );
}
