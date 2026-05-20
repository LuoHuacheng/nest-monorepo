import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth";
import ThemeToggle from "@/components/ThemeToggle";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const initials = user?.name
    ? user.name.slice(0, 2)
    : (user?.username?.slice(0, 2)?.toUpperCase() ?? "AD");

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-5 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1.5 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-border/35" />
      <div className="flex-1" />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative size-8 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.username}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 size-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
