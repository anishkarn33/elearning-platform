import Link from "next/link"
import { redirect } from "next/navigation"
import { routes } from "@/config/routes"

export default function Home() {
  redirect(routes.EXPLORE)
  return (
    <section className="mx-auto mt-20 flex max-w-3xl flex-col items-center justify-center gap-4 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
      <h1 className="from-primary text-balance bg-gradient-to-r to-slate-500 bg-clip-text text-center text-3xl font-bold leading-tight tracking-tighter text-transparent md:text-6xl lg:leading-[1.1] dark:to-zinc-700">
        eLearner
      </h1>
      <span
        className="text-muted-foreground max-w-[750px] text-center text-lg sm:text-xl"
        style={{
          display: "inline-block",
          verticalAlign: "top",
          textDecoration: "inherit",
          maxWidth: "614px",
        }}
      >
        A platform for creating and managing online courses. Get started for
        free!
      </span>

      <div className="absolute inset-x-0 bottom-6">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex flex-row items-center space-x-2">
            <p className="text-muted-foreground text-center text-xs">
              A project by{" "}
              <Link href="https://london.ac.uk" className="underline">
                UoL Student
              </Link>
            </p>
            <span className="text-muted-foreground text-center text-xs">•</span>
            <p className="text-muted-foreground text-center text-xs">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
          <div className="flex flex-row space-x-4">
            <Link
              href={routes.TERMS}
              className="text-muted-foreground text-center text-xs font-bold hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href={routes.PRIVACY}
              className="text-muted-foreground text-center text-xs font-bold hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
