import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);
    const prov = req.query.prov as string;

    var urls = [];
    var startYear = Number(start.getFullYear());
    var endYear = Number(end.getFullYear());
    for (var i = startYear; i <= endYear; i++) {
        urls.push(`https://canada-holidays.ca/api/v1/provinces/${prov}?year=${i}`);
    }

    // [{province: {id: "AB", holidays: [{id: 1, date: "XXXX-XX-XX"},...]}}, {},...]
    var response = await Promise.all(
        urls.map(async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
    );

    const result = response
        .flatMap((yearlyData) =>
            yearlyData.province.holidays
                .filter((holiday: any) => {
                    const compDate = new Date(holiday.date);
                    return start <= compDate && compDate <= end;
                }))
                .map((holiday: any) => ({ date: holiday.date, name: holiday.nameEn }));
    
    // { 2022: [{date: ..., name: ...}, {date: ..., name: ...}, ...], 2024: [...], ... }
    const years = [...new Set(result.map(holiday => holiday.date.substring(0, 4)))];
    const byYears = Object.fromEntries(
      years.map((year) => [
        year, result.filter((h) => h.date.startsWith(year))
      ])
    );
    // console.log("server", JSON.stringify(byYears));

    res.status(200).json(byYears);
}