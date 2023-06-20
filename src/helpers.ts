import { File } from "types";

const ID_DELIMITER = "|";
export function getIdForFile({ device, path }: File): string {
  const parts = [device, path];
  return parts
    .map((part) => part.replaceAll(ID_DELIMITER, ""))
    .join(ID_DELIMITER);
}
