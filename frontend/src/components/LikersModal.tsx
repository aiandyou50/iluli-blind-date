import { Fragment } from 'react';

interface Liker {
  id: string;
  name: string;
  avatar: string;
}

interface LikersModalProps {
  isOpen: boolean;
  onClose: () => void;
  likers: Liker[];
}

export default function LikersModal({ isOpen, onClose, likers }: LikersModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center bg-background-light p-4 dark:bg-background-dark">
        <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-neutral-900">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200/70 p-4 dark:border-neutral-700/50">
            <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              People who liked
            </h1>
            <button
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          
          <div className="flex h-96 flex-col overflow-y-auto">
            {likers.length > 0 ? (
              likers.map((liker) => (
                <a
                  key={liker.id}
                  href={`/profile/${liker.id}`}
                  className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex flex-1 items-center gap-4 overflow-hidden">
                      <div
                        className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url('${liker.avatar}')` }}
                      ></div>
                      <p className="truncate text-base font-medium text-neutral-800 dark:text-neutral-200">
                        {liker.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 dark:text-neutral-500">
                      <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <span className="material-symbols-outlined text-5xl text-neutral-400 dark:text-neutral-600">
                  favorite
                </span>
                <p className="mt-4 font-semibold text-neutral-700 dark:text-neutral-300">
                  No Likes Yet
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Be the first to like this photo!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
