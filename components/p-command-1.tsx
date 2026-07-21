"use client";

import { Fragment, type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export interface CommandPaletteItem {
  action: () => void;
  icon?: ReactNode;
  label: string;
  shortcut?: string;
  suffix?: ReactNode;
  value: string;
}

export interface CommandPaletteGroup {
  items: CommandPaletteItem[];
  value: string;
}

export default function CommandPalette({
  groups,
  inputPlaceholder = "Search for apps and commands...",
  triggerClassName,
  triggerIcon,
  triggerLabel = "Search for apps and commands",
}: {
  groups: CommandPaletteGroup[];
  inputPlaceholder?: string;
  triggerClassName?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  function handleItemClick(item: CommandPaletteItem) {
    item.action();
    setOpen(false);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandDialogTrigger
        render={
          <Button
            className={cn(
              "hidden h-7 min-w-48 max-w-[38vw] justify-between rounded-lg bg-background px-2.5 text-muted-foreground text-xs ring-1 ring-sidebar-border/70 transition-[background-color,scale] duration-150 hover:bg-sidebar-accent active:scale-[0.96] sm:flex md:w-72",
              triggerClassName,
            )}
            variant="outline"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          {triggerIcon}
          <span className="truncate">{triggerLabel}</span>
        </span>
        <KbdGroup className="hidden shrink-0 sm:inline-flex">
          <Kbd className="h-4 min-w-4 px-1 text-[0.625rem]">⌘</Kbd>
          <Kbd className="h-4 min-w-4 px-1 text-[0.625rem]">K</Kbd>
        </KbdGroup>
      </CommandDialogTrigger>
      <CommandDialogPopup>
        <Command items={groups}>
          <CommandInput placeholder={inputPlaceholder} />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: CommandPaletteGroup) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: CommandPaletteItem) => (
                        <CommandItem
                          key={item.value}
                          onClick={() => handleItemClick(item)}
                          value={item.value}
                        >
                          {item.icon}
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {item.suffix}
                          {item.shortcut && (
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                          )}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              )}
            </CommandList>
          </CommandPanel>
          <CommandFooter>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>↵</Kbd>
                <span>Open</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
