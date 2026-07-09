import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmailTab } from "@/components/communication/email-tab";
import { WhatsappTab } from "@/components/communication/whatsapp-tab";

export const dynamic = "force-dynamic";

export default async function CommunicationPage() {
  const [emailTemplates, whatsappTemplates] = await Promise.all([
    prisma.emailTemplate.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.whatsappTemplate.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="E-Mail & WhatsApp"
        description="Markenkonforme E-Mail-Vorlagen und persönliche WhatsApp-Textbausteine."
      />
      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email">E-Mail</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>
        <TabsContent value="email" className="mt-4">
          <EmailTab initial={emailTemplates} />
        </TabsContent>
        <TabsContent value="whatsapp" className="mt-4">
          <WhatsappTab initial={whatsappTemplates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
