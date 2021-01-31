import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, combineLatest, timer } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
} from "rxjs/operators";

import { IssuesService } from "../issues.service";
import { OrganizationsService } from "src/app/api/organizations/organizations.service";
import { normalizeProjectParams } from "../utils";
import { OrganizationProject } from "src/app/api/organizations/organizations.interface";
import { ProjectsService } from "src/app/projects/projects.service";
import { ProjectKeysAPIService } from "src/app/api/projects/project-keys-api.service";
import { flattenedPlatforms } from "src/app/settings/projects/platform-picker/platforms-for-picker";

@Component({
  selector: "app-issue-zero-states",
  templateUrl: "./issue-zero-states.component.html",
  styleUrls: ["./issue-zero-states.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueZeroStatesComponent implements OnInit {
  loading$ = combineLatest([
    this.issuesService.loading$,
    this.projectsService.loading$,
  ]).pipe(map((loads) => loads.every((load) => !!load)));
  initialLoadComplete$ = combineLatest([
    this.issuesService.initialLoadComplete$,
    this.projectsService.initialLoadComplete$,
  ]).pipe(map((loads) => loads.every((load) => !!load)));
  orgHasAProject$ = this.organizationsService.orgHasAProject$;
  projectsFromParams$ = this.activatedRoute.queryParams.pipe(
    map((params) => normalizeProjectParams(params.project))
  );
  activeOrganizationProjects$ = this.organizationsService
    .activeOrganizationProjects$;
  activeProjectID$ = combineLatest([
    this.projectsFromParams$,
    this.activeOrganizationProjects$,
  ]).pipe(
    map(([projectIDs, activeOrgProjects]) => {
      if (projectIDs.length === 1) {
        return projectIDs[0];
      }
      if (activeOrgProjects?.length === 1) {
        return activeOrgProjects[0].id.toString();
      }
      return null;
    }),
    distinctUntilChanged()
  );
  activeProject$ = combineLatest([
    this.projectsService.projects$,
    this.activeProjectID$,
  ]).pipe(
    map(([projects, activeProjectID]) => {
      if (projects && activeProjectID) {
        const activeProject = projects.find(
          (project) => project.id === activeProjectID
        );
        return activeProject ? activeProject : null;
      }
      return null;
    })
  );
  showOnboarding$ = this.activeProject$.pipe(
    map((project) => !project?.firstEvent)
  );
  activeProjectPlatform$ = this.activeProject$.pipe(
    map((project) => project?.platform)
  );
  activeProjectPlatformName$ = this.activeProjectPlatform$.pipe(
    map((id) => flattenedPlatforms.find((platform) => platform.id === id)?.name)
  );
  firstProjectKey$ = combineLatest([
    this.organizationsService.activeOrganizationSlug$,
    this.activeProject$,
  ]).pipe(
    filter(
      ([organizationSlug, activeProject]) =>
        !!organizationSlug && !!activeProject
    ),
    switchMap(([organizationSlug, activeProject]) =>
      this.projectKeysAPIService
        .list(organizationSlug!, activeProject!.slug)
        .pipe(map((keys) => keys[0]))
    )
  );

  copiedDsn$ = new BehaviorSubject(false);

  /**
   * Corresponds to project picker/header nav/project IDs in the URL
   * If the count is zero, we show issues from all projects
   */
  appliedProjectCount$ = this.projectsFromParams$.pipe(
    map((projects) => {
      if (Array.isArray(projects)) {
        return projects.length;
      }
      return 0;
    })
  );

  /**
   * Either a single project is applied with the picker, or there's only one
   * project in the org, which is functionally similar for some things
   */
  singleProjectApplied$ = combineLatest([
    this.appliedProjectCount$,
    this.activeOrganizationProjects$,
  ]).pipe(
    map(
      ([appliedProjectCount, activeOrganizationProjects]) =>
        appliedProjectCount === 1 || activeOrganizationProjects?.length === 1
    )
  );

  projectsWhereAdminIsNotOnTheTeam$ = combineLatest([
    this.projectsFromParams$,
    this.activeOrganizationProjects$,
  ]).pipe(
    map(([projectsFromParams, activeOrgProjects]) => {
      if (!Array.isArray(projectsFromParams)) {
        return [];
      }
      const projectsMatchedFromParams: OrganizationProject[] = [];
      projectsFromParams.forEach((projectId) => {
        const matchedProject = activeOrgProjects?.find(
          (project) => project.id === parseInt(projectId, 10)
        );
        if (matchedProject) {
          projectsMatchedFromParams.push(matchedProject);
        }
      });
      return projectsMatchedFromParams.filter(
        (project) => project.isMember === false
      );
    })
  );

  userNotInSomeTeams$ = combineLatest([
    this.projectsWhereAdminIsNotOnTheTeam$,
    this.appliedProjectCount$,
  ]).pipe(
    map(
      ([projectsWhereAdminIsNotOnTheTeam, appliedProjectCount]) =>
        projectsWhereAdminIsNotOnTheTeam.length && appliedProjectCount > 1
    )
  );

  constructor(
    private issuesService: IssuesService,
    private organizationsService: OrganizationsService,
    private projectKeysAPIService: ProjectKeysAPIService,
    private projectsService: ProjectsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.projectsService.retrieveProjects();
  }

  copied() {
    timer(0, 4000)
      .pipe(take(2))
      .subscribe((i) =>
        i === 0 ? this.copiedDsn$.next(true) : this.copiedDsn$.next(false)
      );
  }
}
