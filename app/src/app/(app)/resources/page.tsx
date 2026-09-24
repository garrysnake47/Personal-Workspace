import { listResources } from "@/actions/content";
import { ResourceLibrary } from "@/components/resources/resource-library";

export const metadata = { title: "Resources" };

export default async function ResourcesPage() {
  const result = await listResources();

  return (
    <ResourceLibrary
      resources={result.ok ? result.data.map((resource) => ({
        ...resource,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
      })) : []}
      loadError={result.ok ? undefined : result.error.message}
    />
  );
}
