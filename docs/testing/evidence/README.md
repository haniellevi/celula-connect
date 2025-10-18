# QA Evidence Archive

This directory stores deterministic artifacts captured during manual validation
passes. Follow these conventions when adding files:

- create a subfolder named `YYYY-MM-DD-short-context` for each validation run;
- include a short `README.md` inside the folder summarising what was captured;
- prefer PNG screenshots and attach raw logs when relevant;
- reference the artifacts from the corresponding checklist entry (e.g.,
  `docs/testing/admin-qa-guide.md` or `PLAN/ACOMPANHAMENTO_MIGRACAO.md`).

Files in this directory should be committed together with the checklist update
so reviewers can verify the evidence without external links.
