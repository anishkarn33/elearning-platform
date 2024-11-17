export default function ProfilePageLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="flex min-h-screen items-center pt-4 sm:flex-col">
        <div className="flex-1">{children}</div>
      </div>
    )
  }
  