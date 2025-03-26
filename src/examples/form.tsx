import React from "react";
import FileUploader from "../lib/form/file-uploader";
import Searchbar from "../lib/form/searchbar";
import Slider from "../lib/form/slider";
import Datepicker from "../lib/form/datepicker";
import Telegram from "../assets/svgs/telegram.svg";
import NumberField from "../lib/form/number-field";
import TextField from "../lib/form/text-field";
import TextArea from "../lib/form/text-area";
import { getLocalTimeZone, now } from "@internationalized/date";
const Form = () => {
  return (
    <>
      <Datepicker time minValue={now(getLocalTimeZone())} />
      <Datepicker minValue={now(getLocalTimeZone())} />

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
        callback={() => {}}
        minValue={1}
        maxValue={30}
        leftLabel="1 day"
        rightLabel="1 month"
        formatter={(value) => `${value} days`}
        defaultValue={3}
      />
    </>
  );
};

export default Form;
