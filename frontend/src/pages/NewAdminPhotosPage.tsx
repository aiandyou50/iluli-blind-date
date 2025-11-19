import { useState } from 'react';
import VerificationModal from '@/components/VerificationModal';

interface PendingPhoto {
  id: string;
  thumbnail: string;
  fullImage: string;
  userName: string;
  submittedAt: string;
}

const mockPendingPhotos: PendingPhoto[] = [
  {
    id: '1',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyYys5pSqX4H47YTEy8mWl0-5e-h5o03YAx6CEVsmSlHj6N0_JCcA8-tekbgIW_Lg9gr5MXT5TyYRJkH7meGk9_WkKn4s-Tml3S63e2zHg-Qq5Gon6jjZYeNi4BARmXYU8idmHyuJU9FTuc0YBDsJyJyh5jfrDxEWuUBY8qS57v4wSWe6kgZcxuRUHuGqXov9jts6Jeaypeg4w9ztgFFpsiZB7kQinz5ytjNCT_CrGpWrLmsthOkRTxoxCOJCYvTQMKtxqCcge_Fz0',
    fullImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHAxrP57_pqg4U0F6ZGz95oyrdsbL26w1se6cBVuxwg0NrAK5JP6_K4PgC4-lT7StAE4TIQ6TJ10E2BuxVxTPcJ7-47Djp9wFwC6wdNWymGDlk9CN19GmTwoPMtpKUJSG_I7_lq9BFBvQDXp5RcnQyOfCYc5RRPiZMm7lDMkQdScuh-UjW6Vf25ClBdkGuIyAG0qB5yQ91QUnyDSK4gftTKvHar4mFbgpZdl5E3W5v4jcg2Vx25EUmA5idSU7obHE7-1oToX4NhSVn',
    userName: 'Korani',
    submittedAt: '2024-10-26 14:30',
  },
  {
    id: '2',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlHUpwvCoy8TWimbQpwl7rD_yTO_y2ZYaxcAf4u_RqtgNSIBsvlIHuPXLwukZ1MOTZb54E33qcqtZ2Ls-576EniP2biValO4I2Mz660n5BFRMfKPCmCkm1n-DIpdkaOzcaRwZ5wpsW0VHnyW5qdiVr-4LCj3oivo7IE-EXCgiuzYHlrXTamdAMi8lo39hKkOrxpnim3s4juv4zhbnrWv7Cy4Ej_aYtByCSa6drQBHTdH6SiXvoGohO9JcBTuM2mgt4U63l7268K90-',
    fullImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlHUpwvCoy8TWimbQpwl7rD_yTO_y2ZYaxcAf4u_RqtgNSIBsvlIHuPXLwukZ1MOTZb54E33qcqtZ2Ls-576EniP2biValO4I2Mz660n5BFRMfKPCmCkm1n-DIpdkaOzcaRwZ5wpsW0VHnyW5qdiVr-4LCj3oivo7IE-EXCgiuzYHlrXTamdAMi8lo39hKkOrxpnim3s4juv4zhbnrWv7Cy4Ej_aYtByCSa6drQBHTdH6SiXvoGohO9JcBTuM2mgt4U63l7268K90-',
    userName: 'Ryan',
    submittedAt: '2024-10-26 13:55',
  },
  {
    id: '3',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcZYywqziG4xso9SG-3K72PtSwEAG4lwghEQWnmES_rW0pCB1OCUsxzPq6DI-X-Tl8-Aw9DSZo-TF8mSOS_2YzwOe4J58ufAhaWLvUeWsS2hg6D1Lzn-mNzPm-eJe8QmMjvkXCAyl9CNEWfaboOYnsN1ui8kauCLKeyIyUJbYyELGGbOcdjm2eFEqHVAn5fPuxLyk3MRWtxQd0Kq8M7G-N-gDb4eNHpkbmqLDtaa1XVbnrCSJvUGKeLzF21xKklZTryWKEaQNnwZZz',
    fullImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcZYywqziG4xso9SG-3K72PtSwEAG4lwghEQWnmES_rW0pCB1OCUsxzPq6DI-X-Tl8-Aw9DSZo-TF8mSOS_2YzwOe4J58ufAhaWLvUeWsS2hg6D1Lzn-mNzPm-eJe8QmMjvkXCAyl9CNEWfaboOYnsN1ui8kauCLKeyIyUJbYyELGGbOcdjm2eFEqHVAn5fPuxLyk3MRWtxQd0Kq8M7G-N-gDb4eNHpkbmqLDtaa1XVbnrCSJvUGKeLzF21xKklZTryWKEaQNnwZZz',
    userName: 'Phoebe',
    submittedAt: '2024-10-26 12:10',
  },
];

export default function NewAdminPhotosPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<PendingPhoto | null>(null);
  const [photos, setPhotos] = useState(mockPendingPhotos);

  const handleApprove = () => {
    if (selectedPhoto) {
      setPhotos(photos.filter((p) => p.id !== selectedPhoto.id));
      setSelectedPhoto(null);
    }
  };

  const handleReject = (reason: string) => {
    if (selectedPhoto) {
      console.log('Rejecting photo with reason:', reason);
      setPhotos(photos.filter((p) => p.id !== selectedPhoto.id));
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex h-full min-w-0 flex-1">
        {/* Side Navigation */}
        <aside className="hidden md:flex md:flex-col md:w-64 flex-shrink-0 bg-white dark:bg-background-dark p-4 border-r border-gray-200 dark:border-gray-800">
          <div className="flex flex-col h-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDlcjTuEwDoCnz3FccE0A3ofJOL8bbECMSbmdw8j8Vu-dGxUJdYVv-PypJaVqA0CU05Efg3M_65X5oOfFFHQUuVKA1aO65WfsK95ZLFrkLTthvsCCcBWsRZ_-1Ta1ptjWn4CyLyxYieF4bjBhEXw8a7pXskAFSoOYzAnaH0y0x-IGFG9bYV4dieoMQ6Jk7uj7_POtu0LzDBTEuaBPsbpcAOTkXV00Ehk8iIuollaW4uTWyVL4wfe3UFiesc-aWVhNv4_a4LlAzGrihD")`,
                  }}
                ></div>
                <div className="flex flex-col">
                  <h1 className="text-[#181111] dark:text-white text-base font-medium leading-normal">
                    Admin
                  </h1>
                  <p className="text-[#8a6064] dark:text-gray-400 text-sm font-normal leading-normal">
                    aiboop.org
                  </p>
                </div>
              </div>
              <nav className="flex flex-col gap-2 mt-4">
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#181111] dark:text-gray-300 rounded hover:bg-primary/10"
                  href="/admin"
                >
                  <span className="material-symbols-outlined text-xl">dashboard</span>
                  <p className="text-sm font-medium leading-normal">Dashboard</p>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 rounded bg-primary/20 text-primary dark:text-primary"
                  href="/admin/photos"
                >
                  <span className="material-symbols-outlined text-xl">photo_library</span>
                  <p className="text-sm font-medium leading-normal">Photo Approval Management</p>
                </a>
                <a
                  className="flex items-center gap-3 px-3 py-2 text-[#181111] dark:text-gray-300 rounded hover:bg-primary/10"
                  href="/admin/users"
                >
                  <span className="material-symbols-outlined text-xl">group</span>
                  <p className="text-sm font-medium leading-normal">User Management</p>
                </a>
              </nav>
            </div>
            <div className="mt-auto flex flex-col gap-1">
              <a
                className="flex items-center gap-3 px-3 py-2 text-[#181111] dark:text-gray-300 rounded hover:bg-primary/10"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                <p className="text-sm font-medium leading-normal">Settings</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 text-[#181111] dark:text-gray-300 rounded hover:bg-primary/10"
                href="/"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <p className="text-sm font-medium leading-normal">Logout</p>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* Page Heading */}
            <header className="flex flex-wrap justify-between gap-3 p-4">
              <h1 className="text-[#181111] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                Photo Approval Pending List
              </h1>
            </header>

            {/* Table */}
            <section className="w-full">
              <div className="flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr className="text-left">
                      <th className="w-20 px-4 py-3 text-sm font-medium leading-normal text-[#181111] dark:text-gray-300">
                        Photo
                      </th>
                      <th className="w-1/3 px-4 py-3 text-sm font-medium leading-normal text-[#181111] dark:text-gray-300">
                        User Nickname
                      </th>
                      <th className="w-1/3 px-4 py-3 text-sm font-medium leading-normal text-[#181111] dark:text-gray-300">
                        Application Date/Time
                      </th>
                      <th className="w-60 px-4 py-3 text-sm font-medium leading-normal text-[#181111] dark:text-gray-300 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {photos.map((photo) => (
                      <tr
                        key={photo.id}
                        className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <td className="h-[72px] px-4 py-2">
                          <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded w-12"
                            style={{ backgroundImage: `url("${photo.thumbnail}")` }}
                          ></div>
                        </td>
                        <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal text-[#181111] dark:text-white">
                          {photo.userName}
                        </td>
                        <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal text-[#8a6064] dark:text-gray-400">
                          {photo.submittedAt}
                        </td>
                        <td className="h-[72px] px-4 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject('Manual rejection');
                              }}
                              className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-600"
                            >
                              Reject
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove();
                              }}
                              className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/90"
                            >
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pagination */}
            <nav className="flex items-center justify-center p-4">
              <a
                className="flex size-10 items-center justify-center text-[#181111] dark:text-gray-400 hover:bg-primary/10 rounded-full"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </a>
              <a
                className="text-sm font-bold leading-normal flex size-10 items-center justify-center text-white bg-primary rounded-full"
                href="#"
              >
                1
              </a>
              <a
                className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#181111] dark:text-gray-300 rounded-full hover:bg-primary/10"
                href="#"
              >
                2
              </a>
              <a
                className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#181111] dark:text-gray-300 rounded-full hover:bg-primary/10"
                href="#"
              >
                3
              </a>
              <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#181111] dark:text-gray-300 rounded-full">
                ...
              </span>
              <a
                className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#181111] dark:text-gray-300 rounded-full hover:bg-primary/10"
                href="#"
              >
                10
              </a>
              <a
                className="flex size-10 items-center justify-center text-[#181111] dark:text-gray-400 hover:bg-primary/10 rounded-full"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </a>
            </nav>
          </div>
        </main>
      </div>

      {/* Verification Modal */}
      {selectedPhoto && (
        <VerificationModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photoUrl={selectedPhoto.fullImage}
          userName={selectedPhoto.userName}
          submittedAt={selectedPhoto.submittedAt}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
