import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../entities/user.entity'
import * as bcrypt from 'bcrypt'
import * as moment from 'moment'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { IAuth } from '@hsuite/auth-types';

/**
 * Service responsible for managing user data in the database.
 * @description
 * The UserModelService provides a complete set of database operations for user management:
 * - User creation with password hashing
 * - Password updates with secure hashing
 * - Email confirmation handling
 * - Two-factor authentication configuration
 * - User search and retrieval
 * - User deletion
 * 
 * The service emits events for major operations to enable system-wide reactivity:
 * - users/create: When a new user is created
 * - users/password_updated: When a user's password is changed
 * - users/confirmed: When a user confirms their email
 * - users/2fa: When 2FA settings are modified
 * - users/delete: When a user is deleted
 * 
 * @example
 * ```typescript
 * // Create a new user
 * const user = await userModelService.create({
 *   email: 'user@example.com',
 *   password: 'securepass123',
 *   username: 'johndoe'
 * });
 * 
 * // Find user by email
 * const foundUser = await userModelService.find({
 *   email: 'user@example.com'
 * });
 * 
 * // Update password
 * await userModelService.updatePassword(
 *   'user@example.com',
 *   'newPassword123'
 * );
 * 
 * // Enable 2FA
 * await userModelService.updateTwoFactorAuth(userId, {
 *   enabled: true,
 *   secret: 'TOTP_SECRET'
 * });
 * ```
 * 
 * @see {@link User} For the user entity structure
 * @see {@link UserDocument} For the Mongoose document interface
 * 
 * @publicApi
 * @category Services
 * @subcategory Models
 */
@Injectable()
export class UserModelService {
  protected logger: Logger = new Logger(UserModelService.name);

  /**
   * Creates an instance of UserModelService.
   * @param eventEmitter - EventEmitter2 instance for broadcasting user-related events
   * @param userModel - Mongoose model for User documents
   */
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  /**
   * Gets the underlying Mongoose model for User documents.
   * @returns The Mongoose Model<UserDocument>
   */
  get model(): Model<UserDocument> {
    return this.userModel;
  }

  /**
   * Creates a new user in the database.
   * @description
   * Creates a new user with the following steps:
   * 1. Hashes the provided password using bcrypt
   * 2. Creates a new user document with default role 'user'
   * 3. Saves the document to the database
   * 4. Emits a 'users/create' event
   * 
   * @param user - User signup data containing email, password and username
   * @param toJSON - Whether to return the document as a plain JSON object
   * @returns Promise resolving to the created user document
   * @throws Error if user creation fails
   * 
   * @example
   * ```typescript
   * const newUser = await userModelService.create({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   username: 'johndoe'
   * });
   * ```
   */
  async create(
    user: IAuth.ICredentials.IWeb2.IDto.ISignup, 
    toJSON: boolean = true
    ): Promise<UserDocument> {
    return new Promise(async(resolve, reject) => {
      try {
        let {password, ...newUser} = user;
        password = await bcrypt.hash(user.password, 10);

        let userDocument = new this.userModel({
          ...newUser,
          password,
          role: 'user'
        });

        await userDocument.save();
        this.eventEmitter.emit('users/create', userDocument);

        if(toJSON) {
          resolve(userDocument?.toJSON() as UserDocument);
        } else {
          resolve(userDocument);
        }        
      } catch(error) {
        reject(error);
      }
    });
  }

  /**
   * Updates a user's password.
   * @description
   * Updates the password for a user with the following steps:
   * 1. Finds the user by email
   * 2. Hashes the new password
   * 3. Updates the password and timestamp
   * 4. Emits a 'users/password_updated' event
   * 
   * @param userEmail - Email of the user to update
   * @param newPassword - New password to set
   * @param toJSON - Whether to return the document as a plain JSON object
   * @returns Promise resolving to the updated user document
   * @throws Error if user not found or update fails
   * 
   * @example
   * ```typescript
   * await userModelService.updatePassword(
   *   'user@example.com',
   *   'newSecurePassword123'
   * );
   * ```
   */
  async updatePassword(
    userEmail: string, 
    newPassword: string,
    toJSON: boolean = true
  ): Promise<UserDocument> {
    return new Promise(async(resolve, reject) => {
      try {
        let password = await bcrypt.hash(newPassword, 10);
        let userDocument = await this.find({
          email: userEmail,
          username: null,
          password: null
        }, false);

        userDocument.password = password;
        userDocument.updated_at = moment().unix();

        await userDocument.save();
        this.eventEmitter.emit('users/password_updated', userDocument);

        if(toJSON) {
          resolve(userDocument?.toJSON() as UserDocument);
        } else {
          resolve(userDocument);
        }
      } catch(error) {
        reject(error);
      }
    });
  }

  /**
   * Confirms a user's email address.
   * @description
   * Marks a user's email as confirmed by:
   * 1. Finding the user by ID
   * 2. Setting confirmed flag to true
   * 3. Saving the change
   * 4. Emitting a 'users/confirmed' event
   * 
   * @param userId - MongoDB _id of the user to confirm
   * @returns Promise resolving to the updated user document
   * @throws Error if user not found or confirmation fails
   * 
   * @example
   * ```typescript
   * await userModelService.emailConfirmation('507f1f77bcf86cd799439011');
   * ```
   */
  async emailConfirmation(
    userId: string
  ): Promise<UserDocument> {
    return new Promise(async(resolve, reject) => {
      try {
        let userDocument: UserDocument = await this.userModel.findById(userId);

        if(!userDocument) {
          throw(new Error(`user doesn't exist.`));
        } else {
          userDocument.confirmed = true;
          userDocument.markModified('confirmed');
          await userDocument.save();

          this.eventEmitter.emit('users/confirmed', userDocument);
          resolve(userDocument.toJSON() as UserDocument);
        }
      } catch(error) {
        reject(error);
      }
    })
  }

  /**
   * Updates two-factor authentication settings.
   * @description
   * Configures 2FA for a user by:
   * 1. Finding the user by ID
   * 2. Updating 2FA configuration
   * 3. Saving changes
   * 4. Emitting a 'users/2fa' event
   * 
   * @param userId - MongoDB _id of the user to update
   * @param twoFactorAuth - New 2FA configuration object
   * @returns Promise resolving to the updated user document
   * @throws Error if user not found or update fails
   * 
   * @example
   * ```typescript
   * await userModelService.updateTwoFactorAuth('507f1f77bcf86cd799439011', {
   *   enabled: true,
   *   secret: 'TOTP_SECRET_KEY',
   *   backupCodes: ['12345', '67890']
   * });
   * ```
   */
  async updateTwoFactorAuth(
    userId: string,
    twoFactorAuth: IAuth.ITwoFactor.IAuth
  ): Promise<UserDocument> {
    return new Promise(async(resolve, reject) => {
      try {
        let userDocument: UserDocument = await this.userModel.findById(userId);

        if(!userDocument) {
          throw(new Error(`user doesn't exist.`));
        } else {
          userDocument.twoFactorAuth = twoFactorAuth;
          userDocument.markModified('twoFactorAuth');
          await userDocument.save();

          this.eventEmitter.emit('users/2fa', userDocument);
          resolve(userDocument.toJSON() as UserDocument);
        }
      } catch(error) {
        reject(error);
      }
    })
  }
  
  /**
   * Finds a user by username or email.
   * @description
   * Searches for a non-banned user using:
   * - Username and/or email as search criteria
   * - Automatic filter for banned users
   * 
   * @param user - Login credentials containing username and/or email
   * @param toJSON - Whether to return the document as a plain JSON object
   * @returns Promise resolving to the found user document
   * @throws Error if search fails
   * 
   * @example
   * ```typescript
   * const user = await userModelService.find({
   *   email: 'user@example.com',
   *   username: 'johndoe'
   * });
   * ```
   */
  async find(user: IAuth.ICredentials.IWeb2.IDto.ILogin, toJSON: boolean = true): Promise<UserDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        let filters = {
          banned: {$in: [false, null]}
        };

        if(user.username) {
          filters['username'] = user.username;
        }

        if(user.email) {
          filters['email'] = user.email;
        }

        let userDocument = await this.userModel.findOne(filters).exec();

        if(toJSON) {
          resolve(userDocument?.toJSON() as UserDocument);
        } else {
          resolve(userDocument);
        }
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * Retrieves all users from the database.
   * @description
   * Fetches all user documents with no filtering.
   * Use with caution on large datasets.
   * 
   * @returns Promise resolving to array of all user documents
   * @throws Error if fetch fails
   * 
   * @example
   * ```typescript
   * const allUsers = await userModelService.findAll();
   * console.log(`Total users: ${allUsers.length}`);
   * ```
   */
  async findAll(): Promise<Array<UserDocument>> {
    return new Promise(async (resolve, reject) => {
      try {
        let userDocuments = await this.userModel.find().exec();
        resolve(userDocuments);
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * Finds a single user by custom filters.
   * @description
   * Performs a flexible search using any valid MongoDB filters.
   * 
   * @param filters - MongoDB query filters
   * @returns Promise resolving to the found user document
   * @throws Error if search fails
   * 
   * @example
   * ```typescript
   * const user = await userModelService.findOne({
   *   role: 'admin',
   *   confirmed: true
   * });
   * ```
   */
  async findOne(filters: any): Promise<UserDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        let userDocuments = await this.userModel.findOne(filters).exec();
        resolve(userDocuments);
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * Finds a user by their MongoDB ID.
   * @description
   * Direct lookup by MongoDB _id field.
   * 
   * @param id - MongoDB _id to search for
   * @param toJSON - Whether to return the document as a plain JSON object
   * @returns Promise resolving to the found user document
   * @throws Error if user not found or search fails
   * 
   * @example
   * ```typescript
   * const user = await userModelService.findById('507f1f77bcf86cd799439011');
   * ```
   */
  async findById(id: string, toJSON: boolean = true): Promise<UserDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        let userDocument = await this.userModel.findById(id).exec();

        if(toJSON) {
          resolve(userDocument?.toJSON() as UserDocument);
        } else {
          resolve(userDocument);
        }
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * Deletes a user from the database.
   * @description
   * Removes a user by:
   * 1. Finding the user by credentials
   * 2. Deleting the document
   * 3. Emitting a 'users/delete' event
   * 
   * @param user - User credentials to match for deletion
   * @param toJSON - Whether to return the deleted document as JSON
   * @returns Promise resolving to the deleted user document
   * @throws Error if user not found or deletion fails
   * 
   * @example
   * ```typescript
   * await userModelService.delete({
   *   email: 'user@example.com',
   *   username: 'johndoe'
   * });
   * ```
   */
  async delete(user: IAuth.ICredentials.IWeb2.IDto.ISignup, toJSON: boolean = true): Promise<UserDocument> {
    return new Promise(async(resolve, reject) => {
      try {
        let userDocument = await this.find(user);
        await userDocument.deleteOne();
        this.eventEmitter.emit('users/delete', userDocument);

        if(toJSON) {
          resolve(userDocument?.toJSON() as UserDocument);
        } else {
          resolve(userDocument);
        }
        
      } catch(error) {
        reject(error);
      }
    })
  }
}
