# datakomm18-g19

## Guide

### Hur man startar

1. Se till att du har node installerat

2. Kör 'node server.js' i foldern

3. Öppna webläsare och gå in på 'localhost:5000'


### Intressanta och ointressanta filer

#### server.js

  Här hanteras servern, startas, visar vart saker finns osv, kör serverside delen av spelet.

#### movement.js

  Hit är allt som hanterar själva mekanismerna kring hur man rör sig sov, collision, gravitation

#### static/game.js

  Client side delen av spelet, här tolkas keyboard input som skickas till servern, här ritas
också allting upp.

#### index.html

  Minsta möjliga html-fil som bara ger oss ett canvas att rita spelet på

#### Resterande filer hör till de olika installerade modulerna vilka är som följer:

1. express
  Gör det väldigt enkelt att sätta upp servern, används bara i dom första raderna i server.js

2. socket.io
  Denna modul är det som används för kommunikation mellan client och server. de funktioner som liknar
socket.foo eller io.emit.bar hör hit.

### Kodkonvention

1. Använd spaces inte tabs, 4 st
2. Använd camelCase
3. Använd inte semicolon i onödan 
4. Använd tydliga variabel- och funktionsnamn
5. etc.

## Att göra:

- Fixa snyggare grafik
- Fixa en snygg front i html/css
- Fixa UI med funktioner:
  - Ange namn
  - Visa alla spelares poäng
  - Starta/Starta om/Avsluta
- Implementera ovanstående funktioner i spelet
- Fixa hur clienten får poängen rapporterad
- Fixa så att rader som inte syns längre försvinner från spelet
- Powerups
- Olika spelare har olika färger
- Implementera ett lokalt state som kan påverkas direkt och som sen måste godkännas av servern annars
rollback, samt att clienten då ritar sitt lokala state
- Fler hål genereras
- Börja spelet med hel maze
- Komma på fler saker att göra