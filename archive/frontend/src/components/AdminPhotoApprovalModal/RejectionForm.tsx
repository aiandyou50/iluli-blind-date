import { useState, useEffect } from 'react';
import type { RejectionFormProps } from './types';

const MIN_REASON_LENGTH = 10;

/**
 * Rejection form component with validation
 * Validates minimum character length and manages form state
 */
export default function RejectionForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: RejectionFormProps) {
  const [reason, setReason] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(reason.trim().length >= MIN_REASON_LENGTH);
  }, [reason]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSubmit(reason.trim());
    }
  };

  const remainingChars = MIN_REASON_LENGTH - reason.trim().length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="rejection-reason" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          거절 사유 <span className="text-danger-500">*</span>
        </label>
        <textarea
          id="rejection-reason"
          name="rejection-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
          placeholder="거절 사유를 입력하세요 (최소 10자)"
          disabled={isSubmitting}
          aria-required="true"
          aria-invalid={reason.length > 0 && !isValid}
          aria-describedby="rejection-reason-hint"
        />
        <p 
          id="rejection-reason-hint" 
          className={`mt-2 text-sm ${
            remainingChars > 0 && reason.length > 0
              ? 'text-danger-600 dark:text-danger-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {reason.length > 0 && remainingChars > 0 
            ? `${remainingChars}자 더 입력해주세요`
            : `최소 ${MIN_REASON_LENGTH}자 이상 입력해주세요`
          }
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200
                   rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors font-medium
                   focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 px-4 py-3 bg-danger-500 text-white rounded-lg 
                   hover:bg-danger-600 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors font-medium
                   focus:outline-none focus:ring-2 focus:ring-danger-500"
        >
          {isSubmitting ? '처리 중...' : '거절 확인'}
        </button>
      </div>
    </form>
  );
}
