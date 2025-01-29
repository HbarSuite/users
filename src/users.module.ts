import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserModelModule } from './models/user.model.module'

/**
 * Main module for user management and authentication functionality.
 * @description
 * The UsersModule serves as the central module for all user-related operations:
 * 
 * Key Features:
 * - User registration and profile management
 * - Authentication and authorization flows
 * - Password management and security
 * - User data access and persistence
 * 
 * Architecture:
 * - Integrates UserModelModule for database operations
 * - Provides UsersService for business logic
 * - Centralizes user management functionality
 * - Enables module reuse across application
 * 
 * Dependencies:
 * - UserModelModule: Handles database operations and schema
 * - UsersService: Implements core business logic
 * 
 * Use Cases:
 * - User registration and onboarding
 * - Authentication and login flows
 * - Profile management and updates
 * - User data access control
 * - Account security features
 * 
 * @example
 * ```typescript
 * // Import in AppModule
 * @Module({
 *   imports: [UsersModule]
 * })
 * export class AppModule {}
 * 
 * // Inject service in other modules
 * constructor(private usersService: UsersService) {}
 * ```
 * @compodoc
 * @category Modules
 * @subcategory Users
 */
@Module({
  imports: [
    UserModelModule // Database operations and schema
  ],
  providers: [
    UsersService // Core business logic service
  ],
  exports: [
    UsersService // Enable reuse in other modules
  ],
})
export class UsersModule {}
