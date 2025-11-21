import { useTranslations } from 'next-intl';
import UserGreeting from '@/components/UserGreeting';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// Mock Data for Feed
const MOCK_FEED = [
  {
    id: 1,
    user: {
      name: "Lee Ji-eun",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu6SXoIDAgx0luxKvgutRyMQMiAgf2E08loXWIh1BwTeP5mtNNvv4sMuoPHl4UwAV1GASzOXxBiDf2beKZ5twfT3fObyaOQY7YhtdsXA0DtnoMMcrrxMS9IdMRtQo_I0GZrIGHwNAbO4ZqaE5OjuCR9sZMnuN_xI4wa2ETvCVKbH5zfItxZ9Z7YowVSKkU1_1bAkSxNUZnFJqXrq99pxuGyfyEv20gT29uQN8S83QH96saEf29h9ho0plbXXhLDv4VsidU4WsV8HPu"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs486KrIsJg1P8_6VOHW2EbIqOpxeFYQYUZ_Ag04vAXT_MqnytM_VMTwBnXnrs4pon7d1ZF9Any5xO-OyvULYTKqA0Cam-CZpufHBq8B_Ybq-zfie_PVW__IwujYIkF5oyeoQhR5MW7WNgFVB20adOAWJgYf2apqep--IGY-fKpOfaWA_JMLy2ASdGcKZQ7npCTuIcFGfoCvFNaisrZRQWWrg_siRyOORIYDfb8WxaCgEvOM1dNah8Mu8DYomItdGe2ILB250Td4VS",
    likes: 152,
    timeAgo: "1 hour ago"
  },
  {
    id: 2,
    user: {
      name: "Park Seo-joon",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRhLypar64sydzOPYaxC3qMosr_GOEzo3siOVj0m5SwOHQT1_Mu9P8e0tJvvKHoU0jDt3-zebbB5DDSM3u6K9WxeGqaqxhcOCAeYhmvGk6Ex1Q4lfwgbvr9PoVRinNmf8xqlIr_T9Rj_JfwllgKJ_8-MYaG7Tre5ukJTSo1OQ1jYayBRK9eJBe5zMDx3xevXrCL95p0zXDWTan_Wzg2F61eIrHcG-XUa_olMCn-VrwWjnYpPbQ00iXjRRyBwAefMmeRYDDl3-FMktW"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbq1yYBCLUeiD5FXXDCxlh57sVm7nj84zB7uLTGOopMh3ewr3RhvoFU5guigz8-bOv-mPo37tVPcJOcFWhR7oU20NF2lbmNqZ6onpLF7VjC6iU8a0cahVi69JELAAHl5oiLxnzuUyzKorDNxy_XWwZ1_p5NCLZ3ssq_vcgfmlQgUD6_OJPQZfNhb89w2HKojMbhlCBtksthV9vx4ROP9j5WJCvURlHljfMVSNRc8PJKkNNPY5F5JbuehgBiUwV6VqskS_JcravKnGr",
    likes: 89,
    timeAgo: "3 hours ago"
  }
];

export default function FeedPage() {
  const t = useTranslations('feed');

  return (
    <>
      <Header 
        rightAction={
          <select className="flex h-8 cursor-pointer items-center justify-center gap-x-2 rounded-full border-0 bg-primary/20 pl-4 pr-8 text-sm font-medium leading-normal text-primary ring-0 focus:ring-2 focus:ring-primary/50 dark:bg-primary/30">
            <option>Latest</option>
            <option>Oldest</option>
            <option>Likes</option>
            <option>Distance</option>
            <option>Random</option>
          </select>
        }
      />
      
      <main className="flex flex-col gap-4 p-2 md:p-4 pb-24">
        <UserGreeting />
        
        {MOCK_FEED.map((item) => (
          <div key={item.id} className="flex flex-col rounded-lg bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
            <a className="flex items-center gap-3 p-3" href="#">
              <img 
                className="h-10 w-10 rounded-full object-cover" 
                src={item.user.avatar} 
                alt={`Avatar of ${item.user.name}`} 
              />
              <p className="text-sm font-bold text-[#181011] dark:text-background-light">
                {item.user.name}
              </p>
            </a>
            <div className="relative w-full cursor-pointer">
              <img 
                className="w-full h-auto object-cover" 
                src={item.image} 
                alt={`Photo by ${item.user.name}`} 
              />
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <button className="group">
                  <span className="material-symbols-outlined text-3xl text-zinc-600 transition-colors group-hover:text-primary dark:text-zinc-400">
                    favorite
                  </span>
                </button>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {item.likes} likes
                </p>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </main>
      
      <BottomNav />
    </>
  );
}
