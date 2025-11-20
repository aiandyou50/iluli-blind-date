import { Fragment } from 'react';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar: string;
  matchAvatar: string;
  hasInstagram?: boolean;
  onSendDM?: () => void;
}

export default function MatchModal({
  isOpen,
  onClose,
  userAvatar,
  matchAvatar,
  hasInstagram = true,
  onSendDM,
}: MatchModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60"></div>
      <div className="fixed inset-0 z-50 flex h-screen min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden items-center justify-center p-4">
        {/* Modal Container */}
        <div className="relative flex flex-col items-center justify-center bg-white dark:bg-[#221012] rounded-xl shadow-lg w-full max-w-sm p-8 text-center m-4">
          {/* Headline */}
          <div className="layout-content-container flex flex-col w-full">
            <h1 className="text-[#181111] dark:text-white tracking-light text-[32px] font-bold leading-tight text-center pb-3 pt-6">
              It's a Match!
            </h1>
          </div>

          {/* Avatar Group */}
          <div className="layout-content-container flex flex-col w-full">
            <div className="flex items-center justify-center px-4 py-6">
              <div className="relative -mr-5 z-10">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex items-center justify-center size-24 border-4 border-white dark:border-background-dark"
                  style={{ backgroundImage: `url("${userAvatar}")` }}
                ></div>
              </div>
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex items-center justify-center size-24 border-4 border-white dark:border-background-dark"
                  style={{ backgroundImage: `url("${matchAvatar}")` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Button Group */}
          <div className="layout-content-container flex flex-col w-full items-center">
            <div className="flex w-full flex-col items-stretch px-4 pt-4 pb-1">
              {hasInstagram ? (
                <button
                  onClick={onSendDM}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full"
                >
                  <span className="truncate">Send Instagram DM</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex min-w-[84px] cursor-not-allowed items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-base font-bold leading-normal tracking-[0.015em] w-full"
                >
                  <span className="truncate">Send Instagram DM</span>
                </button>
              )}
              
              {!hasInstagram && (
                <div className="layout-content-container flex flex-col w-full">
                  <p className="text-[#8a6064] dark:text-gray-400 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
                    Opponent has not registered Instagram.
                  </p>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-primary/20 dark:bg-primary/30 text-primary dark:text-white text-base font-bold leading-normal tracking-[0.015em] w-full mt-3"
              >
                <span className="truncate">Continue Exploring</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
