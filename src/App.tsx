import * as React from "react";
import "./styles.css";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import {
  StarIcon,
  MinusIcon,
  CloudIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { MoonIcon } from "@heroicons/react/24/outline";

var localizedFormat = require("dayjs/plugin/localizedFormat");
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

type Event = {
  start: dayjs.Dayjs;
  type: "Nap" | "Awake" | "Bedtime";
  end?: dayjs.Dayjs;
};

const eventStyles = {
  Awake: {
    Icon: StarIcon,
    iconBg: "bg-purple-500",
    iconColor: "text-purple-100",
    content: "Awake from",
  },
  Nap: {
    Icon: CloudIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-800",
    content: "Nap from",
  },
  Bedtime: {
    Icon: MoonIcon,
    iconBg: "bg-purple-800",
    iconColor: "text-purple-100",
    content: "Bedtime at",
  },
};

function formatDateRange(start: dayjs.Dayjs, end?: dayjs.Dayjs) {
  return [start.format("LT"), end?.format("LT")].filter(Boolean).join(" - ");
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function RangeInput(props: {
  onChange: (e: any) => void;
  onIncrease: () => void;
  onDecrease: () => void;
  value: number;
  name: string;
}) {
  const { onChange, onIncrease, onDecrease, value, name } = props;
  return (
    <div className="mt-2 flex rounded-md shadow-sm">
      <button
        type="button"
        className="relative -mr-px inline-flex items-center gap-x-1.5 rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={onDecrease}
      >
        <MinusIcon
          className="-ml-0.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </button>
      <div className="relative flex flex-grow items-stretch focus-within:z-10">
        <input
          value={value}
          onChange={onChange}
          type="number"
          name={name}
          className="block w-full rounded-none border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
        />
      </div>
      <button
        type="button"
        className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={onIncrease}
      >
        <PlusIcon
          className="-ml-0.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function Schedule(props: { schedule: Event[] }) {
  const { schedule } = props;
  return (
    <div className="max-w-md mx-auto">
      <div className="flow-root">
        <ul className="-mb-8">
          {schedule.map((event, eventIdx) => {
            const { Icon, iconBg, iconColor, content } = eventStyles[
              event.type
            ];
            return (
              <li key={event.start.toISOString()}>
                <div className="relative pb-8">
                  {eventIdx !== schedule.length - 1 ? (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={classNames(
                          iconBg,
                          "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        )}
                      >
                        <Icon
                          className={classNames(iconColor, "h-5 w-5")}
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">{`${content} ${formatDateRange(
                          event.start,
                          event.end
                        )}`}</p>
                      </div>
                      {event.end ? (
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {`${event.end?.diff(event.start, "minutes")}m`}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const defaults = {
  numNaps: 5,
  avgNapLength: 40,
  nextWakeWindow: 90,
  lastWakeWindow: 120,
};

export default function App() {
  const [schedule, setSchedule] = React.useState<Event[]>([]);

  let [searchParams, setSearchParams] = useSearchParams();

  const wakeup = searchParams.get("wakeup")?.toString() || "06:20";
  const numNaps = Number(searchParams.get("numNaps")) || defaults["numNaps"];
  const avgNapLength =
    Number(searchParams.get("avgNapLength")) || defaults["avgNapLength"];
  const nextWakeWindow =
    Number(searchParams.get("nextWakeWindow")) || defaults["nextWakeWindow"];
  const lastWakeWindow =
    Number(searchParams.get("lastWakeWindow")) || defaults["lastWakeWindow"];

  function handleReset(e: any) {
    e.preventDefault();

    setSearchParams({});
  }

  function handleDecrease(name: string) {
    setSearchParams((prev) => {
      prev.set(name, (Number(prev.get(name) || defaults[name]) - 1).toString());
      return prev;
    });
  }

  function handleIncrease(name: string) {
    setSearchParams((prev) => {
      prev.set(name, (Number(prev.get(name) || defaults[name]) + 1).toString());
      return prev;
    });
  }

  function handleChange(e: any) {
    const name = e.target.name;
    const value = e.target.value;
    setSearchParams((prev) => {
      prev.set(name, value);
      return prev;
    });
  }

  function calculateSchedule(args: {
    wakeup?: string;
    numNaps: number;
    avgNapLength: number;
    nextWakeWindow: number;
    lastWakeWindow: number;
  }) {
    const {
      wakeup,
      numNaps,
      avgNapLength,
      nextWakeWindow,
      lastWakeWindow,
    } = args;
    const wakeupDate = dayjs(wakeup, "HH:mm");

    const numWakeWindows = numNaps + 1;
    const wakeWindowIncrease =
      (lastWakeWindow - nextWakeWindow) / (numWakeWindows - 1);

    const newSchedule: Event[] = [];
    let eventStart = wakeupDate;
    let eventEnd = wakeupDate.add(nextWakeWindow, "minutes");
    let eventType: Event["type"] = "Awake";

    newSchedule.push({ start: eventStart, end: eventEnd, type: eventType });

    for (let i = 0; i < numNaps; i++) {
      // nap
      eventStart = eventEnd;
      eventEnd = eventEnd.add(avgNapLength, "minutes");
      eventType = "Nap";

      newSchedule.push({ start: eventStart, end: eventEnd, type: eventType });

      // wake window
      eventStart = eventEnd;
      eventEnd = eventEnd.add(
        // round the wake window length to the nearest multiple of 5
        nextWakeWindow + Math.round((wakeWindowIncrease * (i + 1)) / 5) * 5,
        "minutes"
      );
      eventType = "Awake";

      newSchedule.push({ start: eventStart, end: eventEnd, type: eventType });
    }

    newSchedule.push({ start: eventEnd, type: "Bedtime" });

    setSchedule(newSchedule);
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    calculateSchedule({
      wakeup,
      numNaps,
      avgNapLength,
      nextWakeWindow,
      lastWakeWindow,
    });
  }

  React.useEffect(() => {
    calculateSchedule({
      wakeup,
      numNaps,
      avgNapLength,
      nextWakeWindow,
      lastWakeWindow,
    });
  }, []);

  return (
    <div className="m-4">
      <div className="container mx-auto space-y-6">
        <h1 className="text-2xl font-semibold leading-7 text-gray-900">
          Nap Planner
        </h1>
        <form id="planner" onSubmit={handleSubmit}>
          <div className="border-b border-gray-900/10 pb-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="col-span-full">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Wake up
                </label>
                <div className="mt-2">
                  <input
                    value={wakeup}
                    onChange={handleChange}
                    name="wakeup"
                    type="time"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Naps remaining
                </label>
                <div className="mt-2">
                  <RangeInput
                    value={numNaps}
                    name="numNaps"
                    onChange={handleChange}
                    onDecrease={() => handleDecrease("numNaps")}
                    onIncrease={() => handleIncrease("numNaps")}
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Avg nap length
                </label>
                <div className="mt-2">
                  <RangeInput
                    value={avgNapLength}
                    name="avgNapLength"
                    onChange={handleChange}
                    onDecrease={() => handleDecrease("avgNapLength")}
                    onIncrease={() => handleIncrease("avgNapLength")}
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Next wake window
                </label>
                <div className="mt-2">
                  <RangeInput
                    value={nextWakeWindow}
                    name="nextWakeWindow"
                    onChange={handleChange}
                    onDecrease={() => handleDecrease("nextWakeWindow")}
                    onIncrease={() => handleIncrease("nextWakeWindow")}
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Last wake window
                </label>
                <div className="mt-2">
                  <RangeInput
                    value={lastWakeWindow}
                    name="lastWakeWindow"
                    onChange={handleChange}
                    onDecrease={() => handleDecrease("lastWakeWindow")}
                    onIncrease={() => handleIncrease("lastWakeWindow")}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-start gap-x-6">
              <button
                type="submit"
                className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
              >
                Generate schedule
              </button>
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
        <Schedule schedule={schedule} />
      </div>
    </div>
  );
}
