## How to use this section

Fault isolation modules are organized by **symptom**, not by error message. You
observe a symptom; you do not always have an error message, and when you do it
is often a consequence rather than a cause.

Each module has the same shape:

- **Symptom.** What you observe.
- **Probable causes.** In order of how often each is the cause, not in order of
  severity. Work down the list.
- **Isolation.** The check that distinguishes one cause from the others.
- **Corrective action.** What to do once the cause is known.
- **Escalation boundary.** The point at which further local diagnosis is not
  productive, and what to collect before you contact support.

Work the causes in the order listed. The ordering is derived from support case
volume, so the first cause is the answer more often than the rest combined.

## Symptom index

| Symptom | Module |
|---|---|
| Control-plane service will not start, or exits after starting | FI 7.1 |
| TLS handshake fails when connecting to the control plane | FI 7.2 |
| Connection to port 8443 is refused or times out | FI 7.3 |
| Service is running but reports `database: unreachable` | FI 7.4 |

## FI 7.1: Control plane will not start

**Symptom.** `systemctl is-active orchestrator-control-plane` returns `failed`
or `activating`, and does not reach `active` within 60 seconds.

### Probable causes

1. The configuration file is invalid YAML, or a required key is missing.
2. The TLS private key is not readable by the `orchestrator` account.
3. Port 8443 is held by another process.
4. The database schema version does not match the installed binary.

### Isolation

Read the last 50 lines of the service journal:

```bash
sudo journalctl -u orchestrator-control-plane -n 50 --no-pager
```

Match the message against this table:

| Journal message contains | Cause |
|---|---|
| `yaml: line N` or `missing required key` | Cause 1 |
| `permission denied` and a path under `/etc/orchestrator/tls` | Cause 2 |
| `bind: address already in use` | Cause 3 |
| `schema version mismatch` | Cause 4 |

### Corrective action

**Cause 1.** Validate the configuration without starting the service:

```bash
sudo -u orchestrator orchestrator-ctl config check \
  --file /etc/orchestrator/control-plane.yaml
```

The command names the line and the key. Correct the file, then start the
service.

**Cause 2.** Correct the owner. Do not widen the mode:

```bash
sudo chown orchestrator:orchestrator /etc/orchestrator/tls/server.key
sudo chmod 0600 /etc/orchestrator/tls/server.key
```

**Cause 3.** Identify the process holding the port:

```bash
sudo ss -lntp 'sport = :8443'
```

If the process is a previous Orchestrator instance, stop it. If the process
belongs to another product, change that product's port. Do not change the
Orchestrator port; worker enrolment records the port, and every enrolled worker
must then be re-enrolled.

**Cause 4.** The binary and the schema are from different releases. Confirm
both:

```bash
orchestrator-ctl --version
sudo -u orchestrator orchestrator-ctl db version --dsn "<dsn>"
```

If the schema is older than the binary, run `orchestrator-ctl db migrate`. If
the schema is **newer** than the binary, do not migrate. A downgrade is not
supported, and the correct action is to install the matching binary version.

### Escalation boundary

Escalate if the journal shows no message matching the table above, or if the
configuration passes `config check` and the service still fails.

Collect before you contact support:

```bash
sudo orchestrator-ctl support-bundle --output /tmp/bundle.tar.gz
```

The bundle contains the journal, the configuration with secrets removed, the
schema version, and the package manifest. Attach it to the case.

## FI 7.2: TLS handshake fails

**Symptom.** `curl` to port 8443 returns a certificate error. The service is
`active`.

### Probable causes

1. The hostname used does not appear in the certificate subject alternative
   name field.
2. The issuing certificate authority is not trusted by the calling host.
3. The certificate has expired.
4. The certificate chain is incomplete: the intermediate is not installed.

### Isolation

Read the certificate as presented by the server:

```bash
openssl s_client -connect <hostname>:8443 -servername <hostname> </dev/null \
  2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

Compare the output:

- The hostname you used is absent from `subjectAltName` → cause 1.
- `notAfter` is in the past → cause 3.
- Subject and issuer are identical → the certificate is self-signed, cause 2.
- Otherwise, count the certificates offered:

```bash
openssl s_client -connect <hostname>:8443 -showcerts </dev/null 2>/dev/null \
  | grep -c 'BEGIN CERTIFICATE'
```

A count of 1 with a non-self-signed certificate indicates cause 4.

### Corrective action

**Cause 1.** Reissue the certificate with the correct subject alternative name.
Editing the `hostname` value in the configuration to match the certificate is
not a fix: workers connect by the DNS name, and that name must be in the
certificate.

**Cause 2.** Install the issuing authority's root into the trust store of every
calling host. In a private PKI, this includes every worker node.

**Cause 3.** Replace the certificate, then restart the service. The control
plane reads the certificate at startup and does not reload it on change.

**Cause 4.** Concatenate the intermediate to the server certificate, server
certificate first:

```bash
cat server.crt intermediate.crt \
  | sudo -u orchestrator tee /etc/orchestrator/tls/server.crt > /dev/null
sudo systemctl restart orchestrator-control-plane
```

### Escalation boundary

Escalate if the certificate validates with `openssl verify` against the
intended chain but the handshake still fails. Attach the full `openssl
s_client` output and the certificate chain, excluding the private key.

**Never attach a private key to a support case.** If a private key has been
sent to any third party, treat it as compromised, reissue the certificate, and
re-enrol every worker.

## FI 7.3: Connection refused or times out

**Symptom.** No TLS error. The connection does not establish.

Refused and timed out are different faults and they separate the causes:

| Observation | Meaning |
|---|---|
| Connection **refused**, immediately | The host was reached. Nothing is listening on 8443. |
| Connection **times out** | The packet did not reach a listening socket. A network device is dropping it. |

### Probable causes

1. Refused: the service is not running. Return to FI 7.1.
2. Refused: the service listens on `127.0.0.1` rather than `0.0.0.0`.
3. Timeout: a host firewall is dropping inbound 8443.
4. Timeout: a network firewall or security group between client and host.
5. Timeout: the DNS record resolves to a different host.

### Isolation

Confirm the listen address on the control-plane host:

```bash
sudo ss -lnt 'sport = :8443'
```

`127.0.0.1:8443` indicates cause 2. `0.0.0.0:8443` is correct.

Confirm the name resolves to this host:

```bash
dig +short <hostname>
ip -4 addr show | grep inet
```

An address that does not appear on the host indicates cause 5.

Test from the control-plane host itself:

```bash
curl -sS https://localhost:8443/healthz --insecure
```

Success locally and failure remotely narrows the fault to causes 3 or 4.

### Corrective action

**Cause 2.** Set `listen: 0.0.0.0:8443` in the configuration, then restart the
service.

**Cause 3.** Open the port on the host firewall:

```bash
sudo firewall-cmd --permanent --add-port=8443/tcp && sudo firewall-cmd --reload
```

**Cause 4.** Network firewalls are outside the scope of this manual. Provide
your network team with the source subnets of the worker nodes, the destination
address of the control plane, and TCP port 8443.

**Cause 5.** Correct the DNS record. Do not work around this with a `hosts`
file entry: worker enrolment resolves the name independently on every node, and
an entry that exists only on the administrator's workstation hides the fault
until enrolment fails.

### Escalation boundary

Escalate only after the local `curl --insecure` check succeeds and the fault is
confirmed to be on the path rather than on the host. A connectivity fault
between two network segments is not diagnosable from the support bundle.

## FI 7.4: Database unreachable

**Symptom.** The service is `active` and `/healthz` responds, but
`orchestrator-ctl status --verbose` reports `database: unreachable`.

The control plane starts without its database on purpose, so that a database
outage does not also remove the health endpoint you need to diagnose it.

### Probable causes

1. Credentials in the configuration are wrong or the password has rotated.
2. The database host refuses the connection: `pg_hba.conf` does not permit this
   source address.
3. The database is reachable but the connection limit is exhausted.
4. TLS is required by the database and not configured in the DSN.

### Isolation

Attempt the connection with the same DSN the service uses:

```bash
sudo -u orchestrator psql "<dsn-from-config>" -c 'SELECT 1'
```

| `psql` output contains | Cause |
|---|---|
| `password authentication failed` | Cause 1 |
| `no pg_hba.conf entry for host` | Cause 2 |
| `too many clients already` | Cause 3 |
| `server does not support SSL` or `SSL required` | Cause 4 |

### Corrective action

**Cause 1.** Update the DSN, then restart the service. The control plane reads
the DSN at startup only.

**Cause 2.** Add the control-plane address to `pg_hba.conf` on the database
host and reload PostgreSQL. Use the address the database observes, which
differs from the control plane's own address when NAT is present.

**Cause 3.** Raise `max_connections`, or lower `database.pool_size` in the
control-plane configuration. Confirm which side is exhausting the limit before
you change either; other applications commonly share the instance.

**Cause 4.** Append the required mode to the DSN:

```
postgresql://<user>@<host>:5432/<database>?sslmode=verify-full
```

Use `verify-full` rather than `require`. `require` encrypts the connection
without verifying the server identity, which leaves the connection open to
interception by anything on the path.

### Escalation boundary

Escalate if `psql` connects successfully with the service DSN but the service
still reports `unreachable`. That combination indicates a fault in the service
rather than in the database or the network, and it needs the support bundle.
