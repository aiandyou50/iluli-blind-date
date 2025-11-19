import GlobalLayout from '@/components/GlobalLayout';

export default function NewFeedPage() {
  return (
    <GlobalLayout>
      <div className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          <img
            className="mb-6 h-40 w-40 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBZhvWR_98xz39SIqcS8Cfv3QaYHaiDRH2T1dgWFojwl3LGmTiJlV8C6CxlKDclpHmCND6LVFEBCMgzs58zr0uwgw4p975GTjUpspGKHoWNnTxgeRu8WugopYF0CGfSnfWgmAsQuoRBrJuYPXbgxAMbyo3ze4WyRHdmfZK8pD0In_7CPpD8LA_zXapHmVhSM-wFg6RyBrXBY8usU8DDcRa_5aO2GtceqLwNeaA017C7Kk1yIHpAZW8WU3bxhyi9DiLzRJ3CEaAhfU7"
            alt="Cute illustration of two people talking"
          />
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to aiboop.org!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This is where the main content for each page will be displayed. This could be your
            profile, chat messages, or a list of potential matches.
          </p>
          <button className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Find Your Match
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Event News</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The festival starts tomorrow! Make sure your profile is ready.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Pro Tip</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add a fun fact to your bio to stand out.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">New Feature</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try our new photo filters for your profile picture!
            </p>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
}
