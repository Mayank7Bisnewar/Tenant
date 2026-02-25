import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthButton() {
    const { user, loginWithGoogle, logout } = useAuth();

    if (!user) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={loginWithGoogle}
                className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
                <LogIn className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Login</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted transition-colors p-0 overflow-hidden">
                    <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={user.photoURL || undefined} referrerPolicy="no-referrer" />
                        <AvatarFallback className="rounded-none bg-primary/10">
                            <UserIcon className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg min-w-[150px]">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground truncate max-w-[200px]">
                    {user.email}
                </div>
                <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
