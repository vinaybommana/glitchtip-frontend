import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { MatExpansionPanel } from "@angular/material/expansion";
import { flattenedPlatforms } from "./platforms-for-picker";
import categoryList from "./platform-categories";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: "app-platform-picker",
  templateUrl: "./platform-picker.component.html",
  styleUrls: ["./platform-picker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlatformPickerComponent),
      multi: true,
    },
  ],
})
export class PlatformPickerComponent implements ControlValueAccessor {
  @Input() template: "buttons" | "dropdown" = "buttons";

  @ViewChild("expansionPanel", { static: false })
  expansionPanel?: MatExpansionPanel;

  @ViewChild("filterInput", { static: false })
  filterInput?: ElementRef<HTMLInputElement>;

  platforms = flattenedPlatforms.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  activePlatform = "";
  categoryList = categoryList;

  /** Used to filter project names */
  filterPlatformInput = new FormControl();

  /** Projects that are filtered via the text field form control */
  filteredPlatforms$ = this.filterPlatformInput.valueChanges.pipe(
    startWith(""),
    map((value) => {
      if (value === "") {
        this.setSelected(this.lastSelected);
        return this.platforms;
      } else {
        this.setSelected(this.allTabIndex);
        return this.platforms.filter((platform) =>
          platform.id.toLowerCase().includes(value.toLowerCase())
        );
      }
    })
  );

  selected = 0;
  lastSelected = 0;
  allTabIndex = this.categoryList.length;
  setSelected = (index: number) => {
    if (this.selected !== this.allTabIndex) {
      this.lastSelected = this.selected;
    }
    this.selected = index;
  };

  getPlatformId(platformFromCategoryList: string) {
    const platformInfo = this.platforms.find(
      (platform) => platform.id === platformFromCategoryList
    );
    return platformInfo ? platformInfo.id : "other";
  }

  getPlatformName(platformFromCategoryList: string) {
    const platformInfo = this.platforms.find(
      (platform) => platform.id === platformFromCategoryList
    );
    return platformInfo ? platformInfo.name : platformFromCategoryList;
  }

  constructor() {}

  // Boilerplate for ControlValueAccessor
  onChange = (platform: string) => {};
  onTouched = () => {};
  writeValue(platform: string, toggle: boolean = true): void {
    if (platform === this.activePlatform && toggle) {
      this.activePlatform = "";
      this.onChange("");
    } else {
      this.activePlatform = platform;
      this.onChange(platform);
      if (this.expansionPanel?.expanded) {
        this.expansionPanel.close();
      }
    }
  }
  registerOnChange(fn: (platform: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  focusPanel() {
    this.filterInput?.nativeElement.focus();
  }

  @HostListener("document:keydown", ["$event"]) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (this.expansionPanel?.expanded) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.moveDown();
      }
      if (event.key === "ArrowUp") {
        this.moveUp();
      }
    }
  }

  moveDown() {
    const projectButtons = Array.from(
      document.querySelectorAll(".picker-button")
    ) as HTMLElement[];
    // If the text box is focused, go to the first item
    if (this.filterInput?.nativeElement.id === document.activeElement?.id) {
      projectButtons[0]?.focus();
    } else {
      const indexOfActive = projectButtons.findIndex(
        (button) => button.id === document.activeElement?.id
      );
      if (indexOfActive <= projectButtons.length - 2) {
        // If we're in the list items, go to the next list item
        projectButtons[indexOfActive + 1].focus();
      } else {
        // If we're in the last list item, go to the first item
        projectButtons[0].focus();
      }
    }
  }

  moveUp() {
    const projectButtons = Array.from(
      document.querySelectorAll(".picker-button")
    ) as HTMLElement[];
    const indexOfActive = projectButtons.findIndex(
      (button) => button.id === document.activeElement?.id
    );
    if (indexOfActive > 0) {
      // If we're in the list items, go to the previous list item
      projectButtons[indexOfActive - 1].focus();
    } else {
      // If we're in the first list item, go to the first item
      this.filterInput?.nativeElement.focus();
    }
  }
}
