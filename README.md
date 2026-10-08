# 🎟️ DevSecOps Event Ticket Booking Platform

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20ECR-FF9900?logo=amazonaws\&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?logo=githubactions\&logoColor=white)
![SonarCloud](https://img.shields.io/badge/SonarCloud-SAST-F3702A?logo=sonarcloud\&logoColor=white)
![Trivy](https://img.shields.io/badge/Trivy-Security%20Scanning-1904DA?logo=aquasecurity\&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?logo=cloudflare\&logoColor=white)

---

## 📖 Overview

This project demonstrates a **full-stack event ticket booking platform** deployed through a real-world **DevSecOps workflow**.

The application allows users to browse events, select seats, create accounts, authenticate with JWT, and book tickets. Admin users can create and manage events and their seat inventory.

The application is containerized with Docker and deployed to **AWS EC2**, with **PostgreSQL on AWS RDS** and images stored in **AWS ECR**.

The delivery pipeline uses **GitHub Actions**, **SonarCloud**, **Trivy**, **GitHub OIDC**, and **AWS Systems Manager**. Production traffic is exposed through **Cloudflare Tunnel**, while the EC2 instance has no inbound HTTP/HTTPS access.

---

# 🏗️ Architecture

## 1. CI/CD Architecture

<img width="1983" height="793" alt="CI/CD Pipeline Architecture Diagram" src="https://github.com/user-attachments/assets/048f5aeb-d1e3-4367-9853-3f0a3fe2038d" />

## 2. Application Architecture

<img width="390" height="506" alt="Zero Trust Cloud Architecture Diagram" src="https://github.com/user-attachments/assets/c7d0012a-56c3-46ec-b247-a2ed3308aab0" />

---

# 🛠️ Tech Stack

## Application

| Layer     | Technology                                                |
| --------- | --------------------------------------------------------- |
| Frontend  | React 18, Vite, TailwindCSS, React Router, Zustand, Axios |
| Backend   | Node.js 20, Express, PostgreSQL (`pg`), JWT, bcrypt       |
| Database  | PostgreSQL 16 (AWS RDS)                                   |
| Container | Docker, multi-stage builds, Nginx (frontend runtime)      |

### Infrastructure

| Concern          | Tool                                              |
| ---------------- | ------------------------------------------------- |
| Compute          | AWS EC2                                           |
| Database         | AWS RDS PostgreSQL                                |
| Image registry   | AWS ECR (immutable tags)                          |
| Ingress          | Cloudflare Tunnel + Cloudflare Edge (DNS, TLS)    |
| Secrets          | `.env` on EC2 (chmod 600); GitHub Actions secrets |
| AWS auth from CI | GitHub OIDC → IAM role (no static keys)           |
| Remote deploy    | AWS SSM Run Command (no SSH keys in CI)           |

### CI/CD & Security

| Stage      | Tool          | Purpose                                         |
| ---------- | ------------- | ----------------------------------------------- |
| SAST       | SonarCloud    | Static code analysis with enforced quality gate |
| SCA        | Trivy fs      | Vulnerable dependencies, secrets, misconfig     |
| Image scan | Trivy image   | OS + library CVEs in built images               |
| Build      | Docker Buildx | Multi-stage backend & frontend images           |
| Registry   | AWS ECR       | Immutable SHA-tagged images                     |
| Deploy     | AWS SSM       | Remote command execution on EC2                 |
| Auth       | GitHub OIDC   | Keyless AWS access from Actions                 |

---

# 🧑‍💻 How the Project Was Built

The implementation started with the application itself and then moved through local testing, containerization, AWS infrastructure, secure ingress, and finally automated CI/CD.

---

## 1. Planning the Application

The initial goal was a full-stack ticket booking application suitable for demonstrating practical DevSecOps concepts.

The main application flow was:

```text
User
 │
 ├── Browse Events
 ├── Select Seats
 ├── Register / Login
 └── Book Tickets

Admin
 │
 ├── Create Events
 ├── Update Events
 └── Delete Events
```

The initial technology choices were:

* React + Vite + TailwindCSS for the frontend.
* Node.js + Express for the backend.
* PostgreSQL for persistent data.
* JWT for authentication.
* Docker for the local database and later application containers.

The GitHub Actions workflow and security configuration were added later as the deployment pipeline was developed.

---

## 2. Building the Backend

The backend started with the Express application entry point.

### `server.js`

* Creates the Express server.
* Enables CORS.
* Enables JSON request parsing.
* Exposes `/api/health`.
* Mounts authentication, event, and booking routes.

The API was organized into separate areas:

```text
/api/auth
/api/events
/api/bookings
```

### Database Connection

`db.js` creates a PostgreSQL connection pool using `DATABASE_URL`.

The application creates four main tables:

```text
users
events
seats
bookings
```

### Authentication

`middleware/auth.js` provides:

* `requireAuth` — verifies the JWT from the `Authorization: Bearer` header.
* `requireAdmin` — checks whether the authenticated user's role is `admin`.

Passwords are hashed with bcrypt before being stored.

### Event Routes

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

---

## 3. Building the Frontend

<img width="1918" height="967" alt="ss20" src="https://github.com/user-attachments/assets/f6f979bb-6ea9-4da5-bc3a-d64c0e047cfe" />
<img width="1917" height="967" alt="ss19" src="https://github.com/user-attachments/assets/4355b13b-6a65-491e-973c-2d38c5420581" />

The frontend was built as a React single-page application.

### API Layer

`api.js` creates a single Axios instance with:

```text
baseURL: /api
```

An Axios interceptor reads the JWT from `localStorage` and adds:

```text
Authorization: Bearer <token>
```

to authenticated requests.

### Authentication State

`auth.js` contains small helpers for:

```text
getUser()
saveAuth()
logout()
```

Authentication information is stored in `localStorage`.

### Routing

React Router handles:

```text
/                    → Events
/events/:id          → Event details
/login               → Login
/register            → Registration
/my-bookings         → User bookings
/admin               → Admin dashboard
```

`Layout.jsx` provides the main navigation and conditionally displays user and admin links.

### Pages

The main pages are:

* `Events.jsx` — event listing.
* `EventDetail.jsx` — event details and seat selection.
* `Login.jsx` — authentication.
* `Register.jsx` — account registration.
* `MyBookings.jsx` — booking history.
* `Admin.jsx` — event management.

The Vite development proxy forwards `/api` requests to:

```text
http://localhost:3000
```

---

## 4. Local Development and Testing

PostgreSQL was first run locally using Docker Compose.

```bash
docker compose up -d
```

The backend was started with:

```bash
cd backend
npm install
npm run seed
npm run dev
```

The frontend was started separately:

```bash
cd frontend
npm install
npm run dev
```

The health endpoint returns:

```json
{
  "status": "ok",
  "db": "ok"
}
```

Once these flows were working locally, the application was ready for containerization.

---

# 🐳 Containerizing the Application

Two separate Docker images were created:

```text
booking-backend
booking-frontend
```

## Backend Docker Image

The backend uses a multi-stage Docker build.

The build process:

1. Starts from `node:20-alpine`.
2. Updates Alpine packages.
3. Installs dependencies with:

```bash
npm ci --omit=dev
```

4. Copies the backend source.
5. Creates a non-root `app` user.
6. Runs the application as that user.
7. Starts with:

```bash
node src/server.js
```

Running only production dependencies keeps development-only packages out of the runtime image.

The Alpine package update also applies available security updates to OS packages that could otherwise be detected by Trivy.

## Frontend Docker Image

The frontend also uses a multi-stage build.

The build stage:

```bash
npm ci
npm run build
```

produces:

```text
dist/
```

The final image uses `nginx:alpine` to serve the compiled React application.

This keeps Node.js out of the frontend runtime container.

## Nginx

The custom Nginx configuration:

* Serves the React application.
* Provides SPA fallback through `index.html`.
* Proxies `/api/` to the backend container.
* Forwards standard request headers.

The container network therefore looks like:

```text
Browser
   │
   ▼
Nginx :80
   │
   └── /api/* ──▶ Express :3000
```

Both images were built and tested locally before moving to AWS.

---

# ☁️ AWS Infrastructure

## 5. Creating RDS PostgreSQL

<img width="1900" height="321" alt="Amazon RDS PostgreSQL Configuration" src="https://github.com/user-attachments/assets/ade54456-f032-40b4-8927-675e3568308f" />

The production database was moved from the local Docker PostgreSQL container to AWS RDS.

Configuration:

* PostgreSQL.
* `db.t4g.micro`.
* 20 GB gp3 storage.
* Public access disabled.
* Default VPC.
* Encryption enabled.
* Database name: `booking`.
* Security group: `booking-rds-sg`.

During initial testing, PostgreSQL port `5432` was temporarily allowed from the testing IP.

After EC2 deployment was working, the rule was changed to:

```text
EC2 Security Group
       │
       │ TCP 5432
       ▼
RDS Security Group
```

This means the production database is not open to the public internet.

---

## 6. Creating the EC2 IAM Role

EC2 needs two main capabilities:

1. Pull Docker images from ECR.
2. Receive commands through AWS Systems Manager.

The instance role:

```text
booking-ec2-role
```

uses:

```text
AmazonEC2ContainerRegistryReadOnly
AmazonSSMManagedInstanceCore
```

This avoids storing static AWS access keys on the EC2 instance.

---

## 7. Creating ECR Repositories

Two private ECR repositories were created:

<img width="1908" height="397" alt="Amazon ECR Repositories" src="https://github.com/user-attachments/assets/e735c37d-6208-47f6-9907-3d55bdbf357a" />

```text
booking-backend
booking-frontend
```

Repository settings include:

* Tag immutability enabled.
* Scan on push enabled.

The registry is:

```text
<account-id>.dkr.ecr.us-east-1.amazonaws.com
```

The initial deployment used `v1` tags while the automated pipeline later moved to commit-based tags.

---

## 8. Launching EC2

The application runtime was created using:

* Amazon Linux 2023.
* Default VPC.
* IAM instance profile: `booking-ec2-role`.

Temporary inbound access was used during the initial deployment:

```text
SSH 22  → testing IP
HTTP 80 → testing IP
```

HTTP was later removed after Cloudflare Tunnel was configured.

---

## 9. Preparing EC2

Docker was installed and enabled:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
```

Docker Compose was then installed through the Docker Compose CLI/plugin setup used for the instance.

The EC2 instance returned the IAM role identity.

ECR access was verified with:

```bash
aws ecr describe-repositories --region us-east-1
```

The instance could then authenticate to ECR:

```bash
aws ecr get-login-password --region us-east-1 \
| docker login --username AWS --password-stdin \
<account>.dkr.ecr.us-east-1.amazonaws.com
```

---

## 10. Pushing the First Images to ECR

Before CI/CD was automated, the Docker images were pushed manually to validate the AWS deployment path.

```bash
docker tag booking-backend:latest <ECR>/booking-backend:v1
docker push <ECR>/booking-backend:v1

docker tag booking-frontend:latest <ECR>/booking-frontend:v1
docker push <ECR>/booking-frontend:v1
```

Both images appeared in ECR with the `v1` tag.

---

## 11. Deploying the Application to EC2

An application directory was created:

```text
/home/ec2-user/app
```

The production environment file contains values similar to:

```env
ECR=<account>.dkr.ecr.us-east-1.amazonaws.com
TAG=v1
DATABASE_URL=postgres://booking:<password>@<rds-endpoint>:5432/booking
JWT_SECRET=<random-secret>
```

The file was protected with:

```bash
chmod 600 .env
```

Docker Compose was configured with two services:

```text
backend
frontend
```

The backend receives:

```text
DATABASE_URL
JWT_SECRET
PORT=3000
NODE_ENV=production
```

The frontend exposes Nginx on port `80`.

Deployment was initially performed with:

```bash
docker compose pull
docker compose up -d
```

The backend logs confirmed:

<img width="1135" height="403" alt="Backend Logs" src="https://github.com/user-attachments/assets/f2cc170d-9260-48d8-96ba-c55d993773be" />

<img width="1903" height="207" alt="Application Deployment Logs" src="https://github.com/user-attachments/assets/5e2945b1-ef47-4042-8243-09737bb9d26b" />

```text
DB schema ready
Backend on http://localhost:3000
```

The database was seeded:

```bash
docker compose exec backend node src/seed.js
```

The application was then tested through the EC2 public IP.

At this stage:

```text
EC2
 ├── Nginx
 └── Express
       │
       ▼
      RDS
```

was fully working.

---

# ☁️ Cloudflare Tunnel

## 12. Adding Cloudflare Tunnel

The goal of this step was to stop exposing the application directly through the EC2 public IP.

Instead, all traffic would arrive through a **Cloudflare Tunnel** — an outbound-only connection initiated from EC2 to Cloudflare's edge.

This removes the need to expose the application through inbound HTTP/HTTPS ports on the EC2 instance.

### Installing and Authenticating `cloudflared`

`cloudflared` was installed on the EC2 instance from the official RPM release and authenticated with the Cloudflare account:

```bash
cloudflared tunnel login
```

This opened a browser URL to authorize the domain.

After authorization, the Cloudflare credentials were saved to:

```text
~/.cloudflared/cert.pem
```

### Creating the Tunnel

A tunnel named `booking-app` was created:

```bash
cloudflared tunnel create booking-app
```

This generated a tunnel credentials file:

```text
~/.cloudflared/<uuid>.json
```

and displayed the tunnel UUID.

<img width="1903" height="242" alt="Cloudflare Tunnel Creation" src="https://github.com/user-attachments/assets/d7e0a567-a370-4c6b-a8a6-0e18d88e5a81" />

### Configuring the Tunnel

A configuration file was created at:

```text
~/.cloudflared/config.yml
```

The tunnel was configured to forward incoming requests to the local Nginx service running on port `80`:

```yaml
tunnel: <uuid>
credentials-file: /home/ec2-user/.cloudflared/<uuid>.json

ingress:
  - hostname: <domain>
    service: http://localhost:80
  - service: http_status:404
```

<img width="1087" height="276" alt="Cloudflare Tunnel Configuration" src="https://github.com/user-attachments/assets/90aec229-5428-4aba-b8ca-d6c663c461e9" />

### Traffic Flow

The traffic flow was therefore:

```text
User
  │
  ▼
Cloudflare Edge
  │
  │ Cloudflare Tunnel
  ▼
cloudflared
  │
  ▼
Nginx :80
  │
  ▼
Application
```

### Creating the DNS Route

The domain was connected to the tunnel using:

```bash
cloudflared tunnel route dns booking-app <domain>
```

This created a CNAME record in Cloudflare that points the domain to:

```text
<uuid>.cfargotunnel.com
```

As a result, users can access the application through the domain without connecting directly to the EC2 public IP.

### Testing the Tunnel

Before running the tunnel as a background service, it was tested in the foreground:

```bash
cloudflared tunnel run booking-app
```

This was used to confirm that requests were successfully reaching the Nginx service on the EC2 instance.

### Running the Tunnel as a Systemd Service

Once the tunnel was confirmed to be working, it was configured to run automatically as a systemd service.

The configuration and credentials were copied to `/etc/cloudflared/` so that the system service could access them:

```bash
sudo mkdir -p /etc/cloudflared

sudo cp ~/.cloudflared/config.yml /etc/cloudflared/config.yml
sudo cp ~/.cloudflared/<uuid>.json /etc/cloudflared/

sudo chmod 600 /etc/cloudflared/*.json
```

The `credentials-file` path in the configuration was updated to the absolute system path:

```yaml
credentials-file: /etc/cloudflared/<uuid>.json
```

The Cloudflare Tunnel service was then installed, enabled, and started:

```bash
sudo cloudflared service install

sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### Verifying the Service

The service status was checked with:

```bash
sudo systemctl status cloudflared
```

<img width="1412" height="657" alt="Cloudflare Tunnel Systemd Service Status" src="https://github.com/user-attachments/assets/795496f4-bbd5-4d7f-ac63-2d1e526846bf" />

The tunnel was also verified in the **Cloudflare Dashboard → Zero Trust → Networks → Tunnels**.

The tunnel showed a **Healthy** status with **4 active connections**, confirming that the EC2 instance was successfully connected to Cloudflare.

<!-- Add your 4th Cloudflare screenshot here -->

<!-- Recommended screenshot: Cloudflare Dashboard showing the Healthy tunnel and active connections -->

### Enabled Cloudflare Security Features
<img width="1703" height="785" alt="ss11" src="https://github.com/user-attachments/assets/82c74b0d-53a9-44a1-86ad-504a98f812da" />
<img width="1540" height="676" alt="ss10" src="https://github.com/user-attachments/assets/aa97e0bf-a121-4520-b467-c81fc9bbffab" />

---

## 13. Closing the Public HTTP Port

Once the tunnel was working, the temporary EC2 HTTP rule was removed.

The final EC2 security group no longer exposes HTTP/HTTPS directly to the internet.

```text
HTTP 80   → removed
HTTPS 443 → removed
```

Testing confirmed:

```text
http://<ec2-public-ip>  → timeout
https://<domain>        → application
```

This became the final ingress model:

```text
Internet
   │
   ▼
Cloudflare
   │
   ▼
Cloudflare Tunnel
   │
   ▼
EC2
```

The EC2 instance no longer requires inbound HTTP/HTTPS access.

---

# 🔐 GitHub Actions and DevSecOps

## 14. Creating the GitHub Repository

The application source was pushed to a GitHub repository.

The repository contains:

```text
backend/
frontend/
docker-compose.yml
.trivyignore
sonar-project.properties
.github/workflows/pipeline.yml
```

Production `.env` files and secrets are excluded from Git.

---

## 15. GitHub OIDC to AWS

The CI/CD pipeline needs AWS access for ECR and SSM.

Instead of creating permanent AWS access keys, GitHub Actions uses OIDC.

The flow is:

```text
GitHub Actions
      │
      │ OIDC token
      ▼
   AWS IAM
      │
      │ AssumeRole
      ▼
github-actions-deploy
      │
      ├──▶ ECR
      └──▶ SSM
```

The AWS identity provider uses:

```text
token.actions.githubusercontent.com
```

with:

```text
sts.amazonaws.com
```

as the audience.

The role:

```text
github-actions-deploy
```

has a trust policy restricted to the project repository.

This prevents unrelated GitHub repositories from assuming the deployment role.

---

## 16. GitHub Repository Secrets

The required repository secrets are:

```text
AWS_ROLE_ARN
EC2_INSTANCE_ID
ECR_REGISTRY
SONAR_TOKEN
```

No static AWS access key or secret access key is stored in GitHub.

---

# 🔎 SonarCloud

## 17. Adding SAST

SonarCloud was integrated to analyze:

```text
backend/src
frontend/src
```

The repository contains:

```text
sonar-project.properties
```

with the source directories and exclusions for generated/dependency directories.

The quality gate is enforced with:

```text
-Dsonar.qualitygate.wait=true
-Dsonar.qualitygate.timeout=300
```

The pipeline therefore waits for the SonarCloud quality gate instead of simply uploading the analysis and continuing.

A failed quality gate blocks the later build and deployment stages.

<img width="1910" height="862" alt="SonarCloud Analysis Results" src="https://github.com/user-attachments/assets/b7a097fc-dd5e-4579-872a-44de071fda4c" />

---

# 🛡️ Trivy Security Scanning

## 18. Filesystem Scanning

Trivy scans the repository before Docker images are built.

The filesystem scan checks for relevant vulnerabilities in the project and its dependencies.

The configured severity level is:

```text
HIGH
CRITICAL
```

with:

```text
exit-code: 1
ignore-unfixed: true
```

A HIGH or CRITICAL vulnerability with an available fix causes the security job to fail.

---

## 19. Container Image Scanning

After each Docker image is built, Trivy scans the image itself.

The scan covers:

* Alpine OS packages.
* Application libraries.
* Known CVEs.

The same HIGH/CRITICAL security gate is applied before the image can be pushed to ECR.

---

## 20. Trivy Exceptions

A `.trivyignore` file documents specific build-time vulnerabilities originating from npm's bundled dependencies inside the Node base image.

Examples include:

```text
tar
minimatch
glob
sigstore
pacote
```

These packages are part of npm's installation and are not used by the production backend process.

The backend runtime executes:

```bash
node src/server.js
```

rather than running the npm CLI.

OS-level Alpine vulnerabilities are handled differently: the Dockerfiles run:

```dockerfile
RUN apk upgrade --no-cache
```

so available OS security updates are applied during the image build.

The exceptions are documented rather than silently ignored.

---

# ⚙️ GitHub Actions Pipeline

<img width="1442" height="389" alt="GitHub Actions CI/CD Pipeline" src="https://github.com/user-attachments/assets/6db7862a-0ada-4b10-b9e8-1d8db598f1fb" />

## 21. Building the CI/CD Workflow

The workflow was created at:

```text
.github/workflows/pipeline.yml
```

It runs for:

```text
push → main
pull_request → main
workflow_dispatch
```

The workflow permissions include:

```yaml
permissions:
  id-token: write
  contents: read
```

The first permission enables GitHub OIDC authentication to AWS.

---

## 22. Pipeline Jobs

The workflow contains five main jobs.

### SonarCloud

```text
sonar
```

Checks out the source, runs SonarCloud analysis, and waits for the quality gate.

### Trivy Filesystem

```text
trivy-fs
```

Scans the repository filesystem for HIGH and CRITICAL vulnerabilities.

### Backend Build

```text
build-backend
```

The job:

1. Checks out the repository.
2. Generates a short commit SHA.
3. Assumes the AWS role through OIDC.
4. Logs in to ECR.
5. Builds the backend image.
6. Scans the image with Trivy.
7. Pushes the image to ECR on `main`.

### Frontend Build

```text
build-frontend
```

The same process runs for the frontend image.

The backend and frontend builds run in parallel after the initial security jobs pass.

### Deployment

```text
deploy
```

The deployment job runs only after both image builds succeed and only for a push to `main`.

---

## 23. Commit-Based Image Tags

Instead of using only:

```text
latest
```

the pipeline creates tags such as:

```text
sha-a1b2c3d
```

This connects the Docker image to a specific Git commit.

Example:

```text
booking-backend:sha-a1b2c3d
booking-frontend:sha-a1b2c3d
```

ECR tag immutability prevents an existing tag from being overwritten.

This provides deployment traceability and makes rollback easier.

---

## 24. Deploying with AWS SSM

The pipeline does not SSH into EC2.

Instead, GitHub Actions uses SSM to execute the deployment script on the instance.

The deployment process is:

```bash
cd /home/ec2-user/app

aws ecr get-login-password | docker login ...

sed -i "s/^TAG=.*/TAG=sha-<short>/" .env

docker compose pull
docker compose up -d
docker image prune -f
```

The workflow waits for the SSM command result and fails if the command is not successful.

This provides a CI/CD path without storing an SSH private key in GitHub.

---

# 🌿 Branch Protection

The `main` branch is protected with:

* Pull request required before merging.
* `sonar` check required.
* `trivy-fs` check required.
* `build-backend` check required.
* `build-frontend` check required.
* Branch must be up to date before merging.
* Bypassing the protection disabled.

---

# 🔄 Rollback

Images remain available in ECR using their immutable commit-based tags:

```text
sha-a1b2c3d
sha-d4e5f6g
sha-h7i8j9k
```

A previous version can therefore be redeployed without rebuilding the application.

---

# Cloudflare Analytics

<img width="1450" height="791" alt="ss13" src="https://github.com/user-attachments/assets/a5e70136-4ba4-480c-a54b-19eb16c0de93" />
<img width="1807" height="865" alt="ss14" src="https://github.com/user-attachments/assets/2e1d951f-2305-4a19-a5e9-8b61203d529a" />
<img width="1826" height="862" alt="ss15" src="https://github.com/user-attachments/assets/4e880831-1cdf-4aad-a2c7-b9a7af50a7ce" />
<img width="1827" height="866" alt="ss16" src="https://github.com/user-attachments/assets/d4e053d0-956a-4d44-b0e0-10b4bc6e8a82" />


---

# 📁 Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── pipeline.yml
│
├── .trivyignore
├── sonar-project.properties
├── docker-compose.yml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── env.js
│       ├── db.js
│       ├── seed.js
│       ├── middleware/
│       │   └── auth.js
│       └── routes/
│           ├── auth.js
│           ├── events.js
│           └── bookings.js
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── auth.js
        ├── components/
        │   └── Layout.jsx
        └── pages/
            ├── Events.jsx
            ├── EventDetail.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── MyBookings.jsx
            └── Admin.jsx
```

---

# 🔑 Environment Variables

Production configuration is kept on EC2 rather than committed to GitHub.

Example:

```env
ECR=<account>.dkr.ecr.us-east-1.amazonaws.com
TAG=sha-<commit>
DATABASE_URL=postgres://booking:<password>@<rds-endpoint>:5432/booking
JWT_SECRET=<random-secret>
```

The production `.env` file is protected with:

```bash
chmod 600 .env
```

Secrets are injected into the containers through environment variables and are not baked into Docker images.

---

# 🔐 IAM

## EC2 Role

```text
booking-ec2-role
```

Policies:

```text
AmazonEC2ContainerRegistryReadOnly
AmazonSSMManagedInstanceCore
```

Used for:

* Pulling private images from ECR.
* Receiving SSM commands.

## GitHub Actions Role

```text
github-actions-deploy
```

Used for:

* ECR authentication and image push.
* SSM deployment commands.
* Checking SSM command status.

The trust policy restricts role assumption to the project repository through GitHub OIDC.

---

# 🛡️ Security Model

The final deployment includes multiple security layers:

```text
                     Internet
                         │
                         ▼
                  Cloudflare Edge
                 DNS · TLS · DDoS
                         │
                         ▼
                Cloudflare Tunnel
                         │
                    Outbound only
                         │
                         ▼
                        EC2
                 No inbound HTTP/HTTPS
                         │
                         ▼
                       Nginx
                         │
                         ▼
                      Express
                         │
                         ▼
                    Private VPC
                         │
                         ▼
                   PostgreSQL RDS
```

The final architecture provides:

* **Cloudflare Edge** for public DNS, TLS, and traffic protection.
* **Cloudflare Tunnel** for outbound-only connectivity from EC2.
* **No inbound HTTP/HTTPS ports** exposed on EC2.
* **Nginx** as the frontend web server and reverse proxy.
* **Express** for backend API services.
* **RDS PostgreSQL** isolated from public internet access.
* **AWS IAM roles** instead of static credentials.
* **GitHub OIDC** for keyless AWS authentication.
* **AWS SSM** instead of SSH-based CI/CD deployment.
* **SonarCloud** for static code analysis.
* **Trivy** for dependency and container vulnerability scanning.
* **Immutable ECR image tags** for deployment traceability and rollback.
