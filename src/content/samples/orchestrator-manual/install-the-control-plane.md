## Purpose

This task installs the Orchestrator control plane on a single host and brings
it to a running state. At the end of this task, the control plane accepts API
requests and is ready to enroll worker nodes.

Worker enrollment is Task 3.3. High-availability control planes are Task 3.5.
Do not begin either until this task is verified.

**Estimated time:** 25 minutes.

## Prerequisites

Confirm all 8 items before you begin. A missing item found at step 6 requires
the procedure to be started again.

| # | Item | How to confirm |
|---|---|---|
| 1 | Host running RHEL 9.2+, Ubuntu 22.04+, or Debian 12+ | `cat /etc/os-release` |
| 2 | 8 CPU cores, 16 GB RAM, 200 GB free on `/var` | `nproc`, `free -g`, `df -h /var` |
| 3 | Root or full `sudo` privilege | `sudo -v` returns without error |
| 4 | PostgreSQL 15+ reachable, with an empty database | `psql -h <db-host> -U <user> -l` |
| 5 | TLS certificate and private key for the control-plane hostname | Files present and readable |
| 6 | DNS A record for the control-plane hostname resolving to this host | `dig +short <hostname>` |
| 7 | Inbound TCP 8443 open from worker subnets | `ss -lnt` after step 7 |
| 8 | Outbound HTTPS to the package repository | `curl -sI https://repo.orchestrator.io` |

The certificate at item 5 must carry the hostname from item 6 in its subject
alternative name field. A mismatch is not detected until step 8, and it cannot
be corrected without repeating steps 5 through 8.

## Advisory notices for this task

> **WARNING**
>
> Step 6 initializes the database schema and erases all data in the target
> database. Confirm the database is empty before you run step 6. Data erased at
> this step is not recoverable.

> **WARNING**
>
> The private key installed at step 5 grants the identity of the control plane.
> A key readable by other accounts permits impersonation of the control plane
> to every worker node.

> **CAUTION**
>
> Do not start the service before step 7. A service started without a complete
> configuration writes a partial state file, and the procedure must then be
> started again from step 3.

## Procedure

### Install the package

1. Log in to the control-plane host as a user with `sudo` privilege.

2. Add the package repository:

   ```bash
   curl -fsSL https://repo.orchestrator.io/setup.sh | sudo bash
   ```

3. Install the control-plane package:

   ```bash
   sudo apt-get install -y orchestrator-control-plane=4.6.0
   ```

   **NOTE:** On RHEL, use `sudo dnf install -y
   orchestrator-control-plane-4.6.0`. The remaining steps do not differ.

4. Confirm the installed version:

   ```bash
   orchestrator-ctl --version
   ```

   The output reads `orchestrator-ctl 4.6.0`. If the output shows a different
   version, stop and see [FI 7.1](/samples/orchestrator-manual/troubleshooting).

### Install the certificate

> **WARNING**
>
> The private key installed at step 5 grants the identity of the control plane.
> A key readable by other accounts permits impersonation of the control plane
> to every worker node.

5. Copy the certificate and the private key into the configuration directory:

   ```bash
   sudo install -o orchestrator -g orchestrator -m 0644 \
     <cert-path> /etc/orchestrator/tls/server.crt
   sudo install -o orchestrator -g orchestrator -m 0600 \
     <key-path> /etc/orchestrator/tls/server.key
   ```

   The mode on the key is `0600`. Do not widen it. If a later step reports that
   the key is unreadable, correct the owner, not the mode.

### Initialize the database

> **WARNING**
>
> Step 6 erases all data in the target database. Confirm the database is empty
> before you continue. Data erased at this step is not recoverable.

6. Initialize the schema:

   ```bash
   sudo -u orchestrator orchestrator-ctl db init \
     --dsn "postgresql://<user>@<db-host>:5432/<database>"
   ```

   The command prompts for the password and prints the name of the target
   database. Read the printed name before you confirm.

   Expected output ends with `schema initialized: 47 tables`.

### Configure and start

7. Write the configuration file:

   ```bash
   sudo -u orchestrator tee /etc/orchestrator/control-plane.yaml <<'EOF'
   listen: 0.0.0.0:8443
   hostname: <control-plane-hostname>
   tls:
     certificate: /etc/orchestrator/tls/server.crt
     key: /etc/orchestrator/tls/server.key
   database:
     dsn: postgresql://<user>@<db-host>:5432/<database>
   EOF
   ```

   Substitute every value in angle brackets. The `hostname` value must match
   the subject alternative name in the certificate from step 5.

8. Start the service:

   ```bash
   sudo systemctl enable --now orchestrator-control-plane
   ```

9. Wait 30 seconds for the service to complete its first-run checks.

## Verification

Perform all 3 checks. The task is complete only when all 3 pass.

**Check 1: the service is running.**

```bash
systemctl is-active orchestrator-control-plane
```

Expected result: `active`.

**Check 2: the API responds over TLS.**

```bash
curl -sS https://<control-plane-hostname>:8443/healthz
```

Expected result: `{"status":"ok","version":"4.6.0"}`.

A TLS error here means the certificate does not match the hostname. See FI 7.2.

**Check 3: the database is reachable from the service.**

```bash
sudo -u orchestrator orchestrator-ctl status --verbose
```

Expected result: the output contains `database: connected` and
`schema_version: 46`.

## If verification fails

| Check | Symptom | Go to |
|---|---|---|
| 1 | Service reports `failed` | [FI 7.1](/samples/orchestrator-manual/troubleshooting) |
| 2 | TLS handshake error | [FI 7.2](/samples/orchestrator-manual/troubleshooting) |
| 2 | Connection refused or timeout | [FI 7.3](/samples/orchestrator-manual/troubleshooting) |
| 3 | `database: unreachable` | [FI 7.4](/samples/orchestrator-manual/troubleshooting) |
| 3 | `schema_version` below 46 | Repeat step 6 against the same database |

Do not proceed to Task 3.3 while any check fails. A worker enrolled against an
incompletely configured control plane holds a certificate that must be revoked
by hand before the worker can be enrolled again.

## Next

- **Task 3.3** enrolls worker nodes.
- **Task 6.1** configures the scheduled backup. Complete it within 24 hours;
  a control plane without a verified backup has no recovery path.
