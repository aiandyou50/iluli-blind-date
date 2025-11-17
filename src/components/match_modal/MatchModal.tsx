import React from 'react';

interface UserInfo {
  profileImageUrl: string;
  instagramUrl?: string | null;
}

interface MatchModalProps {
  currentUser: UserInfo;
  matchedUser: UserInfo;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ currentUser, matchedUser, onClose }) => {
  const hasInstagram = !!matchedUser.instagramUrl;

  const handleDmClick = () => {
    if (hasInstagram) {
      window.open(matchedUser.instagramUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-full items-center justify-center bg-black/60 p-4">
      <div className="relative flex w-full max-w-sm flex-col items-center justify-center rounded-xl bg-white dark:bg-[#221012] p-8 text-center shadow-lg">
        <h1 className="pb-3 pt-6 text-center text-[32px] font-bold leading-tight tracking-light text-[#181111] dark:text-white">
          It's a Match!
        </h1>

        <div className="flex items-center justify-center px-4 py-6">
          <div className="relative -mr-5 z-10">
            <div
              className="size-24 rounded-full border-4 border-white bg-cover bg-center bg-no-repeat dark:border-background-dark"
              style={{ backgroundImage: `url("${currentUser.profileImageUrl}")` }}
            ></div>
          </div>
          <div className="relative">
            <div
              className="size-24 rounded-full border-4 border-white bg-cover bg-center bg-no-repeat dark:border-background-dark"
              style={{ backgroundImage: `url("${matchedUser.profileImageUrl}")` }}
            ></div>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch px-4 pt-4 pb-1">
          <button
            onClick={handleDmClick}
            disabled={!hasInstagram}
            className={`flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full px-5 text-base font-bold leading-normal tracking-[0.015em] w-full ${
              hasInstagram
                ? 'bg-primary text-white'
                : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="truncate">Send Instagram DM</span>
          </button>
          {!hasInstagram && (
            <p className="px-4 pt-1 pb-3 text-center text-sm font-normal leading-normal text-[#8a6064] dark:text-gray-400">
              Opponent has not registered Instagram.
            </p>
          )}
        </div>

        <div className="flex w-full flex-col items-stretch px-4 pt-1 pb-4">
           <button
            onClick={onClose}
            className="mt-3 flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/20 px-5 text-base font-bold leading-normal text-primary dark:bg-primary/30 dark:text-white"
          >
            <span className="truncate">Continue Exploring</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
