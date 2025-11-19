import { Fragment, useState } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  userName: string;
  submittedAt: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function VerificationModal({
  isOpen,
  onClose,
  photoUrl,
  onApprove,
  onReject,
}: VerificationModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen) return null;

  const handleRejectClick = () => {
    if (showRejectInput && rejectionReason.trim()) {
      onReject(rejectionReason);
      setRejectionReason('');
      setShowRejectInput(false);
    } else {
      setShowRejectInput(true);
    }
  };

  return (
    <Fragment>
      <div className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex flex-col w-full max-w-lg bg-white dark:bg-background-dark rounded-lg shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Submission</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">
                close
              </span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 flex flex-col gap-6">
            {/* Image Display */}
            <div className="w-full gap-1 overflow-hidden bg-white aspect-[3/4] flex rounded-lg">
              <div
                className="w-full bg-center bg-no-repeat bg-cover aspect-auto flex-1"
                style={{ backgroundImage: `url("${photoUrl}")` }}
              ></div>
            </div>

            {/* Conditional Text Area for Rejection */}
            {showRejectInput && (
              <div className="flex flex-col min-w-40 flex-1">
                <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                  Rejection Reason
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary min-h-28 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal leading-normal"
                  placeholder="Please enter the reason for rejection."
                />
              </div>
            )}
          </div>

          {/* Modal Footer with Button Group */}
          <div className="flex flex-1 gap-3 flex-wrap px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 justify-end">
            <button
              onClick={handleRejectClick}
              disabled={showRejectInput && !rejectionReason.trim()}
              className={`flex min-w-[84px] items-center justify-center overflow-hidden rounded-full h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] ${
                showRejectInput && rejectionReason.trim()
                  ? 'cursor-pointer bg-danger text-white hover:bg-red-700 transition-colors'
                  : 'cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              <span className="truncate">
                {showRejectInput ? 'Confirm Rejection' : 'Reject'}
              </span>
            </button>
            <button
              onClick={onApprove}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-success text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-green-600 transition-colors"
            >
              <span className="truncate">Approve</span>
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
