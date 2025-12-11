import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import CustomAccordion from "../lib/accordion/custom";
import Button from "../lib/button/index";

const meta = {
  component: CustomAccordion,
  title: "CustomAccordion",
  tags: ["autodocs"],
} satisfies Meta<typeof CustomAccordion>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** CustomAccordion provides the ability to render custom title, body and expandButton. */
export const Accordion: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
        expandButton: ({ expanded, toggle }) => {
          return expanded ? (
            <Button text="Close" variant="secondary" onPress={toggle} />
          ) : (
            <Button text="Expand" onPress={toggle} />
          );
        },
      },
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],

    themeUI: "dark",
    backgroundUI: "light",
  },
};

/** You can provide an expand button at Parent level for all Accordion Items */
export const GlobalExpandButton: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
      },
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],
    expandButton: ({ expanded, toggle }) => {
      return expanded ? (
        <Button text="Close" variant="secondary" onPress={toggle} />
      ) : (
        <Button text="Expand" onPress={toggle} />
      );
    },
    themeUI: "dark",
    backgroundUI: "light",
  },
};

/** Parent Expand Button can be ovverrided at Item level if required */
export const ItemExpandButton: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
        expandButton: ({ expanded, toggle }) => {
          return expanded ? (
            <Button text="Item Close" variant="secondary" onPress={toggle} />
          ) : (
            <Button text="Item Expand" onPress={toggle} />
          );
        },
      },
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],
    expandButton: (expanded) => {
      return expanded ? (
        <Button text="Close" variant="secondary" />
      ) : (
        <Button text="Expand" />
      );
    },
    themeUI: "dark",
    backgroundUI: "light",
  },
};
