# ASCII diagram conventions

Use plain ASCII only — borders `+` `-` `|`, arrows `-->` `<--` `^` `v`, markers `*` `x`. Unicode diagram glyphs render at different widths across terminals, fonts, and locales, so padded boxes and aligned tables can drift.

Suggested shape:

```
+------------------------------------------+
|     Use ASCII diagrams liberally         |
+------------------------------------------+
|                                          |
|   [State A] -------> [State B]           |
|       |                                  |
|       v                                  |
|   [State C]                              |
|                                          |
|   System diagrams, state machines,       |
|   data flows, architecture sketches,     |
|   dependency graphs, comparison tables   |
|                                          |
+------------------------------------------+
```

Good uses: state machines, data flows, request/route flows, architecture sketches, dependency graphs, and side-by-side comparison tables (as in `entry-points.md`).
