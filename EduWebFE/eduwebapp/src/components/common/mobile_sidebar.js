import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../../shadcn/sheet"
import { Sidebar } from "./sidebar";


export const MobileSidebar = ({ isOpen, onToggle }) => {
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
            </SheetTrigger>
            <SheetContent isOpen={isOpen} closeSheet={onToggle} className="p-0 bg-white w-full">
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
};