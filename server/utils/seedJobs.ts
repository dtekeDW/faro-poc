interface SeedJob {
  runId: string
  passes: number
  lines: string[]
  isRunning: boolean
  exitCode: number | null
  startedAt: number
}

/**
 * In-memory job state for the lab's seeding runs. Deliberately not persisted:
 * a run only has to survive long enough for the page that started it to watch.
 */
const jobs = new Map<string, SeedJob>()

export function useSeedJobs() {
  return {
    start(runId: string, passes: number) {
      jobs.set(runId, { runId, passes, lines: [], isRunning: true, exitCode: null, startedAt: Date.now() })
    },

    append(runId: string, chunk: string) {
      const job = jobs.get(runId)
      if (!job)
        return

      for (const line of chunk.split('\n').map(entry => entry.trim()).filter(Boolean)) {
        // pnpm echoes unresolved tokens from the global .npmrc on every spawn.
        // They say nothing about the run and would bury the lines that do.
        if (line.startsWith('[WARN] Failed to replace env'))
          continue

        job.lines.push(line)
      }

      // A long run would otherwise grow without bound.
      if (job.lines.length > 400)
        job.lines = job.lines.slice(-400)
    },

    finish(runId: string, exitCode: number) {
      const job = jobs.get(runId)
      if (!job)
        return

      job.isRunning = false
      job.exitCode = exitCode
    },

    get(runId: string) {
      return jobs.get(runId) ?? null
    },
  }
}
