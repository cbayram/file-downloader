import React from "react";
import { FileDownloader } from "./FileDownloader";
import { files } from "testData";
import { Status } from "enums";

const getSelectedLabel = () => cy.get(".files-selected-label");
const getRows = () => cy.get(".file-downloader tbody tr");
const getDownloadSelected = () => cy.get(".download-selected-files-button");
describe("<FileDownloader />", () => {
  it("renders", () => {
    cy.mount(<FileDownloader files={files} />);
    getSelectedLabel().contains("None Selected");
    getDownloadSelected().contains("Download Selected").should("be.disabled");
    getRows().should("have.length", files.length);
    getRows().each(($rowEl, index) => {
      const cb = cy.wrap($rowEl).find('input[type="checkbox"]');
      if (files[index].status === Status.Available) {
        cb.should("not.be.disabled");
      } else {
        cb.should("be.disabled");
      }
    });
  });

  it("selects and unselects all", () => {
    cy.mount(<FileDownloader files={files} />);

    cy.get('.files-selected-label input[type="checkbox"]').should(
      "not.be.checked"
    );
    getSelectedLabel().click();
    getSelectedLabel().contains(
      `Selected ${files.filter((f) => f.status === Status.Available).length}`
    );
    cy.get('.files-selected-label input[type="checkbox"]').should("be.checked");

    getSelectedLabel().click();
    getSelectedLabel().contains("None Selected");
    cy.get('.files-selected-label input[type="checkbox"]').should(
      "not.be.checked"
    );
  });

  it("selects and unselects file, verifying select all indeterminate state", () => {
    cy.mount(<FileDownloader files={files} />);
    getSelectedLabel().contains("None Selected");
    cy.get('.files-selected-label input[type="checkbox"]:indeterminate').should(
      "not.exist"
    );
    const firstAvailableIndex = files.findIndex(
      (f) => f.status === Status.Available
    );
    cy.get(".file-downloader tbody tr").eq(firstAvailableIndex).click();
    getSelectedLabel().contains("Selected 1");
    cy.get('.files-selected-label input[type="checkbox"]:indeterminate').should(
      "exist"
    );
    cy.get('.files-selected-label input[type="checkbox"]').click();
    getSelectedLabel().contains(
      `Selected ${files.filter((f) => f.status === Status.Available).length}`
    );
  });

  it("disables selection of unavailable file", () => {
    cy.mount(<FileDownloader files={files} />);
    getSelectedLabel().contains("None Selected");
    const firstUnavailableIndex = files.findIndex(
      (f) => f.status !== Status.Available
    );
    cy.get(".file-downloader tbody tr").eq(firstUnavailableIndex).click();
    getSelectedLabel().contains("None Selected");
  });

  it("should alert downloaded files", () => {
    cy.mount(<FileDownloader files={files} />);
    getSelectedLabel().contains("None Selected");
    getSelectedLabel().click();
    getSelectedLabel().contains(
      `Selected ${files.filter((f) => f.status === Status.Available).length}`
    );
    getDownloadSelected().should("not.be.disabled");
    getDownloadSelected().click();
    cy.on("window:alert", (t) => {
      files.forEach((f) => {
        if (f.status === Status.Available) {
          expect(t).to.contains(f.device);
          expect(t).to.contains(f.path);
        }
      });
    });
  });
});
