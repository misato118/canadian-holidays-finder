import { provinces, provinceCodes } from "../constants/provinces";
import { searchSteps } from "@/constants/messages";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const Schema = z.object({
  province: z.enum(provinceCodes, { error: "Choose a province." }),
  startDate: z.date({ error: "Choose a start date" }),
  endDate: z.date({ error: "Choose an end date" }),
}).refine(d => d.endDate >= d.startDate, {
  path: ["endDate"],
  message: "End date must be after start date",
});
type FormValues = z.infer<typeof Schema>;

type Holiday = { date: string, name: string }
type ListByYear = Record<string, Holiday[]>;

export default function Home() {
  const [province, setProvince] = useState({ label: "", code: "" });
  const [listByYear, setListByYear] = useState<ListByYear>({});
  const [message, setMessage] = useState("");

  const { register, handleSubmit, control, setValue, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(Schema),
      mode: "onSubmit",
      reValidateMode: "onChange",
      defaultValues: { province: "", startDate: undefined, endDate: undefined },
    });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });

  useEffect(() => {
    setValue("province", province.code);
  }, [province.code, setValue])

  const dateFormat = (oldFormat: string) => {
    return new Date(`${oldFormat}T00:00:00Z`).toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    }
    );
  }

  const handleClick = (label: string, code: string) => {
    const elem = document.activeElement;
    if (elem) {
      (elem as HTMLElement)?.blur();
    }
    setProvince({ label: label, code: code });
    setValue("province", code, { shouldValidate: true });
  }

  async function onSubmit() {
    try {
      const url = `/api/holidays?start=${encodeURIComponent(startDate + "")}&end=${encodeURIComponent(endDate + "")}&prov=${encodeURIComponent(province.code)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: HTTP ${res.status}`);
      const json = await res.json();
      // setList(json);
      setListByYear(json);
      if (Object.entries(json).length < 1) {
        setMessage("No holidays found.");
      }
    } catch (error: any) {
      console.log("Error!");
      setMessage("Out of the range. Please try with a different range.");
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-base-100">
      <header className="sticky top-0 z-10 bg-base-100/90 backdrop-blur border-b">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          <h1 className="text-primary text-4xl font-bold">Find Public Holidays in Canada</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="pt-10 grid grid-cols-5 place-items-center gap-4 auto-rows-[3.25rem]">
            <div className="col-span-2 flex items-center">
              <input type="hidden" {...register("province")} />
              {/* Province dropdown */}
              <div className="dropdown">
                <div tabIndex={0} role="button" className="btn m-1 w-xs border-1 border-solid border-base-content">{province.label == "" ? "Choose Province" : province.label} ▼</div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                  {provinces.map((province, index) => {
                    const label = province.substring(0, province.length - 3);
                    const code = province.substring(province.length - 2);
                    return (
                      <li key={province + index} onClick={() => { handleClick(label, code); }}><a>{label}</a></li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* Date range selector here */}
            <div className="flex items-center">
              <input
                type="date"
                className="px-2 py-1 border-1 border-solid rounded-lg cursor-pointer"
                {...register("startDate", { valueAsDate: true })}
              />
            </div>
            <div className="flex items-center">
              <input
                type="date"
                className="px-2 py-1 border-1 border-solid rounded-lg cursor-pointer"
                {...register("endDate", { valueAsDate: true })}
              />
            </div>

            {/* Search button here */}
            <div className="flex items-center">
              <button className="btn bg-accent text-info-content self-center">
                Search
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
              </button>
            </div>

          </form>

          <div className="grid grid-cols-5 items-center gap-4">
            <div className="col-span-2">
              <p className="text-error text-sm mt-1 h-5">
                {errors.province?.message ?? "\u00A0"}
              </p>
            </div>
            <div>
              <p className="text-error text-sm mt-1 h-5">
                {errors.startDate?.message ?? "\u00A0"}
              </p>
            </div>
            <div>
              <p className="text-error text-sm mt-1 h-5">
                {errors.endDate?.message ?? "\u00A0"}
              </p>
            </div>
          </div>

        </div>
      </header>

      <main className="flex-1 overflow-hidden px-4">
        {/* Display area here */}
        <div className="mx-auto max-w-xl py-6 space-y-4 h-[60vh]">
          <div className="card bg-base-200 p-4 min-h-full h-full overflow-y-auto">
            {/* Show the list here */}
            {Object.keys(listByYear).length > 0 ?
              (
                <div className="w-1/2 mx-auto">
                  {Object.entries(listByYear).map(([year, holidays]) => {
                    return (
                      <section key={year}>
                      <h3 className="my-3 font-semibold text-left bg-stone-900 py-1 px-3 border-solid rounded-xl ">{year}</h3>
                      <ul className="w-1/2 mx-auto flex flex-wrap justify-center gap-2">
                        {holidays.map((holiday, index) => (
                          <li key={`${holiday}+${index}`} className="inline-flex items-center gap-2 whitespace-nowrap badge badge-outline badge-primary mb-2">
                            {dateFormat(holiday.date)} - {holiday.name}
                          </li>
                        ))}
                      </ul>
                    </section>
                    );
                  })}
                </div>
              )
              : message === "" ?
              // Show the steps to search here
              (
                <ul className="mx-auto">
                  {searchSteps.map((step: string, index: number) => {
                    return (
                      <li key={step + index} className="my-2 text-center">{step}</li>
                    );
                  })}
                </ul>            
              )
              :
              // Show a message if no result is found
              (
                <p className="text-center">{message}</p>
              )
              }
          </div>
        </div>
      </main>
    </div>
  );
}