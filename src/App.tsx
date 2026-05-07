"use client";

import type { CSSProperties } from "react";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import {
  Archive,
  CircleArrowDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  House,
  Languages,
  Library,
  ListMusic,
  LogOut,
  Mic2,
  Music2,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";
import AddTrackModal from "./components/AddTrackModal";
import CoverImage from "./components/ui/CoverImage";
import Player from "./components/Player";
import { Button } from "./components/ui/button";
import { PlaylistProvider, usePlaylist } from "./context/PlaylistContext";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import type { Track, UserPlaylist } from "./types";

type AppView = "home" | "search" | "library" | "playlist" | "favorites" | "admin";
type HomeSectionId = "songs" | "artists" | "albums" | "radio" | "podcasts";
type AuthView = "login" | "register";
type SearchFilter =
  | "all"
  | "songs"
  | "playlists"
  | "albums"
  | "podcasts"
  | "artists"
  | "profiles"
  | "genres";

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      className={`w-full justify-start rounded-md px-3 text-sm transition ${
        active ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
      }`}
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      <Icon className="size-5" />
      {label}
    </Button>
  );
}

function TopNavbar({
  activeView,
  onNavigate,
  onOpenAuth,
  authReady,
  isAdmin,
  searchQuery,
  user,
  onSearchChange,
  onSignOut,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: (view: AuthView) => void;
  authReady: boolean;
  isAdmin: boolean;
  searchQuery: string;
  user: User | null;
  onSearchChange: (query: string) => void;
  onSignOut: () => void;
}) {
  const menuItems = ["Premium", "Támogatás", "Letöltés"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchCloseTimerRef = useRef<number | null>(null);
  const mobileSearchClearTimerRef = useRef<number | null>(null);
  const showExpandedMobileSearch = !user && mobileSearchOpen;
  const mobileAccountLinks: Array<{
    icon: LucideIcon;
    label: string;
    view: AppView;
    active: boolean;
  }> = [
    {
      icon: House,
      label: "Kezdőlap",
      view: "home",
      active: activeView === "home",
    },
    {
      icon: Search,
      label: "Keresés",
      view: "search",
      active: activeView === "search",
    },
    {
      icon: Library,
      label: "Könyvtárad",
      view: "library",
      active: activeView === "library" || activeView === "playlist",
    },
    {
      icon: Heart,
      label: "Kedvencek",
      view: "favorites",
      active: activeView === "favorites",
    },
  ];

  if (isAdmin) {
    mobileAccountLinks.push({
      icon: ShieldCheck,
      label: "Admin",
      view: "admin",
      active: activeView === "admin",
    });
  }

  function handleDropdownNavigate(view: AppView) {
    setDropdownOpen(false);
    onNavigate(view);
  }

  function openMobileSearch() {
    setMobileSearchOpen(true);
    onNavigate("search");
    window.setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function scheduleMobileSearchClose() {
    if (mobileSearchCloseTimerRef.current) {
      window.clearTimeout(mobileSearchCloseTimerRef.current);
    }

    mobileSearchCloseTimerRef.current = window.setTimeout(() => {
      if (!user) {
        setMobileSearchOpen(false);
      }
      searchInputRef.current?.blur();
      mobileSearchCloseTimerRef.current = null;
    }, 1200);
  }

  function scheduleMobileSearchClearOnBlur() {
    if (!user || !searchQuery.trim()) {
      return;
    }

    if (mobileSearchClearTimerRef.current) {
      window.clearTimeout(mobileSearchClearTimerRef.current);
    }

    mobileSearchClearTimerRef.current = window.setTimeout(() => {
      onSearchChange("");
      mobileSearchClearTimerRef.current = null;
    }, 1000);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setMobileSearchOpen(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (mobileSearchCloseTimerRef.current) {
        window.clearTimeout(mobileSearchCloseTimerRef.current);
      }
      if (mobileSearchClearTimerRef.current) {
        window.clearTimeout(mobileSearchClearTimerRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`sticky top-2 z-40 grid h-14 items-center gap-2 rounded-none bg-black px-3 text-white md:col-span-2 lg:flex lg:justify-between lg:gap-3 ${
        showExpandedMobileSearch
          ? "grid-cols-1"
          : "grid-cols-[56px_minmax(0,1fr)_56px] sm:grid-cols-[88px_minmax(0,1fr)_88px]"
      }`}
    >
      {!showExpandedMobileSearch && <div aria-hidden="true" className="lg:hidden" />}

      <div
        className={`flex min-w-0 items-center gap-2 lg:flex-1 lg:justify-start ${
          showExpandedMobileSearch ? "justify-center" : "justify-center"
        }`}
      >
        <button
          aria-label="WaveFlow"
          className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition ${
            showExpandedMobileSearch ? "w-0 scale-0 opacity-0 sm:w-10 sm:scale-100 sm:opacity-100" : ""
          }`}
          type="button"
          onClick={() => window.location.reload()}
        >
          <svg
            aria-hidden="true"
            className="size-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.25 8.7c4.55-1.38 9.55-.78 13.36 1.45"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.2"
            />
            <path
              d="M6.3 12.1c3.48-1.05 7.38-.58 10.31 1.12"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d="M7.2 15.35c2.54-.72 5.28-.42 7.49.86"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </button>

        <button
          aria-label="Kezdőlap"
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-[#2a2a2a] ${
            activeView === "home" ? "bg-[#2a2a2a]" : "bg-[#1f1f1f]"
          } ${showExpandedMobileSearch ? "w-0 scale-0 opacity-0 sm:w-12 sm:scale-100 sm:opacity-100" : ""}`}
          type="button"
          onClick={() => onNavigate("home")}
        >
          <House className="size-6" strokeWidth={2.7} />
        </button>

        {!user && !mobileSearchOpen && (
          <button
            aria-label="Keresés megnyitása"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-zinc-300 transition hover:bg-[#2a2a2a] hover:text-white sm:hidden"
            type="button"
            onClick={openMobileSearch}
          >
            <Search className="size-6" />
          </button>
        )}

        <div
          className={`h-12 min-w-0 items-center rounded-full bg-[#1f1f1f] text-zinc-400 ring-1 ring-transparent transition-all duration-300 focus-within:bg-[#242424] focus-within:ring-white/25 hover:bg-[#242424] ${
            !user && !mobileSearchOpen
              ? "hidden max-w-[480px] flex-1 pl-4 pr-2 sm:flex"
              : showExpandedMobileSearch
                ? "flex max-w-none flex-[1_1_100%] pl-4 pr-2"
                : "flex max-w-[480px] flex-1 pl-4 pr-2"
          }`}
        >
          <Search className="size-6 shrink-0" />
          <input
            ref={searchInputRef}
            aria-label="Keresés"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-white outline-none placeholder:text-zinc-300"
            placeholder="Mit szeretnél lejátszani?"
            type="text"
            value={searchQuery}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onNavigate("search");
              if (!user && event.target.value.trim()) {
                scheduleMobileSearchClose();
              }
            }}
            onFocus={() => {
              if (mobileSearchClearTimerRef.current) {
                window.clearTimeout(mobileSearchClearTimerRef.current);
                mobileSearchClearTimerRef.current = null;
              }
              onNavigate("search");
            }}
            onBlur={scheduleMobileSearchClearOnBlur}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onSearchChange("");
                setMobileSearchOpen(false);
                if (mobileSearchClearTimerRef.current) {
                  window.clearTimeout(mobileSearchClearTimerRef.current);
                  mobileSearchClearTimerRef.current = null;
                }
                return;
              }

              if (event.key === "Enter" && searchQuery.trim()) {
                setMobileSearchOpen(false);
                searchInputRef.current?.blur();
              }
            }}
          />
          {showExpandedMobileSearch && (
            <button
              aria-label={searchQuery ? "Keresés törlése" : "Keresés bezárása"}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSearchChange("");
                setMobileSearchOpen(false);
                if (mobileSearchCloseTimerRef.current) {
                  window.clearTimeout(mobileSearchCloseTimerRef.current);
                  mobileSearchCloseTimerRef.current = null;
                }
              }}
            >
              <X className="size-5" />
            </button>
          )}
          {searchQuery && (
            <button
              aria-label="Keresés törlése"
              className="hidden size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white sm:flex"
              type="button"
              onClick={() => {
                onSearchChange("");
                onNavigate("search");
              }}
            >
              <X className="size-5" />
            </button>
          )}
          <span className="mx-1 hidden h-6 w-px bg-zinc-500 sm:block" />
          <button
            aria-label="Könyvtár"
            className={`hidden size-9 shrink-0 items-center justify-center rounded-full transition hover:text-white sm:flex ${
              activeView === "library" ? "text-white" : "text-zinc-300"
            }`}
            type="button"
            onClick={() => onNavigate("library")}
          >
            <Archive className="size-5" />
          </button>
        </div>
      </div>

      <nav className="hidden shrink-0 items-center gap-4 text-sm font-bold text-zinc-400 lg:flex">
        {menuItems.map((item) => (
          <button
            key={item}
            className="transition hover:scale-105 hover:text-white"
            type="button"
          >
            {item}
          </button>
        ))}
        <span className="mx-2 h-6 w-px bg-white" />
        <button
          className="flex items-center gap-2 transition hover:scale-105 hover:text-white"
          type="button"
        >
          <CircleArrowDown className="size-4" />
          Alkalmazás telepítése
        </button>
      </nav>

      <div
        className={`shrink-0 items-center justify-end gap-2 ${
          showExpandedMobileSearch ? "hidden sm:flex" : "flex"
        }`}
      >
        {!authReady ? (
          <div aria-hidden="true" className="flex h-12 items-center gap-2">
            <div className="hidden h-10 w-24 animate-pulse rounded-full bg-white/10 md:block" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          </div>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              aria-label="Profil menü"
              className="flex size-10 items-center justify-center rounded-full bg-primary font-bold text-black transition hover:scale-105"
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              {user.email?.[0]?.toUpperCase() ?? "U"}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-12 z-50 min-w-[220px] overflow-hidden rounded-lg bg-[#282828] py-1 shadow-xl">
                <div className="border-b border-white/10 px-4 py-2 text-xs text-zinc-400 truncate">
                  {user.email}
                </div>
                <div className="border-b border-white/10 py-1 sm:hidden">
                  {mobileAccountLinks.map(({ active, icon: Icon, label, view }) => (
                    <button
                      key={view}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/10 ${
                        active ? "text-primary" : "text-white"
                      }`}
                      type="button"
                      onClick={() => handleDropdownNavigate(view)}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                  type="button"
                  onClick={() => { setDropdownOpen(false); onSignOut(); }}
                >
                  <LogOut className="size-4" />
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button
              className="hidden rounded-full px-4 font-bold text-zinc-300 hover:text-white md:inline-flex"
              type="button"
              variant="ghost"
              onClick={() => onOpenAuth("register")}
            >
              Regisztráció
            </Button>
            <Button
              className="h-10 rounded-full bg-white px-4 text-sm font-bold text-black hover:scale-105 hover:bg-white sm:h-12 sm:px-6 md:px-8"
              type="button"
              onClick={() => onOpenAuth("login")}
            >
              Bejelentkezés
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

function SidebarFooter() {
  const links = [
    "Jogi tudnivalók",
    "Biztonsági és adatvédelmi központ",
    "Adatvédelmi szabályzat",
    "Cookie-beállítások",
    "A reklámokról",
    "Kisegítő lehetőségek",
  ];

  return (
    <div className="mt-5 border-t border-white/5 px-3 pb-2 pt-5">
      <div className="flex flex-wrap gap-x-4 gap-y-3 text-[11px] leading-none text-zinc-400">
        {links.map((link) => (
          <button
            key={link}
            className="transition hover:text-white hover:underline"
            type="button"
          >
            {link}
          </button>
        ))}
        <button
          className="basis-full text-left font-bold text-white transition hover:underline"
          type="button"
        >
          Cookie-k
        </button>
      </div>

      <button
        className="mt-8 inline-flex h-9 items-center gap-2 rounded-full border border-zinc-500 px-3 text-sm font-bold text-white transition hover:scale-105 hover:border-white"
        type="button"
      >
        <Languages className="size-4" />
        Magyar
      </button>
    </div>
  );
}

function AuthPage({
  mode,
  onClose,
  onModeChange,
}: {
  mode: AuthView;
  onClose: () => void;
  onModeChange: (mode: AuthView) => void;
}) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Add meg az e-mail-címet és a jelszót.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    setLoading(true);

    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setInfo("Megerősítő e-mailt küldtünk. Ellenőrizd a postaládádat!");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Hibás e-mail-cím vagy jelszó.");
      } else {
        onClose();
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#121212] text-white">
      <button
        aria-label="Visszalépés"
        className="fixed right-6 top-6 flex size-11 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/20 hover:text-white"
        type="button"
        onClick={onClose}
      >
        <X className="size-6" />
      </button>

      <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center px-6 py-16">
        <div className="mb-5 flex size-9 items-center justify-center rounded-full bg-white text-black">
          <Music2 className="size-6" />
        </div>

        <h1 className="text-center text-5xl font-black leading-[1.15] tracking-tight">
          {isRegister
            ? "Regisztrálj a zenehallgatás elindításához"
            : "Jelentkezz be a WaveFlow-ba"}
        </h1>

        {error && (
          <p className="mt-6 w-full rounded-md bg-red-500/15 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
        {info && (
          <p className="mt-6 w-full rounded-md bg-primary/15 px-4 py-3 text-sm text-primary">
            {info}
          </p>
        )}

        <div className="mt-10 w-full space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">E-mail-cím</span>
            <input
              className="h-12 w-full rounded border border-zinc-500 bg-[#121212] px-3 text-base text-white outline-none transition placeholder:text-zinc-400 focus:border-white"
              placeholder="nev@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Jelszó</span>
            <input
              className="h-12 w-full rounded border border-zinc-500 bg-[#121212] px-3 text-base text-white outline-none transition placeholder:text-zinc-400 focus:border-white"
              placeholder="Jelszó"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {isRegister && (
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Jelszó megerősítése</span>
              <input
                className="h-12 w-full rounded border border-zinc-500 bg-[#121212] px-3 text-base text-white outline-none transition placeholder:text-zinc-400 focus:border-white"
                placeholder="Jelszó újra"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          )}

          <Button
            className="mt-4 h-12 w-full rounded-full bg-primary font-black text-black hover:scale-[1.02] hover:bg-primary"
            disabled={loading}
            type="button"
            onClick={handleSubmit}
          >
            {loading ? "Betöltés..." : isRegister ? "Regisztráció" : "Bejelentkezés"}
          </Button>
        </div>

        <div className="my-6 text-sm font-bold text-white">vagy</div>

        <div className="w-full space-y-2">
          <Button
            className="h-12 w-full justify-start rounded-full border border-zinc-500 bg-transparent px-7 text-white hover:border-white hover:bg-transparent"
            type="button"
            variant="outline"
            onClick={handleGoogle}
          >
            <span className="mr-4 flex items-center">
              <GoogleIcon />
            </span>
            {isRegister
              ? "Regisztráció Google-fiókkal"
              : "Folytatás Google-fiókkal"}
          </Button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-base text-zinc-400">
            {isRegister ? "Már van fiókod?" : "Nincs még fiókod?"}
          </p>
          <button
            className="mt-3 font-bold text-white underline-offset-4 hover:underline"
            type="button"
            onClick={() => onModeChange(isRegister ? "login" : "register")}
          >
            {isRegister ? "Bejelentkezés" : "Regisztráció"}
          </button>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

const searchFilters: Array<{ id: SearchFilter; label: string }> = [
  { id: "all", label: "Az összes" },
  { id: "songs", label: "Dalok" },
  { id: "playlists", label: "Műsorlisták" },
  { id: "albums", label: "Albumok" },
  { id: "podcasts", label: "Podcastok" },
  { id: "artists", label: "Előadók" },
  { id: "profiles", label: "Profilok" },
  { id: "genres", label: "Műfajok és hangulatok" },
];

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("hu-HU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchText(track: Track) {
  return normalizeSearchText(`${track.title} ${track.artist} ${track.genre}`);
}

function isPodcastTrack(track: Track) {
  return normalizeSearchText(track.genre).includes("podcast");
}

function getTrackKindLabel(track: Track) {
  return isPodcastTrack(track) ? "Podcast" : "Dal";
}

function formatDurationSeconds(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const rest = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
      rest < 10 ? "0" : ""
    }${rest}`;
  }

  return `${minutes}:${rest < 10 ? "0" : ""}${rest}`;
}

function formatSearchDuration(track: Track) {
  if (
    typeof track.durationSeconds === "number" &&
    Number.isFinite(track.durationSeconds) &&
    track.durationSeconds > 0
  ) {
    return formatDurationSeconds(track.durationSeconds);
  }

  const seconds = 125 + ((track.id * 37) % 142);

  return formatDurationSeconds(seconds);
}

function readAudioUrlDuration(src: string) {
  if (typeof Audio === "undefined") {
    return Promise.resolve<number | null>(null);
  }

  return new Promise<number | null>((resolve) => {
    const audio = new Audio();

    function cleanup() {
      audio.removeAttribute("src");
    }

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const seconds = Number.isFinite(audio.duration)
        ? Math.round(audio.duration)
        : null;
      cleanup();
      resolve(seconds && seconds > 0 ? seconds : null);
    };
    audio.onerror = () => {
      cleanup();
      resolve(null);
    };
    audio.src = src;
  });
}

function SearchPage({
  query,
  tracks,
  currentIndex,
  isPlaying,
  onPlayTrack,
  onQueryChange,
  onTogglePlay,
}: {
  query: string;
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onPlayTrack: (index: number) => void;
  onQueryChange: (query: string) => void;
  onTogglePlay: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
  const trimmedQuery = query.trim();
  const searchTokens = useMemo(
    () => normalizeSearchText(trimmedQuery).split(/\s+/).filter(Boolean),
    [trimmedQuery],
  );
  const matchingTracks = useMemo(() => {
    if (searchTokens.length === 0) {
      return tracks;
    }

    return tracks.filter((track) => {
      const haystack = getSearchText(track);
      return searchTokens.every((token) => haystack.includes(token));
    });
  }, [searchTokens, tracks]);
  const matchingSongs = useMemo(
    () => matchingTracks.filter((track) => !isPodcastTrack(track)),
    [matchingTracks],
  );
  const matchingPodcasts = useMemo(
    () => matchingTracks.filter(isPodcastTrack),
    [matchingTracks],
  );
  const topTrack = matchingTracks[0] ?? null;
  const matchingArtists = useMemo(
    () =>
      Array.from(new Map(matchingSongs.map((track) => [track.artist, track])).values()),
    [matchingSongs],
  );
  const matchingGenres = useMemo(
    () => Array.from(new Set(matchingSongs.map((track) => track.genre).filter(Boolean))),
    [matchingSongs],
  );

  function handleSelect(track: Track) {
    const trackIndex = tracks.findIndex((item) => item.id === track.id);

    if (trackIndex < 0) {
      return;
    }

    if (trackIndex === currentIndex && isPlaying) {
      onTogglePlay();
    } else {
      onPlayTrack(trackIndex);
    }
  }

  const showAll = activeFilter === "all";
  const showSongs = showAll || activeFilter === "songs";
  const showPodcasts = showAll || activeFilter === "podcasts";
  const showArtists = showAll || activeFilter === "artists";
  const showAlbums = showAll || activeFilter === "albums";
  const showGenres = showAll || activeFilter === "genres" || activeFilter === "playlists";
  const hasResults =
    activeFilter === "songs"
      ? matchingSongs.length > 0
      : activeFilter === "podcasts"
        ? matchingPodcasts.length > 0
        : matchingTracks.length > 0;

  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-2 sm:px-8">
      <div className="sticky top-0 z-20 -mx-5 bg-[#121212]/95 px-5 pb-6 pt-1 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {searchFilters.map((filter) => (
            <button
              key={filter.id}
              className={`h-8 shrink-0 rounded-full px-4 text-sm font-bold transition ${
                activeFilter === filter.id
                  ? "bg-white text-black"
                  : "bg-[#2a2a2a] text-white hover:bg-[#343434]"
              }`}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {!hasResults ? (
        <div className="pt-14">
          <h1 className="text-3xl font-black text-white">
            Nincs találat erre: {trimmedQuery}
          </h1>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-zinc-400">
            Próbálj másik címet, előadót vagy műfajt keresni.
          </p>
        </div>
      ) : (
        <>
          {showAll && topTrack && trimmedQuery && (
            <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(280px,400px)_minmax(360px,1fr)]">
              <section>
                <h2 className="mb-4 text-2xl font-black text-white">
                  Legjobb találat
                </h2>
                <button
                  className="group relative w-full rounded-lg bg-[#181818] p-5 text-left transition hover:bg-[#282828]"
                  type="button"
                  onClick={() => handleSelect(topTrack)}
                >
                  <div
                    className="relative flex size-24 items-center justify-center overflow-hidden rounded-md bg-zinc-800 shadow-xl"
                    style={{ backgroundColor: topTrack.cover ? undefined : topTrack.color }}
                  >
                    <CoverImage
                      src={topTrack.cover}
                      alt={`${topTrack.title} borító`}
                      fallback={<Music2 className="size-9 text-white/70" />}
                    />
                  </div>
                  <h3 className="mt-6 truncate text-3xl font-black text-white">
                    {topTrack.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-400">
                    <span className="rounded-sm bg-zinc-400 px-1 text-[10px] font-black leading-4 text-black">
                      E
                    </span>
                    <span>{getTrackKindLabel(topTrack)}</span>
                    <span>•</span>
                    <span className="text-white">{topTrack.artist}</span>
                  </p>
                  <span className="absolute bottom-5 right-5 flex size-12 translate-y-3 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.45)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    {tracks[currentIndex]?.id === topTrack.id && isPlaying ? (
                      <Pause className="size-5 fill-black" />
                    ) : (
                      <Play className="ml-0.5 size-5 fill-black" />
                    )}
                  </span>
                </button>
              </section>

              {matchingSongs.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-black text-white">Dalok</h2>
                  <div className="space-y-1">
                    {matchingSongs.slice(0, 5).map((track) => {
                      const active = tracks[currentIndex]?.id === track.id;

                      return (
                        <button
                          key={track.id}
                          className="grid w-full grid-cols-[48px_minmax(0,1fr)_52px] items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-white/10"
                          type="button"
                          onClick={() => handleSelect(track)}
                        >
                          <span
                            className="relative flex size-10 items-center justify-center overflow-hidden rounded bg-zinc-800"
                            style={{ backgroundColor: track.cover ? undefined : track.color }}
                          >
                            <CoverImage
                              src={track.cover}
                              alt={`${track.title} borító`}
                              fallback={<Music2 className="size-5 text-zinc-500" />}
                            />
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block truncate text-base font-bold ${
                                active ? "text-primary" : "text-white"
                              }`}
                            >
                              {track.title}
                            </span>
                            <span className="mt-0.5 flex min-w-0 items-center gap-1 text-sm font-semibold text-zinc-400">
                              <span className="rounded-sm bg-zinc-400 px-1 text-[10px] font-black leading-4 text-black">
                                E
                              </span>
                              <span className="truncate">{track.artist}</span>
                            </span>
                          </span>
                          <span className="justify-self-end text-sm font-semibold text-zinc-400">
                            {formatSearchDuration(track)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}

          {showSongs && (!showAll || !trimmedQuery) && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-black text-white">Dalok</h2>
              <div className="space-y-1">
                {matchingSongs.map((track) => {
                  const active = tracks[currentIndex]?.id === track.id;

                  return (
                    <button
                      key={track.id}
                      className="grid w-full grid-cols-[48px_minmax(0,1fr)_52px] items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-white/10"
                      type="button"
                      onClick={() => handleSelect(track)}
                    >
                      <span
                        className="relative flex size-10 items-center justify-center overflow-hidden rounded bg-zinc-800"
                        style={{ backgroundColor: track.cover ? undefined : track.color }}
                      >
                        <CoverImage
                          src={track.cover}
                          alt={`${track.title} borító`}
                          fallback={<Music2 className="size-5 text-zinc-500" />}
                        />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-base font-bold ${
                            active ? "text-primary" : "text-white"
                          }`}
                        >
                          {track.title}
                        </span>
                        <span className="block truncate text-sm font-semibold text-zinc-400">
                          {track.artist}
                        </span>
                      </span>
                      <span className="justify-self-end text-sm font-semibold text-zinc-400">
                        {formatSearchDuration(track)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {showPodcasts && matchingPodcasts.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-black text-white">Podcastok</h2>
              <div className="space-y-1">
                {matchingPodcasts.map((track) => {
                  const active = tracks[currentIndex]?.id === track.id;

                  return (
                    <button
                      key={track.id}
                      className="grid w-full grid-cols-[48px_minmax(0,1fr)_52px] items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-white/10"
                      type="button"
                      onClick={() => handleSelect(track)}
                    >
                      <span
                        className="relative flex size-10 items-center justify-center overflow-hidden rounded bg-zinc-800"
                        style={{ backgroundColor: track.cover ? undefined : track.color }}
                      >
                        <CoverImage
                          src={track.cover}
                          alt={`${track.title} borító`}
                          fallback={<Mic2 className="size-5 text-zinc-500" />}
                        />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-base font-bold ${
                            active ? "text-primary" : "text-white"
                          }`}
                        >
                          {track.title}
                        </span>
                        <span className="block truncate text-sm font-semibold text-zinc-400">
                          {track.artist}
                        </span>
                      </span>
                      <span className="justify-self-end text-sm font-semibold text-zinc-400">
                        {formatSearchDuration(track)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {showArtists && matchingArtists.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-black text-white">Előadók</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
                {matchingArtists.slice(0, showAll ? 8 : undefined).map((track) => {
                  const trackIndex = tracks.findIndex((item) => item.id === track.id);

                  return (
                    <ArtistCard
                      key={track.artist}
                      active={trackIndex === currentIndex}
                      isPlaying={isPlaying}
                      track={track}
                      onSelect={() => handleSelect(track)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {showAlbums && matchingSongs.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-black text-white">Albumok</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
                {matchingSongs.slice(0, showAll ? 8 : undefined).map((track) => (
                  <SongCard
                    key={track.id}
                    active={tracks[currentIndex]?.id === track.id}
                    isPlaying={isPlaying}
                    track={track}
                    onSelect={() => handleSelect(track)}
                  />
                ))}
              </div>
            </section>
          )}

          {showGenres && matchingGenres.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-black text-white">
                Műfajok és hangulatok
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4">
                {matchingGenres.slice(0, 10).map((genre, index) => (
                  <button
                    key={genre}
                    className="h-28 overflow-hidden rounded-lg p-4 text-left text-xl font-black text-white transition hover:scale-[1.02]"
                    style={{
                      backgroundColor:
                        tracks[index % Math.max(tracks.length, 1)]?.color ?? "#1ed760",
                    }}
                    type="button"
                    onClick={() => onQueryChange(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>
          )}

          {!showSongs &&
            !showPodcasts &&
            !showArtists &&
            !showAlbums &&
            !showGenres && (
              <div className="pt-14">
                <h1 className="text-3xl font-black text-white">
                  Ebben a kategóriában nincs találat
                </h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-zinc-400">
                  A helyi könyvtárban jelenleg dalok, előadók, albumok és műfajok
                  kereshetők.
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  onShowAll,
}: {
  title: string;
  onShowAll?: () => void;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="truncate text-2xl font-black tracking-tight text-white">
        {title}
      </h2>
      <button
        className="shrink-0 text-sm font-bold text-zinc-400 transition hover:text-white hover:underline"
        type="button"
        onClick={onShowAll}
      >
        Összes
      </button>
    </div>
  );
}

function CarouselSection({
  title,
  onShowAll,
  children,
}: {
  title: string;
  onShowAll?: () => void;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollButtons(row = rowRef.current) {
    if (!row) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = row.scrollWidth - row.clientWidth;
    setCanScrollLeft(row.scrollLeft > 2);
    setCanScrollRight(row.scrollLeft < maxScroll - 2);
  }

  useEffect(() => {
    const row = rowRef.current;

    if (!row) {
      return;
    }

    updateScrollButtons(row);

    const resizeObserver = new ResizeObserver(() => updateScrollButtons(row));
    resizeObserver.observe(row);

    return () => resizeObserver.disconnect();
  }, [children]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    updateScrollButtons(event.currentTarget);
  }

  function scrollRow(direction: "left" | "right") {
    const row = rowRef.current;

    if (!row) {
      return;
    }

    const distance = Math.max(260, row.clientWidth * 0.82);
    row.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });

    window.setTimeout(() => updateScrollButtons(row), 280);
  }

  return (
    <section className="group/section mb-14">
      <SectionHeader title={title} onShowAll={onShowAll} />
      <div className="relative">
        <button
          aria-label={`${title} balra`}
          className={`absolute left-0 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/80 text-white opacity-0 shadow-xl transition hover:scale-105 hover:bg-black group-hover/section:flex group-hover/section:opacity-100 ${
            canScrollLeft ? "" : "pointer-events-none group-hover/section:hidden"
          }`}
          type="button"
          onClick={() => scrollRow("left")}
        >
          <ChevronLeft className="size-6" />
        </button>

        <div
          ref={rowRef}
          className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-3 pr-12"
          onScroll={handleScroll}
        >
          {children}
        </div>

        <button
          aria-label={`${title} jobbra`}
          className={`absolute right-0 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/80 text-white opacity-0 shadow-xl transition hover:scale-105 hover:bg-black group-hover/section:flex group-hover/section:opacity-100 ${
            canScrollRight ? "" : "pointer-events-none group-hover/section:hidden"
          }`}
          type="button"
          onClick={() => scrollRow("right")}
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </section>
  );
}

function SongCard({
  track,
  active,
  isPlaying,
  onSelect,
}: {
  track: Track;
  active?: boolean;
  isPlaying?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className="group w-[196px] shrink-0 rounded-md p-3 text-left transition duration-200 hover:bg-[#1f1f1f]"
      type="button"
      onClick={onSelect}
    >
      <div className={`relative aspect-square rounded-md bg-zinc-800 shadow-xl transition duration-200 ${active && isPlaying ? "ring-2 ring-primary" : ""}`}>
        <CoverImage
          src={track.cover}
          alt={`${track.title} borító`}
          className="rounded-md transition duration-300 group-hover:scale-105"
          fallback={
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: track.color }}
            >
              <Music2 className="size-10 text-white/70" />
            </div>
          }
        />
        <span className="absolute -bottom-2 -right-2 z-10 flex size-12 translate-y-3 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.45)] transition duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {active && isPlaying ? (
            <Pause className="size-5 fill-black" />
          ) : (
            <Play className="ml-0.5 size-5 fill-black" />
          )}
        </span>
      </div>
      <p
        className={`mt-3 truncate text-base font-bold ${
          active ? "text-primary" : "text-white"
        }`}
      >
        {track.title}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-400">
        {track.artist}
      </p>
    </button>
  );
}

function ArtistCard({
  track,
  active,
  isPlaying,
  onSelect,
}: {
  track: Track;
  active?: boolean;
  isPlaying?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className="group w-[196px] shrink-0 rounded-md p-3 text-left transition duration-200 hover:bg-[#1f1f1f]"
      type="button"
      onClick={onSelect}
    >
      <div className={`relative aspect-square rounded-full bg-zinc-800 shadow-xl transition duration-200 ${active && isPlaying ? "ring-2 ring-primary" : ""}`}>
        <CoverImage
          src={track.cover}
          alt={track.artist}
          className="rounded-full transition duration-300 group-hover:scale-105"
          fallback={
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: track.color }}
            >
              <Music2 className="size-10 text-white/70" />
            </div>
          }
        />
        <span className="absolute -bottom-2 -right-2 z-10 flex size-12 translate-y-3 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.45)] transition duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {active && isPlaying ? (
            <Pause className="size-5 fill-black" />
          ) : (
            <Play className="ml-0.5 size-5 fill-black" />
          )}
        </span>
      </div>
      <p className="mt-4 truncate text-base font-bold text-white">
        {track.artist}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-400">Előadó</p>
    </button>
  );
}

function RadioCard({
  track,
  index,
  active,
  isPlaying,
  onSelect,
}: {
  track: Track;
  index: number;
  active?: boolean;
  isPlaying?: boolean;
  onSelect: () => void;
}) {
  const palettes = [
    "from-[#a5a2ff] to-[#c9a7ff]",
    "from-[#ff8da1] to-[#f8a1cb]",
    "from-[#79e1d1] to-[#a8f0df]",
    "from-[#f092cf] to-[#cc78f1]",
    "from-[#fbd36a] to-[#f48b66]",
  ];

  return (
    <button
      className="group w-[196px] shrink-0 rounded-md p-3 text-left transition duration-200 hover:bg-[#1f1f1f]"
      type="button"
      onClick={onSelect}
    >
      <div
        className={`relative aspect-square rounded-md bg-gradient-to-br ${
          palettes[index % palettes.length]
        } p-3 text-black shadow-xl transition duration-200 ${active && isPlaying ? "ring-2 ring-primary" : ""}`}
      >
        <span className="absolute left-3 top-3 flex size-4 items-center justify-center rounded-full bg-black text-white">
          <Music2 className="size-3" />
        </span>
        <span className="absolute right-3 top-3 text-xs font-black uppercase tracking-[0.2em]">
          Rádió
        </span>
        <div className="absolute inset-x-0 top-14 flex items-center justify-center">
          <div className="relative size-20 overflow-hidden rounded-full border-4 border-black/10 shadow-xl">
            <CoverImage
              src={track.cover}
              alt={`${track.artist} rádió`}
              fallback={<div style={{ backgroundColor: track.color }} className="h-full w-full" />}
            />
          </div>
        </div>
        <p className="absolute bottom-4 left-3 right-3 truncate text-2xl font-black">
          {track.artist}
        </p>
        <span className="absolute -bottom-2 -right-2 z-10 flex size-12 translate-y-3 items-center justify-center rounded-full bg-primary text-black opacity-0 shadow-[0_8px_18px_rgba(0,0,0,0.45)] transition duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          {active && isPlaying ? (
            <Pause className="size-5 fill-black" />
          ) : (
            <Play className="ml-0.5 size-5 fill-black" />
          )}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-zinc-400">
        {track.genre}, {track.artist} és továbbiak...
      </p>
    </button>
  );
}

function HomePage({
  tracks,
  currentIndex,
  isPlaying,
  activeSection,
  onShowAll,
  onPlayTrack,
  onTogglePlay,
  scrollRef,
}: {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  activeSection: HomeSectionId | null;
  onShowAll: (section: HomeSectionId | null) => void;
  onPlayTrack: (index: number) => void;
  onTogglePlay: () => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  function handleSelect(trackIndex: number) {
    if (trackIndex === currentIndex && isPlaying) {
      onTogglePlay();
    } else {
      onPlayTrack(trackIndex);
    }
  }
  const songTracks = tracks.filter((track) => !isPodcastTrack(track));
  const podcastTracks = tracks.filter(isPodcastTrack);
  const popularSongs = songTracks;
  const popularArtists = Array.from(
    new Map(songTracks.map((track) => [track.artist, track])).values(),
  );
  const popularAlbums = [...songTracks.slice(8), ...songTracks.slice(0, 8)];
  const radios = songTracks;

  if (activeSection) {
    const titleMap: Record<HomeSectionId, string> = {
      songs: "Felkapott dalok",
      artists: "Népszerű előadók",
      albums: "Népszerű albumok és kislemezek",
      radio: "Népszerű rádió",
      podcasts: "Podcastok",
    };

    return (
      <div ref={scrollRef} className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-black tracking-tight text-white">
            {titleMap[activeSection]}
          </h1>
          <button
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition hover:scale-105"
            type="button"
            onClick={() => onShowAll(null)}
          >
            Vissza
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-5 gap-y-8">
          {activeSection === "songs" &&
            popularSongs.map((track) => {
              const trackIndex = tracks.findIndex((item) => item.id === track.id);

              return (
                <SongCard
                  key={track.id}
                  active={trackIndex === currentIndex}
                  isPlaying={isPlaying}
                  track={track}
                  onSelect={() => handleSelect(trackIndex)}
                />
              );
            })}

          {activeSection === "artists" &&
            popularArtists.map((track) => {
              const trackIndex = tracks.findIndex((item) => item.id === track.id);

              return (
                <ArtistCard
                  key={track.artist}
                  active={trackIndex === currentIndex}
                  isPlaying={isPlaying}
                  track={track}
                  onSelect={() => handleSelect(trackIndex)}
                />
              );
            })}

          {activeSection === "albums" &&
            popularAlbums.map((track) => {
              const trackIndex = tracks.findIndex((item) => item.id === track.id);

              return (
                <SongCard
                  key={track.id}
                  active={trackIndex === currentIndex}
                  isPlaying={isPlaying}
                  track={track}
                  onSelect={() => handleSelect(trackIndex)}
                />
              );
            })}

          {activeSection === "radio" &&
            radios.map((track, index) => {
              const trackIndex = tracks.findIndex((item) => item.id === track.id);

              return (
                <RadioCard
                  key={track.id}
                  active={trackIndex === currentIndex}
                  index={index}
                  isPlaying={isPlaying}
                  track={track}
                  onSelect={() => handleSelect(trackIndex)}
                />
              );
            })}

          {activeSection === "podcasts" &&
            podcastTracks
              .map((track) => {
                const trackIndex = tracks.findIndex((item) => item.id === track.id);
                return (
                  <SongCard
                    key={track.id}
                    active={trackIndex === currentIndex}
                    isPlaying={isPlaying}
                    track={track}
                    onSelect={() => handleSelect(trackIndex)}
                  />
                );
              })}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
      <CarouselSection title="Felkapott dalok" onShowAll={() => onShowAll("songs")}>
        {popularSongs.slice(0, 9).map((track) => {
          const trackIndex = tracks.findIndex((item) => item.id === track.id);

          return (
            <SongCard
              key={track.id}
              active={trackIndex === currentIndex}
              isPlaying={isPlaying}
              track={track}
              onSelect={() => handleSelect(trackIndex)}
            />
          );
        })}
      </CarouselSection>

      <CarouselSection title="Népszerű előadók" onShowAll={() => onShowAll("artists")}>
        {popularArtists.slice(0, 9).map((track) => {
          const trackIndex = tracks.findIndex((item) => item.id === track.id);

          return (
            <ArtistCard
              key={track.artist}
              active={trackIndex === currentIndex}
              isPlaying={isPlaying}
              track={track}
              onSelect={() => handleSelect(trackIndex)}
            />
          );
        })}
      </CarouselSection>

      <CarouselSection
        title="Népszerű albumok és kislemezek"
        onShowAll={() => onShowAll("albums")}
      >
        {popularAlbums.slice(0, 9).map((track) => {
          const trackIndex = tracks.findIndex((item) => item.id === track.id);

          return (
            <SongCard
              key={track.id}
              active={trackIndex === currentIndex}
              isPlaying={isPlaying}
              track={track}
              onSelect={() => handleSelect(trackIndex)}
            />
          );
        })}
      </CarouselSection>

      <CarouselSection title="Népszerű rádió" onShowAll={() => onShowAll("radio")}>
        {radios.slice(0, 8).map((track, index) => {
          const trackIndex = tracks.findIndex((item) => item.id === track.id);

          return (
            <RadioCard
              key={track.id}
              active={trackIndex === currentIndex}
              index={index}
              isPlaying={isPlaying}
              track={track}
              onSelect={() => handleSelect(trackIndex)}
            />
          );
        })}
      </CarouselSection>

      {(() => {
        if (podcastTracks.length === 0) return null;
        return (
          <CarouselSection title="Podcastok" onShowAll={() => onShowAll("podcasts")}>
            {podcastTracks.slice(0, 9).map((track) => {
              const trackIndex = tracks.findIndex((item) => item.id === track.id);
              return (
                <SongCard
                  key={track.id}
                  active={trackIndex === currentIndex}
                  isPlaying={isPlaying}
                  track={track}
                  onSelect={() => handleSelect(trackIndex)}
                />
              );
            })}
          </CarouselSection>
        );
      })()}
    </div>
  );
}

function ActiveBars() {
  return (
    <div className="flex h-5 w-5 items-end justify-center gap-[2px] text-primary">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="eq-bar w-[3px] rounded-full bg-primary"
          style={{ animationDelay: `${bar * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function LibraryTrackList({
  currentIndex,
  favoriteIds,
  isPlaying,
  removable = false,
  tracks,
  visibleTracks,
  onPlayTrack,
  onRemoveTrack,
  onToggleFavorite,
  onTogglePlay,
}: {
  currentIndex: number;
  favoriteIds: number[];
  isPlaying: boolean;
  removable?: boolean;
  tracks: Track[];
  visibleTracks: Track[];
  onPlayTrack: (index: number) => void;
  onRemoveTrack?: (trackId: number) => void;
  onToggleFavorite: (trackId: number) => void;
  onTogglePlay: () => void;
}) {
  const desktopGridClass = removable
    ? "md:grid-cols-[48px_minmax(220px,1.6fr)_minmax(140px,0.75fr)_72px_80px_56px]"
    : "md:grid-cols-[48px_minmax(0,1.4fr)_minmax(120px,0.7fr)_64px_96px]";

  return (
    <div>
      <div
        className={`hidden items-center border-b border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-500 md:grid ${desktopGridClass}`}
      >
        <span>#</span>
        <span>Cím</span>
        <span>Műfaj</span>
        <span className="justify-self-center">Kedvenc</span>
        <span className="justify-self-end">Idő</span>
        {removable ? <span aria-hidden="true" /> : null}
      </div>

      <ul className="space-y-1 py-2">
        {visibleTracks.map((track, index) => {
          const trackIndex = tracks.findIndex((item) => item.id === track.id);
          const active = trackIndex === currentIndex;
          const favorite = favoriteIds.includes(track.id);

          return (
            <li key={track.id}>
              <button
                className={`group grid w-full grid-cols-[38px_minmax(0,1fr)_44px_auto] items-center gap-3 rounded-md px-2 py-2 text-left transition md:px-3 ${desktopGridClass} ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
                type="button"
                onClick={() => {
                  if (trackIndex < 0) {
                    return;
                  }

                  if (active) {
                    onTogglePlay();
                  } else {
                    onPlayTrack(trackIndex);
                  }
                }}
              >
                <span
                  className={`flex items-center justify-center text-sm ${
                    active ? "text-primary" : "text-zinc-500"
                  }`}
                >
                  <span className="group-hover:hidden">
                    {active && isPlaying ? (
                      <ActiveBars />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {active && isPlaying ? (
                    <Pause className="hidden size-4 fill-white group-hover:block" />
                  ) : (
                    <Play className="hidden size-4 fill-white group-hover:block" />
                  )}
                </span>

                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-800"
                    style={{ backgroundColor: track.cover ? undefined : track.color }}
                  >
                    <CoverImage
                      src={track.cover}
                      alt={`${track.title} borító`}
                      fallback={<Music2 className="size-5 text-zinc-500" />}
                    />
                  </span>

                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        active ? "text-primary" : "text-white"
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {track.artist}
                    </span>
                  </span>
                </span>

                <span className="hidden truncate text-sm text-zinc-500 md:block">
                  {track.genre || "Saját"}
                </span>

                <span className="flex justify-center">
                  <span
                    aria-label={
                      favorite
                        ? "Eltávolítás a kedvencekből"
                        : "Hozzáadás a kedvencekhez"
                    }
                    className={`flex size-9 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white ${
                      favorite
                        ? "text-primary hover:text-primary"
                        : "text-zinc-500"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(track.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onToggleFavorite(track.id);
                      }
                    }}
                  >
                    <Heart className={`size-4 ${favorite ? "fill-primary" : ""}`} />
                  </span>
                </span>

                <span
                  className={`items-center justify-end justify-self-end text-xs text-zinc-500 ${
                    removable ? "hidden md:flex" : "flex"
                  }`}
                >
                  <span>{formatSearchDuration(track)}</span>
                </span>

                {removable && onRemoveTrack ? (
                  <span className="flex justify-end">
                    <span
                      aria-label="Eltávolítás a listából"
                      className="flex size-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-red-500/20 hover:text-red-500"
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveTrack(track.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          onRemoveTrack(track.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8">
      <div className="flex size-14 items-center justify-center rounded-full bg-white/10 text-zinc-300">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-5 text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-zinc-400">
        {text}
      </p>
    </div>
  );
}

function SkeletonCard({ round = false }: { round?: boolean }) {
  return (
    <div className="w-[196px] shrink-0 rounded-md p-3">
      <div
        className={`aspect-square animate-pulse bg-white/10 shadow-xl ${
          round ? "rounded-full" : "rounded-md"
        }`}
      />
      <div className="mt-4 h-4 w-32 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-white/5" />
    </div>
  );
}

function SkeletonCarouselSection({
  title,
  round = false,
}: {
  title: string;
  round?: boolean;
}) {
  return (
    <section className="mb-14">
      <SectionHeader title={title} />
      <div className="no-scrollbar flex gap-6 overflow-hidden pb-3 pr-12">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonCard key={index} round={round} />
        ))}
      </div>
    </section>
  );
}

function TrackRowsSkeleton({
  count = 8,
  removable = false,
}: {
  count?: number;
  removable?: boolean;
}) {
  const desktopGridClass = removable
    ? "md:grid-cols-[48px_minmax(220px,1.6fr)_minmax(140px,0.75fr)_72px_80px_56px]"
    : "md:grid-cols-[48px_minmax(0,1.4fr)_minmax(120px,0.7fr)_64px_96px]";

  return (
    <div>
      <div
        className={`hidden items-center border-b border-white/10 px-3 py-2 md:grid ${desktopGridClass}`}
      >
        {Array.from({ length: removable ? 6 : 5 }, (_, index) => (
          <div
            key={index}
            className="h-3 w-12 animate-pulse rounded-full bg-white/5"
          />
        ))}
      </div>

      <ul className="space-y-1 py-2">
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>
            <div
              className={`grid w-full grid-cols-[38px_minmax(0,1fr)_44px_auto] items-center gap-3 rounded-md px-2 py-2 md:px-3 ${desktopGridClass}`}
            >
              <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-white/10" />
              <div className="flex min-w-0 items-center gap-3">
                <div className="size-11 shrink-0 animate-pulse rounded bg-white/10" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-white/5" />
                </div>
              </div>
              <div className="hidden h-3 w-24 animate-pulse rounded-full bg-white/5 md:block" />
              <div className="mx-auto size-5 animate-pulse rounded-full bg-white/5" />
              <div
                className={`justify-self-end ${
                  removable ? "hidden md:block" : "block"
                } h-3 w-10 animate-pulse rounded-full bg-white/5`}
              />
              {removable ? (
                <div className="hidden size-8 animate-pulse rounded-full bg-white/5 md:block" />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HomeSkeleton({ activeSection }: { activeSection: HomeSectionId | null }) {
  if (activeSection) {
    return (
      <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
        <div className="mb-8 h-10 w-64 animate-pulse rounded-full bg-white/10" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-5 gap-y-8">
          {Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} round={activeSection === "artists"} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
      <SkeletonCarouselSection title="Felkapott dalok" />
      <SkeletonCarouselSection title="Népszerű előadók" round />
      <SkeletonCarouselSection title="Népszerű albumok és kislemezek" />
      <SkeletonCarouselSection title="Népszerű rádió" />
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-2 sm:px-8">
      <div className="sticky top-0 z-20 -mx-5 bg-[#121212]/95 px-5 pb-6 pt-1 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-white/10"
            />
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(280px,400px)_minmax(360px,1fr)]">
        <div className="h-56 animate-pulse rounded-lg bg-white/[0.04]" />
        <TrackRowsSkeleton count={5} />
      </div>
      <div className="mt-12">
        <SkeletonCarouselSection title="Előadók" round />
      </div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
      <div className="mb-8">
        <div className="h-3 w-24 animate-pulse rounded-full bg-primary/40" />
        <div className="mt-4 h-12 w-64 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-full bg-white/5" />
      </div>
      <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(280px,0.95fr)_minmax(320px,1.35fr)]">
        <div className="min-h-[190px] animate-pulse rounded-lg border border-dashed border-white/10 bg-white/[0.03]" />
        <div className="min-h-[190px] animate-pulse rounded-lg border border-white/10 bg-white/[0.04]" />
      </div>
      <TrackRowsSkeleton count={7} removable />
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="h-3 w-20 animate-pulse rounded-full bg-primary/40" />
          <div className="mt-4 h-12 w-72 max-w-full animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-full bg-white/5" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <div className="h-24 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="h-24 animate-pulse rounded-lg bg-white/[0.04]" />
      </div>
      <TrackRowsSkeleton count={9} removable />
    </div>
  );
}

function MainContentSkeleton({
  activeSection,
  view,
}: {
  activeSection: HomeSectionId | null;
  view: AppView;
}) {
  if (view === "home") {
    return <HomeSkeleton activeSection={activeSection} />;
  }

  if (view === "search") {
    return <SearchSkeleton />;
  }

  if (view === "admin") {
    return <AdminSkeleton />;
  }

  return <LibrarySkeleton />;
}

function LibraryPage({
  currentIndex,
  favoriteIds,
  isPlaying,
  canCreatePlaylists,
  playlists,
  tracks,
  onAddToPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayTrack,
  onRemoveFromPlaylist,
  onRequireLogin,
  onToggleFavorite,
  onTogglePlay,
}: {
  currentIndex: number;
  favoriteIds: number[];
  isPlaying: boolean;
  canCreatePlaylists: boolean;
  playlists: UserPlaylist[];
  tracks: Track[];
  onAddToPlaylist: (playlistId: string, trackId: number) => void;
  onCreatePlaylist: (name: string) => string | null;
  onDeletePlaylist: (playlistId: string) => void;
  onPlayTrack: (index: number) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: number) => void;
  onRequireLogin: () => void;
  onToggleFavorite: (trackId: number) => void;
  onTogglePlay: () => void;
}) {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists[0]?.id ?? null,
  );
  const selectedPlaylist =
    playlists.find((playlist) => playlist.id === selectedPlaylistId) ??
    playlists[0] ??
    null;
  const selectedTracks = selectedPlaylist
    ? selectedPlaylist.trackIds
        .map((trackId) => tracks.find((track) => track.id === trackId))
        .filter((track): track is Track => Boolean(track))
    : [];
  const addableTracks = selectedPlaylist
    ? tracks.filter((track) => !selectedPlaylist.trackIds.includes(track.id))
    : [];
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const filteredAddableTracks = useMemo(() => {
    const query = normalizeSearchText(trackSearchQuery.trim());

    if (!query) {
      return addableTracks.slice(0, 6);
    }

    return addableTracks
      .filter((track) => getSearchText(track).includes(query))
      .slice(0, 8);
  }, [addableTracks, trackSearchQuery]);

  useEffect(() => {
    if (playlists.length === 0) {
      setSelectedPlaylistId(null);
      return;
    }

    if (!selectedPlaylistId || !playlists.some((playlist) => playlist.id === selectedPlaylistId)) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  function handleCreatePlaylist() {
    if (!canCreatePlaylists) {
      onRequireLogin();
      return;
    }

    const createdId = onCreatePlaylist(newPlaylistName);

    if (!createdId) {
      return;
    }

    setNewPlaylistName("");
    setCreateCardOpen(false);
    setSelectedPlaylistId(createdId);
  }

  function handleAddToPlaylist(trackId: number) {
    if (!selectedPlaylist) {
      return;
    }

    onAddToPlaylist(selectedPlaylist.id, trackId);
    setTrackSearchQuery("");
  }

  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
      <section className="mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Könyvtár
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Könyvtárad
          </h1>
          <p className="mt-3 text-sm font-semibold text-zinc-400">
            Itt tudsz saját listákat létrehozni, és dalokat berakni ezekbe.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(280px,0.95fr)_minmax(320px,1.35fr)]">
          {createCardOpen ? (
            <div className="min-h-[190px] rounded-lg border border-primary bg-primary/10 p-6">
              <label
                className="text-lg font-black text-white"
                htmlFor="playlist-name"
              >
                Új lista neve
              </label>
              <input
                id="playlist-name"
                className="mt-5 h-12 w-full rounded-md border border-white/10 bg-black/30 px-4 text-base font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40"
                placeholder="Pl. Edzés mix"
                type="text"
                value={newPlaylistName}
                onChange={(event) => setNewPlaylistName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCreatePlaylist();
                  }
                }}
              />
              <div className="mt-5 flex gap-2">
                <Button
                  className="h-11 rounded-full bg-white px-6 font-bold text-black hover:bg-zinc-200"
                  type="button"
                  onClick={handleCreatePlaylist}
                >
                  Létrehozás
                </Button>
                <Button
                  className="h-11 rounded-full border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateCardOpen(false);
                    setNewPlaylistName("");
                  }}
                >
                  Mégse
                </Button>
              </div>
            </div>
          ) : (
            <button
              className="group min-h-[190px] rounded-lg border border-dashed border-white/20 bg-white/[0.03] p-6 text-left transition hover:border-primary hover:bg-primary/10"
              type="button"
              onClick={() => {
                if (!canCreatePlaylists) {
                  onRequireLogin();
                  return;
                }

                setCreateCardOpen(true);
              }}
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-black shadow-xl transition group-hover:scale-105">
                <Plus className="size-8" />
              </div>
              <h3 className="mt-6 truncate text-2xl font-black text-white">
                Új lista
              </h3>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-zinc-400">
                {canCreatePlaylists
                  ? "Adj nevet, majd rakj bele zenéket."
                  : "Bejelentkezés szükséges."}
              </p>
            </button>
          )}

          <div className="min-h-[190px] rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Listáid</h2>
                <p className="mt-2 text-sm font-semibold text-zinc-400">
                  {playlists.length > 0
                    ? `${playlists.length} saját lista`
                    : "Még nincs saját listád."}
                </p>
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#2a2a2a] text-white">
                <ListMusic className="size-6" />
              </div>
            </div>

            {playlists.length > 0 ? (
              <>
                <label
                  className="mt-6 block text-sm font-bold text-zinc-300"
                  htmlFor="playlist-select"
                >
                  Lista kiválasztása
                </label>
                <select
                  id="playlist-select"
                  className="mt-2 h-12 w-full rounded-md border border-white/10 bg-black/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-white/40"
                  value={selectedPlaylist?.id ?? ""}
                  onChange={(event) => setSelectedPlaylistId(event.target.value)}
                >
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name} - {playlist.trackIds.length} dal
                    </option>
                  ))}
                </select>

                {selectedPlaylist && (
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-md bg-black/25 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">
                        {selectedPlaylist.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        {selectedPlaylist.trackIds.length} dal
                      </p>
                    </div>
                    <button
                      aria-label="Lista törlése"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white"
                      type="button"
                      onClick={() => onDeletePlaylist(selectedPlaylist.id)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-6 max-w-sm text-sm font-semibold leading-6 text-zinc-500">
                Hozz létre egy listát bal oldalt, utána itt tudod kiválasztani.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        {selectedPlaylist ? (
          <>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 shrink-0">
                  <h2 className="truncate text-2xl font-black text-white">
                    {selectedPlaylist.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-zinc-400">
                    {selectedTracks.length} dal ebben a listában.
                  </p>
                </div>

                <div className="relative w-full min-w-[240px] sm:w-[360px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    className="h-11 w-full rounded-full border border-white/10 bg-black/40 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40"
                    placeholder="Keresés dal hozzáadásához"
                    type="text"
                    value={trackSearchQuery}
                    onChange={(event) => setTrackSearchQuery(event.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-fit rounded-full border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
                type="button"
                variant="outline"
                onClick={() => onDeletePlaylist(selectedPlaylist.id)}
              >
                <Trash2 className="size-4" />
                Lista törlése
              </Button>
            </div>

            <div className="mb-5 rounded-lg border border-white/10 bg-black/20 p-2">
              {addableTracks.length === 0 ? (
                <p className="px-3 py-3 text-sm font-semibold text-zinc-500">
                  Minden dal benne van ebben a listában.
                </p>
              ) : filteredAddableTracks.length > 0 ? (
                <div className="grid gap-1 md:grid-cols-2">
                  {filteredAddableTracks.map((track) => (
                    <button
                      key={track.id}
                      className="flex min-w-0 items-center gap-3 rounded-md p-2 text-left transition hover:bg-white/10"
                      type="button"
                      onClick={() => handleAddToPlaylist(track.id)}
                    >
                      <span
                        className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-800"
                        style={{ backgroundColor: track.cover ? undefined : track.color }}
                      >
                        <CoverImage
                          src={track.cover}
                          alt={`${track.title} borító`}
                          fallback={<Music2 className="size-5 text-zinc-500" />}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">
                          {track.title}
                        </span>
                        <span className="block truncate text-xs font-semibold text-zinc-500">
                          {track.artist}
                        </span>
                      </span>
                      <Plus className="size-4 shrink-0 text-primary" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-3 text-sm font-semibold text-zinc-500">
                  Nincs találat erre a keresésre.
                </p>
              )}
            </div>

            {selectedTracks.length > 0 ? (
              <LibraryTrackList
                currentIndex={currentIndex}
                favoriteIds={favoriteIds}
                isPlaying={isPlaying}
                removable
                tracks={tracks}
                visibleTracks={selectedTracks}
                onPlayTrack={onPlayTrack}
                onRemoveTrack={(trackId) =>
                  onRemoveFromPlaylist(selectedPlaylist.id, trackId)
                }
                onToggleFavorite={onToggleFavorite}
                onTogglePlay={onTogglePlay}
              />
            ) : (
              <EmptyPanel
                icon={ListMusic}
                title="Üres lista"
                text="Keress rá egy dalra fent, és add hozzá ehhez a listához."
              />
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}

function FavoritesPage({
  currentIndex,
  favoriteIds,
  favoriteTracks,
  isPlaying,
  tracks,
  onPlayTrack,
  onToggleFavorite,
  onTogglePlay,
}: {
  currentIndex: number;
  favoriteIds: number[];
  favoriteTracks: Track[];
  isPlaying: boolean;
  tracks: Track[];
  onPlayTrack: (index: number) => void;
  onToggleFavorite: (trackId: number) => void;
  onTogglePlay: () => void;
}) {
  const favoriteSongs = favoriteTracks.filter((track) => !isPodcastTrack(track));
  const favoritePodcasts = favoriteTracks.filter(isPodcastTrack);

  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Könyvtár
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Kedvencek
        </h1>
        <p className="mt-3 text-sm font-semibold text-zinc-400">
          {favoriteTracks.length > 0
            ? `${favoriteSongs.length} dal • ${favoritePodcasts.length} podcast`
            : "Még nincs kedvenc dalod."}
        </p>
      </div>

      {favoriteTracks.length > 0 ? (
        <div className="space-y-10">
          {favoriteSongs.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-black text-white">Dalok</h2>
              <LibraryTrackList
                currentIndex={currentIndex}
                favoriteIds={favoriteIds}
                isPlaying={isPlaying}
                tracks={tracks}
                visibleTracks={favoriteSongs}
                onPlayTrack={onPlayTrack}
                onToggleFavorite={onToggleFavorite}
                onTogglePlay={onTogglePlay}
              />
            </section>
          )}

          {favoritePodcasts.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-black text-white">Podcastok</h2>
              <LibraryTrackList
                currentIndex={currentIndex}
                favoriteIds={favoriteIds}
                isPlaying={isPlaying}
                tracks={tracks}
                visibleTracks={favoritePodcasts}
                onPlayTrack={onPlayTrack}
                onToggleFavorite={onToggleFavorite}
                onTogglePlay={onTogglePlay}
              />
            </section>
          )}
        </div>
      ) : (
        <EmptyPanel
          icon={Heart}
          title="Mentsd el a kedvenceidet"
          text="Nyomd meg a szív ikont az alsó lejátszóban vagy egy dal sorában, és a dal itt fog megjelenni."
        />
      )}
    </div>
  );
}

function PlaylistDetailPage({
  currentIndex,
  favoriteIds,
  isPlaying,
  playlist,
  tracks,
  onBack,
  onPlayTrack,
  onToggleFavorite,
  onTogglePlay,
}: {
  currentIndex: number;
  favoriteIds: number[];
  isPlaying: boolean;
  playlist: UserPlaylist | null;
  tracks: Track[];
  onBack: () => void;
  onPlayTrack: (index: number) => void;
  onToggleFavorite: (trackId: number) => void;
  onTogglePlay: () => void;
}) {
  const playlistTracks = playlist
    ? playlist.trackIds
        .map((trackId) => tracks.find((track) => track.id === trackId))
        .filter((track): track is Track => Boolean(track))
    : [];
  const activeTrackInPlaylist =
    playlistTracks.some((track) => tracks[currentIndex]?.id === track.id);

  function handlePrimaryPlay() {
    if (playlistTracks.length === 0) {
      return;
    }

    if (activeTrackInPlaylist && isPlaying) {
      onTogglePlay();
      return;
    }

    const firstTrackIndex = tracks.findIndex(
      (track) => track.id === playlistTracks[0].id,
    );

    if (firstTrackIndex >= 0) {
      onPlayTrack(firstTrackIndex);
    }
  }

  if (!playlist) {
    return (
      <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
        <EmptyPanel
          icon={ListMusic}
          title="Ez a lista nem található"
          text="Lehet, hogy törölted. Menj vissza a Könyvtárad oldalra, és válassz másik listát."
        />
        <Button
          className="mt-6 rounded-full bg-white px-5 font-bold text-black hover:bg-zinc-200"
          type="button"
          onClick={onBack}
        >
          Vissza a könyvtárhoz
        </Button>
      </div>
    );
  }

  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-7 sm:px-8">
      <section className="mb-8">
        <button
          className="mb-6 text-sm font-bold text-zinc-400 transition hover:text-white hover:underline"
          type="button"
          onClick={onBack}
        >
          Vissza a könyvtárhoz
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="flex size-44 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#2a2a2a] to-[#111] shadow-2xl">
            <ListMusic className="size-20 text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Lista
            </p>
            <h1 className="mt-2 truncate text-5xl font-black tracking-tight text-white sm:text-7xl">
              {playlist.name}
            </h1>
            <p className="mt-3 text-sm font-semibold text-zinc-400">
              {playlistTracks.length} dal
            </p>

            <Button
              className="mt-6 size-14 rounded-full bg-primary text-black shadow-glow hover:scale-105 hover:bg-primary"
              disabled={playlistTracks.length === 0}
              size="icon"
              type="button"
              onClick={handlePrimaryPlay}
            >
              {activeTrackInPlaylist && isPlaying ? (
                <Pause className="size-6 fill-black" />
              ) : (
                <Play className="ml-0.5 size-6 fill-black" />
              )}
            </Button>
          </div>
        </div>
      </section>

      {playlistTracks.length > 0 ? (
        <LibraryTrackList
          currentIndex={currentIndex}
          favoriteIds={favoriteIds}
          isPlaying={isPlaying}
          tracks={tracks}
          visibleTracks={playlistTracks}
          onPlayTrack={onPlayTrack}
          onToggleFavorite={onToggleFavorite}
          onTogglePlay={onTogglePlay}
        />
      ) : (
        <EmptyPanel
          icon={ListMusic}
          title="Üres lista"
          text="A Könyvtárad oldalon tudsz dalokat hozzáadni ehhez a listához."
        />
      )}
    </div>
  );
}

function AdminPage({
  currentIndex,
  favoriteIds,
  isPlaying,
  tracks,
  onAddTrack,
  onPlayTrack,
  onRemoveTrack,
  onToggleFavorite,
  onTogglePlay,
}: {
  currentIndex: number;
  favoriteIds: number[];
  isPlaying: boolean;
  tracks: Track[];
  onAddTrack: () => void;
  onPlayTrack: (index: number) => void;
  onRemoveTrack: (id: number) => void;
  onToggleFavorite: (trackId: number) => void;
  onTogglePlay: () => void;
}) {
  const customTracks = tracks.filter((track) => track.isCustom);
  const songTracks = tracks.filter((track) => !isPodcastTrack(track));
  const podcastTracks = tracks.filter(isPodcastTrack);

  return (
    <div className="spotify-scrollbar h-full overflow-y-auto bg-[#121212] px-5 pb-10 pt-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Admin
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Admin felület
          </h1>
          <p className="mt-3 text-sm font-semibold text-zinc-400">
            Dalok és podcastok kezelése, új tartalom feltöltése.
          </p>
        </div>

        <Button
          className="mt-1 rounded-full bg-white px-5 font-bold text-black hover:bg-zinc-200"
          type="button"
          onClick={onAddTrack}
        >
          <Plus className="size-4" />
          Feltöltés
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <div className="rounded-lg bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-zinc-400">Dalok</p>
          <p className="mt-2 text-3xl font-black text-white">{songTracks.length}</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-zinc-400">Podcastok</p>
          <p className="mt-2 text-3xl font-black text-white">
            {podcastTracks.length}
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-zinc-400">Saját feltöltés</p>
          <p className="mt-2 text-3xl font-black text-white">
            {customTracks.length}
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-2xl font-black text-white">Dalok</h2>
          {songTracks.length > 0 ? (
            <LibraryTrackList
              currentIndex={currentIndex}
              favoriteIds={favoriteIds}
              isPlaying={isPlaying}
              removable
              tracks={tracks}
              visibleTracks={songTracks}
              onPlayTrack={onPlayTrack}
              onRemoveTrack={onRemoveTrack}
              onToggleFavorite={onToggleFavorite}
              onTogglePlay={onTogglePlay}
            />
          ) : (
            <EmptyPanel
              icon={Music2}
              title="Nincs dal"
              text="A feltöltés gombbal adhatsz hozzá új dalt."
            />
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-black text-white">Podcastok</h2>
          {podcastTracks.length > 0 ? (
            <LibraryTrackList
              currentIndex={currentIndex}
              favoriteIds={favoriteIds}
              isPlaying={isPlaying}
              removable
              tracks={tracks}
              visibleTracks={podcastTracks}
              onPlayTrack={onPlayTrack}
              onRemoveTrack={onRemoveTrack}
              onToggleFavorite={onToggleFavorite}
              onTogglePlay={onTogglePlay}
            />
          ) : (
            <EmptyPanel
              icon={Mic2}
              title="Nincs podcast"
              text="Feltöltéskor válaszd a Podcast típust, és itt külön fog megjelenni."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function WaveFlow() {
  const {
    tracks,
    loading: tracksLoading,
    addTrack,
    removeTrack,
    updateTrack,
  } = usePlaylist();
  const [showModal, setShowModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView | null>(null);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [activeHomeSection, setActiveHomeSection] =
    useState<HomeSectionId | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const homeScrollRef = useRef<HTMLDivElement>(null);
  const durationLookupRef = useRef<Set<number>>(new Set());
  const [loadedFavoriteUserId, setLoadedFavoriteUserId] = useState<string | null>(
    null,
  );
  const [loadedPlaylistUserId, setLoadedPlaylistUserId] = useState<string | null>(
    null,
  );

  // Supabase auth listener — resolves admin flag on login/logout
  useEffect(() => {
    let mounted = true;

    async function checkAdmin(userId: string | undefined) {
      if (!userId) {
        if (mounted) setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      if (error) console.error("checkAdmin error:", error.message);
      if (mounted) setIsAdmin(data === true);
    }

    async function syncSession(session: Session | null) {
      if (!mounted) return;
      setCurrentUser(session?.user ?? null);
      await checkAdmin(session?.user.id);
      if (mounted) setAuthReady(true);
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        void syncSession(session);
      })
      .catch((error) => {
        console.error("getSession error:", error.message);
        if (!mounted) return;
        setCurrentUser(null);
        setIsAdmin(false);
        setAuthReady(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void syncSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setFavoriteIds([]);
    setUserPlaylists([]);
    setActivePlaylistId(null);
    setLoadedFavoriteUserId(null);
    setLoadedPlaylistUserId(null);
    setFavoritesReady(false);
    setPlaylistsReady(false);
    setIsAdmin(false);
    setAuthReady(true);
  }
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [playlistsReady, setPlaylistsReady] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setFavoriteIds([]);
      setLoadedFavoriteUserId(null);
      setFavoritesReady(false);
      return;
    }

    try {
      const saved = localStorage.getItem(`waveflow_favorites_${currentUser.id}`);
      const parsed = saved ? JSON.parse(saved) : [];
      setFavoriteIds(
        Array.isArray(parsed)
          ? parsed.filter((id): id is number => typeof id === "number")
          : [],
      );
      setLoadedFavoriteUserId(currentUser.id);
      setFavoritesReady(true);
    } catch {
      setFavoriteIds([]);
      setLoadedFavoriteUserId(currentUser.id);
      setFavoritesReady(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setUserPlaylists([]);
      setActivePlaylistId(null);
      setLoadedPlaylistUserId(null);
      setPlaylistsReady(false);
      return;
    }

    try {
      const playlistKey = `waveflow_user_playlists_${currentUser.id}`;
      const saved =
        localStorage.getItem(playlistKey) ??
        localStorage.getItem("waveflow_user_playlists");
      const parsed = saved ? JSON.parse(saved) : [];

      setUserPlaylists(
        Array.isArray(parsed)
          ? parsed
              .filter((playlist): playlist is UserPlaylist => {
                if (!playlist || typeof playlist !== "object") {
                  return false;
                }

                const maybePlaylist = playlist as Partial<UserPlaylist>;
                return (
                  typeof maybePlaylist.id === "string" &&
                  typeof maybePlaylist.name === "string" &&
                  Array.isArray(maybePlaylist.trackIds)
                );
              })
              .map((playlist) => ({
                id: playlist.id,
                name: playlist.name || "Névtelen lista",
                trackIds: playlist.trackIds.filter(
                  (trackId): trackId is number => typeof trackId === "number",
                ),
                createdAt: playlist.createdAt || Date.now(),
              }))
          : [],
      );
      setLoadedPlaylistUserId(currentUser.id);
      setPlaylistsReady(true);
    } catch {
      setUserPlaylists([]);
      setLoadedPlaylistUserId(currentUser.id);
      setPlaylistsReady(true);
    }
  }, [currentUser]);

  const {
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    next,
    prev,
    seek,
    playTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayer(tracks);

  useEffect(() => {
    if (tracksLoading) {
      return;
    }

    let cancelled = false;
    const podcastTracksWithoutDuration = tracks.filter(
      (track) =>
        track.mp3 &&
        isPodcastTrack(track) &&
        !track.durationSeconds &&
        !durationLookupRef.current.has(track.id),
    );

    podcastTracksWithoutDuration.forEach((track) => {
      durationLookupRef.current.add(track.id);
      readAudioUrlDuration(track.mp3 as string).then((seconds) => {
        if (!cancelled && seconds) {
          updateTrack(track.id, { durationSeconds: seconds });
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [tracks, tracksLoading, updateTrack]);

  function openAuth(view: AuthView) {
    if (isPlaying) togglePlay();
    setAuthView(view);
  }

  const accent = currentTrack?.color ?? "#1ed760";
  const favoriteTracks = useMemo(
    () => tracks.filter((track) => favoriteIds.includes(track.id)),
    [favoriteIds, tracks],
  );
  const activePlaylist =
    userPlaylists.find((playlist) => playlist.id === activePlaylistId) ?? null;
  const isCurrentFavorite = currentTrack
    ? favoriteIds.includes(currentTrack.id)
    : false;

  useEffect(() => {
    if (
      !currentUser ||
      !favoritesReady ||
      loadedFavoriteUserId !== currentUser.id
    ) {
      return;
    }

    localStorage.setItem(
      `waveflow_favorites_${currentUser.id}`,
      JSON.stringify(favoriteIds),
    );
  }, [currentUser, favoriteIds, favoritesReady, loadedFavoriteUserId]);

  useEffect(() => {
    if (
      !currentUser ||
      !playlistsReady ||
      loadedPlaylistUserId !== currentUser.id
    ) {
      return;
    }

    localStorage.setItem(
      `waveflow_user_playlists_${currentUser.id}`,
      JSON.stringify(userPlaylists),
    );
  }, [currentUser, loadedPlaylistUserId, playlistsReady, userPlaylists]);

  useEffect(() => {
    if (!isAdmin && activeView === "admin") {
      setActiveView("library");
    }
  }, [activeView, isAdmin]);

  useEffect(() => {
    if (
      activeView === "playlist" &&
      (!activePlaylistId ||
        !userPlaylists.some((playlist) => playlist.id === activePlaylistId))
    ) {
      setActiveView("library");
      setActivePlaylistId(null);
    }
  }, [activePlaylistId, activeView, userPlaylists]);

  function toggleFavoriteById(trackId: number) {
    if (!currentUser) {
      openAuth("login");
      return;
    }

    setFavoriteIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId],
    );
  }

  function toggleFavorite() {
    if (!currentTrack) {
      return;
    }

    toggleFavoriteById(currentTrack.id);
  }

  function createPlaylist(name: string) {
    if (!currentUser) {
      openAuth("login");
      return null;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      return null;
    }

    const playlist: UserPlaylist = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmedName,
      trackIds: [],
      createdAt: Date.now(),
    };

    setUserPlaylists((prev) => [playlist, ...prev]);
    return playlist.id;
  }

  function addToPlaylist(playlistId: string, trackId: number) {
    setUserPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId && !playlist.trackIds.includes(trackId)
          ? { ...playlist, trackIds: [...playlist.trackIds, trackId] }
          : playlist,
      ),
    );
  }

  function removeFromPlaylist(playlistId: string, trackId: number) {
    setUserPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              trackIds: playlist.trackIds.filter((id) => id !== trackId),
            }
          : playlist,
      ),
    );
  }

  function deletePlaylist(playlistId: string) {
    setUserPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== playlistId),
    );

    if (activePlaylistId === playlistId) {
      setActivePlaylistId(null);
      setActiveView("library");
    }
  }

  function openPlaylist(playlistId: string) {
    setActiveHomeSection(null);
    setActivePlaylistId(playlistId);
    setActiveView("playlist");
  }

  function navigateTo(view: AppView) {
    if (view === "admin" && !isAdmin) {
      return;
    }

    if (view === "home" && activeView === "home") {
      homeScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setActiveHomeSection(null);
    setActiveView(view);
  }

  return (
    <div className="wave-app-shell dark bg-black text-zinc-100">
      <div
        className="wave-app-grid grid grid-cols-1 gap-2 md:grid-cols-[256px_minmax(0,1fr)]"
        style={
          {
            "--accent-raw": accent,
          } as CSSProperties
        }
      >
        <TopNavbar
          activeView={activeView}
          authReady={authReady}
          isAdmin={isAdmin}
          searchQuery={searchQuery}
          user={currentUser}
          onNavigate={navigateTo}
          onOpenAuth={openAuth}
          onSearchChange={setSearchQuery}
          onSignOut={handleSignOut}
        />

        <aside className="hidden min-h-0 flex-col gap-2 md:flex">
          <div className="rounded-lg bg-[#121212] p-3">
            <nav className="space-y-1">
              <NavButton
                active={activeView === "home"}
                icon={House}
                label="Kezdőlap"
                onClick={() => navigateTo("home")}
              />
              <NavButton
                active={activeView === "search"}
                icon={Search}
                label="Keresés"
                onClick={() => navigateTo("search")}
              />
              <NavButton
                active={activeView === "library"}
                icon={Library}
                label="Könyvtárad"
                onClick={() => navigateTo("library")}
              />
              <NavButton
                active={activeView === "favorites"}
                icon={Heart}
                label="Kedvencek"
                onClick={() => navigateTo("favorites")}
              />
              {tracks.some(isPodcastTrack) && (
                <NavButton
                  active={activeView === "home" && activeHomeSection === "podcasts"}
                  icon={Mic2}
                  label="Podcastok"
                  onClick={() => {
                    setActiveView("home");
                    setActiveHomeSection("podcasts");
                  }}
                />
              )}
              {isAdmin && (
                <NavButton
                  active={activeView === "admin"}
                  icon={ShieldCheck}
                  label="Admin"
                  onClick={() => navigateTo("admin")}
                />
              )}
            </nav>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-[#121212] p-3">
            <div className="mb-3 flex items-center justify-between px-3">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                <ListMusic className="size-5" />
                Listák
              </div>
            </div>

            <div className="spotify-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-1">
              {userPlaylists.slice(0, 6).map((playlist) => (
                <button
                  key={playlist.id}
                  className={`w-full rounded-md p-3 text-left transition hover:bg-white/10 ${
                    activeView === "playlist" && activePlaylistId === playlist.id
                      ? "bg-white/10 text-white"
                      : "bg-white/5"
                  }`}
                  type="button"
                  onClick={() => openPlaylist(playlist.id)}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ListMusic className="size-4 text-white" />
                    <span className="truncate">{playlist.name}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {playlist.trackIds.length} dal
                  </p>
                </button>
              ))}
            </div>

            <SidebarFooter />
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden rounded-lg bg-[#121212]">
          {tracksLoading ? (
            <MainContentSkeleton
              activeSection={activeHomeSection}
              view={activeView}
            />
          ) : activeView === "home" ? (
            <HomePage
              activeSection={activeHomeSection}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              scrollRef={homeScrollRef}
              tracks={tracks}
              onPlayTrack={playTrack}
              onShowAll={setActiveHomeSection}
              onTogglePlay={togglePlay}
            />
          ) : activeView === "search" ? (
            <SearchPage
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              query={searchQuery}
              tracks={tracks}
              onPlayTrack={playTrack}
              onQueryChange={setSearchQuery}
              onTogglePlay={togglePlay}
            />
          ) : activeView === "favorites" ? (
            <FavoritesPage
              currentIndex={currentIndex}
              favoriteIds={favoriteIds}
              favoriteTracks={favoriteTracks}
              isPlaying={isPlaying}
              tracks={tracks}
              onPlayTrack={playTrack}
              onToggleFavorite={toggleFavoriteById}
              onTogglePlay={togglePlay}
            />
          ) : activeView === "playlist" ? (
            <PlaylistDetailPage
              currentIndex={currentIndex}
              favoriteIds={favoriteIds}
              isPlaying={isPlaying}
              playlist={activePlaylist}
              tracks={tracks}
              onBack={() => navigateTo("library")}
              onPlayTrack={playTrack}
              onToggleFavorite={toggleFavoriteById}
              onTogglePlay={togglePlay}
            />
          ) : activeView === "admin" && isAdmin ? (
            <AdminPage
              currentIndex={currentIndex}
              favoriteIds={favoriteIds}
              isPlaying={isPlaying}
              tracks={tracks}
              onAddTrack={() => setShowModal(true)}
              onPlayTrack={playTrack}
              onRemoveTrack={removeTrack}
              onToggleFavorite={toggleFavoriteById}
              onTogglePlay={togglePlay}
            />
          ) : (
            <LibraryPage
              canCreatePlaylists={Boolean(currentUser)}
              currentIndex={currentIndex}
              favoriteIds={favoriteIds}
              isPlaying={isPlaying}
              playlists={userPlaylists}
              tracks={tracks}
              onAddToPlaylist={addToPlaylist}
              onCreatePlaylist={createPlaylist}
              onDeletePlaylist={deletePlaylist}
              onPlayTrack={playTrack}
              onRemoveFromPlaylist={removeFromPlaylist}
              onRequireLogin={() => openAuth("login")}
              onToggleFavorite={toggleFavoriteById}
              onTogglePlay={togglePlay}
            />
          )}
        </main>

        <div className="md:col-span-2">
          <Player
            currentTime={currentTime}
            currentTrack={currentTrack}
            duration={duration}
            isFavorite={isCurrentFavorite}
            isMuted={isMuted}
            isPlaying={isPlaying}
            isRepeat={isRepeat}
            isShuffle={isShuffle}
            progress={progress}
            volume={volume}
            onNext={next}
            onPrev={prev}
            onSeek={seek}
            onTogglePlay={togglePlay}
            onToggleRepeat={toggleRepeat}
            onToggleFavorite={toggleFavorite}
            onToggleMute={toggleMute}
            onShowPlaylist={() => navigateTo("library")}
            onToggleShuffle={toggleShuffle}
            onVolumeChange={setVolume}
          />
        </div>

        {showModal && (
          <AddTrackModal onAdd={addTrack} onClose={() => setShowModal(false)} />
        )}

        {authView && (
          <AuthPage
            mode={authView}
            onClose={() => setAuthView(null)}
            onModeChange={setAuthView}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PlaylistProvider>
      <WaveFlow />
    </PlaylistProvider>
  );
}
