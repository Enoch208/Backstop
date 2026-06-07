import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function RunLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#08080a] text-white">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <MobileNav />
        {children}
      </div>
    </div>
  );
}
