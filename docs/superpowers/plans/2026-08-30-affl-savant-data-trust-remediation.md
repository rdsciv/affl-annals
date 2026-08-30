# AFFL Savant Data Trust Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current AFFL Savant prototype into a trustworthy, statically deployable AFFL analytics site whose identities, metrics, queries, historical claims, and internal links are reproducible and correct.

**Architecture:** Keep the vetted legacy `data/affl.db` warehouse as the sole production source contract for this release, validate it before mart generation, and derive every public claim from versioned marts. Put query behavior and metric formulas in small, testable modules; expose only scopes and grains supported by the published data. Generate a compact player index plus per-player payloads so static routing, discovery, and caching share one contract.

**Tech Stack:** Next.js 15.5 static export, React 19, TypeScript 5.7, Python 3.12+, SQLite, pandas, PyArrow, Vitest, pytest, ESLint, GitHub Actions, GitHub Pages.

## Global Constraints

- Audit baseline: clean commit `c943593` on `main`/`origin/main`.
- The worktree has concurrent user-owned design edits. Inspect `git status --short` before every task; do not overwrite, revert, or stage unrelated changes.
- Standard scoring remains non-PPR: passing yards `/25`, passing touchdowns `4`, interceptions `-2`, rushing/receiving yards `/10`, rushing/receiving touchdowns `6`, and fumbles lost `-2`.
- An owner/person is the durable AFFL identity. A historical ESPN team slot or similarly named team is not an identity.
- Do not regenerate or commit public marts until source-contract, identity, and metric tests pass.
- Do not display a scope, grain, metric, record, or search field that the published data cannot calculate.
- Every internal player link in a static build must resolve to an exported page.
- Preserve the existing visual system unless a functional correction requires a small UI change.
- Do not add a database service, API server, or alternate warehouse in this remediation.

---

## Executive Report

### Verdict

The project is a convincing visual prototype but is not ready to be treated as the permanent statistical home of the AFFL. Its routes resemble the intended combination of [NFL Savant's queryable explorer](https://nflsavant.com/explore), [PlayerProfiler's player analytics](https://www.playerprofiler.com/fantasy-football-stats/), and [Fantasy Genius's league-history features](https://www.fantasygenius.io/features). The blocking gap is trust: the current source pipeline is internally contradictory, several identities are merged incorrectly, receiving opportunity fields are wired to passing fields, Explore controls return results they do not actually represent, and hard-coded historical claims disagree with the marts.

### What is already strong

- The information architecture covers franchises, seasons, players, drafts, trades, records, methodology, and an Explore surface.
- Static export is a sensible hosting choice for a private historical league dataset.
- The visual language is coherent and differentiated from the reference sites.
- Existing Python tests establish a useful starting point for scoring and warehouse checks.
- The repository already contains enough raw NFL weekly and play-by-play data to correct receiving fields and derive situational opportunity inputs.

### Priority findings and suggested fixes

| Priority | Defect | User impact | Suggested fix | Release acceptance |
|---|---|---|---|---|
| P1 | `pipeline/schema.sql` and `ingest_espn_to_sqlite.py` create prefixed `dim_affl_*`/`fact_affl_*` objects, while `build_marts.py` reads the legacy warehouse | A documented rebuild either fails or updates tables the public marts ignore | Declare the vetted legacy database the production contract, add a fail-fast schema validator, and mark the incomplete prefixed pipeline experimental | A temporary incomplete DB fails with a readable missing-object error; `data/affl.db` passes |
| P1 | Jake Hibbard, Scott Ace, Garrett Jones, and David Allardyce are merged into other owners' durable franchises | Duplicate franchise-seasons, self-rivalries, lost draft picks, and incorrect cumulative history | Give each person a distinct alumni franchise identity and centralize the legacy-owner mapping | No duplicate `(season, franchise_id)`, no self-head-to-head pair, and no `FRAN_UNKNOWN` |
| P1 | WR/RB/TE air yards and YAC use `passing_air_yards` and `passing_yards_after_catch` | xFP, FPOE, Air Yards, and YAC are materially false | Use receiving columns, add golden fixture tests, and supply or explicitly remove undocumented situational inputs | A WR fixture publishes receiving values exactly; production totals reconcile to raw weekly stats |
| P1 | Explore ignores custody scope | “Rostered,” “Started,” and “Ever” can return the same data | Publish an Explore-specific mart with explicit `rostered` and `started` rows; remove undefined `ever` until its business meaning is specified | Scope tests return intentionally different totals |
| P1 | Explore advertises nine grains but only implements player and franchise aggregation | Week/game/play/NFL-team choices silently mislabel season-custody rows | Support only player, franchise, team-season, position, and season in this release; re-enable deeper grains only with a matching mart | Unsupported grains cannot be selected or encoded in a valid query |
| P1 | Explore accumulates singular field names while the mart publishes plural/different names; rate metrics retain the first season | Carries and touchdowns become zero, while EPA/WOPR/share metrics are stale | Publish the TypeScript contract's canonical names and move aggregation into a typed pure function | Multi-season golden rows have correct sums and weighted rates |
| P1 | Player static generation stops at 500 IDs | Hundreds of links return 404 on GitHub Pages | Generate one player index from custody, draft, and gamelog identities; build every slug from that index | Static verifier finds a page and payload for every indexed player |
| P1 | Season archive and record book are hand-authored and contradict warehouse results | The most trust-sensitive pages publish false champions and records | Generate season summaries and record-book entries from canonical marts; remove factual literals from TSX | One champion per season and every displayed record equals its source aggregation |
| P2 | Methodology xFP calculator uses different inputs and coefficients from Python | Calculator results cannot reproduce site metrics | Store coefficients in one JSON contract and run the same golden cases in Python and TypeScript | Identical fixtures produce identical xFP and FPOE |
| P2 | Draft board stores one pick per franchise/round | Later auction or duplicate-cell picks disappear | Store `DraftPickRecord[]` per cell, sorted by overall pick, and render every item | A two-pick cell displays and opens both picks |
| P2 | Mart URLs include `Date.now()` and use `no-store` | Every visit bypasses browser/CDN reuse and player pages fetch multi-megabyte files | Version URLs with the manifest's file hash, memoize requests, and split player payloads | Repeated reads make one data request; a hash change produces a new URL |
| P2 | Security test catches its own assertion | A shipped credential can pass the audit | Remove the broad catch and scan the shipped text directories deterministically | A temporary forbidden token makes the test fail |
| P2 | Player chronology reverses season and week ordering incorrectly | Career charts run backward within each season | Sort explicitly by `season ASC, week ASC` | `[2024-W1, 2023-W2, 2023-W1]` becomes `[2023-W1, 2023-W2, 2024-W1]` |
| P2 | Player directory promises college search but omits college data and silently caps browse/search results | Valid players are undiscoverable and college search never matches | Join `dim_player_bio`, use the player index, and paginate visible cards without limiting the searchable collection | Last indexed player and known college are searchable |
| P2 | Lint is interactive and deployment runs only `next build` | Frontend/data regressions can deploy despite green Pages CI | Configure ESLint/Vitest/pytest/static-export gates and require them before upload | One noninteractive `npm run check` plus Python/build/export checks all exit zero |

### Required execution order

1. Establish noninteractive quality gates and a safe temporary-output test path.
2. Lock the production source contract and correct durable identities.
3. Correct metric inputs, formulas, and generated mart schemas.
4. Make Explore truthful using only supported scope/grain combinations.
5. Replace hard-coded history with generated summaries.
6. Complete player routing, discovery, payloads, and chronology.
7. Preserve all draft picks and restore content-addressed caching.
8. Run the full release gate and inspect the generated-data diff before deployment.

Do not reverse steps 2 and 3: regenerated marts produced before identity correction will preserve corrupt franchise history in every downstream artifact.

## Target File Structure

| Path | Responsibility |
|---|---|
| `pipeline/source_contract.py` | Validate the legacy SQLite objects and columns required by mart generation |
| `pipeline/identity_canon.py` | Own canonical franchise metadata and legacy owner-to-franchise resolution |
| `pipeline/build_marts.py` | Build deterministic, typed, versioned public marts from the validated warehouse |
| `data/config/metric_contract.json` | Shared xFP/WOPR coefficients and model label used by Python and TypeScript |
| `src/lib/metrics.ts` | TypeScript implementation of the shared metric contract |
| `src/lib/explore-query.ts` | Pure normalization, filtering, aggregation, sorting, and limiting for Explore |
| `src/lib/server-marts.ts` | Read small public JSON marts during static generation |
| `src/lib/players.ts` | Player slug, index lookup, chronology, and pagination helpers |
| `src/lib/draft-board.ts` | Group multiple draft picks into stable display cells |
| `scripts/verify-static-export.mjs` | Ensure every generated route/data dependency exists after `next build` |
| `tests/test_source_contract.py` | Production schema contract regression tests |
| `tests/test_identity_canon.py` | Durable-owner identity regression tests |
| `tests/test_build_marts.py` | Golden mart-field and summary generation tests |
| `src/**/*.test.ts` | Pure frontend behavior tests run by Vitest |

---

### Task 1: Establish Reproducible Quality Gates

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `pyproject.toml`
- Create: `.python-version`
- Create: `scripts/verify-static-export.mjs`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: current Next.js project and committed public marts
- Produces: `npm run check`, `uv run pytest`, and `npm run verify:export` as stable gates for all later tasks

- [ ] **Step 1: Record the failing baseline without changing source files**

```bash
npm run lint
npx tsc --noEmit --incremental false
UV_CACHE_DIR=/private/tmp/affl-remediation-uv-cache uv run --with pytest python -m pytest -q -p no:cacheprovider
```

Expected baseline: lint exits into interactive setup; pytest reports eight passing tests. Typecheck must be recorded against the current worktree because concurrent design edits may change its result.

- [ ] **Step 2: Add noninteractive scripts and pinned lockfile dependencies**

Run:

```bash
npm install --save-dev eslint eslint-config-next@15.5.24 @eslint/eslintrc vitest
```

Set the `scripts` block to include:

```json
{
  "lint": "eslint .",
  "typecheck": "tsc --noEmit --incremental false",
  "test": "vitest run",
  "test:watch": "vitest",
  "verify:export": "node scripts/verify-static-export.mjs",
  "check": "npm run lint && npm run typecheck && npm test"
}
```

- [ ] **Step 3: Configure ESLint and Vitest**

Create `eslint.config.mjs`:

```js
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseDirectory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory });

export default [
  { ignores: [".next/**", "out/**", "public/data/marts/**", "*.tsbuildinfo"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
```

- [ ] **Step 4: Pin the Python environment and ignore transient outputs**

Create `pyproject.toml`:

```toml
[project]
name = "affl-savant-pipeline"
version = "0.1.0"
requires-python = ">=3.12,<3.14"
dependencies = [
  "pandas>=2.2,<3",
  "pyarrow>=18,<20",
  "requests>=2.32,<3",
]

[dependency-groups]
dev = ["pytest>=8,<9"]
```

Create `.python-version` with exactly:

```text
3.12
```

Add these lines to `.gitignore`:

```gitignore
*.tsbuildinfo
*.db-shm
*.db-wal
```

Remove the already tracked `tsconfig.tsbuildinfo`, `data/affl.db-shm`, and `data/affl.db-wal` from Git tracking only after confirming they are generated artifacts; never delete `data/affl.db`.

- [ ] **Step 5: Add the initial static export verifier**

Create `scripts/verify-static-export.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");
const marts = path.join(root, "public", "data", "marts");
const indexPath = path.join(marts, "mart_affl_player_index.json");

if (!fs.existsSync(out)) throw new Error("out/ is missing; run npm run build first");
if (!fs.existsSync(indexPath)) throw new Error("mart_affl_player_index.json is missing");

const players = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const missing = players.filter(({ slug }) => {
  const route = path.join(out, "players", slug, "index.html");
  const payload = path.join(marts, "players", `${slug}.json`);
  return !fs.existsSync(route) || !fs.existsSync(payload);
});

if (missing.length) {
  throw new Error(`Missing static player artifacts: ${missing.slice(0, 10).map((p) => p.slug).join(", ")}`);
}

console.log(`Verified ${players.length} player routes and payloads.`);
```

This script is expected to fail until Task 6 creates the player index and payloads.

- [ ] **Step 6: Add CI without changing deployment yet**

Create `.github/workflows/ci.yml` with Node 20 and Python 3.12 jobs that run the gates available at this stage:

```yaml
- run: npm ci
- run: npm run check
- uses: astral-sh/setup-uv@v6
- run: uv sync --frozen
- run: uv run pytest -q -p no:cacheprovider
- run: npm run build
  env:
    NEXT_PUBLIC_BASE_PATH: /affl-savant
```

Task 8 adds `npm run verify:export` after Task 6 creates the player index and payload contract. Requiring it earlier would keep CI red for unrelated tasks.

- [ ] **Step 7: Verify and commit the tooling task**

```bash
npm run lint
npm run typecheck
npm test
uv sync
uv run pytest -q -p no:cacheprovider
git add package.json package-lock.json .gitignore eslint.config.mjs vitest.config.ts pyproject.toml .python-version uv.lock scripts/verify-static-export.mjs .github/workflows/ci.yml
git commit -m "test: add reproducible frontend and data gates"
```

Do not run `npm run verify:export` as a required passing gate until Task 6 lands.

---

### Task 2: Lock the Source Contract and Correct Durable Identities

**Files:**
- Create: `pipeline/source_contract.py`
- Create: `pipeline/README.md`
- Create: `tests/test_source_contract.py`
- Create: `tests/test_identity_canon.py`
- Modify: `pipeline/build_marts.py`
- Modify: `pipeline/identity_canon.py`
- Modify: `pipeline/schema.sql`
- Modify: `pipeline/ingest_espn_to_sqlite.py`
- Modify: `pipeline/build_identity_bridge.py`
- Modify: `tests/test_data_integrity.py`
- Modify: `src/lib/constants.ts`

**Interfaces:**
- Consumes: `sqlite3.Connection` for the legacy `affl.db` contract
- Produces: `validate_source_contract(conn) -> None`, `resolve_legacy_owner(owner_id) -> FranchiseMetadata`, and collision-free franchise IDs for all marts

- [ ] **Step 1: Write source-contract tests that fail on an incomplete database**

Create `tests/test_source_contract.py`:

```python
import sqlite3
from pathlib import Path

import pytest

from pipeline.source_contract import validate_source_contract

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "affl.db"


def test_incomplete_database_lists_missing_objects():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE dim_player (player_id INTEGER)")

    with pytest.raises(RuntimeError, match="fact_roster_week"):
        validate_source_contract(conn)


def test_production_snapshot_satisfies_contract():
    with sqlite3.connect(DB_PATH) as conn:
        validate_source_contract(conn)
```

Run `uv run pytest tests/test_source_contract.py -q`; expected result before implementation: import failure.

- [ ] **Step 2: Implement the fail-fast source validator**

Create `pipeline/source_contract.py` around this exact contract:

```python
import argparse
import sqlite3

REQUIRED_OBJECTS = {
    "v_team": {
        "season", "team_id", "owner_id", "owner_name", "name", "abbrev", "logo",
        "wins", "losses", "ties", "points_for", "points_against", "playoff_seed", "final_rank",
    },
    "v_matchup": {
        "season", "week", "team_id", "opponent_id", "points", "opponent_points", "phase", "result",
    },
    "dim_player": {"player_id", "name", "position", "gsis_id", "headshot_url"},
    "dim_player_bio": {"player_id", "gsis_id", "college"},
    "fact_roster_week": {"season", "week", "team_id", "player_id", "slot", "points", "started"},
    "fact_draft_pick": {"season", "round", "overall", "team_id", "player_id", "bid", "is_keeper"},
    "fact_trade": {"trade_id", "season", "week", "ts"},
    "fact_trade_item": {"trade_id", "player_id", "from_team_id", "to_team_id"},
}


def validate_source_contract(conn):
    available = {row[0] for row in conn.execute("SELECT name FROM sqlite_master")}
    errors = []
    for name, required_columns in REQUIRED_OBJECTS.items():
        if name not in available:
            errors.append(f"missing object {name}")
            continue
        actual = {row[1] for row in conn.execute(f"PRAGMA table_info({name})")}
        missing = sorted(required_columns - actual)
        if missing:
            errors.append(f"{name} missing columns: {', '.join(missing)}")
    if errors:
        raise RuntimeError("AFFL source contract failed: " + "; ".join(errors))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("db_path")
    args = parser.parse_args()
    with sqlite3.connect(args.db_path) as conn:
        validate_source_contract(conn)
    print(f"AFFL source contract passed: {args.db_path}")


if __name__ == "__main__":
    main()
```

Parameterize `build_all_marts(db_path=DB_PATH, marts_dir=MARTS_DIR)` and call `validate_source_contract(conn)` immediately after opening the connection. Tests must use temporary output directories, never `public/data/marts`.

- [ ] **Step 3: Write identity tests before changing mappings**

Create `tests/test_identity_canon.py`:

```python
from pipeline.identity_canon import resolve_legacy_owner


def test_distinct_people_never_share_a_durable_franchise():
    distinct_pairs = [("m04", "m15"), ("m09", "m02"), ("m12", "m21"), ("m16", "m17")]
    for left, right in distinct_pairs:
        assert resolve_legacy_owner(left)["franchise_id"] != resolve_legacy_owner(right)["franchise_id"]


def test_verified_same_person_aliases_still_merge():
    assert resolve_legacy_owner("m01")["franchise_id"] == resolve_legacy_owner("m07")["franchise_id"]
    assert resolve_legacy_owner("m03")["franchise_id"] == resolve_legacy_owner("m08")["franchise_id"]
```

Run `uv run pytest tests/test_identity_canon.py -q`; expected result before implementation: import failure.

- [ ] **Step 4: Centralize and correct legacy identities**

Move the mapping out of `build_marts.py` and add these distinct alumni records to `CANONICAL_FRANCHISES`:

```python
"FRAN_CHC": {
    "franchise_id": "FRAN_CHC", "display_name": "Charleston Chewbacca",
    "owner_id": "OWNER_CHC", "owner_display_name": "Jake Hibbard",
    "canonical_name": "Charleston Chewbacca", "current_logo_path": "",
    "primary_color": "#64748b", "secondary_color": "#94a3b8",
    "first_season": 2015, "last_season": 2018, "is_active": 0,
},
"FRAN_PWP": {
    "franchise_id": "FRAN_PWP", "display_name": "Pawtucket Patriots",
    "owner_id": "OWNER_PWP", "owner_display_name": "Scott Ace",
    "canonical_name": "Pawtucket Patriots", "current_logo_path": "",
    "primary_color": "#64748b", "secondary_color": "#94a3b8",
    "first_season": 2014, "last_season": 2014, "is_active": 0,
},
"FRAN_MCMD": {
    "franchise_id": "FRAN_MCMD", "display_name": "Muck City Mad Dawgs",
    "owner_id": "OWNER_MCMD", "owner_display_name": "Garrett Jones",
    "canonical_name": "Muck City Mad Dawgs", "current_logo_path": "",
    "primary_color": "#64748b", "secondary_color": "#94a3b8",
    "first_season": 2014, "last_season": 2020, "is_active": 0,
},
"FRAN_LOBT": {
    "franchise_id": "FRAN_LOBT", "display_name": "L.O.B. Thunder",
    "owner_id": "OWNER_LOBT", "owner_display_name": "David Allardyce",
    "canonical_name": "L.O.B. Thunder", "current_logo_path": "",
    "primary_color": "#64748b", "secondary_color": "#94a3b8",
    "first_season": 2014, "last_season": 2014, "is_active": 0,
},
```

Use neutral fallback colors and an empty logo path until approved alumni assets exist. Define:

```python
LEGACY_OWNER_TO_FRANCHISE = {
    "m01": "FRAN_CVC",
    "m02": "FRAN_DCMC",
    "m03": "FRAN_GGG",
    "m04": "FRAN_CHC",
    "m05": "FRAN_SDS",
    "m06": "FRAN_FFC",
    "m07": "FRAN_CVC",
    "m08": "FRAN_GGG",
    "m09": "FRAN_PWP",
    "m10": "FRAN_COG",
    "m11": "FRAN_SVS",
    "m12": "FRAN_MCMD",
    "m13": "FRAN_HLH",
    "m14": "FRAN_PLW",
    "m15": "FRAN_WWL",
    "m16": "FRAN_LOBT",
    "m17": "FRAN_TJS",
    "m18": "FRAN_GTF",
    "m19": "FRAN_PND",
    "m21": "FRAN_PTP",
}


def resolve_legacy_owner(owner_id):
    franchise_id = LEGACY_OWNER_TO_FRANCHISE.get(owner_id)
    if not franchise_id:
        raise KeyError(f"Unmapped legacy AFFL owner: {owner_id}")
    return CANONICAL_FRANCHISES[franchise_id]
```

Replace `get_franchise_meta()` call sites with dictionary access through `resolve_legacy_owner()`; never fall back silently to `FRAN_UNKNOWN`. Mirror the four complete alumni records in `src/lib/constants.ts` so filters can render rebuilt history.

Update the existing `MEMBER_ID_FRANCHISE_MAP` entries whose comments identify Jake Hibbard, Scott Ace, Garrett Jones, and David Allardyce to `FRAN_CHC`, `FRAN_PWP`, `FRAN_MCMD`, and `FRAN_LOBT`. Add these exact name aliases to `MEMBER_FRANCHISE_MAP`:

```python
"jake hibbard": "FRAN_CHC",
"scott ace": "FRAN_PWP",
"garrett jones": "FRAN_MCMD",
"david allardyce": "FRAN_LOBT",
```

- [ ] **Step 5: Make the production/experimental pipeline boundary explicit**

Document this supported sequence in `pipeline/README.md`:

```text
Production source: imported data/affl.db snapshot using the validated legacy affl-analytics schema.
Production command: uv run python -m pipeline.build_marts.
Experimental v2 schema: pipeline/schema.sql, pipeline/ingest_espn_to_sqlite.py, and pipeline/build_identity_bridge.py; both scripts must write data/affl_v2_experimental.db and are not consumed by production marts.
```

Change both experimental scripts' `DB_PATH` to `data/affl_v2_experimental.db` and add the same warning at the top of `schema.sql`. Do not implement dual-schema auto-detection.

- [ ] **Step 6: Add post-build identity assertions**

Extend `tests/test_data_integrity.py` to load the generated JSON and assert:

```python
assert not franchise_seasons.duplicated(["season", "franchise_id"]).any()
assert all(row["franchise1_id"] != row["franchise2_id"] for row in head_to_head)
assert "FRAN_UNKNOWN" not in set(franchise_seasons["franchise_id"])
assert franchise_seasons.groupby("season")["is_champion"].sum().eq(1).all()
```

- [ ] **Step 7: Run the focused tests and commit without regenerated marts**

```bash
uv run pytest tests/test_source_contract.py tests/test_identity_canon.py -q
uv run python -m pipeline.source_contract data/affl.db
git add pipeline/source_contract.py pipeline/identity_canon.py pipeline/build_marts.py pipeline/README.md pipeline/schema.sql pipeline/ingest_espn_to_sqlite.py pipeline/build_identity_bridge.py tests/test_source_contract.py tests/test_identity_canon.py tests/test_data_integrity.py src/lib/constants.ts
git commit -m "fix: restore durable franchise identity contract"
```

---

### Task 3: Correct Metrics and Publish a Stable Mart Contract

**Files:**
- Create: `data/config/metric_contract.json`
- Create: `src/lib/metrics.ts`
- Create: `src/lib/metrics.test.ts`
- Create: `tests/test_build_marts.py`
- Modify: `pipeline/metrics.py`
- Modify: `pipeline/build_marts.py`
- Modify: `tests/test_metrics.py`
- Modify: `src/lib/types.ts`
- Modify: `src/components/MethodologyCalculators.tsx`

**Interfaces:**
- Consumes: validated player-week rows and nflverse weekly/PBP fields
- Produces: canonical `PlayerSeasonCustody` keys, shared `calculateExpectedPoints(inputs) -> number`, and manifest entries with a hash for each emitted file

- [ ] **Step 1: Write a golden receiving-field test**

Create a one-row WR fixture in `tests/test_build_marts.py` with targets `10`, receiving air yards `120`, passing air yards `999`, receiving YAC `55`, and passing YAC `777`. Assert:

```python
row = enrich_player_week_metrics(fixture).iloc[0]
assert row["air_yards"] == 120
assert row["yac"] == 55
assert row["xfp"] == 14.2  # volume inputs only: 10 * .88 + 120 * .045
```

Run `uv run pytest tests/test_build_marts.py -q`; expected result before implementation: import failure.

- [ ] **Step 2: Publish one metric coefficient contract**

Create `data/config/metric_contract.json`:

```json
{
  "version": "affl-opportunity-xfp-v1",
  "label": "Heuristic opportunity-based expected fantasy points",
  "wopr": { "target_share": 1.5, "air_yards_share": 0.7 },
  "xfp": {
    "QB": { "pass_att": 0.35, "rush_att": 0.55, "targets": 0, "air_yards": 0, "red_zone_opps": 0.8, "goal_to_go_opps": 1.5 },
    "RB": { "pass_att": 0, "rush_att": 0.58, "targets": 0.72, "air_yards": 0, "red_zone_opps": 1.2, "goal_to_go_opps": 2.2 },
    "WR": { "pass_att": 0, "rush_att": 0, "targets": 0.88, "air_yards": 0.045, "red_zone_opps": 1.4, "goal_to_go_opps": 2.4 },
    "TE": { "pass_att": 0, "rush_att": 0, "targets": 0.78, "air_yards": 0.035, "red_zone_opps": 1.3, "goal_to_go_opps": 2.3 },
    "DEFAULT": { "pass_att": 0, "rush_att": 0.5, "targets": 0.8, "air_yards": 0, "red_zone_opps": 0, "goal_to_go_opps": 0 }
  }
}
```

Load this file in Python and TypeScript. `src/lib/metrics.ts` must select `DEFAULT` for an unlisted position, compute the dot product of named inputs, and round to two decimals; `pipeline/metrics.py` must use the same contract rather than separate literals.

- [ ] **Step 3: Add cross-language golden cases**

Use the same cases in `tests/test_metrics.py` and `src/lib/metrics.test.ts`:

```ts
expect(calculateExpectedPoints({
  position: "QB",
  pass_att: 40,
  rush_att: 5,
  targets: 0,
  air_yards: 0,
  red_zone_opps: 2,
  goal_to_go_opps: 1,
})).toBe(19.85);

expect(calculateExpectedPoints({
  position: "WR",
  pass_att: 0,
  rush_att: 0,
  targets: 10,
  air_yards: 120,
  red_zone_opps: 2,
  goal_to_go_opps: 1,
})).toBe(19.4);
```

- [ ] **Step 4: Correct the weekly source fields and canonical output names**

In `build_marts.py`, include `receiving_air_yards` and `receiving_yards_after_catch`, then set:

```python
df_rw["air_yards"] = df_rw["receiving_air_yards"].fillna(0.0)
df_rw["yac"] = df_rw["receiving_yards_after_catch"].fillna(0.0)
```

Pass `air_yards` to xFP. Emit season-custody fields named exactly as `src/lib/types.ts` expects:

```python
rush_att=("carries", "sum"),
rush_td=("rushing_tds", "sum"),
rec_td=("receiving_tds", "sum"),
pass_td=("passing_tds", "sum"),
air_yards=("air_yards", "sum"),
yac=("yac", "sum"),
```

Join `dim_player_bio` by `player_id` to publish `college` in the custody and player-index marts.

Publish a non-null stable player key before grouping:

```python
df_rw["player_key"] = df_rw.apply(
    lambda row: row["gsis_id"] if pd.notna(row["gsis_id"]) else f"legacy-{int(row['player_id'])}",
    axis=1,
)
```

Include `player_key` and `player_id` in custody rows; add them to `PlayerSeasonCustody` in `src/lib/types.ts`.

- [ ] **Step 5: Derive situational opportunity counts from PBP**

Add `build_high_value_opportunities(pbp_frames)` in `build_marts.py`. Filter out `play_deleted == 1`, keep `yardline_100 <= 20`, and emit player-role rows using `passer_player_id` for pass attempts, `rusher_player_id` for carries, and `receiver_player_id` for targets. Group by `(season, week, gsis_id)`:

```python
opportunities = role_rows.groupby(["season", "week", "gsis_id"], as_index=False).agg(
    red_zone_opps=("yardline_100", "size"),
    goal_to_go_opps=("goal_to_go", "sum"),
)
```

Merge those counts into `df_rw` before calculating xFP. If a season's PBP file is absent, fail mart generation with the missing season list; do not silently fill every situational count with zero.

- [ ] **Step 6: Make the methodology calculator call the shared TypeScript function**

Replace its local `calcXfp` branch tree with `calculateExpectedPoints`. Show pass attempts for QB and show red-zone/goal-to-go fields for every position. Display the contract's `version` and `label` beside the result.

- [ ] **Step 7: Version every generated file independently**

Replace the hard-coded manifest timestamp with the current UTC build time and maintain one top-level lookup keyed by the exact filename consumed by `fetchMartJson`:

```python
from datetime import datetime, timezone

manifest = {
    "version": "1.1.0",
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "files": {},
    "marts": {},
}

manifest["files"][json_path.name] = {
    "path": json_path.name,
    "md5": compute_md5(json_path),
    "rows": int(len(frame)),
}
manifest["files"][parquet_path.name] = {
    "path": parquet_path.name,
    "md5": compute_md5(parquet_path),
    "rows": int(len(frame)),
}
```

Hash the actual JSON and Parquet separately. Add every `explore_player_week` and `explore_play_actor` shard to `manifest["files"]`; `manifest["marts"]` may group those file records for documentation but must not replace the filename lookup.

- [ ] **Step 8: Run metric tests and commit source changes without public marts**

```bash
uv run pytest tests/test_metrics.py tests/test_build_marts.py -q
npm test -- src/lib/metrics.test.ts
npm run typecheck
git add data/config/metric_contract.json pipeline/metrics.py pipeline/build_marts.py tests/test_metrics.py tests/test_build_marts.py src/lib/metrics.ts src/lib/metrics.test.ts src/lib/types.ts src/components/MethodologyCalculators.tsx
git commit -m "fix: align opportunity metrics across pipeline and UI"
```

---

### Task 4: Make Explore Truthful and Testable

**Files:**
- Create: `src/lib/explore-query.ts`
- Create: `src/lib/explore-query.test.ts`
- Modify: `pipeline/build_marts.py`
- Modify: `src/app/explore/page.tsx`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/components/ExploreSentence.tsx`
- Modify: `src/components/ExploreFilters.tsx`
- Modify: `src/components/ExploreTable.tsx`

**Interfaces:**
- Consumes: `mart_affl_explore_player_season.json` rows with `scope: "rostered" | "started"`
- Produces: `runExploreQuery(rows, state) -> { allRows, visibleRows, scannedCount }`

- [ ] **Step 1: Generate explicit rostered and started scope rows**

Build the Explore mart twice from `df_rw`:

```python
scope_frames = []
for scope, scoped in (("rostered", df_rw), ("started", df_rw[df_rw["started"] == 1])):
    frame = aggregate_player_season(scoped)
    frame["scope"] = scope
    scope_frames.append(frame)
df_explore = pd.concat(scope_frames, ignore_index=True)
```

Do not publish an `ever` scope. Its current label implies career production outside custody, which the custody mart cannot derive.

- [ ] **Step 2: Write failing pure-query tests**

Create fixtures covering two seasons, two franchises, two positions, and both scopes. Assert:

```ts
expect(runExploreQuery(rows, rosteredState).allRows[0].affl_points).toBe(30);
expect(runExploreQuery(rows, startedState).allRows[0].affl_points).toBe(18);
expect(runExploreQuery(rows, playerState).allRows[0].epa).toBeCloseTo(4.5);
expect(runExploreQuery(rows, teamSeasonState).allRows).toHaveLength(2);
expect(runExploreQuery(rows, positionState).allRows).toHaveLength(2);
expect(runExploreQuery(rows, seasonState).allRows).toHaveLength(2);
expect(runExploreQuery(rows, { ...playerState, limit: 1 }).allRows).toHaveLength(2);
expect(runExploreQuery(rows, { ...playerState, limit: 1 }).visibleRows).toHaveLength(1);
```

- [ ] **Step 3: Implement one typed aggregation registry**

Restrict `ResultGrain` to:

```ts
export type ResultGrain = "player" | "franchise" | "team_season" | "position" | "season";
export type CustodyScope = "rostered" | "started";
```

In `explore-query.ts`, define additive metrics once:

```ts
const ADDITIVE = [
  "affl_points", "bench_points", "xfp", "fpoe", "custody_par", "epa",
  "air_yards", "yac", "rush_att", "rush_yds", "rush_td", "targets",
  "receptions", "rec_yds", "rec_td", "pass_att", "pass_cmp", "pass_yds",
  "pass_td", "pass_int", "weeks_rostered", "weeks_started",
] as const;
```

Use these explicit group keys:

```ts
const GROUP_KEYS: Record<ResultGrain, readonly string[]> = {
  player: ["player_key"],
  franchise: ["franchise_id"],
  team_season: ["season", "franchise_id"],
  position: ["position"],
  season: ["season"],
};
```

Compute `wopr`, `target_share`, and `air_yards_share` as `weeks_rostered`-weighted means rather than inheriting the first row. Filter by `scope` before grouping, sort the full result, and slice only when assigning `visibleRows`.

- [ ] **Step 4: Replace the component's inline `any` aggregation**

Load `mart_affl_explore_player_season.json`, call `runExploreQuery`, pass `visibleRows` to table/chart, and pass `allRows` to CSV/JSON export. CSV string values must escape embedded quotes using `value.replaceAll('"', '""')`, and both export handlers must call `URL.revokeObjectURL(url)` after the click.

- [ ] **Step 5: Remove unsupported controls and presets**

Remove NFL-team, week, game, and play from `GRAINS`; remove `ever` from `ExploreSentence`. Remove or rewrite presets that claim play-level/explosive-play/red-zone behavior not present in the supported metrics. Keep only presets whose expected row set is asserted in `explore-query.test.ts`.

- [ ] **Step 6: Verify and commit Explore**

```bash
npm test -- src/lib/explore-query.test.ts
npm run lint
npm run typecheck
git add pipeline/build_marts.py src/lib/explore-query.ts src/lib/explore-query.test.ts src/app/explore/page.tsx src/lib/types.ts src/lib/constants.ts src/components/ExploreSentence.tsx src/components/ExploreFilters.tsx src/components/ExploreTable.tsx
git commit -m "fix: make explore scopes and grains truthful"
```

---

### Task 5: Generate Historical Summaries and Records

**Files:**
- Create: `src/lib/server-marts.ts`
- Create: `tests/test_history_marts.py`
- Modify: `pipeline/build_marts.py`
- Modify: `src/app/page.tsx`
- Modify: `src/app/seasons/page.tsx`
- Modify: `src/app/records/page.tsx`

**Interfaces:**
- Consumes: corrected franchise-season, matchup, custody, and draft marts
- Produces: `mart_affl_season_summary.json`, `mart_affl_record_book.json`, and `readMartJson<T>(filename) -> Promise<T>`

- [ ] **Step 1: Write history-mart contract tests**

Create `tests/test_history_marts.py` and assert:

```python
assert summaries["season"].nunique() == 12
assert summaries.groupby("season")["is_champion"].sum().eq(1).all()
assert records_by_id["team_points_season"]["value"] == franchise_seasons["points_for"].max()
assert records_by_id["player_points_season"]["value"] == custody["affl_points"].max()
assert records_by_id["custody_par_season"]["value"] == custody["custody_par"].max()
```

Also assert the single-game record and largest margin directly against `v_matchup`.

- [ ] **Step 2: Generate only records supported by source data**

Generate these IDs: `team_points_season`, `best_regular_record`, `team_points_game`, `largest_margin`, `player_points_season`, `custody_par_season`, and `draft_par_season`. Each record must include `id`, `title`, `value`, `season`, `holder`, `context`, and `source_mart`. Remove any current record category that cannot be derived exactly.

Generate season summary rows from `final_rank` with champion and runner-up data. Abort generation unless every completed season has exactly one `is_champion == 1` row.

- [ ] **Step 3: Read small marts at static-build time**

Create `src/lib/server-marts.ts`:

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function readMartJson<T>(filename: string): Promise<T> {
  const fullPath = path.join(process.cwd(), "public", "data", "marts", filename);
  return JSON.parse(await readFile(fullPath, "utf8")) as T;
}
```

- [ ] **Step 4: Remove factual literals from history pages**

Make the homepage timeline, season archive, and record book read generated rows. Page components may retain labels and formatting, but no champion, runner-up, score, points total, record holder, or season result may remain as a literal in TSX.

- [ ] **Step 5: Verify and commit history generation**

```bash
uv run pytest tests/test_history_marts.py tests/test_data_integrity.py -q
npm run typecheck
npm run build
git add pipeline/build_marts.py tests/test_history_marts.py src/lib/server-marts.ts src/app/page.tsx src/app/seasons/page.tsx src/app/records/page.tsx
git commit -m "fix: derive AFFL history from canonical marts"
```

---

### Task 6: Complete Player Routing, Discovery, Payloads, and Chronology

**Files:**
- Create: `src/lib/players.ts`
- Create: `src/lib/players.test.ts`
- Create: `public/data/marts/players/` generated payloads
- Modify: `pipeline/build_marts.py`
- Modify: `src/app/players/[gsis_id]/page.tsx`
- Modify: `src/app/players/[gsis_id]/PlayerClientContent.tsx`
- Modify: `src/app/players/page.tsx`
- Modify: `src/components/CommandPalette.tsx`
- Modify: `scripts/verify-static-export.mjs`

**Interfaces:**
- Consumes: custody, draft, gamelog, `dim_player`, and `dim_player_bio` records
- Produces: `PlayerIndexEntry[]`, one stable `slug` per player, and `players/{slug}.json` profile payloads

- [ ] **Step 1: Define and test the player index contract**

Use this interface:

```ts
export interface PlayerIndexEntry {
  slug: string;
  gsis_id: string | null;
  espn_player_id: string | null;
  player_name: string;
  position: string;
  college: string | null;
  headshot_url: string;
  franchise_ids: string[];
  franchise_names: string[];
  seasons: number[];
  total_points: number;
  total_xfp: number;
  total_fpoe: number;
  total_par: number;
  total_started: number;
}
```

Use GSIS ID as the preferred slug, then `espn-<espn_player_id>`, then `legacy-<player_id>`. Never use a mutable display name as the canonical slug.

- [ ] **Step 2: Add chronology and pagination tests**

```ts
expect(sortGameLogs([
  { season: 2024, week: 1 },
  { season: 2023, week: 2 },
  { season: 2023, week: 1 },
])).toEqual([
  { season: 2023, week: 1 },
  { season: 2023, week: 2 },
  { season: 2024, week: 1 },
]);

expect(filterPlayers(index, "oregon").some((p) => p.college === "Oregon")).toBe(true);
expect(paginatePlayers(index, 60, 60)).toEqual(index.slice(0, 120));
```

- [ ] **Step 3: Generate the index and per-player payloads**

Build the index from the union of custody, draft, and gamelog identities. Each `players/{slug}.json` file must contain its index record, custody rows, and gamelogs sorted by `(season, week)`. Fail generation on duplicate slugs or any linked record that cannot resolve to an index entry.

- [ ] **Step 4: Generate every static player route**

Change `generateStaticParams()` to read `mart_affl_player_index.json` and return all entries:

```ts
return index.map(({ slug }) => ({ gsis_id: slug }));
```

Remove the 500-item slice and silent single-player fallback. A missing index should fail the build with the filename in the error.

- [ ] **Step 5: Use the index for directory and command search**

The directory must filter the full index, render the first 60 matches, and expose a “Load 60 more” action until all matches are visible. The command palette must search the full compact index; remove the 300-entry cap. Keep the college-search copy because the index now joins `dim_player_bio.college`.

- [ ] **Step 6: Load only the selected player's payload**

Rename the detail prop to `playerSlug` and fetch `players/${encodeURIComponent(playerSlug)}.json`. Remove full custody and full gamelog downloads from the detail page. Sort using `sortGameLogs`, not `reverse()`.

- [ ] **Step 7: Build and verify all routes**

```bash
npm test -- src/lib/players.test.ts
npm run build
npm run verify:export
git add pipeline/build_marts.py src/lib/players.ts src/lib/players.test.ts src/app/players/'[gsis_id]'/page.tsx src/app/players/'[gsis_id]'/PlayerClientContent.tsx src/app/players/page.tsx src/components/CommandPalette.tsx scripts/verify-static-export.mjs public/data/marts
git commit -m "fix: export and discover every AFFL player"
```

Review the generated-data diff before committing. Row-count or identity changes must be explainable by Tasks 2–3.

---

### Task 7: Preserve Draft Picks and Restore Stable Caching

**Files:**
- Create: `src/lib/draft-board.ts`
- Create: `src/lib/draft-board.test.ts`
- Create: `src/lib/api.test.ts`
- Modify: `src/components/DraftBoardGrid.tsx`
- Modify: `src/lib/api.ts`
- Modify: `pipeline/build_marts.py`

**Interfaces:**
- Consumes: `DraftPickRecord[]` and per-file manifest hashes
- Produces: `Map<string, DraftPickRecord[]>` and memoized `fetchMartJson<T>(filename) -> Promise<T>`

- [ ] **Step 1: Write the duplicate-cell draft test**

```ts
const cells = groupDraftPicks([
  { franchise_id: "FRAN_DCMC", round: 1, pick_overall: 1 },
  { franchise_id: "FRAN_DCMC", round: 1, pick_overall: 7 },
] as DraftPickRecord[]);

expect(cells.get("FRAN_DCMC_1")?.map((p) => p.pick_overall)).toEqual([1, 7]);
```

- [ ] **Step 2: Render every pick in a cell**

Implement `groupDraftPicks` with `Map<string, DraftPickRecord[]>`, append every pick, and sort each array by `pick_overall`. Render a compact card for every item and key each card by `pick_overall`; clicking a card must open that exact record.

- [ ] **Step 3: Write stable-cache tests**

Mock `fetch` and assert that two calls for the same filename and manifest hash make one mart request. Change the mock hash and assert that the requested URL changes from `?v=oldhash` to `?v=newhash`.

- [ ] **Step 4: Implement manifest-addressed fetches**

Use a module-level promise cache:

```ts
const jsonCache = new Map<string, Promise<unknown>>();

export async function fetchMartJson<T>(filename: string): Promise<T> {
  const manifest = await fetchManifest({ cache: "no-cache" });
  const hash = manifest.files[filename]?.md5;
  if (!hash) throw new Error(`Manifest entry missing for ${filename}`);
  const key = `${filename}:${hash}`;
  if (!jsonCache.has(key)) {
    const url = getAssetUrl(`/data/marts/${filename}?v=${hash}`);
    jsonCache.set(key, fetch(url, { cache: "force-cache" }).then(assertJsonResponse));
  }
  return jsonCache.get(key) as Promise<T>;
}
```

Export a test-only cache reset function or reset modules between Vitest cases. Remove `Date.now()` and `no-store` from mart requests.

- [ ] **Step 5: Verify and commit draft/cache fixes**

```bash
npm test -- src/lib/draft-board.test.ts src/lib/api.test.ts
npm run lint
npm run typecheck
git add src/lib/draft-board.ts src/lib/draft-board.test.ts src/components/DraftBoardGrid.tsx src/lib/api.ts src/lib/api.test.ts pipeline/build_marts.py
git commit -m "fix: preserve draft cells and cache versioned marts"
```

---

### Task 8: Close Security, CI, and Release Gates

**Files:**
- Modify: `tests/test_security_audit.py`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Modify: `pipeline/README.md`
- Modify: `public/data/marts/manifest.json` and regenerated marts

**Interfaces:**
- Consumes: all corrected sources and generated artifacts from Tasks 1–7
- Produces: a deployment that cannot upload unless code, data, routes, and security checks pass

- [ ] **Step 1: Prove the security test currently misses its own failure**

Temporarily create a forbidden token fixture under a temporary copy of `src`, run the test against that root, and confirm the old broad `except Exception` reports a false pass. Do not place a credential-like token in a tracked source file.

- [ ] **Step 2: Remove the broad catch**

Use direct text reading for shipped source directories:

```python
for file_path in files_to_scan:
    content = file_path.read_text(encoding="utf-8", errors="ignore")
    for token in forbidden_tokens:
        assert token not in content, f"Forbidden credential token found in {file_path.relative_to(ROOT_DIR)}"
```

Exclude only known binary extensions and generated build directories. Add a test fixture that proves a match raises `AssertionError`.

- [ ] **Step 3: Regenerate production marts once**

```bash
uv run python -m pipeline.source_contract data/affl.db
uv run python -m pipeline.build_marts
```

Inspect the diff for:

- zero duplicate franchise-season keys;
- zero self-head-to-head pairs;
- exactly one champion for each 2014–2025 season;
- receiving air-yards/YAC totals reconciled to raw weekly receiving columns;
- a manifest entry and file hash for every published artifact;
- one player index row, payload, and route per stable slug.

- [ ] **Step 4: Make deployment depend on the full gate**

Either make the Pages `build` job depend on the CI workflow or insert these steps before artifact upload:

```bash
npm ci
npm run check
uv sync --frozen
uv run pytest -q -p no:cacheprovider
NEXT_PUBLIC_BASE_PATH=/affl-savant npm run build
npm run verify:export
```

The artifact upload must not use `if: always()`.

- [ ] **Step 5: Run the final release verification**

```bash
npm ci
npm run check
uv sync --frozen
uv run pytest -q -p no:cacheprovider
NEXT_PUBLIC_BASE_PATH=/affl-savant npm run build
npm run verify:export
git status --short
```

Expected: every command exits zero. `git status --short` contains only the intended source, test, lockfile, and regenerated-mart changes—no `.next`, `out`, `*.tsbuildinfo`, `*.db-shm`, `*.db-wal`, or unrelated design edits.

- [ ] **Step 6: Commit the verified release gate**

```bash
git add tests/test_security_audit.py .github/workflows/ci.yml .github/workflows/deploy.yml pipeline/README.md public/data/marts
git commit -m "fix: gate AFFL releases on code and data integrity"
```

---

## Deferred Work That Must Not Be Misrepresented as Complete

These items are valid follow-on projects, not part of the correctness release:

1. Re-enable NFL-team, week, game, and play Explore grains through DuckDB WASM only after each grain has a documented Parquet contract and golden-result tests.
2. Define “ever rostered” with the league commissioner. If it means full NFL production for anyone ever held by a franchise, build a qualification set separately from custody-time aggregation.
3. Statistically calibrate xFP against historical non-PPR outcomes. The current coefficient model can be internally consistent without being a validated predictive model; label it accordingly.
4. Design approved marks/colors for the four separated alumni franchises. Neutral fallbacks are preferable to merging their history into active owners.
5. Build a reproducible upstream importer for the legacy warehouse as a separate migration project. Do not revive the incomplete prefixed schema inside this remediation.

## Final Definition of Done

- The production source contract is explicit and validated before every mart build.
- Durable owners are unique; no franchise competes against itself.
- Receiving opportunity fields, xFP inputs, and calculator outputs agree across Python, TypeScript, raw data, and public marts.
- Every visible Explore control changes the query as described; unsupported controls are absent.
- Every historical champion and record is generated from canonical data.
- Every indexed player is searchable and has a valid static route and small profile payload.
- Every draft pick is rendered.
- Mart caching uses stable content versions instead of timestamps.
- Lint, TypeScript, Vitest, pytest, static build, security audit, and route verification all pass noninteractively.
- The final commit contains no unrelated user edits or transient database/build files.
