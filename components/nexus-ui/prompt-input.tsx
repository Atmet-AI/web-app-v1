"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PromptInputContextValue = {
  onSubmit?: (value: string) => void;
  setTextareaNode: (node: HTMLTextAreaElement | null) => void;
};

const PromptInputContext = React.createContext<PromptInputContextValue | null>(
  null,
);

type PromptInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSubmit"
> & {
  onSubmit?: (value: string) => void;
};

function PromptInput({
  className,
  onClick,
  onSubmit,
  ...props
}: PromptInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest(
          'button, a, input, textarea, [role="button"], [role="tab"]',
        )
      ) {
        textareaRef.current?.focus();
      }

      onClick?.(event);
    },
    [onClick],
  );

  const contextValue = React.useMemo<PromptInputContextValue>(
    () => ({
      onSubmit,
      setTextareaNode: (node) => {
        textareaRef.current = node;
      },
    }),
    [onSubmit],
  );

  return (
    <TooltipProvider>
      <PromptInputContext.Provider value={contextValue}>
        <div
          aria-label="Chat input"
          className={cn(
            "relative flex h-auto w-full cursor-text flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs/5 transition-shadow focus-within:ring-[3px] focus-within:ring-ring/16 dark:bg-input/24",
            className,
          )}
          onClick={handleClick}
          role="group"
          {...props}
        />
      </PromptInputContext.Provider>
    </TooltipProvider>
  );
}

type PromptInputTextareaProps = React.ComponentProps<"textarea">;

const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(function PromptInputTextarea(
  { className, onKeyDown, ...props },
  forwardedRef,
) {
  const context = React.useContext(PromptInputContext);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      context?.setTextareaNode(node);

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [context, forwardedRef],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && context?.onSubmit) {
        event.preventDefault();
        context.onSubmit(event.currentTarget.value);
      }

      onKeyDown?.(event);
    },
    [context, onKeyDown],
  );

  return (
    <textarea
      aria-label="Message input"
      className={cn(
        "min-h-24 w-full resize-none bg-transparent px-5 py-4 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      onKeyDown={handleKeyDown}
      ref={setRefs}
      {...props}
    />
  );
});

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActions({ className, ...props }: PromptInputActionsProps) {
  return (
    <div
      aria-label="Input actions"
      className={cn(
        "flex w-full shrink-0 items-center justify-between px-3 pb-3",
        className,
      )}
      role="group"
      {...props}
    />
  );
}

type PromptInputActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActionGroup({
  className,
  ...props
}: PromptInputActionGroupProps) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

type PromptInputActionProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  tooltip?:
    | string
    | {
        content?: string;
        shortcut?: string;
        side?: "bottom" | "left" | "right" | "top";
      };
};

function PromptInputAction({
  asChild = false,
  tooltip,
  ...props
}: PromptInputActionProps) {
  const Comp = asChild ? Slot : "div";
  const { content, side, shortcut } =
    typeof tooltip === "string" ? { content: tooltip } : (tooltip ?? {});

  if (!content) {
    return <Comp {...props} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          asChild && React.isValidElement(props.children) ? (
            props.children
          ) : (
            <Comp {...props} />
          )
        }
      />
      <TooltipContent className="rounded-full" side={side}>
        {content}
        {shortcut ? <Kbd className="rounded-md!">{shortcut}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  PromptInput,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputActions,
  PromptInputTextarea,
};
