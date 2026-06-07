import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function RunLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#08080a] text-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}
