import ChatInterface from "@/components/ChatInterface";
import BackButton from "@/components/BackButton";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  return (
    <div className="h-screen flex flex-col">
      <div className="p-8 pb-4">
        <BackButton href={`/client/${companyId}/dashboard`} label="Volver al Dashboard" />
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black">
          Chat con Melisa
        </h1>
        <p className="text-[#6b7280] mt-1">
          Consulta con tu estratega de marketing impulsado por IA
        </p>
      </div>
      <div className="flex-1 overflow-hidden px-8 pb-8">
        <ChatInterface companyId={companyId} />
      </div>
    </div>
  );
}
