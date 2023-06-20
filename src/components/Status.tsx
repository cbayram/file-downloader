import React from "react";
import { Status as StatusEnum } from "enums";
import { MdCircle } from "react-icons/md";
import { css } from "@emotion/css";

export function StatusIcon({ status }: { status: StatusEnum }) {
  switch (status) {
    case StatusEnum.Available:
      return (
        <span
          className={css`
            display: inline-flex;
            vertical-align: text-top;
            font-size: 1.5em;
          `}
        >
          <MdCircle fill="#94ce50" />
        </span>
      );
    case StatusEnum.Scheduled:
      return null;
    default:
      throw new Error(`Unknown status ${status}`);
  }
}

export function StatusLabel({ status }: { status: StatusEnum }) {
  switch (status) {
    case StatusEnum.Available:
      return <span>Available</span>;
    case StatusEnum.Scheduled:
      return <span>Scheduled</span>;
    default:
      throw new Error(`Unknown status ${status}`);
  }
}
