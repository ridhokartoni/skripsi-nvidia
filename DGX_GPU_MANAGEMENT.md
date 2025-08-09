# DGX A100 GPU Management – Technical Design

Status: Draft
Owner: Admin Panel / Platform Team
Scope: Backend (skripsi-admin) + Frontend (skripsi-frontend)

## 1. Goals
- Provide administrators with accurate, live visibility into NVIDIA DGX A100 GPUs (inventory and health/usage) without schema changes.
- Lay the groundwork for advanced DGX features: MIG partitioning, NVLink/NVSwitch topology, DCGM health, and GPU sharing policies.
- Keep changes minimal, reversible, and aligned with current stack (Express, Prisma, Next.js, TS).

## 2. Background
This platform manages GPU-enabled containers. On DGX A100 systems, two key capabilities drive utilization and sharing:
- MIG (Multi‑Instance GPU): partitions a single A100 into multiple GPU instances for secure, predictable QoS.
- NVSwitch/NVLink: high‑bandwidth, all‑to‑all GPU interconnect crucial for multi‑GPU jobs.

Authoritative references (read-only, for planning):
- NVIDIA System Management Interface (nvidia-smi): https://docs.nvidia.com/deploy/nvidia-smi
- NVIDIA A100 MIG User Guide: https://docs.nvidia.com/datacenter/tesla/mig-user-guide
- DCGM (Data Center GPU Manager): https://docs.nvidia.com/datacenter/dcgm/latest
- NVSwitch/NVLink topology: https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/nvlink.html

## 3. Design Overview
The GPU Management tab will present two categories of information:
1) Cataloged GPUs (existing DB table GPU: id, name) – editable labels for logical resources (already implemented).
2) Live DGX hardware discovery (read-only) – pulled directly from nvidia-smi on the server.

Phase 1 (implemented):
- Backend endpoint GET /gpu/discover shells out to nvidia-smi and returns structured metrics per GPU.
- Frontend adds a Refresh Live GPUs control and table rendering of the discovery payload.
- No DB or schema changes.

Future phases (proposed):
- MIG layout inspection (GI/CI, profiles, memory slices)
- NVLink/NVSwitch topology matrix for scheduling
- DCGM metric exposure (errors, retired pages, power, thermals)
- Optional GPU sharing via MPS and quota policies

## 4. Backend – API Design (Phase 1)
Base path: /gpu
Auth: Admin only (existing isAuthenticated + role check)

Endpoint: GET /gpu/discover
- Purpose: Live inventory and utilization from nvidia-smi
- Implementation: child_process.exec('nvidia-smi …')
- Response (200):
  {
    data: [
      {
        index: number,
        uuid: string,
        name: string,
        driverVersion: string,
        vbiosVersion: string,
        memoryTotalMB: number,
        memoryUsedMB: number,
        utilizationPercent: number,
        temperatureC: number,
        smClockMHz: number,
        computeMode: string
      }, ...
    ],
    meta: { code: 200, message: 'GPU discovery successful' }
  }
- Errors (500): cmd failed or no GPUs present

Security & Safety:
- Endpoint is read-only; no device state changes.
- Admin authorization enforced.
- maxBuffer set for exec to prevent output overflows.

Operational Assumptions:
- nvidia-smi available on host (DGX OS image or NVIDIA drivers installed)
- Service has permission to execute nvidia-smi

## 5. Frontend – UI/UX (Phase 1)
Location: Admin > GPU Management

Controls:
- Button: “Refresh Live GPUs” – calls GET /gpu/discover
- Existing: “Add GPU” creates DB label entries (unchanged)

Panels:
- Cataloged GPUs grid (from DB) – existing
- Live DGX GPU Inventory (new table) – index, name, UUID, driver, mem used/total, util %, temp, SM MHz, compute mode

State & Error Handling:
- Separate loading states for catalog vs. discovery
- Toasts on fetch failure
- Non-blocking; discovery does not affect DB items

## 6. Data Model
- No changes to prisma schema in Phase 1.
- Longer term: introduce tables for hardware inventory snapshots and MIG topology (optional).

## 7. Deployment & Runtime
- No new services or packages.
- Requires NVIDIA drivers and nvidia-smi on the server.
- Error messaging clarifies when nvidia-smi is unavailable.

## 8. Testing Strategy
- Unit: parse of nvidia-smi CSV lines into typed JSON
- Integration: GET /gpu/discover with admin token returns array on DGX host
- Negative: simulate command failure; verify HTTP 500 and toast on frontend

Manual Verification:
- curl -H "Authorization: Bearer {{ADMIN_JWT}}" {{API_URL}}/gpu/discover
- Frontend Admin > GPU > Refresh Live GPUs shows table

## 9. Future Phases (Design Sketch)
A) MIG Inspection (Read-only)
- Endpoints:
  - GET /gpu/mig/summary → per physical GPU: enabled?, GI/CI counts
  - GET /gpu/mig/instances → list GI/CI with profile and memory slices
- Source: nvidia-smi mig -lgi / -lci and nvidia-smi -L
- UI: Tabs within GPU Management for “MIG” showing instance cards and capacities
- Optional DB: Persist last-seen layout for audit

B) NVLink/NVSwitch Topology
- Endpoint: GET /gpu/topology → parse nvidia-smi topo -m
- UI: adjacency matrix table; tooltip with link bandwidth
- Use cases: placement guidance for multi-GPU containers

C) DCGM Metrics (Health & Reliability)
- Options:
  1) Direct dcgm-smi shell-out (read-only)
  2) dcgm-exporter → Prometheus → summarized API (requires added components)
- Surface: ECC errors, retired pages, throttling, power/thermals
- UI: health badges per GPU with drill-down panel

D) GPU Sharing & Policies
- MPS enablement per host (guard‑railed):
  - start/stop MPS control plane for shared workloads
  - expose per-container CUDA_MPS_PIPE_DIRECTORY vars via backend when enabled
- Quotas: optional scheduler layer for fair-share (outside Phase 1)

## 10. Risks & Mitigations
- nvidia-smi not available → return clear error; keep UI non-blocking
- Exec surface: command injection avoided by using fixed commands (no user input)
- Performance: discovery calls are on-demand via button, not periodic polling
- Privileges: retain admin-only guard

## 11. Rollback
- Remove route GET /gpu/discover and associated service function
- Remove frontend discovery button/table and gpuApi.getDiscovery
- No schema migrations to rollback

## 12. Implementation Summary (Phase 1)
Backend changes:
- src/api/gpu/gpu.services.js → add discoverGpus() using nvidia-smi CSV
- src/api/gpu/gpu.routes.js → add GET /gpu/discover (admin only)

Frontend changes:
- src/lib/api.ts → gpuApi.getDiscovery()
- src/app/admin/gpu/page.tsx → discovery button, loading state, and table

## 13. Acceptance Criteria (Phase 1)
- As an admin, I can click “Refresh Live GPUs” and see a table of DGX GPUs with utilization and memory stats.
- If the host lacks NVIDIA drivers, I see a clear error toast and the rest of the page still works.
- No database migrations are required.

---
Appendix A – Example nvidia-smi commands (read-only)
- Inventory and usage:
  nvidia-smi --query-gpu=index,uuid,name,driver_version,vbios_version,memory.total,memory.used,utilization.gpu,temperature.gpu,clocks.sm,compute_mode --format=csv,noheader,nounits
- MIG instances:
  nvidia-smi -L
  nvidia-smi mig -lgi
  nvidia-smi mig -lci
- Topology matrix:
  nvidia-smi topo -m
- DCGM quick check (if installed):
  dcgm-smi -h

