import { seedBackend, requestLogin } from "./utils";
import { organization, newTeam, team } from "../fixtures/variables";
import { user } from "../fixtures/users";

describe("Create New Team", () => {
  beforeEach(() => {
    seedBackend();
    requestLogin();
  });

  it("should add and update teams", () => {
    cy.visit(`/settings/${organization.name}/teams`);
    cy.get("#new-team").click();
    cy.get("input[formcontrolname=slug]").type(newTeam.slug);
    cy.get("#create-team-submit").click();
    cy.contains(`#${newTeam.slug}`);
  });

  it("should show validation errors", () => {
    cy.visit(`/settings/${organization.name}/teams`);
    cy.get("#new-team").click();
    cy.get("input[formcontrolname=slug]").type(
      newTeam.slug + " invalid spaces"
    );
    cy.get("#create-team-submit").click();
    cy.contains("consisting of letters, numbers, underscores or hyphens.");
  });
});

describe("List Team Members", () => {
  beforeEach(() => {
    seedBackend();
    requestLogin();
  });

  it("should add and list team member", () => {
    cy.visit(`/settings/${organization.name}/teams/${team.name}/members/`);
    cy.contains(`#${team.name}`);
    cy.get("mat-label").contains("Add Member");
    cy.get("mat-select").first().click();
    cy.get("mat-option span")
      .contains(user.email)
      .then((option) => option[0].click());
    cy.get("mat-list mat-list-item").first().contains(user.email);
  });
});
