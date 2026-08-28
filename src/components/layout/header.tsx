import { Logo } from "@/components/logo";
import { SearchBox } from "@/components/layout/search-box";
import { NewArticleButton } from "@/components/layout/new-article-button";
import { NotificationBellGate } from "@/components/layout/notification-bell-gate";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <SearchBox />
          <NewArticleButton />
          <NotificationBellGate />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
