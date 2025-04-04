import React from "react";
import { Form as AriaForm, type FormProps } from "react-aria-components";

/** A form is a group of inputs that allows users to submit data to a server,
 * with support for providing field validation errors. */
function Form({ children, ...props }: Readonly<FormProps>) {
  return <AriaForm {...props}>{children}</AriaForm>;
}

export default Form;
