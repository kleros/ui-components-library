import React, { useState } from "react";
import FileUploader from "../lib/form/file-uploader";
import Searchbar from "../lib/form/searchbar";
import Slider from "../lib/form/slider";
import Datepicker from "../lib/form/datepicker";
import Telegram from "../assets/svgs/telegram.svg";
import NumberField from "../lib/form/number-field";
import TextField from "../lib/form/text-field";
import TextArea from "../lib/form/text-area";
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
      <TextField
        placeholder={"eg. Email"}
        variant="success"
        message="success msg"
        type="email"
      />
      <NumberField
        placeholder={"Number"}
        variant="info"
        message="Age is your"
        Icon={Telegram}
      />

      <NumberField
        placeholder={"Number"}
        variant="warning"
        label="Enter your age"
        minValue={0}
      />

      <NumberField placeholder={"Number"} />
      <Searchbar />
      <TextArea
        placeholder={"eg. longer text"}
        message={"Error msg"}
        variant="error"
        resizeY
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
