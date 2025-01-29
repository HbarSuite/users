import { Injectable } from '@nestjs/common'
import { UserModelService } from './models/user.model.service'
import { User, UserDocument } from './entities/user.entity'
import { IAuth } from '@hsuite/auth-types';

/**
 * Service responsible for high-level user management operations.
 * @description
 * The UsersService provides a business logic layer for user management by wrapping
 * the UserModelService. It handles all core user operations including:
 * 
 * Key Features:
 * - User registration and account creation
 * - Profile lookup and search
 * - Two-factor authentication management  
 * - Password updates and security
 * - Email verification
 * - Account deletion
 * 
 * Architecture:
 * - Wraps UserModelService for database operations
 * - Provides clean interfaces for controllers
 * - Handles error management and validation
 * - Maintains separation of concerns
 * 
 * Use Cases:
 * - User registration flows
 * - Authentication and authorization
 * - Profile management
 * - Security settings configuration
 * - Account recovery processes
 * 
 * @example
 * ```typescript
 * // Inject in controller
 * constructor(private usersService: UsersService) {}
 * 
 * // Register new user
 * const user = await this.usersService.create({
 *   email: 'user@example.com',
 *   password: 'securepass123',
 *   username: 'johndoe'
 * });
 * 
 * // Find user by ID
 * const foundUser = await this.usersService.findById('user123');
 * 
 * // Update password
 * await this.usersService.updatePassword(
 *   'user@example.com',
 *   'newPassword123'
 * );
 * ```
 * @see {@link UserModelService} For underlying database operations
 * @see {@link User} For user entity structure
 * @compodoc
 * @category Services
 * @subcategory Users
 */
@Injectable()
export class UsersService {
    constructor(
        private userModelService: UserModelService
    ) {}

    /**
     * Creates a new user account.
     * @description
     * Handles the creation of a new user account by:
     * - Validating user input data
     * - Delegating to UserModelService for persistence
     * - Managing error scenarios
     * - Returning the created user document
     * 
     * @param user - Complete user data for account creation
     * @returns Promise resolving to the newly created UserDocument
     * @throws Error if validation fails or database operation errors
     * @example
     * ```typescript
     * const newUser = await usersService.create({
     *   email: 'user@example.com',
     *   password: 'securepass123',
     *   username: 'johndoe'
     * });
     * ```
     * @compodoc
     */
    async create(user: User): Promise<UserDocument> {
        return new Promise(async(resolve, reject) => {
          try {
            let userDocument = await this.userModelService.create(user);
            resolve(userDocument);
          } catch(error) {
            reject(error);
          }
        });
      }

    /**
     * Retrieves a user by their unique identifier.
     * @description
     * Looks up a user in the database using their MongoDB _id:
     * - Validates ID format
     * - Performs database lookup
     * - Handles not found scenarios
     * - Returns complete user profile
     * 
     * @param userId - MongoDB _id of the target user
     * @returns Promise resolving to the found UserDocument
     * @throws Error if user not found or invalid ID
     * @example
     * ```typescript
     * const user = await usersService.findById('507f1f77bcf86cd799439011');
     * console.log(user.email);
     * ```
     * @compodoc
     */
    async findById(userId: string): Promise<UserDocument> {
        return new Promise(async (resolve, reject) => {
          try {
            let userDocument = await this.userModelService.findById(userId);
            resolve(userDocument);
          } catch (error) {
            reject(error);
          }
        })
      }
      
    /**
     * Finds a user by their login credentials.
     * @description
     * Searches for a user account using provided login information:
     * - Validates credential format
     * - Performs secure credential matching
     * - Handles authentication failures
     * - Returns matched user profile
     * 
     * @param user - Login credentials containing email and password
     * @returns Promise resolving to the matched UserDocument
     * @throws Error if credentials invalid or user not found
     * @example
     * ```typescript
     * const user = await usersService.find({
     *   email: 'user@example.com',
     *   password: 'userpass123'
     * });
     * ```
     * @compodoc
     */
    async find(user: IAuth.ICredentials.IWeb2.IDto.ILogin): Promise<UserDocument> {
        return new Promise(async (resolve, reject) => {
          try {
            let userDocument = await this.userModelService.find(user);
            resolve(userDocument);
          } catch (error) {
            reject(error);
          }
        })
      }

    /**
     * Updates two-factor authentication settings.
     * @description
     * Manages 2FA configuration for a user account:
     * - Validates 2FA settings
     * - Updates security preferences
     * - Stores authentication secrets
     * - Handles verification status
     * 
     * @param userId - MongoDB _id of the target user
     * @param twoFactorAuth - New 2FA configuration settings
     * @returns Promise resolving to the updated UserDocument
     * @throws Error if update fails or invalid settings
     * @example
     * ```typescript
     * const user = await usersService.updateTwoFactorAuth('user123', {
     *   enabled: true,
     *   secret: 'TOTP_SECRET_KEY',
     *   verified: false
     * });
     * ```
     * @compodoc
     */
    async updateTwoFactorAuth(userId: string, twoFactorAuth: IAuth.ITwoFactor.IAuth): Promise<UserDocument> {
        return new Promise(async (resolve, reject) => {
          try {
            let userDocument = await this.userModelService.updateTwoFactorAuth(
              userId, twoFactorAuth
            );
            
            resolve(userDocument);
          } catch (error) {
            reject(error);
          }
        })
      }

    /**
     * Updates a user's password.
     * @description
     * Securely changes a user's password:
     * - Validates password requirements
     * - Handles password hashing
     * - Updates stored credentials
     * - Manages password history
     * 
     * @param userEmail - Email of the target user
     * @param newPassword - New password to set
     * @returns Promise resolving to the updated UserDocument
     * @throws Error if password invalid or update fails
     * @example
     * ```typescript
     * const user = await usersService.updatePassword(
     *   'user@example.com',
     *   'newSecurePass123'
     * );
     * ```
     * @compodoc
     */
    async updatePassword(userEmail: string, newPassword: string): Promise<UserDocument> {
        return new Promise(async (resolve, reject) => {
          try {
            let userDocument = await this.userModelService.updatePassword(
              userEmail, newPassword
            );
            resolve(userDocument);
          } catch (error) {
            reject(error);
          }
        })
      }

    /**
     * Confirms a user's email address.
     * @description
     * Handles email verification process:
     * - Updates verification status
     * - Records verification timestamp
     * - Manages verification attempts
     * - Triggers post-verification processes
     * 
     * @param userId - MongoDB _id of the user to verify
     * @returns Promise resolving to the updated UserDocument
     * @throws Error if confirmation fails or invalid user
     * @example
     * ```typescript
     * const user = await usersService.emailConfirmation('user123');
     * console.log(user.emailVerified); // true
     * ```
     * @compodoc
     */
    async emailConfirmation(userId: string): Promise<UserDocument> {
        return new Promise(async (resolve, reject) => {
          try {
            let userDocument = await this.userModelService.emailConfirmation(
              userId
            );
            resolve(userDocument);
          } catch (error) {
            reject(error);
          }
        })
      }
    
    /**
     * Permanently deletes a user account.
     * @description
     * Handles complete user account removal:
     * - Validates deletion request
     * - Removes user data
     * - Cleans up related resources
     * - Handles deletion events
     * 
     * @param user - User credentials to confirm deletion
     * @returns Promise resolving to the deleted UserDocument
     * @throws Error if deletion fails or invalid credentials
     * @example
     * ```typescript
     * const deletedUser = await usersService.delete({
     *   email: 'user@example.com',
     *   password: 'userpass123'
     * });
     * ```
     * @compodoc
     */
    async delete(user: IAuth.ICredentials.IWeb2.IDto.ISignup): Promise<UserDocument> {
        return new Promise(async(resolve, reject) => {
          try {
            let userDocument = await this.userModelService.delete(user);
            resolve(userDocument);
          } catch(error) {
            reject(error);
          }
        })
      }
}