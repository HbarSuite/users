import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@hsuite/nestjs-swagger'
import { Document } from 'mongoose'
import { User as UserNamespace } from '@hsuite/users-types'

/**
 * Type representing a User document in MongoDB.
 * @description
 * Combines the User entity with Mongoose Document type to provide:
 * - MongoDB document functionality
 * - User entity properties and methods
 * - Database persistence capabilities
 * - Mongoose lifecycle hooks
 * 
 * @example
 * ```typescript
 * // Create a new user document
 * const userDoc: UserDocument = new User();
 * await userDoc.save();
 * ```
 * @compodoc
 * @category Types
 * @subcategory Documents
 */
export type UserDocument = User & Document;

/**
 * User entity class representing a complete user in the system.
 * @extends {UserNamespace.Safe}
 * @description
 * The User entity provides:
 * - Complete user data model including sensitive fields
 * - MongoDB schema definition and validation
 * - API documentation via Swagger decorators
 * - Data persistence through Mongoose
 * 
 * Key Features:
 * - Extends UserSafe for public properties
 * - Adds secure password storage
 * - Automatic timestamps
 * - Pre-save validation
 * - Collection management
 * 
 * Use Cases:
 * - User registration
 * - Authentication
 * - Profile management
 * - User data storage
 * 
 * @example
 * ```typescript
 * // Create and save a new user
 * const user = new User();
 * user.email = "user@example.com";
 * user.username = "johndoe";
 * user.password = await hashPassword("securepass123");
 * await user.save();
 * ```
 * @compodoc
 * @category Entities
 * @subcategory User
 */
@Schema({
  validateBeforeSave: true,
  timestamps: true,
  collection: 'auth_users'
})
export class User extends UserNamespace.Safe {
  /**
   * Hashed password for user authentication.
   * @type {string}
   * @description
   * Stores the user's password in a secure hashed format:
   * - Uses bcrypt hashing algorithm
   * - Never stores plain text passwords
   * - Required for authentication
   * - Validated before save
   * 
   * Security Features:
   * - One-way hashing
   * - Salt rounds configuration
   * - Timing attack protection
   * 
   * @example
   * ```typescript
   * user.password = await bcrypt.hash("mypassword", 10);
   * // Stores: "$2b$10$..."
   * ```
   */
  @Prop({ 
    required: true, 
    type: String 
  })
  @ApiProperty({
    type: String,
    description: 'Hashed password for user authentication',
    required: true,
    example: '$2b$10$...'
  })
  password: string
}

/**
 * Mongoose schema definition for the User entity.
 * @description
 * Provides the database schema configuration:
 * - Field definitions and types
 * - Validation rules
 * - Indexes
 * - Virtuals
 * - Methods
 * - Middleware hooks
 * 
 * Features:
 * - Type safety
 * - Data validation
 * - Query building
 * - Lifecycle hooks
 * - Custom methods
 * 
 * @example
 * ```typescript
 * // Using the schema to create a model
 * const UserModel = mongoose.model('User', UserSchema);
 * 
 * // Adding an index
 * UserSchema.index({ email: 1 }, { unique: true });
 * ```
 * @compodoc
 * @category Schemas
 * @subcategory MongoDB
 */
export const UserSchema = SchemaFactory.createForClass(User);