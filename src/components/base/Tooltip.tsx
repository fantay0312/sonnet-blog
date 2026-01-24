import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { useState, createContext, useContext, type ReactNode } from "react";

interface TooltipContextValue {
  enabled: boolean;
}

const TooltipContext = createContext<TooltipContextValue>({ enabled: true });

export function TooltipProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  return (
    <TooltipContext.Provider value={{ enabled }}>
      {children}
    </TooltipContext.Provider>
  );
}

interface TooltipProps {
  children: ReactNode;
  content: string;
  disabled?: boolean;
}

export default function Tooltip({ children, content, disabled }: TooltipProps) {
  const { enabled } = useContext(TooltipContext);
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift()],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const showTooltip = enabled && !disabled && isOpen;

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {showTooltip && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 px-2 py-1 text-xs rounded bg-foreground text-background shadow-lg"
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
