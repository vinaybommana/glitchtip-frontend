import { Event } from "../../interfaces";

// List an Issue's Events
// https://docs.sentry.io/api/events/get-group-events/
// Event ID number in GlitchTip, but string in Sentry

export const IssueEventList: Event[] = [
  {
    eventID: "a58902b72e3e45f58ab9ecfb08297fd1",
    tags: [
      { value: "no", key: "handled" },
      { value: "error", key: "level" },
      { value: "threading", key: "mechanism" },
      { value: "CPython 3.8.0", key: "runtime" },
      { value: "CPython", key: "runtime.name" },
      { value: "340bbf5db4d1", key: "server_name" }
    ],
    projectID: "1851390",
    dateCreated: "2020-01-09T14:25:31Z",
    user: {
      username: null,
      name: null,
      ip_address: null,
      email: null,
      data: null,
      id: null
    },
    message:
      "<module> AttributeError type object 'ResultsView' has no attribute 'as_view' polls/urls.py polls.urls in <module>",
    id: "a58902b72e3e45f58ab9ecfb08297fd1",
    culprit: "polls.urls in <module>",
    title:
      "AttributeError: type object 'ResultsView' has no attribute 'as_view'",
    platform: "python",
    location: "polls/urls.py",
    crashFile: null,
    "event.type": "error",
    groupID: "1427810956"
  },
  {
    eventID: "f750f067686d4bf78e7512c8dfe47089",
    tags: [
      { value: "no", key: "handled" },
      { value: "error", key: "level" },
      { value: "threading", key: "mechanism" },
      { value: "CPython 3.8.0", key: "runtime" },
      { value: "CPython", key: "runtime.name" },
      { value: "340bbf5db4d1", key: "server_name" }
    ],
    projectID: "1851390",
    dateCreated: "2020-01-09T14:25:27Z",
    user: {
      username: null,
      name: null,
      ip_address: null,
      email: null,
      data: null,
      id: null
    },
    message:
      "<module> AttributeError type object 'ResultsView' has no attribute 'as_view' polls/urls.py polls.urls in <module>",
    id: "f750f067686d4bf78e7512c8dfe47089",
    culprit: "polls.urls in <module>",
    title:
      "AttributeError: type object 'ResultsView' has no attribute 'as_view'",
    platform: "python",
    location: "polls/urls.py",
    crashFile: null,
    "event.type": "error",
    groupID: "1427810956"
  },
  {
    eventID: "47f42c33f3ed46da8499385273952a7c",
    tags: [
      { value: "no", key: "handled" },
      { value: "error", key: "level" },
      { value: "threading", key: "mechanism" },
      { value: "CPython 3.8.0", key: "runtime" },
      { value: "CPython", key: "runtime.name" },
      { value: "340bbf5db4d1", key: "server_name" }
    ],
    projectID: "1851390",
    dateCreated: "2020-01-09T14:24:50Z",
    user: {
      username: null,
      name: null,
      ip_address: null,
      email: null,
      data: null,
      id: null
    },
    message:
      "<module> AttributeError type object 'ResultsView' has no attribute 'as_view' polls/urls.py polls.urls in <module>",
    id: "47f42c33f3ed46da8499385273952a7c",
    culprit: "polls.urls in <module>",
    title:
      "AttributeError: type object 'ResultsView' has no attribute 'as_view'",
    platform: "python",
    location: "polls/urls.py",
    crashFile: null,
    "event.type": "error",
    groupID: "1427810956"
  },
  {
    eventID: "00ad4149b92043f29d591e74f4167f90",
    tags: [
      { value: "no", key: "handled" },
      { value: "error", key: "level" },
      { value: "threading", key: "mechanism" },
      { value: "CPython 3.8.0", key: "runtime" },
      { value: "CPython", key: "runtime.name" },
      { value: "340bbf5db4d1", key: "server_name" }
    ],
    projectID: "1851390",
    dateCreated: "2020-01-09T14:24:28Z",
    user: {
      username: null,
      name: null,
      ip_address: null,
      email: null,
      data: null,
      id: null
    },
    message:
      "<module> AttributeError type object 'ResultsView' has no attribute 'as_view' polls/urls.py polls.urls in <module>",
    id: "00ad4149b92043f29d591e74f4167f90",
    culprit: "polls.urls in <module>",
    title:
      "AttributeError: type object 'ResultsView' has no attribute 'as_view'",
    platform: "python",
    location: "polls/urls.py",
    crashFile: null,
    "event.type": "error",
    groupID: "1427810956"
  },
  {
    eventID: "59211189118c4133b4d2e1917d4fe845",
    tags: [
      { value: "no", key: "handled" },
      { value: "error", key: "level" },
      { value: "threading", key: "mechanism" },
      { value: "CPython 3.8.0", key: "runtime" },
      { value: "CPython", key: "runtime.name" },
      { value: "340bbf5db4d1", key: "server_name" }
    ],
    projectID: "1851390",
    dateCreated: "2020-01-09T14:23:36Z",
    user: {
      username: null,
      name: null,
      ip_address: null,
      email: null,
      data: null,
      id: null
    },
    message:
      "<module> AttributeError type object 'ResultsView' has no attribute 'as_view' polls/urls.py polls.urls in <module>",
    id: "59211189118c4133b4d2e1917d4fe845",
    culprit: "polls.urls in <module>",
    title:
      "AttributeError: type object 'ResultsView' has no attribute 'as_view'",
    platform: "python",
    location: "polls/urls.py",
    crashFile: null,
    "event.type": "error",
    groupID: "1427810956"
  },
  {
    eventID: "32bebb93704c4cd3886f22c47b2df3c4",
    tags: [
      { value: "no", key: "handled" },
      { value: "error", key: "level" },
      { value: "threading", key: "mechanism" },
      { value: "CPython 3.8.0", key: "runtime" },
      { value: "CPython", key: "runtime.name" },
      { value: "340bbf5db4d1", key: "server_name" }
    ],
    projectID: "1851390",
    dateCreated: "2020-01-09T14:22:51Z",
    user: {
      username: null,
      name: null,
      ip_address: null,
      email: null,
      data: null,
      id: null
    },
    message:
      "<module> AttributeError type object 'ResultsView' has no attribute 'as_view' polls/urls.py polls.urls in <module>",
    id: "32bebb93704c4cd3886f22c47b2df3c4",
    culprit: "polls.urls in <module>",
    title:
      "AttributeError: type object 'ResultsView' has no attribute 'as_view'",
    platform: "python",
    location: "polls/urls.py",
    crashFile: null,
    "event.type": "error",
    groupID: "1427810956"
  }
];