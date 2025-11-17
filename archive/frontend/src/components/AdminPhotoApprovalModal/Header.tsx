import { XMarkIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onClose: () => void;
}

/**
 * Modal header component with close button
 * Implements accessibility with proper ARIA labels
 */
export default function Header({ onClose }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 
        id="modal-title" 
        className="text-xl font-semibold text-gray-900 dark:text-gray-100"
      >
        사진 승인 관리
      </h2>
      <button
        onClick={onClose}
        aria-label="모달 닫기"
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
