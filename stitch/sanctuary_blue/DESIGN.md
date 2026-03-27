# Design System Specification: The Serene Steward

This design system is a bespoke framework crafted to elevate a functional utility into a premium, editorial experience. It moves away from the rigid, "boxed-in" aesthetic of traditional management software, instead embracing a philosophy of **Tonal Architecture**. By prioritizing depth through color shifts rather than lines, we create a space that feels calm, authoritative, and profoundly organized.

---

## 1. Creative North Star: The Digital Sanctuary
The visual identity is defined by the **"Digital Sanctuary"**—a concept that balances the high-stakes precision of attendance data with the welcoming, human-centric nature of a community. 

To achieve this, the system rejects "Standard SaaS" aesthetics. We utilize **intentional asymmetry**, where large editorial display type sits offset from dense data tables, and **nested layering**, where information is tiered through background shifts rather than borders. The goal is an interface that feels like a high-end architectural blueprint: clean, spacious, and mathematically harmonious.

---

## 2. Color & Tonal Architecture

We avoid the "flat" look by using a sophisticated palette that mimics physical depth.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for large section blocks sitting on a `surface` background. This creates a softer, more professional "edge" that reduces visual noise.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of fine paper.
*   **Base Layer:** `surface` (#f8f9ff)
*   **Secondary Content:** `surface-container-low` (#eff4ff)
*   **Primary Interaction Cards:** `surface-container-lowest` (#ffffff) for maximum "lift."
*   **Active/Navigation:** `primary-container` (#1e3a5f) to anchor the eye.

### Glass & Gradient Signature
To move beyond a generic feel, floating elements (like sticky action bars or modals) must use **Glassmorphism**. Apply `surface` at 80% opacity with a `20px` backdrop-blur. 
*   **CTA Soul:** Primary buttons should not be flat hex codes. Use a subtle linear gradient from `primary` (#022448) to `primary-container` (#1e3a5f) at a 135-degree angle to provide a "jeweled" depth.

---

## 3. Typography: Editorial Authority

The system uses a pairing of **Manrope** for high-impact headlines and **Inter** for high-legibility data.

*   **Display & Headline (Manrope):** Used for total counts and section titles. The wide tracking and geometric forms convey modern stability.
    *   *Display-LG (3.5rem):* For hero stats (e.g., "94% Attendance").
    *   *Headline-SM (1.5rem):* For categorical headers.
*   **Title & Body (Inter):** The workhorse for list items and labels.
    *   *Title-SM (1rem):* Used for member names.
    *   *Body-LG (1rem):* The minimum standard for interactive text to ensure tap accuracy.
*   **Labels (Inter):** 
    *   *Label-MD (0.75rem):* All-caps with 0.05rem letter-spacing for metadata like "LAST ATTENDED."

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "dirty" for this aesthetic. We use **Ambient Shadows** and **Tonal Lift**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural elevation without a single shadow pixel.
*   **Soft Ambient Shadows:** For modals or floating action buttons, use a highly diffused shadow: `0px 12px 32px rgba(13, 28, 46, 0.06)`. The tint is pulled from the `on-surface` color, not pure black.
*   **The "Ghost Border" Fallback:** If a divider is essential for accessibility, use `outline-variant` at **15% opacity**. Never use a 100% opaque line.

---

## 5. Components

### Buttons & Inputs
*   **Primary Action:** Rounded-MD (`0.75rem`), using the Primary-to-Container gradient. 
*   **Ghost Inputs:** Forgo the "box." Use a `surface-container-highest` background with a `label-sm` floating above it. Focus states are indicated by a 2px `primary` bottom-border only.
*   **Sticky Primary Button:** Usually anchored to the bottom-right, this should be a large circular button (`xl` roundedness) using `primary` and a `surface-container-highest` ambient shadow.

### Status Indicators (Chips)
Do not use heavy, solid-colored blocks for status.
*   **Present:** `secondary-container` background with `on-secondary-container` text.
*   **Absent/At-Risk:** `error-container` background with `on-error-container` text.
*   **Late:** `tertiary-container` background with `on-tertiary-container` text.
*   *Styling:* Use `full` roundedness (pills) and `label-md` bold typography.

### Member Cards & Lists
*   **Anti-Divider Policy:** Forbid the use of horizontal divider lines. Use `spacing-4` (1.4rem) of vertical white space to separate list items.
*   **Interactivity:** On hover/tap, the background of a list item should transition from `surface` to `surface-container-high`.

### Specialized Component: The Attendance Sparkline
A custom micro-visualization component. A small, simplified line graph using `primary` or `secondary` tokens placed next to a member's name to show attendance trends over the last 4 weeks.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a left-aligned headline with a right-aligned search bar on a different vertical plane).
*   **Do** prioritize "Breathing Room." If a screen feels crowded, increase spacing using the `spacing-8` or `spacing-10` tokens.
*   **Do** use `surface-bright` for Dark Mode accents to maintain a "glow" effect without losing the navy depth.

### Don't:
*   **Don't** use standard 1px borders. If you feel you need one, use a background color shift instead.
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#0d1c2e) for a softer, premium contrast.
*   **Don't** cram icons together. Every icon must have a `48x48dp` touch target and a clear `label-sm` underneath or beside it.