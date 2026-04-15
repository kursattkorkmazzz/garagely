import React from "react";

export function useDisclosure(defaultOpen?: boolean) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen || false);

  const close = React.useCallback(() => setIsOpen(false), []);
  const open = React.useCallback(() => setIsOpen(true), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
