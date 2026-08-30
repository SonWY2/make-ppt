# Human editing and feedback

Treat human feedback as structured evidence: capture the target layer (or point/rect), exact note, status, and any direct geometry override. Apply only feedback still pending. Direct user geometry has priority over inferred layout; preserve it until the user changes or resets it. After source review applies feedback, mark the feedback handled and clear only the corresponding persisted override.

`feedback.jsonl` is append-only. Build the actionable set by first collecting every `feedbackIds` named by a later `type: "resolution"` event with `status: "applied"` or `"rejected"`. Events covered by that later resolution are history even if their original record says `status: "pending"`.

Read this actionable set before changing source. A geometry or crop event is actionable only when its final `after` value matches the current override for that layer; an undo/reset leaves its old events as history. A direct layer override wins over inferred layout.

When a reviewed source change deliberately incorporates an override, preserve the resulting source geometry, clear that override from persistent review state, and append one `resolution` event that names the applied feedback IDs. Do not clear unrelated overrides or feedback.

## Editor comment visibility

Edit mode shows only unresolved comments and point annotations by default. `History` reveals resolved annotations as dim markers without returning them to the active queue. `Dismiss` appends a `resolution` event with `status: "rejected"`; it hides the annotation but retains its source location and note in the append-only log.
