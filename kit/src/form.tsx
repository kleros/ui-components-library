import React, { useEffect, useRef, useState } from "react";
import { Button, Steps } from "@kleros/ui-components-library";
import { FormStack } from "./layout.js";
import { cn } from "./cn.js";

export interface FormFieldProps {
  /** Label text above the control. */
  label: string;
  /** The `id` of the control, so clicking the label focuses it. */
  htmlFor?: string;
  /** Muted hint under the control. */
  help?: string;
  /** Error text under the control; shown instead of `help`. */
  error?: string;
  /** The control. */
  children: React.ReactNode;
  className?: string;
}

/**
 * Label, help and error text around a custom control (a chain picker, a token selector, a file drop).
 * Core fields (`TextField`, `NumberField`, ...) already take `label`, `variant="error"` and `message`, so use `FormField` only for controls that do not.
 * Its label looks like the core fields' labels (secondary text colour, `text-sm`, regular weight, 4 px above the control), so both kinds sit in one form with one label style.
 * @intent form field, label, help text, error message, validation, custom input, field wrapper
 * @example <FormField label="Court" htmlFor="court" error={errors.court}><CourtPicker id="court" /></FormField>
 */
export function FormField({ label, htmlFor, help, error, children, className }: Readonly<FormFieldProps>) {
  // The classes of the core TextField/TextArea/NumberField/Searchbar label, less its mb-1: the gap-1 above gives the 4 px.
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-klerosUIComponentsSecondaryText text-sm">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-klerosUIComponentsError text-xs">
          {error}
        </p>
      ) : (
        help && <p className="text-klerosUIComponentsSecondaryText text-xs">{help}</p>
      )}
    </div>
  );
}

export interface WizardStep {
  /** Name in the steps bar, e.g. "Payment". */
  title: string;
  /** The step's fields. Keep their values in your own state: the shell only moves between steps. */
  content: React.ReactNode;
  /** Runs on Next, and on Submit for the last step. Return false to stay on the step, and show the errors yourself (core fields take `variant="error"` and `message`). Catch your own errors in it (a failed lookup, say), show them and return false: a throw also stays on the step, with no message for the user. */
  validate?: () => boolean | Promise<boolean>;
}

export interface WizardShellProps {
  /** The steps, in order. */
  steps: WizardStep[];
  /** Called on Submit from the last step once its `validate` passes. The button shows a spinner while the promise is pending. Catch your own errors in it. */
  onSubmit: () => void | Promise<void>;
  /** Current step index, for a controlled wizard; pair it with `onStepChange`. */
  step?: number;
  /** First step shown when uncontrolled. @default 0 */
  defaultStep?: number;
  /** Called with the new index on Back, and on Next once the step's `validate` passes. */
  onStepChange?: (step: number) => void;
  /** When set, a Cancel button shows on the first step, where there is no Back. */
  onCancel?: () => void;
  /** @default "Back" */
  backText?: string;
  /** @default "Next" */
  nextText?: string;
  /** Text of the last step's button, e.g. "Create deal". @default "Submit" */
  submitText?: string;
  /** @default "Cancel" */
  cancelText?: string;
  className?: string;
}

/**
 * Multi-step form: the core `Steps` bar above the current step's fields in a `FormStack`, with Back, Next and Submit in its actions.
 * Next runs the step's `validate` and moves on only when it returns true; Submit runs the last step's `validate`, then `onSubmit`.
 * It renders a `form`, so Enter in a field acts as Next and the fields' own constraints (`isRequired`) also hold Next.
 * Put no form element (the core `Form` included) inside a step's content, and do not nest the shell in a form: browsers do not submit a form inside a form, so Enter in such a field does nothing.
 * Back is hidden on the first step. A double click on Next or Submit counts once, so it never skips a step.
 * Uncontrolled by default; pass `step` and `onStepChange` to control it.
 * After a successful submit the shell stays on the last step: the confirmation is yours, rendered in its place.
 * @intent wizard, multi-step form, step form, steps form, stepper, form steps, next back, create flow, onboarding flow, checkout
 * @example
 * const [done, setDone] = useState(false);
 * if (done) return <AlertMessage variant="success" title="Deal created" msg="The payment is locked in escrow." />;
 * return (
 *   <Card fluid className="p-6">
 *     <WizardShell submitText="Create deal" onSubmit={async () => { await createDeal(draft); setDone(true); }} steps={[
 *       { title: "Terms", content: <TermsFields draft={draft} />, validate: () => checkTerms(draft) },
 *       { title: "Payment", content: <PaymentFields draft={draft} />, validate: () => checkPayment(draft) },
 *       { title: "Review", content: <KeyValueList items={reviewRows(draft)} /> },
 *     ]} />
 *   </Card>
 * );
 */
export function WizardShell({
  steps,
  onSubmit,
  step,
  defaultStep = 0,
  onStepChange,
  onCancel,
  backText = "Back",
  nextText = "Next",
  submitText = "Submit",
  cancelText = "Cancel",
  className,
}: Readonly<WizardShellProps>) {
  const [ownStep, setOwnStep] = useState(defaultStep);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const shown = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const lastIndex = steps.length - 1;
  const current = Math.min(Math.max(step ?? ownStep, 0), Math.max(lastIndex, 0));

  // When the step changes, move focus to its name, so a screen reader announces the new step and Tab goes to its
  // first field. Not on the first render (React's StrictMode runs this twice with the same step), and only when focus
  // was in the shell or was lost with an unmounted button (a parent's "Edit" link on a review step): a step change from
  // outside never pulls focus away from a field elsewhere on the page.
  useEffect(() => {
    if (shown.current === current) return;
    const first = shown.current === null;
    shown.current = current;
    if (first) return;
    const active = document.activeElement;
    if (!active || active === document.body || formRef.current?.contains(active)) statusRef.current?.focus();
  }, [current]);

  if (steps.length === 0) return null;

  const go = (to: number) => {
    if (step === undefined) setOwnStep(to);
    onStepChange?.(to);
  };

  const advance = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    const at = current;
    try {
      const valid = (await steps[at].validate?.()) ?? true;
      if (!valid) return;
      if (at < lastIndex) go(at + 1);
      else await onSubmit();
    } catch (error) {
      // A validate or onSubmit that throws keeps the step. Reported once, not left as an unhandled rejection.
      console.error(error);
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  const isLast = current === lastIndex;
  return (
    <form
      ref={formRef}
      className={cn("flex w-full flex-col gap-6", className)}
      // Capture, not bubble: a browser stops a submit event at a form nested in another form, before React's bubble
      // listener, and then reloads the page. Only the shell's own submit advances; any other is cancelled.
      onSubmitCapture={(e) => {
        e.preventDefault();
        if (e.target === e.currentTarget) void advance();
      }}
      // The second click of a double click lands on the button that has just become the next step's Next or Submit.
      // Cancelling it keeps the review step from being skipped. A scripted click and the keyboard have no detail > 1.
      onClickCapture={(e) => {
        if (e.detail > 1 && (e.target as Element).closest?.('button[type="submit"]')) e.preventDefault();
      }}
    >
      <Steps horizontal items={steps.map((s) => ({ title: s.title }))} currentItemIndex={current} className="w-full" />
      <p ref={statusRef} tabIndex={-1} className="sr-only">
        {`Step ${current + 1} of ${steps.length}: ${steps[current].title}`}
      </p>
      <FormStack
        actions={
          <>
            {current > 0 ? (
              <Button type="button" variant="secondary" text={backText} isDisabled={pending} onPress={() => go(current - 1)} />
            ) : (
              onCancel && <Button type="button" variant="secondary" text={cancelText} isDisabled={pending} onPress={onCancel} />
            )}
            <Button type="submit" text={isLast ? submitText : nextText} isLoading={pending} />
          </>
        }
      >
        {steps[current].content}
      </FormStack>
    </form>
  );
}
