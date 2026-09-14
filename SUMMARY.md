# Grafana Faro — Proof of Concept

Zusammenfassung für [MOP-8251](https://motel-one.atlassian.net/browse/MOP-8251).
Diskussionsgrundlage für [MOP-7626](https://motel-one.atlassian.net/browse/MOP-7626).

## Worum es geht

PageSpeed und Lighthouse messen **einmal, im Labor, auf einer Maschine**. Sie
beantworten nicht die Frage, die nach einem Release zählt: _Ist es für die
echten Besucher schlechter geworden?_

Grafana Faro misst im Browser der Nutzer — fortlaufend, auf deren Geräten und
Verbindungen. Dieser PoC zeigt, wie das aussieht und was man damit sehen kann.

## Was gebaut wurde

Eine eigenständige Demo-Anwendung, bewusst **ohne Anbindung ans MS-Frontend**.
Sechs Seiten, jede identisch aufgebaut, jede mit **genau einem Fehler**:

| Seite     | Was daran kaputt ist                        | Betroffene Messung   |
| --------- | ------------------------------------------- | -------------------- |
| `/`       | nichts — die Vergleichsseite                | alles grün           |
| `/lcp`    | Hero-Bild kommt zu spät vom Server          | Ladezeit (LCP)       |
| `/cls`    | Inhalt ohne reservierten Platz springt nach | Layout-Sprünge (CLS) |
| `/inp`    | Klick wird durch Rechenarbeit blockiert     | Reaktionszeit (INP)  |
| `/ttfb`   | Server antwortet verzögert                  | Serverzeit (TTFB)    |
| `/errors` | JavaScript-Fehler, fehlgeschlagene Requests | Fehler               |

Jede Seite hat Schaltflächen für verschiedene Schweregrade und zeigt den
gemessenen Wert **live an** — aus derselben Quelle, aus der Grafana ihn bekommt.
Wer drückt, sieht die Zahl sofort und findet sie eine Minute später identisch im
Dashboard wieder.

## Das Dashboard

Eine Zeile pro Szenario, eine Spalte pro Messung, gegen Googles offizielle
Schwellenwerte eingefärbt. **In jeder Zeile ist genau eine Zelle rot** — der
Fehler, für den die Seite gebaut wurde.

Gemessene Werte aus einem Durchlauf:

| Szenario            | Messung          | Bewertung              |
| ------------------- | ---------------- | ---------------------- |
| `/lcp?v=lazy`       | LCP **4312 ms**  | schlecht (Grenze 2500) |
| `/cls?level=severe` | CLS **0,508**    | schlecht (Grenze 0,1)  |
| `/inp?level=severe` | INP **800 ms**   | schlecht (Grenze 200)  |
| `/ttfb?delay=2000`  | TTFB **2060 ms** | schlecht (Grenze 800)  |
| `/` (Vergleich)     | alle Werte grün  | —                      |

## Nachvollziehbarkeit

Jeder Testlauf bekommt einen Namen und ein Datum — etwa
`inp-kundentermin-0914-1826`. Alles, was dieser Lauf misst, trägt dieses Etikett.
Im Dashboard filtert man darauf und sieht genau die Zahlen dieses einen Laufs.

Die Testläufe lassen sich per Knopfdruck starten; ein echter Browser arbeitet
die Seiten ab, während der Fortschritt live mitläuft.

## Warum das zum MS-Frontend passt

Jedes Szenario bildet ein Muster ab, das im Backlog bereits einzeln analysiert
wurde:

| Szenario          | Frühere Tickets                                             |
| ----------------- | ----------------------------------------------------------- |
| Langsames Bild    | MOP-8316 (Stage-Video mobil), MOP-6431 (große Bilder mobil) |
| Layout-Sprünge    | MOP-7548 (Buchen-Button), MOP-6562 (Footer-Bilder)          |
| Blockierte Klicks | Die MOP-742x-Serie — Booker, Menü, Karte, Slider            |

Die Aussage ist deshalb nicht „hier ist ein Werkzeug", sondern: **Die Fragen,
die letztes Jahr in zwölf Analyse-Tickets von Hand beantwortet wurden,
beantwortet das hier laufend und von selbst.**

## Was der PoC bewusst nicht entscheidet

Gemäß Ticket-Abgrenzung: keine Anbindung ans MS-Frontend, keine produktive
Konfiguration, keine Aussage zu Kosten, Skalierung oder Rollout.

Zwei Punkte sind aber aufgefallen und gehören in die Entscheidung zu MOP-7626:

**Erreichbarkeit.** Faro sendet aus dem Browser des Besuchers an einen
Sammelpunkt. Ein nur intern erreichbarer Sammelpunkt kann von echten Besuchern
nicht beliefert werden — produktiv braucht es einen öffentlichen Zugang.
Feature-Umgebungen wären der günstigere erste Schritt, weil der Browser dort
ohnehin im internen Netz steht.

**Einwilligung.** Faro vergibt Sitzungskennungen und erfasst URLs sowie
Fehlermeldungen. Eine produktive Einbindung braucht sehr wahrscheinlich eine
Consent-Steuerung wie GTM sie heute schon hat, und muss gegen das bestehende
Cookie-Handling im SSR geprüft werden.

## Aufwand

Das Ticket war auf vier Stunden geschätzt. Tatsächlich wurde es deutlich mehr —
im Wesentlichen, weil die Demo-Anwendung samt Design entstanden ist und weil
jede der fünf Messungen eigene Tücken hatte, bis sie verlässlich schlechte Werte
erzeugte. Der Aufbau ist dafür wiederverwendbar und kann als Ausgangspunkt für
die produktive Einführung dienen.
