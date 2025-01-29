import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../entities/user.entity'
import { UserModelService } from './user.model.service'

/**
 * Module for handling User model-related operations in the database layer.
 * @description
 * The UserModelModule provides core database functionality for user management:
 * 
 * Key Features:
 * - MongoDB schema and model configuration via Mongoose
 * - User entity database operations through UserModelService
 * - Centralized user data access layer
 * - Database connection management
 * - Schema validation and type safety
 * 
 * Architecture:
 * - Imports MongooseModule for database connectivity
 * - Configures User schema and model
 * - Provides UserModelService for CRUD operations
 * - Exports database configuration for reuse
 * 
 * Use Cases:
 * - User registration and profile management
 * - Authentication and authorization
 * - User data persistence and retrieval
 * - Account management workflows
 * 
 * @example
 * ```typescript
 * // Import in AppModule
 * @Module({
 *   imports: [UserModelModule],
 * })
 * export class AppModule {}
 * 
 * // Inject service in other modules
 * constructor(private userModelService: UserModelService) {}
 * ```
 * @compodoc
 * @category Modules
 * @subcategory Database
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ 
      name: User.name, 
      schema: UserSchema 
    }])
  ],
  controllers: [],
  providers: [
    UserModelService
  ],
  exports: [
    UserModelService,
    MongooseModule.forFeature([{
      name: User.name, 
      schema: UserSchema 
    }])
  ]
})
export class UserModelModule {}
