import React, {
  useState,
  useEffect,
  KeyboardEvent,
  WheelEvent,
  ChangeEvent,
  FocusEvent,
  useRef,
} from "react";
import BigNumber from "bignumber.js";

export interface FormatOptions {
  /** String to prepend */
  prefix?: string;
  /** Decimal separator */
  decimalSeparator?: string;
  /** Grouping separator of the integer part */
  groupSeparator?: string;
  /** Primary grouping size of the integer part */
  groupSize?: number;
  /** Secondary grouping size of the integer part */
  secondaryGroupSize?: number;
  /** Grouping separator of the fraction part */
  fractionGroupSeparator?: string;
  /** Grouping size of the fraction part */
  fractionGroupSize?: number;
  /** String to append */
  suffix?: string;
}

export interface BigNumberFieldProps {
  /** The current value (controlled). */
  value?: string | BigNumber;
  /** The default value (uncontrolled). */
  defaultValue?: string | BigNumber;
  /** The minimum allowed value. */
  minValue?: string | BigNumber;
  /** The maximum allowed value. */
  maxValue?: string | BigNumber;
  /** The amount to increment or decrement by. */
  step?: string | BigNumber;
  /** Handler that is called when the value changes. */
  onChange?: (value: BigNumber) => void;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Whether the input is read only. */
  isReadOnly?: boolean;
  /** Whether the input is required. */
  isRequired?: boolean;
  /** Whether the wheel scrolling is disabled. */
  isWheelDisabled?: boolean;
  /** ID for the input element. */
  id?: string;
  /** Label for the input. */
  label?: string;
  /** Description for the input. */
  description?: string;
  /** Error message for the input. */
  errorMessage?: string;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Format options for the BigNumber.toFormat method */
  formatOptions?: FormatOptions;
  /** Additional props for the input element. */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** A function that returns an error message if a given value is invalid.
   * Return a string to denote invalid.*/
  validate?: (value: BigNumber | null) => true | null | undefined | string;
  /** Flag to enable field errors, alternative to `message`
   * This will show the validation errors from browser, or custom error in case `validate` is setup on Field.
   */
  showFieldError?: boolean;
  /** ClassName for field error message. */
  fieldErrorClassName?: string;
}

// Default format configuration
const DEFAULT_FORMAT = {
  prefix: "",
  decimalSeparator: ".",
  groupSeparator: ",",
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: " ",
  fractionGroupSize: 0,
  suffix: "",
};

export function useBigNumberField(props: BigNumberFieldProps) {
  // Configure BigNumber format
  useEffect(() => {
    const formatConfig = {
      ...DEFAULT_FORMAT,
      ...props.formatOptions,
    };

    BigNumber.config({
      EXPONENTIAL_AT: 1e9,
      FORMAT: formatConfig,
    });
  }, [props.formatOptions]);

  const {
    value,
    defaultValue,
    minValue,
    maxValue,
    step = "1",
    onChange,
    isDisabled,
    isReadOnly,
    isWheelDisabled,
    id,
  } = props;

  const stepBig = new BigNumber(step.toString()).abs();
  const minBig =
    minValue !== undefined ? new BigNumber(minValue.toString()) : undefined;
  const maxBig =
    maxValue !== undefined ? new BigNumber(maxValue.toString()) : undefined;

  // State for the input value
  const [inputValue, setInputValue] = useState<string>(() => {
    if (value !== undefined) {
      return new BigNumber(value.toString()).toFormat();
    }
    if (defaultValue !== undefined) {
      return new BigNumber(defaultValue.toString()).toFormat();
    }
    return "";
  });

  // State to track if the input is currently formatted
  const [isFormatted, setIsFormatted] = useState<boolean>(false);

  // State to track input's validation
  const [validationResult, setValidationResult] = useState<{
    isInvalid: boolean;
    validationError?: string;
  }>({ isInvalid: false });

  // State for the numeric value
  const [numberValue, setNumberValue] = useState<BigNumber | null>(() => {
    try {
      if (value !== undefined) {
        return new BigNumber(value.toString());
      }
      if (defaultValue !== undefined) {
        return new BigNumber(defaultValue.toString());
      }
    } catch (error) {
      // If the value can't be parsed as a BigNumber, return null
      console.error("Error parsing initial BigNumber value:", error);
    }
    return null;
  });

  // Debounce timer reference for formatting after inactivity
  const formatTimerRef = useRef<number | null>(null);

  // Update internal state when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString());
      try {
        setNumberValue(new BigNumber(value.toString()));
      } catch (error) {
        console.error("Error updating BigNumber value:", error);
        setNumberValue(null);
      }
    }
  }, [value]);

  // Apply formatting after 3 second of inactivity when numberValue changes
  useEffect(() => {
    if (formatTimerRef.current !== null) {
      window.clearTimeout(formatTimerRef.current);
      formatTimerRef.current = null;
    }

    if (numberValue !== null && !isFormatted) {
      formatTimerRef.current = window.setTimeout(() => {
        setInputValue(numberValue.toFormat());
        setIsFormatted(true);
        formatTimerRef.current = null;
      }, 3000);
    }

    return () => {
      if (formatTimerRef.current !== null) {
        window.clearTimeout(formatTimerRef.current);
        formatTimerRef.current = null;
      }
    };
  }, [numberValue, isFormatted]);

  // Check if increment/decrement buttons should be disabled
  const canIncrement = (): boolean => {
    if (isDisabled || isReadOnly) return false;
    if (maxBig === undefined || numberValue === null) return true;

    return numberValue.plus(stepBig).isLessThanOrEqualTo(maxBig);
  };

  const canDecrement = (): boolean => {
    if (isDisabled || isReadOnly) return false;
    if (minBig === undefined || numberValue === null) return true;

    return numberValue.minus(stepBig).isGreaterThanOrEqualTo(minBig);
  };

  // Clamp a value to the min/max range
  const clampValue = (value: BigNumber): BigNumber => {
    let clampedValue = value;

    // Clamp to min if defined
    if (minBig !== undefined && value.isLessThan(minBig)) {
      clampedValue = minBig;
    }

    // Clamp to max if defined
    if (maxBig !== undefined && value.isGreaterThan(maxBig)) {
      clampedValue = maxBig;
    }

    return clampedValue;
  };

  // Handle increment/decrement
  const increment = () => {
    if (!canIncrement()) return;

    let newValue: BigNumber;
    if (numberValue === null) {
      newValue = stepBig;
    } else {
      newValue = numberValue.plus(stepBig);
    }

    // Ensure the new value doesn't exceed the maximum
    if (maxBig !== undefined && newValue.isGreaterThan(maxBig)) {
      newValue = maxBig;
    }

    setNumberValue(newValue);
    setInputValue(newValue.toString());
    setIsFormatted(false);
    onChange?.(newValue);
    setValidationResult(getValidationResult(newValue));
  };

  const decrement = () => {
    if (!canDecrement()) return;

    let newValue: BigNumber;
    if (numberValue === null) {
      newValue = stepBig.negated();
    } else {
      newValue = numberValue.minus(stepBig);
    }

    // Ensure the new value isn't less than the minimum
    if (minBig !== undefined && newValue.isLessThan(minBig)) {
      newValue = minBig;
    }

    setNumberValue(newValue);
    setInputValue(newValue.toString());
    setIsFormatted(false);
    onChange?.(newValue);
    setValidationResult(getValidationResult(newValue));
  };

  // Helper function to escape special characters in regex
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Unformat a formatted string to a raw number string
  const unformatValue = (formattedValue: string): string => {
    if (!formattedValue) return "";

    const formatConfig = {
      ...DEFAULT_FORMAT,
      ...props.formatOptions,
    };

    // Remove prefix and suffix
    let result = formattedValue;
    if (formatConfig.prefix && result.startsWith(formatConfig.prefix)) {
      result = result.substring(formatConfig.prefix.length);
    }
    if (formatConfig.suffix && result.endsWith(formatConfig.suffix)) {
      result = result.substring(0, result.length - formatConfig.suffix.length);
    }

    // Remove group separators
    // eslint-disable-next-line security/detect-non-literal-regexp
    const groupSepRegex = new RegExp(
      escapeRegExp(formatConfig.groupSeparator),
      "g",
    );
    result = result.replace(groupSepRegex, "");

    // Replace decimal separator with standard dot if needed
    if (formatConfig.decimalSeparator !== ".") {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const decimalSepRegex = new RegExp(
        escapeRegExp(formatConfig.decimalSeparator),
        "g",
      );
      result = result.replace(decimalSepRegex, ".");
    }

    return result.trim();
  };

  // Validate input to only allow numbers, decimal points, and minus signs
  const isValidInput = (input: string): boolean => {
    // Allow empty string
    if (input === "") return true;

    // Allow a single minus sign at the beginning
    if (input === "-") return true;

    // Regular expression to match valid number format (including decimal and negative)
    const regex = /^-?\d*\.?\d*$/;
    return regex.test(input);
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;

    // If the input is formatted, we need to unformat it first
    if (isFormatted) {
      // We're no longer in formatted mode since the user is typing
      setIsFormatted(false);

      // Unformat the value and update the input
      const unformattedValue = unformatValue(newInputValue);
      if (isValidInput(unformattedValue)) {
        try {
          if (unformattedValue === "" || unformattedValue === "-") {
            setInputValue(unformattedValue);
            setNumberValue(null);
            if (unformattedValue === "") {
              onChange?.(new BigNumber(0));
            }
            return;
          }

          const newNumberValue = new BigNumber(unformattedValue);
          // Clamp the value to min/max range
          const clampedValue = clampValue(newNumberValue);

          // Update the input value and state
          if (!clampedValue.isEqualTo(newNumberValue)) {
            // If the value was clamped, update the input to show the clamped value
            setInputValue(clampedValue.toString());
          } else {
            setInputValue(unformattedValue);
          }

          setNumberValue(clampedValue);
          onChange?.(clampedValue);
        } catch (error) {
          console.error("Error parsing unformatted value:", error);
          setInputValue(unformattedValue);
          setNumberValue(null);
        }
      }
      return;
    }

    // Normal case - not formatted
    if (isValidInput(newInputValue)) {
      try {
        if (newInputValue === "" || newInputValue === "-") {
          setInputValue(newInputValue);
          setNumberValue(null);
          if (newInputValue === "") {
            onChange?.(new BigNumber(0));
          }
          return;
        }

        const newNumberValue = new BigNumber(newInputValue);
        // Clamp the value to min/max range
        const clampedValue = clampValue(newNumberValue);

        // Update the input value and state
        if (!clampedValue.isEqualTo(newNumberValue)) {
          // If the value was clamped, update the input to show the clamped value
          setInputValue(clampedValue.toString());
        } else {
          setInputValue(newInputValue);
        }

        setNumberValue(clampedValue);
        onChange?.(clampedValue);
      } catch (error) {
        // If the input can't be parsed as a BigNumber, just update the input value
        console.error("Error parsing input as BigNumber:", error);
        setInputValue(newInputValue);
        setNumberValue(null);
      }
    }
  };

  // Handle focus event to unformat the value
  const handleFocus = (_ignored: FocusEvent<HTMLInputElement>) => {
    // Clear any existing format timer when the user focuses on the input
    if (formatTimerRef.current !== null) {
      window.clearTimeout(formatTimerRef.current);
      formatTimerRef.current = null;
    }

    if (isFormatted && numberValue !== null) {
      // Unformat the value when the user focuses on the input
      setInputValue(numberValue.toString());
      setIsFormatted(false);
    }
  };

  // Handle blur event to normalize and format the input value
  const handleBlur = () => {
    if (numberValue !== null) {
      // Format the number using BigNumber.toFormat
      setInputValue(numberValue.toFormat());
      setIsFormatted(true);
    } else if (inputValue !== "" && inputValue !== "-") {
      setInputValue("");
    }

    setValidationResult(getValidationResult());
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled || isReadOnly) return;

    // Allow: backspace, delete, tab, escape, enter, decimal point, minus sign
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      ".",
      "-",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (
      (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key)) ||
      allowedKeys.includes(e.key) ||
      // Allow numbers
      /^\d$/.test(e.key)
    ) {
      // Special handling for minus sign - only allow at the beginning
      if (e.key === "-" && e.currentTarget.selectionStart !== 0) {
        e.preventDefault();
        return;
      }

      // Special handling for decimal point - only allow one
      if (e.key === "." && inputValue.includes(".")) {
        e.preventDefault();
        return;
      }

      // Handle special key actions
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          increment();
          break;
        case "ArrowDown":
          e.preventDefault();
          decrement();
          break;
        case "Home":
          if (minBig !== undefined) {
            e.preventDefault();
            setNumberValue(minBig);
            setInputValue(minBig.toString());
            setIsFormatted(false);
            onChange?.(minBig);
          }
          break;
        case "End":
          if (maxBig !== undefined) {
            e.preventDefault();
            setNumberValue(maxBig);
            setInputValue(maxBig.toString());
            setIsFormatted(false);
            onChange?.(maxBig);
          }
          break;
      }

      return;
    }

    // Prevent all other keys
    e.preventDefault();
  };

  // Handle wheel events
  const handleWheel = (e: WheelEvent<HTMLInputElement>) => {
    if (isDisabled || isReadOnly || isWheelDisabled) return;

    // If on a trackpad, users can scroll in both X and Y at once, check the magnitude of the change
    // if it's mostly in the X direction, then just return, the user probably doesn't mean to inc/dec
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) {
      return;
    }

    if (e.deltaY > 0) {
      increment();
    } else if (e.deltaY < 0) {
      decrement();
    }
  };

  // Generate ARIA attributes for accessibility
  const getAriaAttributes = () => {
    const ariaAttributes: Record<string, any> = {
      role: "spinbutton",
      "aria-valuemin": minBig?.toString() || "",
      "aria-valuemax": maxBig?.toString() || "",
      "aria-valuenow": numberValue?.toString() || "",
      "aria-valuetext": numberValue?.toString() || "",
    };

    if (isDisabled) {
      ariaAttributes["aria-disabled"] = true;
    }

    if (isReadOnly) {
      ariaAttributes["aria-readonly"] = true;
    }

    if (props.isRequired) {
      ariaAttributes["aria-required"] = true;
    }

    return ariaAttributes;
  };

  // Input props
  const getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> =
    () => ({
      id,
      type: "text",
      inputMode: "decimal" as const,
      value: inputValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onWheel: handleWheel,
      disabled: isDisabled || isReadOnly,
      readOnly: isReadOnly,
      required: props.isRequired,
      placeholder: props.placeholder,
      "aria-invalid": validationResult?.isInvalid,
      ...getAriaAttributes(),
      ...props.inputProps,
    });

  // Label props
  const getLabelProps = () => ({
    htmlFor: id,
  });

  // Field Error Render props
  const getValidationResult = (value?: BigNumber) => {
    const fieldErrorProps = {
      isInvalid: false,
      validationError: "",
    };

    if (
      props.isRequired &&
      (value ? value.toString() : inputValue).trim() === ""
    ) {
      fieldErrorProps.isInvalid = true;
      fieldErrorProps.validationError = "Please fill out this field.";
    }

    const validate = props.validate;
    if (validate) {
      const result = validate(value ?? numberValue);
      if (typeof result === `string`) {
        fieldErrorProps.isInvalid = true;
        fieldErrorProps.validationError = result;
      }
    }
    return fieldErrorProps;
  };

  // Increment button props
  const getIncrementButtonProps = () => ({
    type: "button" as const,
    "aria-label": "Increment",
    "aria-controls": id,
    isDisabled: !canIncrement(),
    onPress: increment,
  });

  // Decrement button props
  const getDecrementButtonProps = () => ({
    type: "button" as const,
    "aria-label": "Decrement",
    "aria-controls": id,
    isDisabled: !canDecrement(),
    onPress: decrement,
  });

  // Group props
  const getGroupProps = () => ({
    "aria-disabled": isDisabled || undefined,
  });

  // Description props
  const getDescriptionProps = () => ({
    id: props.description ? `${id}-description` : undefined,
    slot: "description",
  });

  // Error message props
  const getErrorMessageProps = () => ({
    id: props.errorMessage ? `${id}-error` : undefined,
  });

  return {
    inputProps: getInputProps(),
    labelProps: getLabelProps(),
    incrementButtonProps: getIncrementButtonProps(),
    decrementButtonProps: getDecrementButtonProps(),
    groupProps: getGroupProps(),
    descriptionProps: getDescriptionProps(),
    errorMessageProps: getErrorMessageProps(),
    validationResult,
    inputValue,
    numberValue,
    canIncrement: canIncrement(),
    canDecrement: canDecrement(),
  };
}
