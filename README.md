# Scenariokartan (Platt)

Webbverktyg för att publicera scenarion och uppgifter på en karta. Använder enbart front end och flat files för enkel driftsättning.

Vidareutveckling av [https://github.com/KajSchmidt/natverksskolan]

## Area Json

**Obligatoriska**

- name
- lat
- long
- locations

### Locations

**Obligatoriska**

- lat
- long
- name
- description

**Valfria**

- image (default: ) Ange en bild URL.
- style (default: bg-light text-dark border-white) Sätt stilklasser från Bootstrap.
- actions (default: ) Array med knappar.

**Planerade**

- marker

#### Actions

**Obligatoriska**

- name
- href

**Valfria**

- style (default: btn-primary) Sätt stilklasser för knappar från Bootstrap.
- target (default: _self) Sätt anchor target för att öppna i samma eller nytt fönster.
