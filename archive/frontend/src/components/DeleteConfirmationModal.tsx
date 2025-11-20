import { Fragment } from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 z-40 flex h-full w-full items-center justify-center bg-black/50 p-4">
        <div className="layout-container flex h-full grow flex-col justify-center">
          <div className="flex flex-1 justify-center items-center">
            <div className="layout-content-container flex flex-col max-w-sm flex-1 bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-6">
              <h3 className="text-[#181111] dark:text-white tracking-light text-2xl font-bold leading-tight text-center pb-2">
                사진 삭제
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base font-normal leading-normal pb-6 pt-1 text-center">
                이 사진을 정말 삭제하시겠습니까? 복구할 수 없습니다.
              </p>
              <div className="flex flex-col sm:flex-row justify-stretch gap-3">
                <button
                  onClick={onClose}
                  className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-zinc-200 dark:bg-zinc-800 text-[#181111] dark:text-white text-base font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">취소</span>
                </button>
                <button
                  onClick={onConfirm}
                  className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
