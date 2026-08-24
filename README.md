# Die Transvaler

Afrikaanse satiriese nuus — *fopnuus wat jy kan vertrou*. Leef op [dietransvaler.co.za](https://dietransvaler.co.za).

## 'n Nuwe artikel skryf

1. Maak `content/artikels/<slug>.mdx`. Die lêernaam word die URL.
2. Vul die frontmatter in — alle velde behalwe die drie `prent*`-velde is verplig:

   ```yaml
   ---
   titel: "Die Kop"
   uittreksel: "Een sin wat op die voorblad wys."
   kategorie: politiek   # politiek | sake | sport | wereld | lewe
   datum: 2026-08-24
   skrywer: "Ons Redakteur"
   prent: /prente/iets.jpg              # opsioneel
   prentAlt: "Wat op die prent te sien is."   # VERPLIG saam met prent
   prentBronskrif: "Bronskrif en outeur."  # opsioneel, slegs saam met prent
   ---
   ```

   **Belangrik:**
   - `prentAlt` beskryf wat die prent vertoon (vir skermlesers en motors).
   - `prentBronskrif` is die byskrif wat onder die prent wys — krediet en konteks.
   - Hulle is twee verskillende dinge. 'n Prent sonder `prentAlt` laat die bou misluk.
   - Prente moet plaaslike lêers in `public/prente/` wees, nie eksterne URL's nie — `next.config.ts` stel geen `images.remotePatterns` op nie.

3. Skryf die liggaam in MDX. Commit en push — Vercel deploy outomaties.

Slegte frontmatter laat die bou misluk met die lêernaam en die veld wat verkeerd is. Dit is 'n kenmerk, nie 'n @bug — dit beteken dat 'n stukkende artikel nooit produksie bereik nie.

## Ontwikkeling

```bash
npm run dev     # http://localhost:3000
npm test        # content-layer toetse
npm run build   # verifieer dat alles nog statisch bou
npm run lint    # ESLint loop oor die kode
```

Vir toets in Watch mode:

```bash
npm run test:watch
```

## Redaksionele Reël

Satiriseer instellings en tipes, nie gewone mense by die naam nie. Suid-Afrika het geen parodie-verweer teen laster nie — hierdie reël hou die projek veilig.
