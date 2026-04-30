# Page Reference

This document explains what each frontend page in RiskApp is used for and how it fits into the ERM and PPM workflows.

## Access Model

- `/login` is the only public page.
- All other pages require authentication.
- Routes under `/ppm/*` are restricted to the `PPM` workspace.
- `/dashboard` is workspace-sensitive:
  - `ERM` users see the risk dashboard.
  - `PPM` users see the portfolio dashboard.

## Shared Pages

### `/login`

Purpose:
Authenticate the user and route them into the application.

What this page does:
- Presents the sign-in form.
- Returns authenticated users to their intended destination or `/dashboard`.
- Prevents already signed-in users from staying on the login page.

### `/dashboard`

Purpose:
Serve as the landing page after login.

What this page does:
- Sends `ERM` users to the risk dashboard view.
- Sends `PPM` users to the portfolio dashboard view.

## ERM Pages

### `/dashboard` for ERM users

Page:
Risk Dashboard

Purpose:
Give risk managers an aggregate view of enterprise risk exposure.

What this page does:
- Displays dashboard controls and filters.
- Shows inherent or residual risk matrices.
- Summarizes risks by category and department.
- Lets users click matrix cells to filter the risk list.
- Links users into the risk register and new-risk flow.

### `/risks`

Page:
Risk Register

Purpose:
Act as the main working list of risk records.

What this page does:
- Lists risks in a searchable, filterable, paginated table.
- Filters by risk metadata such as ID, title, owner, category, and status.
- Opens a drawer to create a new risk.
- Routes the user to the selected risk detail page after creation.

### `/risks/:riskId`

Page:
Risk Detail

Purpose:
Manage a single risk record and its treatment history.

What this page does:
- Shows core risk metadata and current scoring.
- Displays inherent and residual assessment history.
- Displays mitigation actions and their status.
- Uses drawers to add or edit mitigations.
- Uses drawers to add or edit assessments.

## PPM Pages

### `/dashboard` for PPM users

Page:
Portfolio Dashboard

Purpose:
Provide an executive summary of the portfolio intake and delivery pipeline.

What this page does:
- Summarizes submitted, future, and current portfolio items.
- Shows visual status breakdowns across the portfolio.
- Provides owner and strategic-priority drilldowns.
- Surfaces both annual operational initiatives and major projects.
- Links users into project and initiative detail pages.

### `/ppm/submit`

Page:
Submit Project

Purpose:
Capture a new project proposal before review.

What this page does:
- Collects proposal details such as summary, scope, sponsors, staffing, cost, timeline, and alignment.
- Lets the submitter align the proposal to an annual operational initiative.
- Sends the proposal into the submission review queue.

### `/ppm/review`

Page:
Submission Review

Purpose:
Act as the intake queue for portfolio manager review.

What this page does:
- Lists submitted proposals waiting for review.
- Shows proposal status, submission date, sponsorship, and estimated cost.
- Opens the detailed review page for a selected proposal.

### `/ppm/review/:projectId`

Page:
Proposal Review

Purpose:
Support a structured decision on a submitted proposal.

What this page does:
- Shows the full proposal package, including summary, resources, milestones, and attachments.
- Captures review notes.
- Lets the reviewer assign current project classification where needed.
- Supports decisions such as approve, hold, deny, or send back for more detail.
- Routes the proposal into current work, future work, or back to the review queue depending on the decision.

### `/ppm/future`

Page:
Future Projects

Purpose:
Manage projects that are approved for later or parked outside the active portfolio.

What this page does:
- Shows future-pipeline projects as working cards.
- Lets portfolio managers update review notes.
- Lets portfolio managers set or revise current project classification.
- Supports moving future items into current work, hold, or denied states.
- Shows an archive table for historical proposals.

### `/ppm/current`

Page:
Current Projects

Purpose:
Track active approved projects.

What this page does:
- Lists active projects in the current portfolio.
- Separates major projects from operational projects.
- Shows sponsor, owner, cost, timing, category, and alignment details.
- Links each project into its detail page.

### `/ppm/register`

Page:
Portfolio Register

Purpose:
Provide a consolidated register of portfolio delivery items.

What this page does:
- Splits the register into annual operational initiatives and major projects.
- Shows delivery indicators, lifecycle stage, and strategic alignment.
- Gives a single browseable inventory across core PPM records.
- Links users into initiative and project detail pages.

### `/ppm/projects/:projectId`

Page:
Project Detail

Purpose:
Manage an active major project record in depth.

What this page does:
- Shows the project summary, governance details, delivery status, and supporting notes.
- Maintains weekly updates and review notes.
- Maintains milestones through editable drawer workflows.
- Displays linked ERM risks and cost-tracking data.
- Maintains related project artifacts such as documents and team context.
- Supports PowerPoint export of project reporting content.

### `/ppm/strategic-priorities`

Page:
Strategic Priorities

Purpose:
Show the currently active strategic priority period and its priorities.

What this page does:
- Displays the active period label, approval date, and applicable years.
- Lists the priority items used for alignment.
- Provides navigation into the period register and create-period flow.
- Serves as the strategic alignment anchor for downstream initiatives and projects.

### `/ppm/strategic-priorities/register`

Page:
Strategic Priority Period Register

Purpose:
Maintain visibility into current and historical strategic priority periods.

What this page does:
- Lists strategic priority periods in a register.
- Shows applicable years, approval date, and priority counts.
- Expands rows to inspect the priorities defined within each period.

### `/ppm/strategic-priorities/new`

Page:
Create Strategic Priority Period

Purpose:
Create a new strategic priority period and define its priorities.

What this page does:
- Captures the period label and year range.
- Lets the user add multiple strategic priority items.
- Saves the new period and returns to the strategic priorities view.

### `/ppm/operational-initiatives`

Page:
Annual Operational Initiatives

Purpose:
Show the current-year initiatives that translate strategy into delivery work.

What this page does:
- Displays annual operational initiatives for the active strategic priority period.
- Groups initiatives by strategic priority.
- Links each initiative into its detail page.
- Provides entry points to the initiative register and create-initiative flow.

### `/ppm/operational-initiatives/register`

Page:
Operational Initiative Register

Purpose:
Provide the historical and cross-period register for annual operational initiatives.

What this page does:
- Lists initiative sets in register form.
- Expands rows to show the initiatives contained within a year or grouping.
- Links users into initiative detail pages for deeper review.

### `/ppm/operational-initiatives/new`

Page:
Create Annual Operational Initiative

Purpose:
Create a new annual operational initiative under a strategic priority.

What this page does:
- Captures initiative title, year, description, and strategic-priority alignment.
- Saves the initiative into the current PPM data set.
- Returns the user to the annual operational initiatives view.

### `/ppm/operational-initiatives/:initiativeId`

Page:
Operational Initiative Detail

Purpose:
Manage a single annual operational initiative and its rolled-up delivery picture.

What this page does:
- Shows initiative summary, ownership, and status context.
- Maintains monthly progress updates.
- Maintains milestones through drawer-based editing.
- Displays linked ERM risks and cost tracking.
- Rolls up linked major projects beneath the initiative.
- Supports slide-style export for initiative reporting.

## Recommended Audience

- Business users can use this document as a quick navigation guide.
- Product owners can use it as a lightweight inventory of current screens.
- Developers can use it as a route-to-purpose reference when extending the frontend.
