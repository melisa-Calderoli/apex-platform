import ChatInterface from "@/components/ChatInterface";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-8 pb-4">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#f1f1f5]">
          Chat con APEX
        </h1>
        <p className="text-[#8b8ba7] mt-1">
          Consulta con tu estratega de marketing impulsado por IA
        </p>
      </div>
      <div className="flex-1 overflow-hidden px-8 pb-8">
        <ChatInterface companyId={companyId} />
      </div>
    </div>
  );
}
