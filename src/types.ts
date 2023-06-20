import { Status } from "enums";

export type File = {
  name: string;
  device: string;
  path: string;
  status: Status;
};
