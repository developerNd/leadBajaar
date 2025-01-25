import { Metadata } from 'next'

// Define the correct type for page props
type PageProps = {
  params: Promise<{ flowId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | undefined;
}

export const metadata: Metadata = {
  title: 'Flow Editor',
};

export default async function ChatbotBuilderPage({ params }: PageProps) {
  const { flowId } = await params; // Await the params promise

  // Flow editor logic and JSX
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Flow Editor: {flowId}</h1>
      {/* Additional content here */}
    </div>
  );
}
