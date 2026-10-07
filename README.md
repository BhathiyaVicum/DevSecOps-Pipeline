# 🎟️ DevSecOps Event Ticket Booking Platform

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20RDS%20%7C%20ECR-FF9900?logo=amazonaws&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)
![SonarCloud](https://img.shields.io/badge/SonarCloud-SAST-F3702A?logo=sonarcloud&logoColor=white)
![Trivy](https://img.shields.io/badge/Trivy-Security%20Scanning-1904DA?logo=aquasecurity&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?logo=cloudflare&logoColor=white)

## 📖 Overview

This project demonstrates a **full-stack event ticket booking platform** deployed through a real-world **DevSecOps workflow**.

The application allows users to browse events, select seats, create accounts, authenticate with JWT, and book tickets. Admin users can create and manage events and their seat inventory.

The application is containerized with Docker and deployed to **AWS EC2**, with **PostgreSQL on AWS RDS** and images stored in **AWS ECR**.

The delivery pipeline uses **GitHub Actions**, **SonarCloud**, **Trivy**, **GitHub OIDC**, and **AWS Systems Manager**. Production traffic is exposed through **Cloudflare Tunnel**, while the EC2 instance has no inbound HTTP/HTTPS access.


---

# 🏗️ Architecture

---

# 🛠️ Tech Stack

## Application
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router, Zustand, Axios |
| Backend | Node.js 20, Express, PostgreSQL (`pg`), JWT, bcrypt |
| Database | PostgreSQL 16 (AWS RDS) |
| Container | Docker, multi-stage builds, Nginx (frontend runtime) |

### Infrastructure

| Concern | Tool |
|---|---|
| Compute | AWS EC2 (Amazon Linux 2, t3.micro) |
| Database | AWS RDS PostgreSQL (db.t3.micro, private subnet) |
| Image registry | AWS ECR (immutable tags) |
| Ingress | Cloudflare Tunnel + Cloudflare Edge (DNS, WAF, TLS) |
| Secrets | `.env` on EC2 (chmod 600); GitHub Actions secrets |
| AWS auth from CI | GitHub OIDC → IAM role (no static keys) |
| Remote deploy | AWS SSM Run Command (no SSH keys in CI) |

### CI/CD & Security

| Stage | Tool | Purpose |
|---|---|---|
| SAST | SonarCloud | Static code analysis with enforced quality gate |
| SCA | Trivy fs | Vulnerable dependencies, secrets, misconfig |
| Image scan | Trivy image | OS + library CVEs in built images |
| Build | Docker Buildx | Multi-stage backend & frontend images |
| Registry | AWS ECR | Immutable SHA-tagged images |
| Deploy | AWS SSM | Remote command execution on EC2 |
| Auth | GitHub OIDC | Keyless AWS access from Actions |

---

# Application

The application is an event ticket booking platform with separate user and admin functionality.

## User Features

- Browse available events.
- View event details.
- View the event seat map.
- Select one or more available seats.
- Register an account.
- Log in using email and password.
- Book seats.
- View previous bookings.

## Admin Features

- Create events.
- Automatically generate seats for new events.
- Update events.
- Delete events.
- Manage event inventory.

---

# 🧑‍💻 How the Project Was Built

The implementation started with the application itself and then moved through local testing, containerization, AWS infrastructure, secure ingress, and finally automated CI/CD.

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

- React + Vite + TailwindCSS for the frontend.
- Node.js + Express for the backend.
- PostgreSQL for persistent data.
- JWT for authentication.
- Docker for the local database and later application containers.

The GitHub Actions workflow and security configuration were added later as the deployment pipeline was developed.

---

## 2. Building the Backend

The backend started with the Express application entry point.

`server.js`:

- Creates the Express server.
- Enables CORS.
- Enables JSON request parsing.
- Exposes `/api/health`.
- Mounts authentication, event, and booking routes.

The API was organized into separate areas:

```text
/api/auth
/api/events
/api/bookings
```

### Database connection

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

- `requireAuth` — verifies the JWT from the `Authorization: Bearer` header.
- `requireAdmin` — checks whether the authenticated user's role is `admin`.

Passwords are hashed with bcrypt before being stored.

### Event routes

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
```

---

## 4. Building the Frontend

<img width="1916" height="963" alt="ss2" src="https://github.com/user-attachments/assets/415f1db3-da7d-463c-93ec-72b37689172f" />

The frontend was built as a React single-page application.

### API layer

`api.js` creates a single Axios instance with:

```text
baseURL: /api
```

An Axios interceptor reads the JWT from `localStorage` and adds:

```text
Authorization: Bearer <token>
```

to authenticated requests.

### Authentication state

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

- `Events.jsx` — event listing.
- `EventDetail.jsx` — event details and seat selection.
- `Login.jsx` — authentication.
- `Register.jsx` — account registration.
- `MyBookings.jsx` — booking history.
- `Admin.jsx` — event management.

The Vite development proxy forwards `/api` requests to:

```text
http://localhost:3000
```

---

## 5. Local Development and Testing

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

## Backend Docker image

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

The Alpine package update is also important because it applies available security updates to OS packages that could otherwise be detected by Trivy.

## Frontend Docker image

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

- Serves the React application.
- Provides SPA fallback through `index.html`.
- Proxies `/api/` to the backend container.
- Forwards standard request headers.

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

## 6. Creating RDS PostgreSQL

<img width="1900" height="321" alt="ss17" src="https://github.com/user-attachments/assets/ade54456-f032-40b4-8927-675e3568308f" />

The production database was moved from the local Docker PostgreSQL container to AWS RDS.

Configuration:

- PostgreSQL 16.
- `db.t3.micro`.
- 20 GB gp3 storage.
- Public access disabled.
- Default VPC.
- Encryption enabled.
- 7-day backup retention.
- Database name: `booking`.
- Security group: `booking-rds-sg`.

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

## 7. Creating the EC2 IAM Role

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

## 8. Creating ECR Repositories

Two private ECR repositories were created:

```text
booking-backend
booking-frontend
```

Repository settings include:

- Tag immutability enabled.
- Scan on push enabled.

The registry is:

```text
<account-id>.dkr.ecr.us-east-1.amazonaws.com
```

The initial deployment used `v1` tags while the automated pipeline later moved to commit-based tags.

---

## 9. Launching EC2

The application runtime was created using:

- Amazon Linux 2.
- `t3.micro`.
- Default VPC.
- IAM instance profile: `booking-ec2-role`.
- Security group: `booking-ec2-sg`.

Temporary inbound access was used during the initial deployment:

```text
SSH 22  → testing IP
HTTP 80 → testing IP
```

HTTP was later removed after Cloudflare Tunnel was configured.

---

## 10. Preparing EC2

Docker was installed and enabled:

```bash
sudo amazon-linux-extras install docker -y
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
```

Docker Compose was then installed through the Docker CLI plugin.

AWS access was verified with:

```bash
aws sts get-caller-identity
```

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

## 11. Pushing the First Images to ECR

Before CI/CD was automated, the Docker images were pushed manually to validate the AWS deployment path.

```bash
docker tag booking-backend:latest <ECR>/booking-backend:v1
docker push <ECR>/booking-backend:v1

docker tag booking-frontend:latest <ECR>/booking-frontend:v1
docker push <ECR>/booking-frontend:v1
```

Both images appeared in ECR with the `v1` tag.

---

## 12. Deploying the Application to EC2

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

## 13. Adding Cloudflare Tunnel

The next step was to avoid exposing the application directly through the EC2 public IP.

`cloudflared` was installed on EC2 and authenticated with the Cloudflare account.

A tunnel was created:

```bash
cloudflared tunnel create booking-app
```

The tunnel was configured to send the domain to:

```text
http://localhost:80
```

The configuration follows this pattern:

```yaml
tunnel: <uuid>
credentials-file: /home/ec2-user/.cloudflared/<uuid>.json

ingress:
  - hostname: <domain>
    service: http://localhost:80
  - service: http_status:404
```

The DNS route was created with:

```bash
cloudflared tunnel route dns booking-app <domain>
```

The tunnel was first tested in the foreground and then installed as a systemd service.

The service was enabled with:

```bash
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

The tunnel was verified as healthy in Cloudflare.

---

## 14. Closing the Public HTTP Port

Once the tunnel was working, the temporary EC2 HTTP rule was removed.

The result became:

```text
Direct EC2 HTTP
      ↓
   Blocked

Domain
   ↓
Cloudflare
   ↓
Cloudflare Tunnel
   ↓
EC2
   ↓
Nginx
```

Testing confirmed:

```text
http://<ec2-public-ip>  → timeout
https://<domain>        → application
```

This became the final ingress model.

---

# 🔐 GitHub Actions and DevSecOps

## 15. Creating the GitHub Repository

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

## 16. GitHub OIDC to AWS

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

## 17. GitHub Repository Secrets

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

## 18. Adding SAST

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

---

# 🛡️ Trivy Security Scanning

## 19. Filesystem Scanning

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

## 20. Container Image Scanning

After each Docker image is built, Trivy scans the image itself.

The scan covers:

- Alpine OS packages.
- Application libraries.
- Known CVEs.

The same HIGH/CRITICAL security gate is applied before the image can be pushed to ECR.

---

## 21. Trivy Exceptions

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

## 22. Building the CI/CD Workflow

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

## 23. Pipeline Jobs

The workflow contains five main jobs.

### SonarCloud

```text
sonar
```

Checks out the source, runs SonarCloud analysis, and waits for the quality gate.

### Trivy filesystem

```text
trivy-fs
```

Scans the repository filesystem for HIGH and CRITICAL vulnerabilities.

### Backend build

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

### Frontend build

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

## 24. Commit-Based Image Tags

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

## 25. Deploying with AWS SSM

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

# 🚦 Deployment Flow

For a successful push to `main`:

```text
Feature Branch
      │
      ▼
Pull Request
      │
      ├── SonarCloud
      ├── Trivy FS
      ├── Backend Build + Image Scan
      └── Frontend Build + Image Scan
      │
      ▼
All Checks Pass
      │
      ▼
Merge to main
      │
      ▼
Build SHA-tagged Images
      │
      ▼
Push Images to ECR
      │
      ▼
AWS SSM
      │
      ▼
EC2
      │
      ▼
Docker Compose
      │
      ▼
Cloudflare Tunnel
      │
      ▼
Users
```

---

# 🌿 Branch Protection

The `main` branch is protected with:

- Pull request required before merging.
- `sonar` check required.
- `trivy-fs` check required.
- `build-backend` check required.
- `build-frontend` check required.
- Branch must be up to date before merging.
- Bypassing the protection disabled.

The resulting development flow is:

```text
Feature Branch
      ↓
Pull Request
      ↓
Security + Build Checks
      ↓
All Checks Pass
      ↓
Merge
      ↓
Automated Deployment
```

---

# 🔄 Rollback

Images remain available in ECR using their immutable commit-based tags:

```text
sha-a1b2c3d
sha-d4e5f6g
sha-h7i8j9k
```

A previous version can therefore be redeployed without rebuilding the application.

```text
Previous SHA
     ↓
Update TAG
     ↓
docker compose pull
     ↓
docker compose up -d
```

This provides a simple deployment history and rollback mechanism.

---

# 🧪 Local Development

## Prerequisites

- Node.js 20+
- Docker
- Docker Compose

## Start PostgreSQL

```bash
docker compose up -d
```

## Start the backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend:

```text
http://localhost:3000
```

## Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The Vite development proxy forwards:

```text
/api → http://localhost:3000
```

---

# 🧪 Testing

The application was tested for:

- API health.
- User registration.
- User login.
- JWT authentication.
- Admin authorization.
- Event creation.
- Automatic seat generation.
- Seat booking.
- Booking history.
- Double-booking protection.
- Docker image builds.
- EC2 deployment.
- RDS connectivity.
- Cloudflare Tunnel access.

Health check:

```text
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "db": "ok"
}
```

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

- Pulling private images from ECR.
- Receiving SSM commands.

## GitHub Actions Role

```text
github-actions-deploy
```

Used for:

- ECR authentication and image push.
- SSM deployment commands.
- Checking SSM command status.

The trust policy restricts role assumption to the project repository through GitHub OIDC.

---

# 🛡️ Security Model

The final deployment includes multiple security layers:

```text
                    Internet
                       │
                       ▼
                Cloudflare Edge
             DNS · TLS · WAF · DDoS
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
                 Private VPC
                       │
                       ▼
                 PostgreSQL RDS
```

Additional controls include:

- Private ECR repositories.
- Immutable ECR tags.
- RDS public access disabled.
- RDS access restricted to EC2 security group.
- Non-root backend container.
- Production secrets excluded from Git.
- GitHub OIDC instead of static AWS credentials.
- AWS SSM instead of SSH-based CI deployment.
- SonarCloud quality gate.
- Trivy filesystem scanning.
- Trivy container image scanning.
- Protected `main` branch.
- Commit-based deployment traceability.

---

# 📌 Key DevSecOps Concepts Demonstrated

This project demonstrates practical use of:

- Full-stack application development.
- REST API design.
- JWT authentication.
- Role-based authorization.
- Database transactions.
- Race-condition protection.
- Docker multi-stage builds.
- Production container hardening.
- Nginx reverse proxy.
- AWS EC2.
- AWS RDS.
- AWS ECR.
- AWS IAM.
- AWS Security Groups.
- AWS Systems Manager.
- GitHub Actions.
- GitHub OIDC.
- SAST.
- SCA.
- Container vulnerability scanning.
- Quality gates.
- Immutable container tags.
- Commit-based deployments.
- Branch protection.
- Cloudflare Tunnel.
- Zero-trust-style origin access.
- Deployment traceability.
- Rollback using previous images.

---

# ✅ Final Result

The completed platform provides an automated path from application source code to production:

```text
Application Development
        ↓
Local Testing
        ↓
Docker Images
        ↓
AWS Infrastructure
        ↓
Cloudflare Tunnel
        ↓
GitHub Actions
        ↓
SonarCloud + Trivy
        ↓
ECR
        ↓
AWS SSM
        ↓
EC2
        ↓
RDS
        ↓
Production
```

Every production image is associated with a specific Git commit. Security checks run before deployment, AWS authentication uses OIDC, deployment uses SSM instead of SSH, and the EC2 origin is not directly exposed through inbound HTTP/HTTPS.

The project therefore demonstrates the complete path from **building the application** to **securely deploying and continuously updating it**.
