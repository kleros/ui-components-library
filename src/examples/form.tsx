import React, { useState } from "react";
import FileUploader from "../lib/form/file-uploader";
import Field from "../lib/form/field";
import Textarea from "../lib/form/textarea";
import Slider from "../lib/form/slider";

const Form = () => {
  const [date, setDate] = useState(1);
  return (
    <>
      <Field placeholder={"eg. Escrow"} variant='success' />
      <Textarea
        placeholder={"eg. longer text"}
        message={"Error msg"}
        variant='error'
      />
      <FileUploader callback={() => {}} variant='info' msg='Some msg' />
      <Slider
        callback={setDate}
        min={1}
        max={30}
        leftLabel='1 day'
        rightLabel='1 month'
        label={`${date} days`}
      />
    </>
  );
};

export default Form;
