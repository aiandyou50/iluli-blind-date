import GlobalLayout from '@/components/GlobalLayout';

// Mock data - would come from API in real app
const mockProfile = {
  name: '코딩하는 라이언',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYnlEkO464FnfJszzldchVQ0eS-k6O0aQZdcsFlYNp8TZSTJlFxayqSDvSo226m5A_jaYhz68XI3QODZUGbfYYvM7HKeMA_IGIKvRmlryKGfsi2mUOThHOQsoHtBsbS2anQCPTgi814s2uUt1tAyBI9f3888JdsX45zec44F3EmSfVVc7RULpDghSVKo-M3gjL2FPocqOnsEgbGQOMJw1uJHYHJC7DZiCxFPb0aRdjEVGYy-Ob1gfc5AMyVpzAfhgRgGfp-0Roc8dB',
  tags: ['ENFP', '이루리대학교'],
  bio: 'A short biography or self-introduction about the user, describing their interests and personality. Passionate about coding and creating amazing web experiences.',
  photos: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDhde_hgtth5JiWXrSqYbDqyELrbLXNhC2ZBjzfQan-51Cuzv49jMzcOGJ0g-5_xdwdQP756L9BjCEVyuG0Oq125AaFZK17YHSvx6hCtzFg21G2Y1NgtWtMRL4u99pF9y5xDFKDMMI7Mg7iVFIctGNZV9wNe41S5UuDMfMuQzfQ9de7HRi16tad4ntYoggqWBaxkWZNVAwXvOD0nQ-C780uZaU3DXNazgUKprYdZcmuvSK6ESGlKzmeOPT1m_6OOhWFC4957idcmMe-',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBFRenkTta80s6b2srCKcn2CB6v1SZqpvgq1xxwoPK4wRn1nfJKovgxGgKE0JASz2aHIO8dzVCRx1JN3Mto3Z6ghVq18HGljBPaqScqoybSJ_nTten0J75bFS4bs1IybdvPlhOqrl97WVDTfryVd3lbrkc2JW7Ink2VWfhnNIC6X34c-eQ2tqz3XQAmFPx7GHAWjaFqh1fDVm6kJAKZpzkJTzz4cuCUvhZFSl21Ni7qI81ZgHRDgotU_Kj1Tklexp-mhf2pZNT8xw-9',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDw4imtVwX70ukcH-T7KeX9_CQDlznGM24ytzOfqprvQnuC2J71updH6Lx_Tye_6e_tjUp1KghkA-dk_iUIgxb2UK9izFT9Vas79fGqHpHaOkfPLpRV7MBB730LiTYDkLT8ian4LJ3DAF6Rc6rNYRwmegdlQy-scrnMDLkzbgS3lghrPHI-OYQSOJaW7c-uPaLJrvyjLwHCg82AIJ5TGJqDNqRXxmOMgqPm2Eaw1b9047L_SiyvMBgcAXYCnmU6uqdkstUJqxi0MGi3',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCIvTACsKqqyBkm3aOPHEzfUuHk716RxCa08Aj5g5j-5q6pMEqXqKWQNMfpxD_2-9LgEfm7NyOWPMFUfMV-wgD2qHudbWyGDThNE3N4k6DDLNuGyUZdPA3RgTW-2e92ULCo8uZHLsWfrGNYT8zETH9R_JpPc5_H_TDTEMrGkxm4RRP36SpIqFAQfzlIgcc_g07F76XL4EYYKNlEfOPyfRwSweVB6aJsf54IcO7-hpHwkOCAQybuKrl5GvXc8CBTFTeoqlGh2ApAcYdq',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA1f_9qtud0l_t6X-Ti30cqrXZ-RJ1zG1tvB8jLWVf-Jz_tlx_rP4y-dJztAvQzpxrf7n_EnRbcBnv9LlRzInB3fjyuBPU10aAJEP-INPnh3BpvqUEr4nSGTR0fXmVClIH-siV9x1rNUbc4_BraMSAp9tueTQEM8U8PE2QJKeHHZCViLslKsOyTrtvS0YEObZhb8XZQS40GEXdPNw9g2lRXpUohGk_J47uUWDeqPBhK1oafIzvXY6Cy2gtlvxYqxcY55VuomjuSq_uc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQO0BPn_QHyHMgrnfLHqWPX9XT4gvpcQlD2p-UurqS96ewuwkLlsQ49WYGsyp729ySUvszJPmlNrRu2be1puE71k5YuTUMwOrW3ffTGUoaLZXKpYw1GeNWiLsV6ld-tGpouVWbXbBAziNDLwMA9LXYw5e0TWZzR78ELyy_xlGoTFHgdsAa_zFxBXRbEYIWy7icKt_jinM765_vXvxJV9a6SE2bZiNAKUrKzqnx2nr_EzbPclLAflntbMNuso73UZlleEcraG_OZqgG',
  ],
};

export default function PublicProfilePage() {
  // Could use userId from URL params to fetch specific profile data
  // const { userId } = useParams<{ userId: string }>();

  return (
    <GlobalLayout>
      <div className="layout-content-container mx-auto flex max-w-2xl flex-col flex-1 px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col gap-4 items-start">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24"
            style={{ backgroundImage: `url("${mockProfile.avatar}")` }}
          ></div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-[#181011] dark:text-white text-2xl font-bold tracking-tight">
              {mockProfile.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2">
              {mockProfile.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-full bg-primary/20 px-3 py-1 text-primary text-xs font-bold"
                >
                  {tag}
                </div>
              ))}
            </div>
            
            <p className="text-[#8d5e63] dark:text-gray-300 text-base font-normal leading-relaxed pt-2">
              {mockProfile.bio}
            </p>
          </div>
          
          <button className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 transition-colors">
            <svg
              className="feather feather-instagram"
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="20" rx="5" ry="5" width="20" x="2" y="2"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
            <span>Instagram DM</span>
          </button>
        </div>

        {/* Section Header for Photos */}
        <h2 className="text-[#181011] dark:text-white text-lg font-bold tracking-tight pb-2 pt-8">
          Verified Photos
        </h2>

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-2">
          {mockProfile.photos.map((photo, index) => (
            <div key={index} className="flex flex-col">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded"
                style={{ backgroundImage: `url("${photo}")` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </GlobalLayout>
  );
}
