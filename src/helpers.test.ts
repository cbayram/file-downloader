import { getIdForFile } from "helpers";
import { files } from "testData";

describe("helpers", () => {
  describe("getIdForFile", () => {
    it("gets id for file", () => {
      expect(getIdForFile(files[0])).toEqual(
        `Stark|\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe`
      );
    });

    it("gets escapes id delimiter", () => {
      const file = files[0];

      expect(
        getIdForFile({
          ...file,
          device: `Star||k`,
          path: "\\Device\\Harddisk|Volume2\\Windows|\\System32\\smss.exe",
        })
      ).toEqual(`Stark|\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe`);
    });
  });
});
