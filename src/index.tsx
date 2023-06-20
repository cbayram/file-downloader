import React from "react";
import ReactDOM from "react-dom/client";
import { FileDownloader } from "components/FileDownloader";
import { files } from "testData";
import "index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <FileDownloader files={files} />
  </React.StrictMode>
);
