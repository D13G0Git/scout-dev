import { ProgressStream } from "@/components/progress/progress-stream";

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <ProgressStream jobId={jobId} />;
}
