import { env } from "@/env.mjs"
import { clsx, type ClassValue } from "clsx"
import { addDays, format, subMonths } from "date-fns"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"
import * as z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatDate(
  input: Date | string | number,
  formatString?: string
): string {
  const date = new Date(input)

  if (formatString) {
    return format(date, formatString)
  }

  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "long" })
  const year = date.getFullYear()

  const ordinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return `${day}${ordinalSuffix(day)} ${month}, ${year}`
}

export function minusMonths(input: Date | string | number, months: number) {
  return subMonths(new Date(input), months)
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined
}

export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

export async function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value)
}

export function numberFormatter(value: number) {
  const formatter = Intl.NumberFormat("en", { notation: "compact" })
  return formatter.format(value)
}

/**
 * Whenever you select a date, it will use the midnight timestamp of that date.
 * We need to add a day minus one second to include the whole day.
 */
export function manipulateDate(
  date?: {
    from: Date | undefined
    to?: Date | undefined
  } | null
) {
  const isToDateMidnight = String(date?.to?.getTime()).endsWith("00000")

  // We might wanna use `endOfDay(new Date(date.to))` here
  const addOneDayToDate = date?.to
    ? // ? addDays(new Date(date.to), 1).getTime() - 1
      formatDate(addDays(new Date(date.to), 1), "yyyy-MM-dd")
    : null

  // YYYY-MM-DD
  return {
    fromDate: date?.from ? formatDate(date.from, "yyyy-MM-dd") : null,
    toDate: isToDateMidnight
      ? addOneDayToDate
      : date?.to
      ? formatDate(date.to, "yyyy-MM-dd")
      : null,
  }
}

export function toCapitalize(inputString: string) {
  const words = inputString.split(/[\s_]+/) // Split the input string by spaces or underscores

  // Capitalize the first letter of each word
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`
}

export function getEnumKeyFromValue<T>(enumObject: T, enumValue: any) {
  // @ts-ignore
  return Object.keys(enumObject).find(
    // @ts-ignore
    (key) => enumObject[key] === enumValue
  ) as T[keyof T]
}

/**
 * Build supplied string by interpolating properties after delimiter ':' with the given parameters.
 *
 * @example
 * interpolate(':name is here.', {name: 'Barbara'})
 * => 'Barbaba is here.'
 */
export const interpolate = (str: string, params: any = {}) => {
  let formattedString = str

  for (const [key, value] of Object.entries(params)) {
    const val: any = value || ""

    formattedString = formattedString.replace(
      new RegExp(`:${key}`, "gi"),
      val.toString()
    )
  }

  return formattedString
}

export function catchError(err: unknown) {
  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message
    })
    return toast(errors.join("\n"))
  } else if (err instanceof Error) {
    return toast(err.message)
  } else {
    return toast("Something went wrong, please try again later.")
  }
}

export function constructSearchParams(searchParams: {
  [key: string]: string | number | boolean | undefined | null
}) {
  return Object.keys(searchParams)
    .filter(
      (key) =>
        searchParams[key] !== undefined &&
        searchParams[key] !== null &&
        searchParams[key] !== ""
    )
    .map((key) => {
      if (searchParams[key] === undefined || searchParams[key] === null) {
        return ""
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        searchParams[key] as string | number | boolean
      )}`
    })
    .join("&")
}

export function removeEmptyFromObj(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v != null && v !== "" && v !== undefined
    )
  )
}

export const isImageUrl = (url: string): boolean => {
  // Regular expression to check if the URL ends with a common image extension
  const imagePattern = /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i

  try {
    // Create a new URL object to check if it's a valid URL
    const parsedUrl = new URL(url)

    // Check if the URL matches the image pattern
    return imagePattern.test(parsedUrl.pathname)
  } catch (e) {
    // If the URL constructor throws an error, it's not a valid URL
    return false
  }
}
