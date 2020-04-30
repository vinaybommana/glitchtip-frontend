import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { IssuesRoutingModule } from "./issues-routing.module";
import { SharedModule } from "../shared/shared.module";

// Components
import { IssuesPageComponent } from "./issues-page/issues-page.component";
import { IssueListItemComponent } from "./issue-list-item/issue-list-item.component";
import { IssueDetailComponent } from "./issue-detail/issue-detail.component";
import { EventDetailComponent } from "./issue-detail/event-detail/event-detail.component";
import { EntryRequestComponent } from "./issue-detail/event-detail/entry-request/entry-request.component";
import { HeaderNavComponent } from "./header-nav/header-nav.component";
import { EntryCSPComponent } from "./issue-detail/event-detail/entry-csp/entry-csp.component";
import { EntryMessageComponent } from "./issue-detail/event-detail/entry-message/entry-message.component";
import { EntryExceptionComponent } from "./issue-detail/event-detail/entry-exception/entry-exception.component";
import { NonExpandingFramesComponent } from "./issue-detail/event-detail/entry-exception/non-expanding-frames/non-expanding-frames.component";
import { RawStacktraceComponent } from "./issue-detail/event-detail/entry-exception/raw-stacktrace/raw-stacktrace.component";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IssuesRoutingModule,
    SharedModule
  ],
  declarations: [
    IssuesPageComponent,
    IssueListItemComponent,
    IssueDetailComponent,
    EventDetailComponent,
    EntryRequestComponent,
    EntryCSPComponent,
    EntryMessageComponent,
    HeaderNavComponent,
    EntryExceptionComponent,
    NonExpandingFramesComponent,
    RawStacktraceComponent
  ]
})
export class IssuesModule {}
