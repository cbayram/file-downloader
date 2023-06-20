import React, { useCallback, useEffect, useMemo, useState } from "react";
import { File } from "types";
import { Status } from "enums";
import { getIdForFile } from "helpers";
import { StatusIcon, StatusLabel } from "components/Status";
import { MdFileDownload } from "react-icons/md";
import "components/FileDownloader.css";

type ExtendedFile = File & { id: string; selected: boolean };

/**
 * Notes:
 * I opted for a semantic (a11y friendly) table implementation here given time constraints.
 *
 * VIRTUALIZATION
 * In real world, we would want to add virtualization to handle large amounts of files.
 *
 * FILTERING
 * We would also need to consider the select all behavior when the ability to filter is provided.
 * Are we selecting all that is visible (filtered)?
 *
 * SERVER-SIDE PAGINATION
 * What is the behavior of Select All if there is more data than the client has in memory?
 *
 * These are some scenarios I've run into implementing Select All functionality over large filterable datasets with real time updates.
 */
export function FileDownloader({ files }: { files: Array<File> }) {
  const [extendedFiles, setExtendedFiles] = useState<Array<ExtendedFile>>([]);

  // The aim here is to handle incoming data (new files, removed files and update statuses).
  useEffect(() => {
    // group existing files by id to avoid O(n) lookup resulting in O(n^2) time complexity
    const extendedFilesById = extendedFiles.reduce<
      Map<ExtendedFile["id"], ExtendedFile>
    >((byId, file) => {
      byId.set(file.id, file);
      return byId;
    }, new Map<ExtendedFile["id"], ExtendedFile>());

    setExtendedFiles(
      // Retain the selection state for incoming available files
      files.map((file) => {
        const id = getIdForFile(file);
        const selected =
          // Ensure status is still available for file as status might have changed
          file.status === Status.Available &&
          (extendedFilesById.get(id) ?? { selected: false }).selected;
        return { ...file, id, selected };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const selectableFilesCount = useMemo(
    () =>
      extendedFiles.filter(({ status }) => status === Status.Available).length,
    [extendedFiles]
  );
  const selectedFilesCount = useMemo(
    () =>
      extendedFiles.filter(
        ({ status, selected }) => status === Status.Available && selected
      ).length,
    [extendedFiles]
  );
  const { noFilesSelected, allFilesSelected, someFilesSelected } =
    useMemo(() => {
      const noFilesSelected = selectedFilesCount === 0;
      const allFilesSelected =
        !noFilesSelected && selectedFilesCount === selectableFilesCount;
      const someFilesSelected = !noFilesSelected && !allFilesSelected;
      return {
        noFilesSelected,
        allFilesSelected,
        someFilesSelected,
      };
    }, [selectedFilesCount, selectableFilesCount]);

  const { selectAllChecked, selectAllIndeterminate } = useMemo(
    () => ({
      selectAllChecked: noFilesSelected
        ? false
        : allFilesSelected
        ? true
        : undefined,
      selectAllIndeterminate: someFilesSelected ? true : false,
    }),
    [noFilesSelected, allFilesSelected, someFilesSelected]
  );

  const selectAllLabel = useMemo(() => {
    if (selectedFilesCount === 0) {
      return "None Selected";
    }
    return `Selected ${selectedFilesCount}`;
  }, [selectedFilesCount]);

  const selectAllFiles = useCallback(() => {
    setExtendedFiles((prevExtendedFiles) =>
      prevExtendedFiles.map((file) => ({
        ...file,
        selected: file.status === Status.Available && !allFilesSelected,
      }))
    );
  }, [allFilesSelected]);

  const downloadSelectedFiles = useCallback(() => {
    const filesToDownload = extendedFiles
      .filter(({ status, selected }) => status === Status.Available && selected)
      .map(({ device, path }) => `device: ${device}, path: ${path}`)
      .join("\n");
    alert(filesToDownload);
  }, [extendedFiles]);

  const selectFileById = useCallback((id: ExtendedFile["id"]) => {
    setExtendedFiles((prevExtendedFiles) =>
      prevExtendedFiles.map((file) =>
        file.id === id
          ? {
              ...file,
              selected: file.status === Status.Available && !file.selected,
            }
          : file
      )
    );
  }, []);

  return (
    <div className="file-downloader">
      <div className="file-action-bar">
        <label className="files-selected-label">
          <input
            style={{ marginRight: 16 }}
            type="checkbox"
            checked={selectAllChecked}
            ref={(input) => {
              if (input) {
                input.indeterminate = selectAllIndeterminate;
              }
            }}
            onChange={selectAllFiles}
          />
          {`${selectAllLabel}`}
        </label>
        <button
          className="download-selected-files-button"
          disabled={noFilesSelected}
          onClick={downloadSelectedFiles}
        >
          <span>
            <MdFileDownload />
          </span>
          Download Selected
        </button>
      </div>
      <table aria-label="Files">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Device</th>
            <th>Path</th>
            <th>
              <span style={{ display: "none" }} aria-hidden="true">
                Status Icon
              </span>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {extendedFiles.map((file) => {
            const { id, selected, name, device, path, status } = file;
            const disabled = status !== Status.Available;
            return (
              <tr
                key={id}
                onClick={() => selectFileById(id)}
                aria-selected={selected}
                aria-disabled={disabled}
              >
                <td>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected}
                    readOnly={true}
                  />
                </td>
                <td>{name}</td>
                <td>{device}</td>
                <td>{path}</td>
                <td className="status-icon">
                  <StatusIcon status={status} />
                </td>
                <td>
                  <StatusLabel status={status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
