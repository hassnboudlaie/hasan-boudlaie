# Zilux Jewels digital boutique

Independent, buildless Persian/English boutique at `/hasan-boudlaie/zilux-jewels/`.

## Experience

- Persian is the default, with full RTL; `?lang=en` opens English in LTR.
- Hash routes support home, collections, category/search filters, individual pieces, favorites, consultation, boutique and care pages.
- Favorites and language preference stay in the visitor's browser. Form details remain in memory and are not submitted to a backend.
- Consultation prepares an editable enquiry, copies it and links to the supplied Instagram account, `@ziluxjewels`. Visitors send their own message. No booking, stock confirmation or payment is implied.

## Content to replace before using as a retail catalog

The four pieces, their names and reference codes, and all five jewelry images are illustrative. Imagery was created with built-in ImageGen and optimized to WebP. They do not represent actual Zilux stock. The visible preview labels must remain until official images and verified product details replace them.

The boutique location is the user-supplied Mikamall, Kish Island. No phone, unit number, opening hours, metal purity, weight, stone certification, prices or sales policies have been invented. The map points to Mikamall, not an asserted precise unit.

Edit `catalog` and the `copy.fa` / `copy.en` dictionaries in `app.js` when the official catalog and contact details are supplied. Update both languages together. Do not replace the demo disclaimer with stock or authenticity claims without verified data.

## Design and assets

Ivory, pale aqua, dark green, restrained typography and generous spacing. The user requested close inspiration from Tiffany; the implementation uses an original ZILUX text wordmark and original conceptual product imagery. It does not use Tiffany logos, product photographs or branded designs.

Fonts are self-hosted under `assets/fonts` with OFL licenses. Images and type load from the same site. There are no analytics or third-party scripts.

Source of structural inspiration: https://www.tiffany.com/ (collections, category exploration and private consultation).

Validation: syntax checks and a DOM-based interaction check covered both languages, all routes, category/search/empty states, asset paths, labels, favorites storage, zoom, consultation drafting, language changes, clipboard handling and unavailable browser storage. Visual browser QA was unavailable in this environment.
