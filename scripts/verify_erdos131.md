# Reproduction receipt: Erdős 131 (non-dividing sets)

What the site ran on 2026-08-02 to justify the entry's Lean-verified tier and
its "Reproduced here" badge. Anyone can repeat it; the whole point is that the
claim does not rest on the author's word or on ours.

The claim under test: `F(N) = N^(1/5 + o(1))`, where `F(N)` is the largest
non-dividing subset of `{1,…,N}`. Repository:
<https://github.com/theofilxeff/erdos_131>.

## Commands

```sh
# 1. Toolchain (the repo pins Lean 4.32.0 in lean-toolchain).
#    On Windows use a SHORT base path: mathlib carries dependabot ref names
#    that blow past the 260-character limit inside a deep directory.
elan toolchain install leanprover/lean4:v4.32.0

git clone --depth 1 https://github.com/theofilxeff/erdos_131.git l131
cd l131

# 2. Dependencies and mathlib's prebuilt objects (~7 GB, ~15 min).
lake update -R
lake exe cache get

# 3. Build the development (~5 min with the cache warm).
lake build

# 4. The decisive check: ask Lean what the theorem actually depends on.
printf 'import Nondividing.FinalAssembly\n#print axioms Nondividing.main_log_limit\n' > AxCheck.lean
lake env lean AxCheck.lean
```

On Windows, write `AxCheck.lean` without a BOM (`[System.IO.File]::WriteAllText`),
or Lean rejects the first token.

## Result

`lake build` exits 0. No `sorry`, `admit` or `native_decide` appears anywhere in
the 50 files and 17,408 lines outside `Challenge.lean`, where the `sorry` is the
Comparator statement placeholder by design.

The axiom audit prints exactly:

```
'Nondividing.main_log_limit' depends on axioms: [propext,
 Classical.choice,
 Quot.sound,
 Nondividing.External.blaschke_selection,
 Nondividing.External.cfp_structure,
 Nondividing.External.convexBody_volume_tendsto,
 Nondividing.External.convex_density_set,
 Nondividing.External.discrete_john,
 Nondividing.External.full_rank_lattice_points_le_volume,
 Nondividing.External.rogers_shephard,
 Nondividing.External.zonotope_rounding]
```

Three Lean foundational axioms plus the eight declared external interfaces, and
crucially **no `sorryAx`** - which is what a load-bearing `sorry` anywhere in the
dependency graph would surface as.

Statement fidelity, checked with `#print` against the trusted `Challenge.lean`:

```
Nondividing.NonDividing = fun A => ∀ a ∈ A, ∀ (S : Finset ℕ),
  S.Nonempty → S ⊆ A.erase a → ¬a ∣ ∑ s ∈ S, s
Nondividing.candidates  = fun N => Finset.filter NonDividing (Finset.Icc 1 N).powerset
Nondividing.F           = fun N => (candidates N).sup Finset.card
Nondividing.main_log_limit : Tendsto (fun N => log ↑(F N) / log ↑N) atTop (nhds (1/5))
```

## What this does NOT establish

The eight external interfaces are **assumed**, not proved. Each cites a published
result (Schneider Thm 1.8.6 and 1.8.20, Rogers-Shephard 1957, Betke-Henk-Wills
Prop 2.1, Pham-Zakharov Lemmas 1, 7 and 13, Conlon-Fox-Pham), and reading them
turns up nothing absurd, but none was checked line by line against its source.
The exposure concentrates in `convex_density_set`, whose exponent
`(r-1)/(r+1)+ε` is exactly where the 1/4 to 1/5 improvement comes from: if that
axiom is stronger than what Pham-Zakharov actually prove, the result does not
follow. That is why the entry is a candidate rather than resolved.
