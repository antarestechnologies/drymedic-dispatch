import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

export async function GET() {
  try {
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    );

    const token = await credential.getToken(
      "https://graph.microsoft.com/.default"
    );

    const client = Client.init({
      authProvider: (done) => {
        done(null, token?.token || "");
      },
    });

    const workbook = await client
      .api(
        "/me/drive/root:/DRYmedic_Dispatch_Board.xlsx:/workbook/worksheets('Live Dispatch')/usedRange"
      )
      .get();

    return Response.json(workbook.values);
  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}