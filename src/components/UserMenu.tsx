import { Menu, LogIn, LogOut, User as UserIcon, Sun, Moon, Monitor } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
    const { user, loginWithGoogle, logout } = useAuth();
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted transition-colors relative">
                    <Menu className="h-5 w-5" />
                    {user && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-lg p-2">
                {user ? (
                    <>
                        <DropdownMenuLabel className="font-normal py-3 px-0">
                            <div className="flex items-center gap-1">
                                <Avatar className="h-10 w-10 border border-border/50 flex-none">
                                    <AvatarImage src={user.photoURL || undefined} referrerPolicy="no-referrer" />
                                    <AvatarFallback className="bg-primary/10">
                                        <UserIcon className="h-4 w-4 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <p className="text-sm font-bold leading-none truncate">{user.displayName || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
        {/* Sign In / Sign Out button */}
        {/* <Button
          variant="ghost"
          className="w-full mt-2 flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted transition-colors"
          onClick={user ? logout : loginWithGoogle}
        >
          {user ? (
            <>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </Button> */}
                    </>
                ) : (
                    <DropdownMenuItem
                        // onClick={loginWithGoogle}
                        // className="flex items-center gap-2 cursor-pointer rounded-lg font-semibold text-primary focus:bg-primary/5"
                    >
                        {/* <LogIn className="h-4 w-4" />
                        <span>Sign In</span> */}
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50 pb-1">
                    Theme
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2 cursor-pointer rounded-lg"
                >
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2 cursor-pointer rounded-lg"
                >
                    <Moon className="h-4 w-4 text-blue-500" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="flex items-center gap-2 cursor-pointer rounded-lg"
                >
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
