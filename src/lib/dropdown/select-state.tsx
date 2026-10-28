import React, { useContext } from "react";
import { SelectStateContext } from "react-aria-components";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

export type SelectState = NonNullable<
  React.ContextType<typeof SelectStateContext>
>;

/** Points `stateRef` at the select's react-aria state, for the handlers given to the Select itself. */
export function SelectStateBridge({
  stateRef,
}: Readonly<{ stateRef: React.MutableRefObject<SelectState | null> }>) {
  const state = useContext(SelectStateContext);
  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  });
  return null;
}
