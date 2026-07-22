import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCustomer } from "../actions";

export default function NeuerKundePage() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Neuer Kunde</CardTitle>
        <CardDescription>Stammdaten der Kundenakte anlegen.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createCustomer} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Firmenname *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="industry">Branche</Label>
              <Input id="industry" name="industry" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Standort</Label>
              <Input id="location" name="location" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contactPerson">Hauptansprechpartner</Label>
            <Input id="contactPerson" name="contactPerson" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" />
            </div>
          </div>
          <Button type="submit" className="mt-2 self-start">
            Kunde anlegen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
