import React, { useState } from "react";
import FileUploader from "../lib/form/file-uploader";
import Field from "../lib/form/field";
import Textarea from "../lib/form/textarea";
import Slider from "../lib/form/slider";
import Datepicker from "../lib/form/datepicker";

const Form = () => {
  const [value, setValue] = useState(1);
  return (
    <>
      <Datepicker
        time
        onSelect={() => {
          // Called when select is clicked with date as args
        }}
      />
      <Datepicker
        onSelect={() => {
          // Called when select is clicked with date as args
        }}
      />
      <Field placeholder={"eg. Escrow"} variant="success" />
      <Textarea
        placeholder={"eg. longer text"}
        message={"Error msg"}
        variant="error"
      />
      <FileUploader
        callback={() => {
          // function to be called onChange with file as argument
        }}
        variant="info"
        msg="Some msg"
      />
      <Slider
        callback={setValue}
        min={1}
        max={30}
        leftLabel="1 day"
        rightLabel="1 month"
        label={`${value} days`}
      />
    </>
  );
};

export default Form;
