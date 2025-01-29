/**
 * Main export file for the Users module.
 * @description
 * This file serves as the main entry point for the Users module, exporting all necessary components
 * for user management functionality. It provides a centralized location to access user-related 
 * features across the application.
 * 
 * @module Users
 * 
 * @exports UsersModule - The main module that provides user management functionality
 * @exports UsersService - Service containing core user business logic and operations
 * @exports User - The user entity class defining the user data structure
 * @exports UserModelService - Service for user data model operations
 * @exports UserModelModule - Module providing user model functionality
 * 
 * @example
 * // Import and use user components
 * import { 
 *   UsersModule,
 *   UsersService,
 *   User,
 *   UserModelService
 * } from '@hsuite/users';
 * 
 * @compodoc
 * @category Core Modules
 * @subcategory Users
 * @group User Management
 * @description Core user management functionality
 */

// Export main users module and service
export * from './users.module';
export * from './users.service';

// Export user entity and related types
export * from './entities/user.entity';

// Export user model components
export * from './models/user.model.service';
export * from './models/user.model.module';
