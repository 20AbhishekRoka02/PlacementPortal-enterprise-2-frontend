"use client";

import { ColumnDef } from "@tanstack/react-table";

export function generateColumns<T extends Record<string, any>>(
    data: T[]
): ColumnDef<T>[] {
    if (!data.length) return [];

    return Object.keys(data[0]).map((key) => ({
        accessorKey: key,

        header:
            key.charAt(0).toUpperCase() +
            key.slice(1).replaceAll("_", " "),

        cell: ({ row }) => {
            const value = row.getValue(key);

            if (value === null || value === undefined)
                return "-";

            // Pretty formatting

            if (
                typeof value === "string" &&
                !isNaN(Date.parse(value))
            ) {
                return new Date(value).toLocaleDateString();
            }

            return value.toString();
        },
    }));
}