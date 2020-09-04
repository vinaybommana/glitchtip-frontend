import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { FormControl, FormGroup } from "@angular/forms";
import { Subscription, combineLatest } from "rxjs";
import {
  map,
  filter,
  withLatestFrom,
  distinctUntilChanged,
} from "rxjs/operators";
import { IssuesService } from "../issues.service";
import { normalizeProjectParams } from "../utils";
import { OrganizationsService } from "src/app/api/organizations/organizations.service";
import { formatDate } from "@angular/common";
import { OrganizationProject } from "src/app/api/organizations/organizations.interface";
import { ProjectsService } from "src/app/api/projects/projects.service";

@Component({
  selector: "app-issues-page",
  templateUrl: "./issues-page.component.html",
  styleUrls: ["./issues-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuesPageComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["select", "status", "title", "events"];
  loading$ = this.issuesService.loading$;
  form = new FormGroup({
    query: new FormControl(""),
  });
  dateForm = new FormGroup({
    startDate: new FormControl(""),
    endDate: new FormControl(""),
  });
  issues$ = combineLatest([
    this.issuesService.issuesWithSelected$,
    this.loading$,
  ]).pipe(map(([issues, loading]) => (!loading ? issues : [])));
  areAllSelected$ = this.issuesService.areAllSelected$;
  thereAreSelectedIssues$ = this.issuesService.thereAreSelectedIssues$;
  hasNextPage$ = this.issuesService.hasNextPage$;
  hasPreviousPage$ = this.issuesService.hasPreviousPage$;
  nextParams$ = this.issuesService.nextPageParams$;
  previousParams$ = this.issuesService.previousPageParams$;
  activeOrganizationProjects$ = this.organizationsService
    .activeOrganizationProjects$;
  activeOrganization$ = this.organizationsService.activeOrganization$;
  navigationEnd$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    withLatestFrom(this.route.params, this.route.queryParams),
    map(([event, params, queryParams]) => {
      const orgSlug: string | undefined = params["org-slug"];
      const cursor: string | undefined = queryParams.cursor;
      const query: string | undefined = queryParams.query;
      let project: string[] | null = null;
      if (typeof queryParams.project === "string") {
        project = [queryParams.project];
      } else if (typeof queryParams.project === "object") {
        project = queryParams.project;
      }
      const start: string | undefined = queryParams.start;
      const end: string | undefined = queryParams.end;
      return { orgSlug, cursor, query, project, start, end };
    })
  );
  routerEventSubscription: Subscription;

  /**
   * Two ways to trigger project detail. The first is if we switch orgs.
   * Filtered out the cases where orgSlug from URL wasn't the same as
   * active org, and then only move on if the slug actually changes.
   */
  projectDetailTriggerSwitchOrgs = combineLatest([
    this.navigationEnd$,
    this.activeOrganization$,
  ]).pipe(
    filter(([navEnd, activeOrg]) => {
      return navEnd.orgSlug && activeOrg
        ? navEnd.orgSlug === activeOrg.slug
        : false;
    }),
    distinctUntilChanged(
      ([_, previousActiveOrg], [__, currentActiveOrg]) =>
        previousActiveOrg?.slug === currentActiveOrg?.slug
    ),
    map(([navEnd, activeOrg]) => ({
      orgSlug: navEnd.orgSlug,
      projectId: navEnd.project,
      activeOrgProjects: activeOrg ? activeOrg.projects : [],
    }))
  );

  /**
   * Two ways to trigger project detail. The second is if project URL
   * params change.
   */
  projectDetailTriggerProjectCount = combineLatest([
    this.navigationEnd$,
    this.activeOrganization$,
  ]).pipe(
    filter(([navEnd]) => (navEnd.project ? navEnd.project.length > 0 : false)),
    distinctUntilChanged(
      ([previousNavEnd], [currentNavEnd]) =>
        previousNavEnd.project?.toString() === currentNavEnd.project?.toString()
    ),
    map(([navEnd, activeOrg]) => ({
      orgSlug: navEnd.orgSlug,
      projectId: navEnd.project,
      activeOrgProjects: activeOrg ? activeOrg.projects : [],
    }))
  );

  projectsFromParams$ = this.route.queryParams.pipe(
    map((params) => normalizeProjectParams(params.project))
  );

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

  urlHasParam$ = this.route.queryParams.pipe(
    map((params) => !!params.query || !!params.start || !!params.end)
  );

  constructor(
    private issuesService: IssuesService,
    private router: Router,
    private route: ActivatedRoute,
    private organizationsService: OrganizationsService,
    private projectsService: ProjectsService
  ) {
    this.routerEventSubscription = this.navigationEnd$.subscribe(
      ({ orgSlug, cursor, query, project, start, end }) => {
        if (orgSlug) {
          this.issuesService.getIssues(
            orgSlug,
            cursor,
            query,
            project,
            start,
            end
          );
        }
      }
    );
    this.projectDetailTriggerSwitchOrgs.subscribe(
      ({ orgSlug, projectId, activeOrgProjects }) => {
        if (orgSlug) {
          this.getProjectDetails(projectId, activeOrgProjects, orgSlug);
        }
      }
    );
    this.projectDetailTriggerProjectCount.subscribe(
      ({ orgSlug, projectId, activeOrgProjects }) => {
        if (orgSlug) {
          this.getProjectDetails(projectId, activeOrgProjects, orgSlug);
        }
      }
    );
  }

  ngOnInit() {
    this.route.params.subscribe((_) => {
      const query: string | undefined = this.route.snapshot.queryParams.query;
      const start: string | undefined = this.route.snapshot.queryParams.start;
      const end: string | undefined = this.route.snapshot.queryParams.end;
      this.form.setValue({
        query: query !== undefined ? query : "is:unresolved",
      });
      this.dateForm.setValue({
        startDate: start ? start : null,
        endDate: end ? end : null,
      });
    });
  }

  ngOnDestroy() {
    this.routerEventSubscription.unsubscribe();
    this.issuesService.clearState();
  }

  /**
   * Calls retrieveProjectDetail with the active org slug and the slug of a
   * single project. Project comes from either the URL or the active org list
   *
   * @param project An array of project IDs that come from the URL
   * @param activeOrgProjects All projects associated with the active organization
   * @param orgSlug Active organization slug
   */
  getProjectDetails(
    project: string[] | null,
    activeOrgProjects: OrganizationProject[] | null,
    orgSlug: string
  ) {
    if (activeOrgProjects) {
      let matchingProject: OrganizationProject | null = null;
      if (project && project.length === 1) {
        const match = activeOrgProjects.find(
          (activeOrgProject) => activeOrgProject.id === parseInt(project[0], 10)
        );
        if (match) matchingProject = match;
      } else if (activeOrgProjects.length === 1) {
        matchingProject = activeOrgProjects[0];
      }

      if (matchingProject) {
        this.projectsService.retrieveProjectDetail(
          orgSlug,
          matchingProject.slug
        );
      }
    }
  }

  onDateFormSubmit() {
    /**
     * The + "Z" feels ridiculous, but it works, and avoids problems I didn't
     * have time to solve
     */
    const startDate = this.dateForm.value.startDate
      ? formatDate(
          this.dateForm.value.startDate,
          "yyyy-MM-ddTHH:mm:ss.SSS",
          "en-US"
        ) + "Z"
      : null;

    /**
     * End dates come in at midnight, so if you pick May 5, you don't get events
     * from May 5. Bumping it to 23:59:59.999 fixes this
     */
    const modifiedEndDate = this.dateForm.value.endDate
      ? this.dateForm.value.endDate.getTime() + 86399999
      : null;
    const endDate = modifiedEndDate
      ? formatDate(modifiedEndDate, "yyyy-MM-ddTHH:mm:ss.SSS", "en-US") + "Z"
      : null;
    this.router.navigate([], {
      queryParams: {
        cursor: null,
        start: startDate ? startDate : null,
        end: endDate ? endDate : null,
      },
      queryParamsHandling: "merge",
    });
  }

  dateFormReset() {
    this.router.navigate([], {
      queryParams: {
        cursor: null,
        start: null,
        end: null,
      },
      queryParamsHandling: "merge",
    });
    this.dateForm.setValue({ startDate: null, endDate: null });
  }

  onSubmit() {
    this.router.navigate([], {
      queryParams: {
        query: this.form.value.query,
        cursor: null,
      },
      queryParamsHandling: "merge",
    });
  }

  bulkMarkResolved() {
    this.issuesService.bulkSetStatus("resolved");
  }

  bulkMarkUnresolved() {
    this.issuesService.bulkSetStatus("unresolved");
  }

  bulkMarkIgnored() {
    this.issuesService.bulkSetStatus("ignored");
  }

  toggleCheck(issueId: number) {
    this.issuesService.toggleSelected(issueId);
  }

  toggleSelectAll() {
    this.issuesService.toggleSelectAll();
  }
}
