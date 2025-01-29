# @hsuite/users

A comprehensive user management library for HbarSuite applications that provides robust user authentication, profile management, and security features.

## Features

- **User Management**
  - User registration and account creation
  - Profile lookup and search functionality
  - Account deletion and management
  - Email verification system

- **Authentication & Security**
  - Secure password management with hashing
  - Two-factor authentication (2FA) support
  - Email verification workflows
  - Password update and recovery processes

- **Data Management**
  - MongoDB integration with Mongoose
  - Type-safe data models
  - Automatic timestamps
  - Collection management

## Installation

```bash
npm install @hsuite/users
```

## Usage

### Module Setup

Import the UsersModule in your application:

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from '@hsuite/users';

@Module({
  imports: [UsersModule]
})
export class AppModule {}
```

### Basic Usage Examples

1. **User Creation**
```typescript
constructor(private usersService: UsersService) {}

async createUser() {
  const user = await this.usersService.create({
    email: 'user@example.com',
    password: 'securepass123',
    username: 'johndoe'
  });
}
```

2. **Finding Users**
```typescript
// Find by ID
const user = await this.usersService.findById('507f1f77bcf86cd799439011');

// Find by credentials
const user = await this.usersService.find({
  email: 'user@example.com',
  password: 'userpass123'
});
```

3. **Security Management**
```typescript
// Update password
await this.usersService.updatePassword(
  'user@example.com',
  'newSecurePass123'
);

// Configure 2FA
await this.usersService.updateTwoFactorAuth('userId', {
  enabled: true,
  secret: 'TOTP_SECRET_KEY',
  verified: false
});
```

## API Reference

### UsersService

Core service providing user management functionality:

- `create(user: User): Promise<UserDocument>`
- `findById(userId: string): Promise<UserDocument>`
- `find(credentials: IAuth.ICredentials.IWeb2.IDto.ILogin): Promise<UserDocument>`
- `updateTwoFactorAuth(userId: string, twoFactorAuth: IAuth.ITwoFactor.IAuth): Promise<UserDocument>`
- `updatePassword(userEmail: string, newPassword: string): Promise<UserDocument>`
- `emailConfirmation(userId: string): Promise<UserDocument>`
- `delete(user: IAuth.ICredentials.IWeb2.IDto.ISignup): Promise<UserDocument>`

### User Entity

The User entity extends `UserNamespace.Safe` and includes:

- Required fields:
  - `password`: Hashed password string
  - Additional fields inherited from UserNamespace.Safe

- Features:
  - Mongoose schema integration
  - Automatic timestamps
  - Pre-save validation
  - Collection management

## Architecture

The library is structured into several key components:

- **UsersModule**: Main module that orchestrates all user-related functionality
- **UsersService**: Core business logic implementation
- **UserModelModule**: Database operations and schema management
- **User Entity**: Data model and validation rules

## Database

The library uses MongoDB through Mongoose with the following configuration:

- Collection name: `auth_users`
- Schema features:
  - Pre-save validation
  - Automatic timestamps
  - Secure password hashing
  - Type-safe fields

## Security

Built-in security features include:

- Secure password hashing using bcrypt
- Two-factor authentication support
- Email verification system
- Timing attack protection
- One-way password hashing

## Dependencies

- @nestjs/common
- @nestjs/mongoose
- mongoose
- @hsuite/auth-types
- @hsuite/users-types
- @hsuite/nestjs-swagger

## License

[License information not found in source code]

<p align="center">
  Built with ❤️ by the HbarSuite Team<br>
  Copyright © 2024 HbarSuite. All rights reserved.
</p>