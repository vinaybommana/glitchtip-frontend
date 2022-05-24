import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MicroSentryService } from "@micro-sentry/angular";
import { BehaviorSubject } from "rxjs";
import { tap, map } from "rxjs/operators";
import { SocialApp } from "./user/user.interfaces";

export const DSN_REGEXP =
  /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/;

interface SettingsState {
  socialApps: SocialApp[];
  billingEnabled: boolean;
  iPaidForGlitchTip: boolean | null;
  enableUserRegistration: boolean;
  plausibleURL: string | null;
  plausibleDomain: string | null;
  chatwootWebsiteToken: string | null;
  stripePublicKey: string | null;
  sentryDSN: string | null;
  sentryTracesSampleRate: number | null;
  environment: string | null;
  version: string | null;
}

const initialState: SettingsState = {
  socialApps: [],
  billingEnabled: false,
  iPaidForGlitchTip: null,
  enableUserRegistration: false,
  plausibleURL: null,
  plausibleDomain: null,
  chatwootWebsiteToken: null,
  stripePublicKey: null,
  sentryDSN: null,
  sentryTracesSampleRate: null,
  environment: null,
  version: null,
};

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private readonly state = new BehaviorSubject<SettingsState>(initialState);
  socialApps$ = this.state.pipe(map((settings) => settings.socialApps));
  billingEnabled$ = this.state.pipe(map((settings) => settings.billingEnabled));
  paidForGlitchTip$ = this.state.pipe(
    map((settings) => settings.iPaidForGlitchTip)
  );
  stripePublicKey$ = this.state.pipe(
    map((settings) => settings.stripePublicKey)
  );
  enableUserRegistration$ = this.state.pipe(
    map((settings) => settings.enableUserRegistration)
  );
  private readonly url = "/api/settings/";

  constructor(
    private http: HttpClient,
    private microSentry: MicroSentryService
  ) {}

  /** Get and set conf settings from backend. Typically run on application start */
  getSettings() {
    return this.retrieveSettings().pipe(
      tap((settings) => this.setSettings(settings)),
      tap((settings) => {
        // tslint:disable:only-arrow-functions
        // tslint:disable:space-before-function-paren
        // tslint:disable:one-variable-per-declaration
        if (settings.plausibleDomain && settings.plausibleURL) {
          const g = document.createElement("script");
          const s = document.getElementsByTagName("script")[0];
          g.type = "text/javascript";
          g.defer = true;
          g.dataset.domain = settings.plausibleDomain;
          g.src = settings.plausibleURL;
          s.parentNode!.insertBefore(g, s);
          window.plausible =
            window.plausible ||
            function () {
              ((window as any).plausible.q =
                (window as any).plausible.q || []).push(arguments);
            };
        }
      }),
      tap((settings) => {
        if (settings.sentryDSN) {
          // Micro-sentry does not support dynamic configuration, force it to
          const options = {
            dsn: settings.sentryDSN,
            environment: settings.environment
              ? settings.environment
              : undefined,
            release: settings.version
              ? "glitchtip@" + settings.version
              : undefined,
          };

          // https://github.com/Tinkoff/micro-sentry/blob/main/libs/core/src/lib/service/micro-sentry-client.ts#L14
          const searched = DSN_REGEXP.exec(options.dsn);
          const dsn = searched ? searched.slice(1) : [];
          const pathWithProjectId = dsn[5].split("/");
          const path = pathWithProjectId.slice(0, -1).join("/");

          (this.microSentry.apiUrl as string) =
            dsn[0] +
            "://" +
            dsn[3] +
            (dsn[4] ? ":" + dsn[4] : "") +
            (path ? "/" + path : "") +
            "/api/" +
            pathWithProjectId.pop() +
            "/store/";

          (this.microSentry.authHeader as string) =
            "Sentry sentry_version=7,sentry_key=" +
            dsn[1] +
            (dsn[2] ? ",sentry_secret=" + dsn[2] : "");

          if (options.environment) {
            (this.microSentry.environment as string) = options.environment;
          }
          if (options.release) {
            (this.microSentry as any).release = options.release;
          }
        }
      }),
      tap((settings) => {
        if (settings.chatwootWebsiteToken) {
          (function (d, t) {
            const BASE_URL = "https://app.chatwoot.com";
            const g: any = d.createElement(t),
              s: any = d.getElementsByTagName(t)[0];
            g.src = BASE_URL + "/packs/js/sdk.js";
            s.parentNode.insertBefore(g, s);
            g.onload = function () {
              (window as any).chatwootSDK.run({
                websiteToken: settings.chatwootWebsiteToken,
                baseUrl: BASE_URL,
              });
            };
          })(document, "script");
        }
      })
    );
  }

  triggerPlausibleReport(orgSlug: string | undefined) {
    if (window.plausible) {
      var url = window.location.href;
      url = url.replace(/\/issues\/\d+(\/|\?|$)/g, "/issues/<issue_id>/")
      url = url.replace(/\/uptime-monitors\/\d+(\/|$)/g, "/uptime-monitors/<monitor_id>/")
      url = url.replace(/\/events\/\w+(\/|$)/g, "/events/<event_id>/")
      url = url.replace(/\/transaction-groups\/\d+(\/|$)/g, "/transaction-groups/<transaction_group_id>/")

      window.plausible("pageview", {
        u: orgSlug ? url.replace(`/${orgSlug}/`, "/<organization_slug>/") : url,
      });
    }
  }

  private retrieveSettings() {
    return this.http.get<SettingsState>(this.url);
  }

  private setSettings(settings: SettingsState) {
    this.state.next(settings);
  }
}
