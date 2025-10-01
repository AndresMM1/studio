"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InformesPage() {
  const reportUrl = "https://app.powerbi.com/reportEmbed?reportId=e86d4cd7-c159-4d6f-ba7b-785dabed0f76&autoAuth=true&ctid=e529544b-b6a6-44be-a25b-70b74b34311c";

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Power BI</CardTitle>
        
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full">
            <iframe
              title="Power BI Report"
              width="100%"
              height="100%"
              src={reportUrl}
              frameBorder="0"
              allowFullScreen={true}
              style={{ minHeight: '720px' }}
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
