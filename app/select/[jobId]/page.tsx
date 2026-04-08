import { ProjectSelectionView } from "@/components/project-selection";

export default async function SelectPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <ProjectSelectionView jobId={jobId} />;
}
