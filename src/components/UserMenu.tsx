import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, History, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserMenu = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const goToHistory = () => {
    window.location.href = '/history';
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm shadow-lg"
        >
          <User className="h-4 w-4 mr-2" />
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white/95 backdrop-blur-sm border-white/30 shadow-lg"
      >
        <DropdownMenuItem 
          onClick={goToHistory}
          className="cursor-pointer hover:bg-white/50"
        >
          <History className="h-4 w-4 mr-2" />
          History
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer hover:bg-white/50 text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;