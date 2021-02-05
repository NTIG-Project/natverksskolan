# Scenariokartan (Platt)

Webbverktyg för att publicera scenarion och uppgifter på en karta. Den "platta" versionen använder enbart frontend-tekniker och flat-files-datahantering för enkel driftsättning med Github Pages. Det finns en mer utförlig version med fler funktioner baserad på backend-tekniker och databaser under utveckling.

## Exempel

![Exempel 1](/examples/images/example1.png)

![Exempel 2](/examples/images/example2.png)

![Exempel 3](/examples/images/example3.png)

### Nätverksskolan

Systemet kan ses i aktiv användning på [Nätverksskolan](https://github.com/NTIG-Project/natverksskolan).

## Kom igång

För att kunna jobba med systemet behövs en grundläggande förståelse för JSON och webbkoncept. Kunskap i Bootstraps färg och klassystem hjälper för vissa valfria funktioner.

### 1. Klona projektet

Det snabbaste sättet att komma igång med din egen version av scenariokartan är att använda Githubs funktioner **Fork** och **Pages**, och den här guiden utgår från dem. Du kan även ladda ner filerna, redigera dem och lägga upp dem på en webbserver.

Se till att du har ett [konto på Github](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/signing-up-for-github) och klicka på knappen **Fork** uppe i högra hörnet på den här sidan.

När du följt guiden så har du en egen kopia av systemet. Om du är intresserad kan du läsa mer om [forking](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo.)

### 2. Google Maps API Key

För att använda Google Maps behövs en API-nyckel kopplad till ett debiteringkonto hos Google. Det är inte gratis att använda Google Maps men det ingår 28000 visningar per månad innan det börjar kosta något. Läs mer om vad det kostar på [https://cloud.google.com/maps-platform/pricing/sheet].

Följ instruktionerna på [https://developers.google.com/maps/gmp-get-started#procedures] för att skapa ett konto och en kopplad nyckel. Tänk på att sätta en begränsning på vilka domäner som kan använda nyckeln så att ingen annan kan använda din nyckel.

### 3. Skapa settings.json

1. Byt namn på *template_settings.json* till *settings.json* eller skapa en *settings.json*.
2. Redigera *settings.json* och skriv in din API-nyckel och namn på sidan, *"area"* kan lämnas som den är.

#### Koncept Area

* **area:** En area / område är en fil med ett antal markörer angivna på kartan och information för de punkterna. Du kan välja om du vill ha en enda fil, flera som du växlar mellan i settings.json eller flera som du växlar mellan med hjälp av [URL-Parametrar](https://github.com/KajSchmidt/scenariokartan_platt/wiki/URL-parametrar). Ett sätt att använda detta är att ha olika områden för olika moment eller kurser istället för att ha flera olika sidor.

Om du vill göra mer ingående inställningar kan du läsa mer i [wikin](https://github.com/KajSchmidt/scenariokartan_platt/wiki/settings.json).

### 4. Skapa default_area.json

1. Byt namn på */areas/template_default_area.json* till *default_area.json* eller skapa en *default_area.json* i mappen *areas*. Din area-fil kan heta vad som helst så länge den ligger i mappen *area* och är angiven i *settings.json*.
2. Redigera *default_area.json* med de platser och uppgifter du vill ha. Ett enkelt sätt att få fram latitud och longitud för en plats är att öppna [Google Maps](https://www.google.se/maps) och högerklicka på platsen, den första raden i menyn som kommer upp är latitud och longitud för den punkten.

#### Koncept Location

* **location:** En location / plats är en markör på kartan kopplad till ett informationsfönster. En plats kan representera ett scenario / en uppgift eller en samlingsplats för flera uppgifter genom actions. Systemet med JSON är inte så enkelt att använda för långa texter så du kan välja om du vill skriva fullständiga instruktioner i beskrivningen eller istället länka till dokument med instruktioner.
* **action:** En action / uppgift är en knapp med en länk till en fritt vald sida/fil/annat.

**Viktigt att namnet på varje plats är unikt då det används för att generera interna och externa länkar till informationsrutor.**

Om du vill göra mer ingående inställningar kan du läsa mer i [wikin](https://github.com/KajSchmidt/scenariokartan_platt/wiki/area.json).

### 5. Aktivera Github Pages

Genom Github Pages kan du driftsätta en sida utan att behöva ha en egen server så länge den bara innehåller frontend-tekniker.

1. Gå till ditt repository för din sida och klickar på **Settings**.
2. Hitta rubriken **Github Pages** och klicka på knappen **None**
3. Välj **main** i listan och klicka på **Save**
4. När sidan har laddat om så går du tillbaka till rubriken **Github Pages** och nu kan du se adressen för din sida.
5. Använd den adressen för att begränsa vilka sidor som kan använda din Google Maps API Key

## Inkluderade system

* [Bootstrap 5](https://getbootstrap.com/)
* [Google Maps API](https://developers.google.com/maps/documentation)
* [Google Fonts](https://fonts.google.com/)
* [Trianglify](https://github.com/qrohlf/trianglify)
* [Showdown](https://github.com/showdownjs/showdown)
* [color-scheme-js](https://github.com/c0bra/color-scheme-js)

## Övrigt

Nybearbetning av ideerna i [https://github.com/KajSchmidt/natverksskolan]
