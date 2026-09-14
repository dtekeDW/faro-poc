export default defineEventHandler((event) => {
  const runId = getRouterParam(event, 'runId')
  if (!runId)
    throw createError({ statusCode: 400, statusMessage: 'Missing run id' })

  const job = useSeedJobs().get(runId)
  if (!job)
    throw createError({ statusCode: 404, statusMessage: 'Unknown run' })

  return job
})
