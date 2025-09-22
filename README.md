# Auth API - Hexagonal Architecture

[![NestJS](https://img.shields.io/badge/NestJS-11.x-ea2845?style=flat&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat&logo=docker)](https://www.docker.com/)

A production-ready authentication API built with **NestJS** and **TypeScript**, following **Hexagonal Architecture** principles. This API provides comprehensive authentication features including JWT tokens, two-factor authentication (2FA), email verification, password reset, OAuth integration, and robust security measures.

## 🚀 Quick Start

### Docker (Recommended)
```bash
git clone <repository-url>
cd auth-hex-arch-backend
cp .env.example .env
docker compose up --build
```

### Local Development
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Visit: http://localhost:3000/api/docs

## 🏗️ Architecture

```
src/
├── domain/          # Business entities & interfaces
├── application/     # Use cases & business logic
├── presentation/    # REST controllers & DTOs
└── infrastructure/  # External adapters (DB, email, etc.)
```

## ✨ Features

- **JWT Authentication** - Access & refresh tokens
- **Two-Factor Auth** - TOTP & Email OTP
- **OAuth Integration** - Google OAuth2
- **Email Verification** - Registration confirmation
- **Password Reset** - Secure recovery flow
- **Rate Limiting** - Brute force protection
- **OpenAPI Docs** - Interactive Swagger UI

## 📁 Project Structure

```
src/
├── auth/                          # Authentication module
│   ├── application/               # Use cases (business logic)
│   │   └── use-cases/
│   ├── domain/                    # Entities, value objects, ports
│   │   ├── entities/              # User, Token, Otp, etc.
│   │   ├── value-objects/         # Email, Password, etc.
│   │   ├── ports/                 # Interfaces
│   │   │   ├── inbound/           # Use case interfaces
│   │   │   └── outbound/          # Repository interfaces
│   │   └── exceptions/            # Domain exceptions
│   ├── infrastructure/            # External adapters
│   │   ├── adapters/              # Database, email, etc.
│   │   ├── guards/                # JWT, rate limiting
│   │   └── strategies/            # Passport strategies
│   └── presentation/              # REST API layer
│       ├── controllers/           # HTTP controllers
│       ├── dtos/                  # Request/response DTOs
│       └── mappers/               # DTO ↔ Domain mapping
├── shared/                        # Shared utilities
│   ├── domain/                    # Common entities/VOs
│   └── infrastructure/            # Common adapters
├── app.module.ts                  # Root module
└── main.ts                        # Application bootstrap
```

## 🔧 Requirements

- Node.js 20.x+
- PostgreSQL 15.x (or Docker)
- SMTP credentials for email

## 📋 Environment Setup

```bash
# Copy and configure
cp .env.example .env
```

**Required:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MAIL_*`

**Optional:** See `.env.example` for full configuration

## 🧪 Testing

```bash
npm test           # Unit tests
npm run test:cov   # With coverage
```

## 📚 API Documentation

Interactive docs available at: `http://localhost:3000/api/docs`

How to use Swagger UI
- Click the "Authorize" button on the top-right of the docs UI.
- Paste a Bearer token in the `Bearer <token>` format to authenticate requests.
- The UI is configured to persist authorization between reloads (when supported).

**Main endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

## 📖 Project Documentation

Detailed design notes and learning materials live in the repository `docs/` folder. If you want to understand the architecture choices, conventions, and security guidance, start with the files below or open the `docs/` folder in your editor.

- Hexagonal architecture overview: [docs/hexagonal-architecture.md](docs/hexagonal-architecture.md)
- Good practices: [docs/good-practices/](docs/good-practices/)
	- Entities and VO conventions: [docs/good-practices/entities-and-vo-conventions.md](docs/good-practices/entities-and-vo-conventions.md) (GitHub: http://github.com/Kandriws/nestjs-hexagonal-auth/blob/main/docs/good-practices/entities-and-vo-conventions.md)
	- Security / Login rate limiting: [docs/security/login-rate-limiting.md](docs/security/login-rate-limiting.md)

You can view these files locally from the `docs/` folder or on GitHub by navigating to the same paths in the repository.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Run tests (`npm test`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

Distributed under the **MIT** License. See [LICENSE](LICENSE) for details.

## 👤 Author

**Kewin Caviedes**
- GitHub: [@Kandriws](https://github.com/Kandriws)
- LinkedIn: [kewin-caviedes](https://www.linkedin.com/in/kewin-caviedes/)

---


**Built with ❤️ using NestJS and Hexagonal Architecture**

**Don't forget to follow and star the project!** ⭐
