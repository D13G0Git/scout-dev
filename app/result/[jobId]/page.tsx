import { ResultView } from "@/components/result-view";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <ResultView jobId={jobId} />;
}
