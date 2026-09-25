export default function Loading() {
  return (
    <main className="min-h-screen bg-ly-bg">
      {/* Header skeleton */}
      <div className="h-20 border-b border-black/5 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-gray-200" />

          <div className="hidden gap-6 md:flex">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Blog skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Title */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto mb-4 h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="mx-auto h-5 w-96 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        {/* Search / filters */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200 md:w-80" />

          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-10 w-24 shrink-0 animate-pulse rounded-full bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* Blog cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      </section>

      {/* Footer skeleton */}
      <div className="mt-12 h-64 animate-pulse bg-gray-200" />
    </main>
  );
}

function BlogCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/5 bg-white">
      {/* Image */}
      <div className="aspect-[16/10] w-full animate-pulse bg-gray-200" />

      <div className="p-5">
        {/* Category + date */}
        <div className="mb-3 flex items-center justify-between">
          <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Title */}
        <div className="mb-3 space-y-2">
          <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Read more */}
        <div className="mt-5 h-5 w-24 animate-pulse rounded bg-gray-200" />
      </div>
    </article>
  );
}
