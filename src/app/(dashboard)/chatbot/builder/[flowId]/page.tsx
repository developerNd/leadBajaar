export default function ChatbotBuilderPage({
  params,
}: {
  params: { flowId: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Flow Editor: {params.flowId}</h1>
      {/* Flow editor content will go here */}
    </div>
  );
} 