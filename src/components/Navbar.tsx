import { Link, NavLink, useNavigate } from "react-router-dom";
import { FileSearch, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-base ${
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero shadow-glow transition-base group-hover:scale-105">
            <FileSearch className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-tight">
              Tri<span className="text-primary">complex</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Tributos automáticos
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Início</NavLink>
          {isAuthenticated && (
            <NavLink to="/analise" className={navLinkClass}>Analisar NF-e</NavLink>
          )}
          <a href="/#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-base">
            Como funciona
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 hover:bg-accent-soft transition-base">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-accent text-xs font-bold text-accent-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/login?mode=signup">Criar conta</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container flex flex-col gap-4 py-4">
            <NavLink to="/" end className={navLinkClass} onClick={() => setOpen(false)}>Início</NavLink>
            {isAuthenticated && (
              <NavLink to="/analise" className={navLinkClass} onClick={() => setOpen(false)}>Analisar NF-e</NavLink>
            )}
            {isAuthenticated ? (
              <Button variant="outline" onClick={handleLogout}>Sair</Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">Entrar</Link></Button>
                <Button variant="hero" asChild><Link to="/login?mode=signup">Criar conta</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
