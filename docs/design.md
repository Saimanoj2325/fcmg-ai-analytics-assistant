# FMCG AI Analytics Assistant - Design Specification

This document details the UI/UX design choices, styling principles, and the high-fidelity synthetic data simulation engine used to evaluate the assistant's analytical capabilities.

---

## 1. UI/UX Design System & Aesthetics

The application implements a premium, modern design language focused on maximum legibility, high visual hierarchy, and an interactive experience.

### Visual Foundations
- **Color Palette**: Custom tailored HSL/hex color palettes featuring deep indigo and slate bases, accented with professional semantic tones:
  - Slate Dark & Slate Light bases for card layers.
  - Cool grey backgrounds (`#f1f2f6` and `#f8f7ff`).
  - Violet/Indigo accents (`#4f46e5`, `#6366f1`) for main actions, active states, and system focus.
  - Green (`#10b981`) for positive revenue trend statistics and active promotions.
  - Orange/Red (`#ef4444`, `#f59e0b`) for inventory stockout warnings and risk metrics.
- **Typography**: Uses modern, readable font scaling from clean sans-serif systems (interfacing with system defaults).
- **Layout Structure**: 
  - **Shared Navigation Sidebar**: Left-aligned, collapsible workspace listing functional pages and active chat sessions.
  - **Glassmorphic Card Canvas**: Content panels feature border trims and drop-shadows to establish an organized space.
  - **Responsive Layout**: Adapts gracefully across desktop displays.

### UI Components overview
- **KPI Dashboard**: Presents critical health indicators (revenue, units sold, promotion count, stockout rate) side-by-side with micro-trend badges. Interactive charts (Recharts) map weekly revenue trends, top 5 SKUs, and regional performance.
- **Product Explorer**: A search-and-filter grid that allows users to filter by beverage category or brand, view stockout status, and instantly trigger AI prompt questions for specific SKUs or store profiles.
- **Promo Simulator**: An interactive environment where users can slide discount metrics to observe forecasted units sold, gross revenues, and margins based on elasticity formulas.

---

## 2. UX Screens — Live Application

The following screenshots were captured from the running application at `http://localhost:3000`. They show each of the four main views as experienced by end users.

### Dashboard

The central analytics hub. Shows four KPI cards (Total Revenue, Units Sold, Active Promotions, Stockout Rate), a 12-week revenue trend line chart, a regional performance bar chart, and a ranked top-5 products table.

![Dashboard Screen](./screen_dashboard.png)

---

### AI Chat Interface

The conversational analytics terminal. Users type natural language questions; the assistant streams back structured markdown responses with tables, bullet points, and highlighted figures. A tool-call indicator pulses while Gemini executes database queries.

![Chat Interface Screen](./screen_chat.png)

---

### Product Explorer

A filterable grid of all 15 beverage SKUs and 40 retail stores. Users can filter by category or region and click any row to instantly fire a targeted AI analysis prompt into the chat interface.

![Product Explorer Screen](./screen_products.png)

---

### Promo Simulator

A scenario-building workspace. Users select a product, choose a promotion type, and drag a discount slider to see real-time elasticity-driven forecasts for units sold, gross revenue, and net margin — with an option to send the scenario directly to the AI for deeper analysis.

![Promo Simulator Screen](./screen_simulator.png)

---

## 3. Synthetic Data Simulation Engine

To test a conversational analytics agent, simple randomized variables are insufficient. The assistant relies on a seeded, deterministic simulation engine that models structural macroeconomic seasonality, price elasticity, supply chain constraints, and operational business anomalies.

### Core Schema

The database consists of 52 weeks of synchronized history (starting Monday, 2024-01-01 through 2024-12-23) for:
- **15 Beverage SKUs** (`BEV-001` through `BEV-015`) spanning 5 categories (Carbonated, Juice, Water, Energy, Dairy).
- **40 Stores** (`STR-001` through `STR-040`) across 4 regions (North, South, East, West) and 4 store formats (Supermarket, Hypermarket, Convenience, Wholesale).

### Baseline Demand Formula
```
units_demanded = Math.round(base_units * format_multiplier * seasonal_index * uplift_multiplier * random_noise)
```
- **Base Units**: Standard customer demand velocity per SKU.
- **Format Multiplier**: Scales volume by channel capacity (Wholesale: 3.0x, Hypermarket: 2.2x, Supermarket: 1.2x, Convenience: 0.6x).
- **Seasonal Index**: Sinusoidal timeline changes combined with category specific weather/calendar triggers.
- **Uplift Multiplier**: Promotional coefficients calculated from discount depth and elasticities.
- **Random Noise**: Seeded log-normal distribution ($~8\%$ variance) ensuring statistical realism.

### Seasonal Demand Profiles
- **Energy Spikes**: Energy drink sales peak by **$1.6\times$** during summer weeks (Weeks 22–34).
- **Dairy Heatwave Shock**: Intense heatwaves (Weeks 26–29) cause a dairy demand decline:
  - **$-45\%$** in the South region (heat-sensitive).
  - **$-30\%$** general national decline.
  - **$-5\%$** in the temperate West region.
- **Juice Holiday Surge**: Juice sales surge by **$1.35\times$** during late-December holiday catering weeks (Weeks 48-52).
- **Water Main Infrastructure Shock**: In Week 18, a localized main burst triggers a sudden **$1.85\times$** surge in spring water sales in the East region only.

---

## 4. Injected Business Edge Cases & Anomalies

To evaluate the AI's diagnostic reasoning capabilities, specific commercial edge cases are embedded within the transactional sales and inventory records:

| Injected Edge Case | Business Scenario | Analytical / AI Diagnostic Challenge |
| :--- | :--- | :--- |
| **Product Cannibalization** | Promoting a brand leader (e.g., Cola Classic) shifts consumers away from adjacent products, causing a corresponding **$35\%$ volume drop** in Cola Diet. | Tests if the AI can identify that promotional volume lift has a corresponding substitution loss on baseline margins. |
| **Store-Format Resistance** | Buy One Get One (BOGO) campaigns fail completely in Wholesale locations, where bulk buyers ignore retail consumer-focused pairing incentives. | Verifies if the AI recognizes channel friction rather than blindly proposing uniform nation-wide campaigns. |
| **Logistical Replenishment Delays** | Warehouses in the East region experience shipment delays during Weeks 14–16, dropping units received to **0**. | Challenges the AI to distinguish between demand-driven stockouts and back-end supply constraints. |
| **Utility Infrastructure Shock** | Localized main burst in Week 18 (East Region) drives an anomalous water sales surge. | Evaluates the AI's ability to separate temporary local events from recurring seasonal baselines. |
| **Premium SKU Price Inelasticity** | CowPure Organic Almond Milk has low elasticity (**$0.25$**), causing price cuts to fail to generate enough volume lift to offset the lower unit price. | Confirms if the AI can identify margin erosion from unprofitable promotions on inelastic SKUs. |
| **Data Quality Errors** | Missing promotion labels and zero discount values on selective weeks in Week 15/40. | Verifies the system's robustness when parsing incomplete arrays without throwing errors. |

---

## 5. Simulation Assumptions

1. **Static Reference Pricing**: The base price of all beverage SKUs is constant throughout the calendar year; pricing changes occur exclusively via designated promotional discounts.
2. **Internal Substitution Boundary**: Cannibalization occurs strictly within brand portfolios (e.g., Cola Classic vs. Cola Diet) with zero cross-category impact.
3. **Isolated Logistical Networks**: Warehouse distribution issues are localized to regional networks; supply bottlenecks in the East cannot be mitigated by redirecting inventory from adjacent depots like the North or South.
4. **Synchronized Timeline**: All data operates on a weekly cadence starting on Mondays.
