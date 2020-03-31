import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { OrganizationsService } from "../api/organizations/organizations.service";
import { ProjectsService } from "../api/projects/projects.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  activeOrganizationDetail$ = this.organizationsService
    .activeOrganizationDetail$;
  projects$ = this.projectsService.projects$;

  constructor(
    private organizationsService: OrganizationsService,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    this.projectsService.retrieveProjects();
  }

  timeOfDay() {
    const currentHour = new Date().getHours();

    let partOfDay = "Morning";

    if (currentHour > 12 && currentHour < 18) {
      partOfDay = "Afternoon";
    } else if (currentHour > 18 || currentHour < 5) {
      partOfDay = "Evening";
    }

    return partOfDay;
  }
}
